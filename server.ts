import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for translations to preserve API quota and provide instant responses
const translationCache = new Map<string, any>();

// Initialize Google GenAI client if GEMINI_API_KEY is available
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Health check & status
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiEnabled: !!ai,
    service: 'MediSpeak AI Multilingual Backend',
  });
});

/**
 * AI-powered Medical Simplification & Mother Tongue Translation
 * POST /api/simplify
 * Body: { text: string, sourceLang?: string, targetLang: string, targetLangName: string, role?: 'doctor' | 'patient' }
 */
app.post('/api/simplify', async (req: Request, res: Response) => {
  try {
    const { text, sourceLang = 'en', targetLang = 'ta', targetLangName = 'Tamil', role = 'doctor' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    const trimmedText = text.trim();
    const cacheKey = `${trimmedText.toLowerCase()}_${targetLang}_${role}`;

    // Return cached result if available
    if (translationCache.has(cacheKey)) {
      return res.json({
        fallback: false,
        cached: true,
        ...translationCache.get(cacheKey),
      });
    }

    if (!ai) {
      // Graceful fallback signal so client seamlessly uses rich local rule-based dictionary
      return res.json({
        fallback: true,
        message: 'Using comprehensive local Indian languages medical engine.',
      });
    }

    const systemInstruction = `You are MediSpeak AI, a specialized medical communication engine.
Your sole mission: Convert complex technical doctor statements into simple, clear words so everyday patients in India understand their health instructions in their own mother tongue (${targetLangName}).
Guidelines:
1. Identify all difficult technical medical terms (e.g. postoperative, edema, inflammation, analgesic, hypertension, myocardial infarction, dyspnea, dosage, anticoagulant, etc.).
2. Simplify the explanation into plain, everyday language (grade-school level) without losing the clinical meaning.
3. Translate the complete input into ${targetLangName} accurately, including ordinary words, greetings, symptoms, and sentence structure.
4. The motherTongueTranslation must contain only the direct translation of the input. Do not add headings, explanations, medical advice, reassurance, glossaries, or extra sentences.
5. Provide a JSON response format ONLY:
{
  "originalText": string,
  "simpleEnglishExplanation": string,
  "motherTongueTranslation": string,
  "identifiedMedicalTerms": [
    {
      "technicalTerm": string,
      "simpleMeaning": string,
      "motherTongueMeaning": string
    }
  ],
  "reassuringNote": string
}
Never prescribe medicines, diagnose new diseases, or contradict the doctor.`;

    const prompt = `Speaker mode: ${role}.
Input Statement: "${trimmedText}"
Target Mother Tongue: ${targetLangName} (${targetLang})
Source language: ${sourceLang}

Please simplify the medical terms and translate into ${targetLangName}.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });
    } catch (modelErr: any) {
      const errStr = String(modelErr?.message || modelErr);
      const isQuotaOrLimit =
        errStr.includes('429') ||
        errStr.includes('quota') ||
        errStr.includes('RESOURCE_EXHAUSTED') ||
        modelErr?.status === 429;

      if (isQuotaOrLimit) {
        // Try fallback to gemini-3.1-flash-lite if available
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
            },
          });
        } catch {
          // Gracefully serve from local engine without logging fatal errors
          return res.json({
            fallback: true,
            quotaHandled: true,
            message: 'Switched to high-speed local multilingual medical engine.',
          });
        }
      } else {
        return res.json({
          fallback: true,
          message: 'Using offline medical dictionary.',
        });
      }
    }

    const outputText = response.text?.trim() || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      parsed = {
        simpleEnglishExplanation: outputText,
        motherTongueTranslation: outputText,
        identifiedMedicalTerms: [],
      };
    }

    // Cache the parsed result
    translationCache.set(cacheKey, parsed);
    if (translationCache.size > 200) {
      const firstKey = translationCache.keys().next().value;
      if (firstKey) translationCache.delete(firstKey);
    }

    return res.json({
      fallback: false,
      ...parsed,
    });
  } catch (err: any) {
    // Seamless fallback to client local engine
    return res.json({
      fallback: true,
      error: 'Using local medical translation engine',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static files from dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediSpeak AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
