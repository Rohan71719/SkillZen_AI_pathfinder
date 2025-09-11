"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

// Helper to get the upcoming Sunday at 00:00
// Helper to get the upcoming Sunday at 00:00
function getNextSunday(date) {
  const nextSunday = setDay(date, 0, { weekStartsOn: 1 }); // 0 = Sunday
  if (nextSunday <= date) {
    // if today is already Sunday, move to next week
    return setSeconds(setMinutes(setHours(addDays(nextSunday, 7), 0), 0), 0);
  }
  return setSeconds(setMinutes(setHours(nextSunday, 0), 0), 0);
}

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "HIGH" | "MEDIUM" | "LOW",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  return JSON.parse(cleanedText);
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, generate them
 if (!user.industryInsight) {
  const insights = await generateAIInsights(user.industry);

  const today = new Date();

   if (user.industryInsight && today < user.industryInsight.nextUpdate) {
    return user.industryInsight;
  }

const industryInsight = await db.industryInsight.upsert({
    where: { industry: user.industry },
    update: {
      ...insights,
      lastUpdated: new Date(),          // ✅ update timestamp
      nextUpdate: getNextSunday(today), // ✅ auto schedule for Sunday
    },
    create: {
      industry: user.industry,
      ...insights,
      lastUpdated: new Date(),
      nextUpdate: getNextSunday(today),
    },
  });

  return industryInsight;
}

return user.industryInsight;

}