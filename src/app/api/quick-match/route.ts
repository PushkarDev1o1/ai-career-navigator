import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { skills = [], interest = "" } = body;

    if (!skills.length || !interest.trim()) {
      return NextResponse.json(
        { error: "Missing required parameters: skills and interest are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if API key is valid / exists
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      console.warn("Gemini API key is not configured. Generating simulated quick recommendation.");
      const mockResponse = generateMockQuickMatch(skills, interest);
      return NextResponse.json(mockResponse);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
      You are an elite career matchmaking agent. The user has provided a brief subset of skills and an interest.
      Suggest exactly ONE highly precise and relevant career/role name that perfectly bridges these skills and interest.
      
      Inputs:
      - Skills: ${skills.join(", ")}
      - Interest/Passion: ${interest}

      Generate a concise, professional career prediction.
      You must respond in JSON matching this exact structure:
      {
        "title": "Exact Recommended Job Title",
        "suitabilityScore": 95, // 0-100 integer representing match percent
        "matchReason": "A 2-sentence explanation of why their inputs fit this role.",
        "marketOutlook": "High Growth / Steady / Emerging",
        "salaryRange": "Estimated annual salary range (e.g. $85,000 - $120,000)",
        "keySkillsToLearn": ["Skill to learn A", "Skill to learn B", "Skill to learn C"]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    return NextResponse.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Quick Match API Route Error:", error);
    return NextResponse.json(
      { error: "Failed to generate quick recommendation: " + error.message },
      { status: 500 }
    );
  }
}

// Fallback algorithm to mock highly customized quick match if Gemini API key is missing
function generateMockQuickMatch(skills: string[], interest: string) {
  const primarySkill = skills[0] || "Analytical Thinking";
  const secondarySkill = skills[1] || "Problem Solving";
  
  // Clean up input for casing
  const cleanInterest = interest.toLowerCase().trim();
  
  let title = "";
  let matchReason = "";
  let marketOutlook = "High Growth";
  let salaryRange = "$85,000 - $125,000";
  let keySkillsToLearn = ["Technical Project Scope", "Generative AI API Integration", "System Architecture"];

  // Heuristic matching based on interest keywords to make the mock feel highly interactive and real
  if (cleanInterest.includes("code") || cleanInterest.includes("develop") || cleanInterest.includes("program") || cleanInterest.includes("tech")) {
    title = `Full-Stack AI Integrator`;
    matchReason = `Your skills in ${primarySkill} and ${secondarySkill} make you an excellent builder. Bridging this with your passion for "${interest}" positions you well for integrating AI models into scalable software products.`;
    salaryRange = "$95,000 - $145,000";
    keySkillsToLearn = ["Next.js App Routing", "Gemini API SDK", "Database Schema Design"];
  } else if (cleanInterest.includes("design") || cleanInterest.includes("art") || cleanInterest.includes("creative") || cleanInterest.includes("ui") || cleanInterest.includes("ux")) {
    title = `AI Interaction Designer (UX/UI)`;
    matchReason = `Leveraging your proficiency in ${primarySkill} and visual sense in "${interest}", you can design human-centered interfaces for generative AI products.`;
    salaryRange = "$80,000 - $120,000";
    marketOutlook = "High Growth";
    keySkillsToLearn = ["Figma AI Tooling", "Cognitive Load Design", "Interactive Prototyping"];
  } else if (cleanInterest.includes("business") || cleanInterest.includes("market") || cleanInterest.includes("growth") || cleanInterest.includes("product")) {
    title = `Generative AI Product Manager`;
    matchReason = `Your strong core skill of ${secondarySkill} combined with your business focus on "${interest}" is ideal for defining product roadmaps and aligning technical capabilities with market needs.`;
    salaryRange = "$110,000 - $160,000";
    keySkillsToLearn = ["Product Spec Writing", "User Growth Metrics", "Agile AI Lifecycle"];
  } else if (cleanInterest.includes("game") || cleanInterest.includes("gaming") || cleanInterest.includes("play")) {
    title = `AI Technical Game Designer`;
    matchReason = `Combining your developer skill in ${primarySkill} with your passion for gaming allows you to construct dynamic NPC behaviors and procedural AI elements in modern game engines.`;
    salaryRange = "$75,000 - $115,000";
    marketOutlook = "Emerging";
    keySkillsToLearn = ["Unity/Unreal Engine Blueprints", "Behavior Tree Architecture", "State Machine Systems"];
  } else {
    // General fallback
    title = `AI-Enhanced ${interest.charAt(0).toUpperCase() + interest.slice(1)} Specialist`;
    matchReason = `Your background in ${primarySkill} and ${secondarySkill} gives you a solid cognitive framework. Merging this with your interest in "${interest}" enables you to automate and optimize processes as an industry specialist.`;
    salaryRange = "$90,000 - $130,000";
  }

  return {
    title,
    suitabilityScore: Math.floor(Math.random() * 11) + 85, // 85% to 95%
    matchReason,
    marketOutlook,
    salaryRange,
    keySkillsToLearn
  };
}
