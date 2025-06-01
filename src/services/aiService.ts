import OpenAI from "openai";
import type { GeneratePersonaInput, ContactPersona } from "../types/index";

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

    // Create the persona object
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
    };

    return persona;
  } catch (error) {
    console.error("Error generating persona:", error);
    throw new Error("Failed to generate persona. Please try again.");
  }
};

export const aiService = {
  generateContactPersona,
};
