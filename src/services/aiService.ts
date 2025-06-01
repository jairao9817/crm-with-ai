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

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, this should be handled server-side
});

export const generateContactPersona = async (
  input: GeneratePersonaInput
): Promise<ContactPersona> => {
  const { contact_data } = input;
  const { contact, deals, communications, purchaseHistory } = contact_data;

  // Prepare the data summary for the AI prompt
  const contactSummary = `
Contact Information:
- Name: ${contact.name}
- Email: ${contact.email}
- Phone: ${contact.phone || "Not provided"}
- Company: ${contact.company || "Not provided"}
- Job Title: ${contact.job_title || "Not provided"}
- Member since: ${new Date(contact.created_at).toLocaleDateString()}

Deals History (${deals.length} total):
${deals
  .map(
    (deal) => `
- ${deal.title}: $${deal.monetary_value.toLocaleString()} (${deal.stage}, ${
      deal.probability_percentage
    }% probability)
  Expected close: ${
    deal.expected_close_date
      ? new Date(deal.expected_close_date).toLocaleDateString()
      : "Not set"
  }
`
  )
  .join("")}

Communication History (${communications.length} total):
${communications
  .slice(0, 10)
  .map(
    (comm) => `
- ${comm.type.replace("_", " ")}: ${comm.subject || "No subject"} (${new Date(
      comm.communication_date
    ).toLocaleDateString()})
  ${comm.content ? `Content: ${comm.content.substring(0, 100)}...` : ""}
`
  )
  .join("")}

Purchase History (${purchaseHistory.length} total):
${purchaseHistory
  .slice(0, 10)
  .map(
    (purchase) => `
- ${purchase.product_service}: $${purchase.amount.toLocaleString()} (${
      purchase.status
    }) - ${new Date(purchase.date).toLocaleDateString()}
`
  )
  .join("")}
  `;

  const prompt = `
Based on the following customer data, generate a comprehensive behavioral persona profile. Analyze the patterns in their communication, purchasing behavior, and deal interactions to create insights that would help sales and customer service teams.

${contactSummary}

IMPORTANT: Respond with ONLY a valid JSON object in the exact format below. Do not include any markdown formatting, code blocks, or additional text:

{
  "persona_summary": "A 2-3 sentence summary of the customer's overall profile and personality",
  "behavioral_traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "communication_preferences": ["preference1", "preference2", "preference3"],
  "buying_patterns": ["pattern1", "pattern2", "pattern3"]
}

Focus on actionable insights such as:
- Communication style preferences (email vs phone, formal vs casual, frequency)
- Decision-making patterns (quick vs deliberate, price-sensitive vs value-focused)
- Engagement patterns (responsive vs needs follow-up, detail-oriented vs big picture)
- Buying behavior (seasonal patterns, product preferences, budget considerations)
- Relationship building preferences (personal vs professional, long-term vs transactional)

Ensure all insights are based on the actual data provided and avoid generic statements.
  `;

  try {
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

    // Save to database and return the saved persona
    try {
      const savedPersona = await ContactPersonaService.createPersona({
        contact_id: input.contact_id,
        persona_summary: personaData.persona_summary,
        behavioral_traits:
          personaData.behavioral_traits.length > 0
            ? personaData.behavioral_traits
            : ["Data-driven", "Professional"],
        communication_preferences:
          personaData.communication_preferences.length > 0
            ? personaData.communication_preferences
            : ["Email preferred"],
        buying_patterns:
          personaData.buying_patterns.length > 0
            ? personaData.buying_patterns
            : ["Value-conscious"],
        generated_at: new Date().toISOString(),
      });

      return savedPersona;
    } catch (dbError) {
      console.error("Failed to save persona to database:", dbError);

      // Return the generated persona even if database save fails
      const persona: ContactPersona = {
        id: `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        contact_id: input.contact_id,
        persona_summary: personaData.persona_summary,
        behavioral_traits:
          personaData.behavioral_traits.length > 0
            ? personaData.behavioral_traits
            : ["Data-driven", "Professional"],
        communication_preferences:
          personaData.communication_preferences.length > 0
            ? personaData.communication_preferences
            : ["Email preferred"],
        buying_patterns:
          personaData.buying_patterns.length > 0
            ? personaData.buying_patterns
            : ["Value-conscious"],
        generated_at: new Date().toISOString(),
        created_by: "ai_system",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return persona;
    }
  } catch (error) {
    console.error("Error generating persona:", error);
    throw new Error("Failed to generate persona. Please try again.");
  }
};

export const generateObjectionResponse = async (
  input: ObjectionHandlerInput
): Promise<ObjectionHandlerResponse> => {
  const { objection, context } = input;

  // Build context information for better responses
  let contextInfo = "";
  if (context) {
    if (context.contact) {
      contextInfo += `
Customer Context:
- Name: ${context.contact.name}
- Company: ${context.contact.company || "Not specified"}
- Job Title: ${context.contact.job_title || "Not specified"}
- Email: ${context.contact.email}`;
    }

    if (context.deal) {
      contextInfo += `
Deal Context:
- Deal: ${context.deal.title}
- Value: $${context.deal.monetary_value.toLocaleString()}
- Stage: ${context.deal.stage}
- Probability: ${context.deal.probability_percentage}%`;
    }

    if (context.communication) {
      contextInfo += `
Communication Context:
- Type: ${context.communication.type.replace("_", " ")}
- Subject: ${context.communication.subject || "No subject"}`;
    }

    if (context.industry) {
      contextInfo += `
Industry: ${context.industry}`;
    }

    if (context.product_service) {
      contextInfo += `
Product/Service: ${context.product_service}`;
    }
  }

  const prompt = `
You are an expert sales coach and objection handling specialist. A sales representative has encountered a customer objection and needs help crafting an effective response.

Customer Objection:
"${objection}"

${contextInfo ? `Context Information:${contextInfo}` : ""}

Please provide a comprehensive objection handling response in the following JSON format. Do not include markdown formatting or code blocks - just the raw JSON:

{
  "suggested_response": "A professional, empathetic response that addresses the objection directly",
  "response_strategy": "The overall strategy being used (e.g., 'Acknowledge and Redirect', 'Feel, Felt, Found', 'Question the Objection')",
  "key_points": ["point1", "point2", "point3"],
  "tone": "professional|empathetic|confident|consultative"
}

Guidelines for your response:
1. Acknowledge the customer's concern genuinely
2. Provide value-focused reasoning
3. Use the context provided to personalize the response
4. Include specific benefits or solutions
5. End with a question or next step to keep the conversation moving
6. Keep the tone appropriate for a professional sales conversation
7. Make the response actionable and specific to the objection

The key_points should be 3-5 bullet points that summarize the main arguments or benefits to emphasize.
Choose the most appropriate tone based on the objection type and context.
  `;

  try {
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

    // Save to database and return the saved response
    try {
      const savedResponse =
        await ObjectionResponseService.createObjectionResponse({
          objection: objection,
          suggested_response: responseData.suggested_response,
          response_strategy: responseData.response_strategy,
          key_points:
            responseData.key_points.length > 0
              ? responseData.key_points
              : [
                  "Address the concern directly",
                  "Provide value proposition",
                  "Ask for next steps",
                ],
          tone: responseData.tone || "professional",
          context_data: context || {},
          generated_at: new Date().toISOString(),
        });

      return savedResponse;
    } catch (dbError) {
      console.error("Failed to save objection response to database:", dbError);

      // Return the generated response even if database save fails
      const objectionResponse: ObjectionHandlerResponse = {
        id: `objection_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        objection: objection,
        suggested_response: responseData.suggested_response,
        response_strategy: responseData.response_strategy,
        key_points:
          responseData.key_points.length > 0
            ? responseData.key_points
            : [
                "Address the concern directly",
                "Provide value proposition",
                "Ask for next steps",
              ],
        tone: responseData.tone || "professional",
        context_data: context || {},
        generated_at: new Date().toISOString(),
        created_by: "ai_system",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return objectionResponse;
    }
  } catch (error) {
    console.error("Error generating objection response:", error);
    throw new Error("Failed to generate objection response. Please try again.");
  }
};

export const generateWinLossExplanation = async (
  input: WinLossExplainerInput
): Promise<WinLossExplainerResponse> => {
  const { deal, context } = input;

  // Determine if the deal was won or lost
  const outcome = deal.stage === "closed-won" ? "won" : "lost";

  // Build context information for analysis
  let contextInfo = `
Deal Information:
- Title: ${deal.title}
- Value: $${deal.monetary_value.toLocaleString()}
- Stage: ${deal.stage}
- Probability: ${deal.probability_percentage}%
- Expected Close Date: ${
    deal.expected_close_date
      ? new Date(deal.expected_close_date).toLocaleDateString()
      : "Not set"
  }
- Created: ${new Date(deal.created_at).toLocaleDateString()}
- Updated: ${new Date(deal.updated_at).toLocaleDateString()}`;

  if (context?.contact) {
    contextInfo += `

Customer Information:
- Name: ${context.contact.name}
- Company: ${context.contact.company || "Not specified"}
- Job Title: ${context.contact.job_title || "Not specified"}
- Email: ${context.contact.email}
- Phone: ${context.contact.phone || "Not provided"}`;
  }

  if (context?.tasks && context.tasks.length > 0) {
    contextInfo += `

Tasks (${context.tasks.length} total):`;
    context.tasks.slice(0, 10).forEach((task) => {
      contextInfo += `
- ${task.title}: ${task.status}${
        task.due_date
          ? ` (Due: ${new Date(task.due_date).toLocaleDateString()})`
          : ""
      }`;
      if (task.description) {
        contextInfo += `
  Description: ${task.description.substring(0, 100)}${
          task.description.length > 100 ? "..." : ""
        }`;
      }
    });
  }

  if (context?.communications && context.communications.length > 0) {
    contextInfo += `

Communications (${context.communications.length} total):`;
    context.communications.slice(0, 10).forEach((comm) => {
      contextInfo += `
- ${comm.type.replace("_", " ")}: ${comm.subject || "No subject"} (${new Date(
        comm.communication_date
      ).toLocaleDateString()})`;
      if (comm.content) {
        contextInfo += `
  Content: ${comm.content.substring(0, 150)}${
          comm.content.length > 150 ? "..." : ""
        }`;
      }
    });
  }

  if (context?.purchaseHistory && context.purchaseHistory.length > 0) {
    contextInfo += `

Purchase History (${context.purchaseHistory.length} total):`;
    context.purchaseHistory.slice(0, 5).forEach((purchase) => {
      contextInfo += `
- ${purchase.product_service}: $${purchase.amount.toLocaleString()} (${
        purchase.status
      }) - ${new Date(purchase.date).toLocaleDateString()}`;
    });
  }

  const prompt = `
You are an expert sales analyst specializing in win-loss analysis. Analyze the following ${outcome} deal and provide insights into why it ${
    outcome === "won" ? "was successful" : "was lost"
  }.

${contextInfo}

Based on this data, provide a comprehensive analysis in the following JSON format. Do not include markdown formatting or code blocks - just the raw JSON:

{
  "explanation": "A detailed 2-3 paragraph explanation of why this deal was ${outcome}, analyzing the key factors and patterns",
  "key_factors": ["factor1", "factor2", "factor3", "factor4"],
  "lessons_learned": ["lesson1", "lesson2", "lesson3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "confidence_score": 85
}

Guidelines for your analysis:
1. Focus on actionable insights based on the actual data provided
2. Consider timing, communication patterns, task completion, customer engagement
3. Identify specific factors that contributed to the ${outcome}
4. Provide lessons that can be applied to future deals
5. Give recommendations for improving future deal outcomes
6. Assign a confidence score (1-100) based on the amount and quality of data available
7. Be specific and avoid generic statements
8. Consider the customer's behavior patterns and engagement level

Key factors should be 3-5 specific elements that directly influenced the outcome.
Lessons learned should be 2-4 insights that can be applied to future deals.
Recommendations should be 2-4 actionable steps for improving future performance.
  `;

  try {
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

    // Save to database and return the saved analysis
    try {
      const savedAnalysis = await WinLossAnalysisService.createAnalysis({
        deal_id: deal.id,
        outcome: outcome,
        explanation: analysisData.explanation,
        key_factors:
          analysisData.key_factors.length > 0
            ? analysisData.key_factors
            : [`Deal ${outcome} due to insufficient data for analysis`],
        lessons_learned:
          analysisData.lessons_learned.length > 0
            ? analysisData.lessons_learned
            : ["More data needed for comprehensive analysis"],
        recommendations:
          analysisData.recommendations.length > 0
            ? analysisData.recommendations
            : ["Improve data collection for future analysis"],
        confidence_score: Math.max(
          1,
          Math.min(100, analysisData.confidence_score || 50)
        ),
        context_data: {
          deal: deal,
          tasks: context?.tasks || [],
          communications: context?.communications || [],
          purchaseHistory: context?.purchaseHistory || [],
          contact: context?.contact || null,
        },
        generated_at: new Date().toISOString(),
      });

      return savedAnalysis;
    } catch (dbError) {
      console.error("Failed to save win-loss analysis to database:", dbError);

      // Return the generated analysis even if database save fails
      const winLossAnalysis: WinLossExplainerResponse = {
        id: `winloss_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deal_id: deal.id,
        outcome: outcome,
        explanation: analysisData.explanation,
        key_factors:
          analysisData.key_factors.length > 0
            ? analysisData.key_factors
            : [`Deal ${outcome} due to insufficient data for analysis`],
        lessons_learned:
          analysisData.lessons_learned.length > 0
            ? analysisData.lessons_learned
            : ["More data needed for comprehensive analysis"],
        recommendations:
          analysisData.recommendations.length > 0
            ? analysisData.recommendations
            : ["Improve data collection for future analysis"],
        confidence_score: Math.max(
          1,
          Math.min(100, analysisData.confidence_score || 50)
        ),
        context_data: {
          deal: deal,
          tasks: context?.tasks || [],
          communications: context?.communications || [],
          purchaseHistory: context?.purchaseHistory || [],
          contact: context?.contact || null,
        },
        generated_at: new Date().toISOString(),
        created_by: "ai_system",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return winLossAnalysis;
    }
  } catch (error) {
    console.error("Error generating win-loss analysis:", error);
    throw new Error("Failed to generate win-loss analysis. Please try again.");
  }
};

// Add new deal coach function
export const generateDealCoachSuggestions = async (
  deal: Deal,
  context: {
    tasks?: Task[];
    communications?: Communication[];
    purchaseHistory?: PurchaseHistory[];
  }
): Promise<string> => {
  // Build context information for better suggestions
  let contextInfo = `
Deal Information:
- Title: ${deal.title}
- Value: $${deal.monetary_value.toLocaleString()}
- Stage: ${deal.stage}
- Probability: ${deal.probability_percentage}%
- Expected Close Date: ${
    deal.expected_close_date
      ? new Date(deal.expected_close_date).toLocaleDateString()
      : "Not set"
  }
- Created: ${new Date(deal.created_at).toLocaleDateString()}
- Updated: ${new Date(deal.updated_at).toLocaleDateString()}`;

  if (context?.tasks && context.tasks.length > 0) {
    contextInfo += `

Tasks (${context.tasks.length} total):`;
    context.tasks.slice(0, 10).forEach((task) => {
      contextInfo += `
- ${task.title}: ${task.status}${
        task.due_date
          ? ` (Due: ${new Date(task.due_date).toLocaleDateString()})`
          : ""
      }`;
      if (task.description) {
        contextInfo += `
  Description: ${task.description.substring(0, 100)}${
          task.description.length > 100 ? "..." : ""
        }`;
      }
    });
  }

  if (context?.communications && context.communications.length > 0) {
    contextInfo += `

Communications (${context.communications.length} total):`;
    context.communications.slice(0, 10).forEach((comm) => {
      contextInfo += `
- ${comm.type.replace("_", " ")}: ${comm.subject || "No subject"} (${new Date(
        comm.communication_date
      ).toLocaleDateString()})`;
      if (comm.content) {
        contextInfo += `
  Content: ${comm.content.substring(0, 150)}${
          comm.content.length > 150 ? "..." : ""
        }`;
      }
    });
  }

  if (context?.purchaseHistory && context.purchaseHistory.length > 0) {
    contextInfo += `

Purchase History (${context.purchaseHistory.length} total):`;
    context.purchaseHistory.slice(0, 5).forEach((purchase) => {
      contextInfo += `
- ${purchase.product_service}: $${purchase.amount.toLocaleString()} (${
        purchase.status
      }) - ${new Date(purchase.date).toLocaleDateString()}`;
    });
  }

  const prompt = `
You are an expert sales deal coach. Analyze the following deal and provide specific, actionable next steps to improve the probability of closing the deal successfully.

${contextInfo}

Based on this data, provide 3-5 specific, actionable recommendations that the sales representative should take to move this deal forward. Focus on:

1. Immediate next steps based on the current stage
2. Addressing any gaps or risks you identify
3. Leveraging the customer's communication patterns and preferences
4. Building momentum toward closing
5. Specific actions with clear timelines

Format your response as a clear, numbered list of actionable recommendations. Each recommendation should be specific, measurable, and include a suggested timeline.

Keep your response concise but comprehensive - aim for 200-400 words total.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert sales deal coach. Provide specific, actionable recommendations to help sales representatives close deals more effectively. Focus on practical next steps based on the deal context and customer behavior patterns.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    const suggestions = response.trim();

    // Save to database
    try {
      await DealCoachService.createSuggestion({
        deal_id: deal.id,
        suggestions: suggestions,
        deal_context: {
          deal: deal,
          tasks: context.tasks || [],
          communications: context.communications || [],
          purchaseHistory: context.purchaseHistory || [],
        },
        generated_at: new Date().toISOString(),
      });
    } catch (dbError) {
      console.error(
        "Failed to save deal coach suggestion to database:",
        dbError
      );
      // Continue with the response even if database save fails
    }

    return suggestions;
  } catch (error) {
    console.error("Error generating deal coach suggestions:", error);
    throw new Error(
      "Failed to generate deal coach suggestions. Please try again."
    );
  }
};

export const aiService = {
  generateContactPersona,
  generateObjectionResponse,
  generateWinLossExplanation,
  generateDealCoachSuggestions,
};
