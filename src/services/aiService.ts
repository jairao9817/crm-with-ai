import OpenAI from "openai";
import type {
  GeneratePersonaInput,
  ContactPersona,
  ObjectionHandlerInput,
  ObjectionHandlerResponse,
  WinLossExplainerInput,
  WinLossExplainerResponse,
  Deal,
  Task,
  Communication,
  PurchaseHistory,
} from "../types/index";

// Import the new service classes for database operations
import { ContactPersonaService } from "./contactPersonaService";
import { DealCoachService } from "./dealCoachService";
import { ObjectionResponseService } from "./objectionResponseService";
import { WinLossAnalysisService } from "./winLossAnalysisService";
import { SettingsService } from "./settingsService";

// Create OpenAI client instance
let openaiClient: OpenAI | null = null;

const getOpenAIClient = async (): Promise<OpenAI> => {
  // Try to get API key from user settings first
  let apiKey = await SettingsService.getOpenAIApiKey();

  // Fallback to environment variable if no user key is set
  if (!apiKey) {
    apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  }

  if (!apiKey) {
    throw new Error(
      "OpenAI API key not found. Please add your API key in Settings or set VITE_OPENAI_API_KEY environment variable."
    );
  }

  // Create new client if it doesn't exist or if the API key has changed
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, this should be handled server-side
    });
  }

  return openaiClient;
};

// Reset client when API key changes
export const resetOpenAIClient = () => {
  openaiClient = null;
};

export const generateContactPersona = async (
  input: GeneratePersonaInput
): Promise<ContactPersona> => {
  const { contact_id, contact_data } = input;
  const { contact, deals, communications, purchaseHistory } = contact_data;

  // Build comprehensive prompt with all available data
  const prompt = `
Analyze the following customer data and generate a comprehensive behavioral persona:

CONTACT INFORMATION:
- Name: ${contact.name}
- Email: ${contact.email}
- Company: ${contact.company || "Not specified"}
- Job Title: ${contact.job_title || "Not specified"}
- Account Age: ${Math.floor(
    (new Date().getTime() - new Date(contact.created_at).getTime()) /
      (1000 * 60 * 60 * 24)
  )} days

DEAL HISTORY (${deals.length} deals):
${deals
  .map(
    (deal) => `
- ${deal.title}: ${deal.stage} stage, $${deal.monetary_value}, ${
      deal.probability_percentage
    }% probability
  Created: ${new Date(deal.created_at).toLocaleDateString()}
  Expected Close: ${
    deal.expected_close_date
      ? new Date(deal.expected_close_date).toLocaleDateString()
      : "Not set"
  }`
  )
  .join("")}

COMMUNICATION HISTORY (${communications.length} interactions):
${communications
  .slice(0, 10) // Limit to recent 10 communications
  .map(
    (comm) => `
- ${comm.type.replace("_", " ")}: ${comm.subject || "No subject"}
  Date: ${new Date(comm.communication_date).toLocaleDateString()}
  Content: ${comm.content?.substring(0, 100) || "No content"}...`
  )
  .join("")}

PURCHASE HISTORY (${purchaseHistory.length} purchases):
${purchaseHistory
  .map(
    (purchase) => `
- ${purchase.product_service}: $${purchase.amount} (${purchase.status})
  Date: ${new Date(purchase.date).toLocaleDateString()}`
  )
  .join("")}

Based on this data, generate a JSON response with the following structure:
{
  "persona_summary": "A 2-3 sentence summary of the customer's behavioral profile",
  "behavioral_traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "communication_preferences": ["preference1", "preference2", "preference3"],
  "buying_patterns": ["pattern1", "pattern2", "pattern3"]
}

Focus on actionable insights that will help sales and customer service teams interact more effectively with this customer.
`;

  try {
    const openai = await getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert customer behavior analyst. Analyze customer data to generate actionable behavioral personas for sales and customer service teams. You must respond with ONLY valid JSON - no markdown, no code blocks, no additional text. Just the raw JSON object.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = response.trim();

    // Remove ```json and ``` if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    // Parse the JSON response
    let personaData;
    try {
      personaData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", cleanedResponse);
      throw new Error("Invalid response format from AI. Please try again.");
    }

    // Validate the response structure
    if (!personaData || typeof personaData !== "object") {
      throw new Error("Invalid response structure from AI. Please try again.");
    }

    if (
      !personaData.persona_summary ||
      !Array.isArray(personaData.behavioral_traits) ||
      !Array.isArray(personaData.communication_preferences) ||
      !Array.isArray(personaData.buying_patterns)
    ) {
      throw new Error("Incomplete response from AI. Please try again.");
    }

    // Create the persona object to save to database
    const personaToSave = {
      contact_id,
      persona_summary: personaData.persona_summary,
      behavioral_traits: personaData.behavioral_traits,
      communication_preferences: personaData.communication_preferences,
      buying_patterns: personaData.buying_patterns,
      generated_at: new Date().toISOString(),
    };

    // Save to database and return the saved persona
    const savedPersona = await ContactPersonaService.createPersona(
      personaToSave
    );

    return savedPersona;
  } catch (error) {
    console.error("Error generating contact persona:", error);
    throw error;
  }
};

export const generateObjectionResponse = async (
  input: ObjectionHandlerInput
): Promise<ObjectionHandlerResponse> => {
  const { objection, context } = input;

  // Build context-aware prompt
  let contextInfo = "";
  if (context) {
    if (context.contact) {
      contextInfo += `\nCUSTOMER CONTEXT:
- Name: ${context.contact.name}
- Company: ${context.contact.company || "Not specified"}
- Email: ${context.contact.email}`;
    }

    if (context.deal) {
      contextInfo += `\nDEAL CONTEXT:
- Deal: ${context.deal.title}
- Stage: ${context.deal.stage}
- Value: $${context.deal.monetary_value}
- Probability: ${context.deal.probability_percentage}%`;
    }

    if (context.communication) {
      contextInfo += `\nCOMMUNICATION CONTEXT:
- Type: ${context.communication.type}
- Subject: ${context.communication.subject || "No subject"}
- Date: ${new Date(
        context.communication.communication_date
      ).toLocaleDateString()}`;
    }

    if (context.industry) {
      contextInfo += `\nINDUSTRY: ${context.industry}`;
    }

    if (context.product_service) {
      contextInfo += `\nPRODUCT/SERVICE: ${context.product_service}`;
    }
  }

  const prompt = `
You are an expert sales coach. A customer has raised the following objection:

OBJECTION: "${objection}"
${contextInfo}

Provide a professional response that addresses this objection effectively. Consider the context provided and tailor your response accordingly.

Respond with a JSON object in this exact format:
{
  "suggested_response": "A complete, professional response to the objection (2-3 paragraphs)",
  "response_strategy": "The objection handling technique being used (e.g., 'Acknowledge and Redirect', 'Feel, Felt, Found', 'Question the Objection')",
  "key_points": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "tone": "professional"
}

The tone should always be "professional" unless the context suggests otherwise. The key_points should be 3-5 specific arguments or benefits to emphasize.
`;

  try {
    const openai = await getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert sales coach specializing in objection handling. Provide professional, effective responses that help sales representatives overcome customer objections. Always respond with valid JSON only - no markdown, no code blocks, just the JSON object.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = response.trim();

    // Remove ```json and ``` if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    // Parse the JSON response
    let responseData;
    try {
      responseData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", cleanedResponse);
      throw new Error("Invalid response format from AI. Please try again.");
    }

    // Validate the response structure
    if (!responseData || typeof responseData !== "object") {
      throw new Error("Invalid response structure from AI. Please try again.");
    }

    if (
      !responseData.suggested_response ||
      !responseData.response_strategy ||
      !Array.isArray(responseData.key_points) ||
      !responseData.tone
    ) {
      throw new Error("Incomplete response from AI. Please try again.");
    }

    // Create the objection response object to save to database
    const objectionResponseToSave = {
      objection,
      suggested_response: responseData.suggested_response,
      response_strategy: responseData.response_strategy,
      key_points: responseData.key_points,
      tone: responseData.tone as
        | "professional"
        | "empathetic"
        | "confident"
        | "consultative",
      context_data: context || {},
      generated_at: new Date().toISOString(),
    };

    // Save to database and return the saved response
    const savedResponse =
      await ObjectionResponseService.createObjectionResponse(
        objectionResponseToSave
      );

    return savedResponse;
  } catch (error) {
    console.error("Error generating objection response:", error);
    throw error;
  }
};

export const generateWinLossExplanation = async (
  input: WinLossExplainerInput
): Promise<WinLossExplainerResponse> => {
  const { deal, context } = input;

  // Determine outcome based on deal stage
  const outcome = deal.stage === "closed-won" ? "won" : "lost";

  // Build context information
  let contextInfo = "";
  if (context) {
    if (context.contact) {
      contextInfo += `\nCUSTOMER INFORMATION:
- Name: ${context.contact.name}
- Company: ${context.contact.company || "Not specified"}
- Email: ${context.contact.email}`;
    }

    if (context.tasks && context.tasks.length > 0) {
      contextInfo += `\nTASK HISTORY (${context.tasks.length} tasks):`;
      context.tasks.slice(0, 5).forEach((task) => {
        contextInfo += `\n- ${task.title}: ${task.status}`;
        if (task.due_date) {
          contextInfo += ` (Due: ${new Date(
            task.due_date
          ).toLocaleDateString()})`;
        }
      });
    }

    if (context.communications && context.communications.length > 0) {
      contextInfo += `\nCOMMUNICATION HISTORY (${context.communications.length} interactions):`;
      context.communications.slice(0, 5).forEach((comm) => {
        contextInfo += `\n- ${comm.type.replace("_", " ")}: ${
          comm.subject || "No subject"
        } (${new Date(comm.communication_date).toLocaleDateString()})`;
      });
    }

    if (context.purchaseHistory && context.purchaseHistory.length > 0) {
      contextInfo += `\nPURCHASE HISTORY (${context.purchaseHistory.length} purchases):`;
      context.purchaseHistory.forEach((purchase) => {
        contextInfo += `\n- ${purchase.product_service}: $${purchase.amount} (${purchase.status})`;
      });
    }
  }

  const prompt = `
Analyze the following ${outcome} deal and provide insights into why it was ${outcome}:

DEAL INFORMATION:
- Title: ${deal.title}
- Stage: ${deal.stage}
- Value: $${deal.monetary_value}
- Probability: ${deal.probability_percentage}%
- Expected Close Date: ${
    deal.expected_close_date
      ? new Date(deal.expected_close_date).toLocaleDateString()
      : "Not set"
  }
- Created: ${new Date(deal.created_at).toLocaleDateString()}
- Close Date: ${
    deal.close_date
      ? new Date(deal.close_date).toLocaleDateString()
      : "Not closed yet"
  }
${contextInfo}

Based on this information, provide a comprehensive analysis of why this deal was ${outcome}. 

Respond with a JSON object in this exact format:
{
  "outcome": "${outcome}",
  "explanation": "A detailed 2-3 paragraph explanation of why the deal was ${outcome}",
  "key_factors": ["Factor 1", "Factor 2", "Factor 3", "Factor 4"],
  "lessons_learned": ["Lesson 1", "Lesson 2", "Lesson 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "confidence_score": 85
}

The confidence_score should be between 1-100 indicating how confident you are in this analysis based on the available data.
`;

  try {
    const openai = await getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert sales analyst specializing in win-loss analysis. Analyze deal outcomes to provide actionable insights for sales teams. Always respond with valid JSON only - no markdown, no code blocks, just the JSON object.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = response.trim();

    // Remove ```json and ``` if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    // Parse the JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", cleanedResponse);
      throw new Error("Invalid response format from AI. Please try again.");
    }

    // Validate the response structure
    if (!analysisData || typeof analysisData !== "object") {
      throw new Error("Invalid response structure from AI. Please try again.");
    }

    if (
      !analysisData.explanation ||
      !Array.isArray(analysisData.key_factors) ||
      !Array.isArray(analysisData.lessons_learned) ||
      !Array.isArray(analysisData.recommendations) ||
      typeof analysisData.confidence_score !== "number"
    ) {
      throw new Error("Incomplete response from AI. Please try again.");
    }

    // Create the win-loss analysis object to save to database
    const analysisToSave = {
      deal_id: deal.id,
      outcome: outcome as "won" | "lost",
      explanation: analysisData.explanation,
      key_factors: analysisData.key_factors,
      lessons_learned: analysisData.lessons_learned,
      recommendations: analysisData.recommendations,
      confidence_score: Math.min(
        100,
        Math.max(1, analysisData.confidence_score)
      ),
      context_data: {
        deal,
        context,
      },
      generated_at: new Date().toISOString(),
    };

    // Save to database and return the saved analysis
    const savedAnalysis = await WinLossAnalysisService.createAnalysis(
      analysisToSave
    );

    return savedAnalysis;
  } catch (error) {
    console.error("Error generating win-loss explanation:", error);
    throw error;
  }
};

export const generateDealCoachSuggestions = async (
  deal: Deal,
  context: {
    tasks?: Task[];
    communications?: Communication[];
    purchaseHistory?: PurchaseHistory[];
  }
): Promise<string> => {
  // Build comprehensive context for the deal
  let contextInfo = `
DEAL INFORMATION:
- Title: ${deal.title}
- Stage: ${deal.stage}
- Value: $${deal.monetary_value}
- Probability: ${deal.probability_percentage}%
- Expected Close Date: ${
    deal.expected_close_date
      ? new Date(deal.expected_close_date).toLocaleDateString()
      : "Not set"
  }
- Created: ${new Date(deal.created_at).toLocaleDateString()}
- Days in Pipeline: ${Math.floor(
    (new Date().getTime() - new Date(deal.created_at).getTime()) /
      (1000 * 60 * 60 * 24)
  )}`;

  if (deal.contact) {
    contextInfo += `

CONTACT INFORMATION:
- Name: ${deal.contact.name}
- Company: ${deal.contact.company || "Not specified"}
- Email: ${deal.contact.email}`;
  }

  if (context.tasks && context.tasks.length > 0) {
    contextInfo += `

TASK HISTORY (${context.tasks.length} tasks):`;
    context.tasks.slice(0, 10).forEach((task) => {
      contextInfo += `
- ${task.title}: ${task.status}`;
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        const isOverdue = dueDate < new Date() && task.status !== "completed";
        contextInfo += ` (Due: ${dueDate.toLocaleDateString()}${
          isOverdue ? " - OVERDUE" : ""
        })`;
      }
      if (task.description) {
        contextInfo += ` - ${task.description.substring(0, 100)}`;
      }
    });
  }

  if (context.communications && context.communications.length > 0) {
    contextInfo += `

COMMUNICATION HISTORY (${context.communications.length} interactions):`;
    context.communications.slice(0, 10).forEach((comm) => {
      contextInfo += `
- ${comm.type.replace("_", " ")}: ${comm.subject || "No subject"}
  Date: ${new Date(comm.communication_date).toLocaleDateString()}`;
      if (comm.content) {
        contextInfo += `
  Content: ${comm.content.substring(0, 150)}...`;
      }
    });
  }

  if (context.purchaseHistory && context.purchaseHistory.length > 0) {
    contextInfo += `

PURCHASE HISTORY (${context.purchaseHistory.length} purchases):`;
    context.purchaseHistory.forEach((purchase) => {
      contextInfo += `
- ${purchase.product_service}: $${purchase.amount} (${purchase.status})
  Date: ${new Date(purchase.date).toLocaleDateString()}`;
    });
  }

  const prompt = `
As an expert sales coach, analyze this deal and provide specific, actionable recommendations to help move it forward:

${contextInfo}

Based on the current deal stage (${deal.stage}) and the available context, provide detailed coaching suggestions that include:

1. Immediate next steps to take
2. Potential risks or obstacles to address
3. Strategies to increase the probability of closing
4. Timeline recommendations
5. Communication strategies
6. Stakeholder engagement tactics

Focus on practical, actionable advice that a sales representative can implement immediately. Consider the deal's current stage, timeline, and any patterns you notice in the communication or task history.
`;

  try {
    const openai = await getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert sales coach with 20+ years of experience. Provide specific, actionable coaching advice to help sales representatives close deals more effectively. Focus on practical next steps and strategies.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Save the suggestions to database
    const suggestionToSave = {
      deal_id: deal.id,
      suggestions: response.trim(),
      deal_context: {
        deal,
        context,
      },
      generated_at: new Date().toISOString(),
    };

    await DealCoachService.createSuggestion(suggestionToSave);

    return response.trim();
  } catch (error) {
    console.error("Error generating deal coach suggestions:", error);
    throw error;
  }
};

// Export the AI service object for backward compatibility
export const aiService = {
  generateContactPersona,
  generateObjectionResponse,
  generateWinLossExplanation,
  generateDealCoachSuggestions,
};
