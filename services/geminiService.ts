
import { GoogleGenAI, Type } from "@google/genai";
import { ProcessingOptions, ExtractedData, QuestionJSON } from "../types";
import { renderQuestionToQTI } from "../constants";

export interface GenerationResponse {
  xml: string;
  questions: QuestionJSON[];
}

export const generateQTI = async (
  data: ExtractedData,
  options: ProcessingOptions
): Promise<GenerationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Explicitly label references for the model to use
  const parts: any[] = [{ text: `SOURCE TEXT TO PARSE:\n${data.text}\n\n` }];

  if (options.includeImageAnalysis && data.images.length > 0) {
    parts.push({ text: "### VISUAL ASSETS ###\n" });
    data.images.slice(0, 15).forEach((base64, index) => {
      const label = `IMAGE_REF_${index}`;
      const cleanBase64 = base64.split(',')[1];
      parts.push({ text: `REFERENCE LABEL: ${label}\n` });
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: cleanBase64
        }
      });
      parts.push({ text: "\n" });
    });
    parts.push({ text: "\nNOTE: When a question relates to one of the visual assets above, use the 'REFERENCE LABEL' provided (e.g., IMAGE_REF_0) in the 'images' array of the JSON output." });
  }

  // Determine configuration based on model
  const isPro = options.model.includes('pro');
  const generationConfig: any = {
    responseMimeType: "application/json",
    temperature: 0.1,
    maxOutputTokens: 8192, 
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          question: { type: Type.STRING },
          correct_answer: { type: Type.STRING },
          images: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          }
        },
        required: ["category", "question", "correct_answer", "images"]
      }
    }
  };

  if (isPro) {
    generationConfig.thinkingConfig = { thinkingBudget: 4096 };
  }

  const response = await ai.models.generateContent({
    model: options.model,
    contents: { parts },
    config: {
      ...generationConfig,
      systemInstruction: options.systemPrompt,
    },
  });

  const resultText = response.text || "[]";
  let questions: QuestionJSON[] = [];

  try {
    questions = JSON.parse(resultText);
  } catch (e) {
    let cleaned = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    if (cleaned.startsWith('[') && !cleaned.endsWith(']')) {
      const lastBracket = cleaned.lastIndexOf('}');
      if (lastBracket !== -1) {
        cleaned = cleaned.substring(0, lastBracket + 1) + ']';
      } else {
        cleaned = cleaned + ']';
      }
    }
    try {
      questions = JSON.parse(cleaned);
    } catch (innerError) {
      throw new Error(`The AI response was improperly formatted: ${innerError.message}`);
    }
  }

  if (!Array.isArray(questions)) {
    throw new Error("Gemini response was not a JSON array.");
  }

  const processedQuestions = questions.map(q => {
    const resolvedImages = q.images.map(imgRef => {
      const match = imgRef.match(/IMAGE_REF_(\d+)/i);
      if (match) {
        const index = parseInt(match[1], 10);
        if (data.images[index]) {
          return data.images[index];
        }
      }
      return imgRef;
    });
    return { ...q, images: resolvedImages };
  });

  const qtiItems = processedQuestions.map((q, idx) => renderQuestionToQTI(q, idx + 1)).join('\n\n');
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItems>
${qtiItems}
</assessmentItems>`;

  return { xml, questions: processedQuestions };
};
