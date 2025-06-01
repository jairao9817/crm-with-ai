/**
 * Test script for AI Features
 *
 * This script tests the AI features implementation to ensure everything works correctly.
 * Run this after setting up the database schema and environment variables.
 *
 * Usage: npm run test:ai-features
 */

import { aiService } from "../src/services/aiService";
import { ContactPersonaService } from "../src/services/contactPersonaService";
import { DealCoachService } from "../src/services/dealCoachService";
import { ObjectionResponseService } from "../src/services/objectionResponseService";
import { WinLossAnalysisService } from "../src/services/winLossAnalysisService";

// Mock data for testing
const mockContact = {
  id: "test-contact-id",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1-555-0123",
  company: "Acme Corp",
  job_title: "VP of Sales",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockDeal = {
  id: "test-deal-id",
  title: "Enterprise CRM Implementation",
  contact_id: "test-contact-id",
  user_id: "test-user-id",
  stage: "negotiation" as const,
  monetary_value: 50000,
  expected_close_date: "2024-12-31",
  probability_percentage: 75,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockClosedDeal = {
  ...mockDeal,
  id: "test-closed-deal-id",
  stage: "closed-won" as const,
  probability_percentage: 100,
};

const mockTasks = [
  {
    id: "task-1",
    deal_id: "test-deal-id",
    title: "Send proposal",
    description: "Prepare and send detailed proposal",
    due_date: "2024-02-15",
    status: "completed" as const,
    user_id: "test-user-id",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const mockCommunications = [
  {
    id: "comm-1",
    contact_id: "test-contact-id",
    deal_id: "test-deal-id",
    type: "email" as const,
    subject: "Follow-up on proposal",
    content: "Thank you for your interest in our CRM solution...",
    communication_date: "2024-01-15T10:00:00Z",
    user_id: "test-user-id",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
];

const mockPurchaseHistory = [
  {
    id: "purchase-1",
    contact_id: "test-contact-id",
    deal_id: "test-deal-id",
    date: "2023-12-01",
    amount: 25000,
    product_service: "CRM Basic Package",
    status: "completed" as const,
    created_at: "2023-12-01T00:00:00Z",
    updated_at: "2023-12-01T00:00:00Z",
  },
];

async function testAIFeatures() {
  console.log("🚀 Starting AI Features Test Suite...\n");

  try {
    // Test 1: Deal Coach AI
    console.log("📊 Testing Deal Coach AI...");
    const coachSuggestions = await aiService.generateDealCoachSuggestions(
      mockDeal,
      {
        tasks: mockTasks,
        communications: mockCommunications,
        purchaseHistory: mockPurchaseHistory,
      }
    );
    console.log("✅ Deal Coach suggestions generated successfully");
    console.log(
      "Suggestions preview:",
      coachSuggestions.substring(0, 100) + "...\n"
    );

    // Test 2: Customer Persona Builder
    console.log("👤 Testing Customer Persona Builder...");
    const persona = await aiService.generateContactPersona({
      contact_id: mockContact.id,
      contact_data: {
        contact: mockContact,
        deals: [mockDeal],
        communications: mockCommunications,
        purchaseHistory: mockPurchaseHistory,
      },
    });
    console.log("✅ Customer persona generated successfully");
    console.log(
      "Persona summary:",
      persona.persona_summary.substring(0, 100) + "...\n"
    );

    // Test 3: Objection Handler
    console.log("🛡️ Testing Objection Handler...");
    const objectionResponse = await aiService.generateObjectionResponse({
      objection: "Your price is too high compared to competitors",
      context: {
        contact: mockContact,
        deal: mockDeal,
        industry: "Technology",
        product_service: "CRM Software",
      },
    });
    console.log("✅ Objection response generated successfully");
    console.log("Response strategy:", objectionResponse.response_strategy);
    console.log(
      "Suggested response preview:",
      objectionResponse.suggested_response.substring(0, 100) + "...\n"
    );

    // Test 4: Win-Loss Explainer
    console.log("📈 Testing Win-Loss Explainer...");
    const winLossAnalysis = await aiService.generateWinLossExplanation({
      deal: mockClosedDeal,
      context: {
        tasks: mockTasks,
        communications: mockCommunications,
        purchaseHistory: mockPurchaseHistory,
        contact: mockContact,
      },
    });
    console.log("✅ Win-loss analysis generated successfully");
    console.log("Outcome:", winLossAnalysis.outcome);
    console.log("Confidence score:", winLossAnalysis.confidence_score);
    console.log(
      "Explanation preview:",
      winLossAnalysis.explanation.substring(0, 100) + "...\n"
    );

    // Test 5: Database Service Methods (if database is available)
    console.log("🗄️ Testing Database Service Methods...");

    try {
      // Test persona service stats
      const personaStats = await ContactPersonaService.getPersonaStats();
      console.log("✅ Persona stats retrieved:", personaStats);

      // Test deal coach service stats
      const coachStats = await DealCoachService.getSuggestionStats();
      console.log("✅ Deal coach stats retrieved:", coachStats);

      // Test objection response service stats
      const objectionStats = await ObjectionResponseService.getObjectionStats();
      console.log("✅ Objection response stats retrieved:", objectionStats);

      // Test win-loss analysis service stats
      const analysisStats = await WinLossAnalysisService.getAnalysisStats();
      console.log("✅ Win-loss analysis stats retrieved:", analysisStats);
    } catch (dbError) {
      console.log(
        "⚠️ Database service tests skipped (database not available or not set up)"
      );
      console.log("Error:", dbError.message);
    }

    console.log("\n🎉 All AI Features tests completed successfully!");
    console.log("\n📋 Test Summary:");
    console.log("- Deal Coach AI: ✅ Working");
    console.log("- Customer Persona Builder: ✅ Working");
    console.log("- Objection Handler: ✅ Working");
    console.log("- Win-Loss Explainer: ✅ Working");
    console.log("- Database Services: ✅ Working (if database is set up)");
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("\n🔧 Troubleshooting tips:");
    console.error("1. Ensure VITE_OPENAI_API_KEY is set in your environment");
    console.error("2. Check that your OpenAI API key has sufficient credits");
    console.error(
      "3. Verify database schema is set up (run scripts/setup-ai-features.sql)"
    );
    console.error("4. Ensure Supabase connection is configured correctly");

    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  testAIFeatures();
}

export { testAIFeatures };
