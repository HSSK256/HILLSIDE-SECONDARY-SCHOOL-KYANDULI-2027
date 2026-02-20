
import { GoogleGenAI, Modality } from "@google/genai";
import { Student, Mark, FinancialRecord, FeeSummary } from "../types";

// Helper to create a new client instance for each request
// This ensures we use the most up-to-date API key (e.g. if selected by the user at runtime)
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzePerformance = async (student: Student, marks: Mark[]) => {
  const marksSummary = marks
    .map(m => `${m.subject_id}: ${m.marks}% (${m.term})`)
    .join(', ');

  const prompt = `Analyze the academic performance of student ${student.name} (Admission: ${student.admission_number}). 
  Marks history: ${marksSummary}. 
  Provide a professional summary of strengths, weaknesses, and 3 specific recommendations for improvement. 
  Keep the tone encouraging but data-driven. Output in concise bullet points.`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Could not generate analysis at this time.";
  }
};

export const generateLessonPlan = async (subject: string, topic: string, level: string) => {
  const prompt = `Create a detailed high school lesson plan for:
  Subject: ${subject}
  Topic: ${topic}
  Level: ${level}
  
  Include:
  1. Learning Objectives
  2. Materials Needed
  3. Introduction (10 mins)
  4. Core Lesson Body (30 mins)
  5. Conclusion/Assessment (10 mins)
  
  Format as professional Markdown.`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Lesson Plan Error:", error);
    return "Failed to generate lesson plan.";
  }
};

export const speakAnalysis = async (text: string) => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this academic summary clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
  return null;
};

export const searchEducationalResources = async (query: string) => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find up-to-date educational resources and information about: ${query}. Focus on relevance for high school students and teachers.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    // Safely extract grounding chunks and filter for valid web links
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = chunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title);

    return {
      text: response.text,
      links: links
    };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    return { text: "Failed to search for resources.", links: [] };
  }
};

export const generateAnnouncements = async (topic: string) => {
  const prompt = `Write a formal high school announcement regarding: ${topic}. Include a clear heading, the core message, and an action item for students or parents.`;
  
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Announcement Error:", error);
    return "Failed to generate announcement.";
  }
};

export const generateStudentBio = async (name: string, classId: string, backgroundInfo: string) => {
  const prompt = `Write a short, engaging, and professional student biography for a high school profile.
  Student Name: ${name}
  Current Class: ${classId}
  Key Background/Interests/Traits: ${backgroundInfo}
  
  The tone should be positive, encouraging, and suitable for official school records. Focus on potential and character. Keep it to one paragraph (approx 60-80 words).`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Student Bio Generation Error:", error);
    return null;
  }
};

export const analyzeFinancialHistory = async (student: Student, transactions: FinancialRecord[], summary: FeeSummary) => {
  const transactionHistory = transactions
    .slice(0, 15)
    .map(t => `- ${t.date}: ${t.type.toUpperCase()} of ${t.amount.toLocaleString()} (${t.category})`)
    .join('\n');

  const prompt = `Act as a school bursar assistant AI. Analyze the fee payment history for student: ${student.name} (Class: ${student.class_id}).
  
  Financial Status:
  - Total Billed: ${summary.total_billed.toLocaleString()}
  - Total Paid: ${summary.total_paid.toLocaleString()}
  - Outstanding Balance: ${summary.balance.toLocaleString()}

  Recent Transactions:
  ${transactionHistory}

  Provide a professional financial assessment including:
  1. **Payment Trends**: Analyze the consistency and timing of payments.
  2. **Risk Level**: (Low/Medium/High) with a brief justification based on balance and history.
  3. **Communication Strategy**: A specific, polite recommendation on how the administration should approach the parent regarding the fees.
  
  Format the output in clean Markdown.`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Finance Analysis Error:", error);
    return "Financial analysis is currently unavailable.";
  }
};

export const analyzeSchoolPerformance = async (subjectPerformance: { subject: string; average: number }[]) => {
  const performanceSummary = subjectPerformance
    .map(p => `${p.subject}: ${p.average}%`)
    .join(', ');

  const prompt = `Acting as an expert educational consultant, analyze the overall academic performance of Hillside Secondary School based on these average subject scores: ${performanceSummary}.
  
  Please provide:
  1. **Executive Summary**: A brief overview of the current academic standing.
  2. **Key Strengths**: Subjects performing well.
  3. **Areas for Concern**: Subjects with lower averages.
  4. **Strategic Recommendations**: 3 actionable steps the administration can take to improve results.
  
  Format the output in clean Markdown.`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("School Analysis Error:", error);
    return "Unable to generate school performance insights at this time.";
  }
};
