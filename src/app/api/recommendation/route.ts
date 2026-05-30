import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      currentStatus,
      education,
      skills,
      interests,
      workSetting,
      teamPreference,
      industries,
      careerGoals,
      salaryExpectation,
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if API key is valid / exists
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      console.warn("Gemini API key is not configured. Generating realistic mock recommendations for preview.");
      const mockResponse = generateMockRecommendations(body);
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
      You are an elite career advisory agent. Analyze this candidate's profile and recommend 2-3 precise, optimal career directions.
      
      Candidate Profile:
      - Name: ${fullName}
      - Current Status: ${currentStatus}
      - Education: ${education}
      - Current Skills: ${skills.join(", ") || "None specified"}
      - Interests: ${interests.join(", ") || "None specified"}
      - Preferred Work Format: ${workSetting}
      - Preferred Team Size: ${teamPreference}
      - Target Industries: ${industries.join(", ") || "Any"}
      - Professional Aspirations & Goals: ${careerGoals || "General growth"}
      - Salary Expectation Tier: ${salaryExpectation}

      Generate a highly detailed, professional career recommendation.
      You must respond in JSON matching this exact structure:
      {
        "userName": "${fullName}",
        "recommendations": [
          {
            "title": "Exact Recommended Job Title",
            "suitabilityScore": 92, // 0-100 integer
            "matchReason": "Explain exactly how their current skills and interests align to make them an outstanding fit for this role.",
            "marketOutlook": "High Growth / Steady / Emerging",
            "salaryRange": "Estimated annual salary range based on tier",
            "keySkillsRequired": ["Required Skill A", "Required Skill B"],
            "skillsToAcquire": ["Skill to learn C", "Skill to learn D"], // These should be important skills not present in their current skills list
            "learningRoadmap": [
              {
                "phaseName": "Phase 1: Foundations & Core Tools",
                "timeline": "Weeks 1-8",
                "tasks": ["Learn tech X", "Build project Y"],
                "resources": ["Recommended topic or course subject"]
              },
              {
                "phaseName": "Phase 2: Intermediate Concepts",
                "timeline": "Months 3-4",
                "tasks": ["Implement advanced practice Z", "Contribute to portfolio project W"],
                "resources": ["Topics/concepts to master"]
              },
              {
                "phaseName": "Phase 3: Portfolio & Applications",
                "timeline": "Months 5-6",
                "tasks": ["Apply to internships", "Optimize resume for this specific role"],
                "resources": ["Portfolio design guidelines"]
              }
            ]
          }
        ],
        "generalAdvice": "An encouraging summary advice outlining key strengths to leverage."
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    return NextResponse.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Gemini Route Handler Error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations: " + error.message },
      { status: 500 }
    );
  }
}

// Fallback algorithm to mock highly customized recommendations if API key is not present
function generateMockRecommendations(data: any) {
  const { fullName, skills = [], interests = [], industries = [], workSetting } = data;
  
  // Pick primary inputs
  const primarySkill = skills[0] || "Problem Solving";
  const secondarySkill = skills[1] || "Communication";
  const primaryInterest = interests[0] || "Coding & Building";
  const primaryIndustry = industries[0] || "Technology";

  return {
    userName: fullName,
    recommendations: [
      {
        title: `AI-Driven ${primaryIndustry} Consultant`,
        suitabilityScore: 94,
        matchReason: `Combining your skills in ${primarySkill} with an interest in ${primaryInterest} makes you perfectly suited to consult on AI solutions within the ${primaryIndustry} space. You prefer a ${workSetting} setting which allows for focused analytical work.`,
        marketOutlook: "High Growth",
        salaryRange: "$95,000 - $140,000",
        keySkillsRequired: [primarySkill, "Generative AI Prompting", "Strategic Analysis", "Solution Architecture"],
        skillsToAcquire: ["Generative AI Prompting", "Strategic Analysis", "Solution Architecture"],
        learningRoadmap: [
          {
            phaseName: "Phase 1: AI Tools Mastery",
            timeline: "Weeks 1-4",
            tasks: [
              `Learn structured prompting with Gemini`,
              `Build 3 automation workflows using Gemini API and ${primarySkill}`
            ],
            resources: ["Google Generative AI Documentation", "Intro to Prompt Engineering"]
          },
          {
            phaseName: "Phase 2: Business Case & Design",
            timeline: "Weeks 5-8",
            tasks: [
              `Create mock AI transition blueprints for ${primaryIndustry} companies`,
              `Strengthen ${secondarySkill} by preparing and delivering design proposals`
            ],
            resources: ["AI Case Studies in Business", "Presentation Skills for Consultants"]
          },
          {
            phaseName: "Phase 3: Portfolio & Outreach",
            timeline: "Weeks 9-12",
            tasks: [
              "Launch a personal portfolio showcasing your AI-driven case studies",
              "Begin networking on LinkedIn with teams in the target industries"
            ],
            resources: ["Portfolio design blueprints", "Technical networking guide"]
          }
        ]
      },
      {
        title: `Technical Specialist / Builder`,
        suitabilityScore: 88,
        matchReason: `Based on your proficiency in ${primarySkill} and passion for ${primaryInterest}, you possess the fundamental builder mindset necessary for engineering roles in modern teams.`,
        marketOutlook: "Emerging",
        salaryRange: "$80,000 - $115,000",
        keySkillsRequired: [primarySkill, "Systems Architecture", "Advanced Tools Integration", "Agile Methodologies"],
        skillsToAcquire: ["Systems Architecture", "Advanced Tools Integration", "Agile Methodologies"],
        learningRoadmap: [
          {
            phaseName: "Phase 1: Advanced Core Stack",
            timeline: "Weeks 1-6",
            tasks: [
              `Implement deep-dive advanced projects using ${primarySkill}`,
              "Complete bootcamp exercises in software systems design"
            ],
            resources: ["Advanced systems design frameworks", "Design Patterns Courses"]
          },
          {
            phaseName: "Phase 2: Systems Integration",
            timeline: "Weeks 7-12",
            tasks: [
              "Build multi-tier applications with complex API pipelines",
              "Integrate automated testing and cloud deployments"
            ],
            resources: ["Web services integration guidelines", "DevOps basics handbook"]
          }
        ]
      }
    ],
    generalAdvice: `Your background in ${primarySkill} combined with your focus on ${primaryIndustry} provides a strong competitive edge. We recommend concentrating on hands-on portfolio projects to highlight your specialization.`
  };
}
