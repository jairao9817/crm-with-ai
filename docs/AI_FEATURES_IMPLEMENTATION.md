# AI Features Implementation Guide

## Overview

This document describes the implementation of AI-powered features in the CRM application. The system includes four main AI features that enhance sales productivity and customer insights.

## Features Implemented

### 1. Deal Coach AI

- **Purpose**: Provides actionable next steps to improve deal close probability
- **Location**: Deal detail pages, accessible via "AI Deal Coach" button
- **Database**: `deal_coach_suggestions` table
- **Service**: `DealCoachService` class

### 2. Customer Persona Builder

- **Purpose**: Auto-generates behavioral profiles for leads based on interaction data
- **Location**: Contact pages via persona generator component
- **Database**: `contact_personas` table
- **Service**: `ContactPersonaService` class

### 3. Objection Handler Recommender

- **Purpose**: Suggests professional responses to customer objections
- **Location**: Deal detail pages via "Handle Objection" button
- **Database**: `objection_responses` table
- **Service**: `ObjectionResponseService` class

### 4. Win-Loss Explainer

- **Purpose**: Explains why deals were won or lost with actionable insights
- **Location**: Deal detail pages for closed deals
- **Database**: `win_loss_analyses` table
- **Service**: `WinLossAnalysisService` class

## Architecture

### AI Service Layer

- **Central Service**: `src/services/aiService.ts`
- **OpenAI Integration**: Uses GPT-4o-mini model for all AI generation
- **Database Integration**: Automatically saves all AI responses to database
- **Error Handling**: Graceful fallbacks if database saves fail

### Database Schema

- **Tables**: 4 new tables for storing AI responses
- **Security**: Row Level Security (RLS) policies ensure users only see their own data
- **Indexes**: Optimized for common query patterns
- **Triggers**: Automatic `updated_at` timestamp management

### Service Classes

Each AI feature has a dedicated service class with CRUD operations:

- Create, read, update, delete AI responses
- Statistics and analytics methods
- Search and filtering capabilities
- User-specific data access

## Setup Instructions

### 1. Database Setup

Run the SQL script to create the necessary tables:

```bash
# Copy the contents of scripts/setup-ai-features.sql
# Paste and run in your Supabase SQL editor
```

### 2. Environment Variables

Ensure your `.env.local` file contains:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Dependencies

The implementation uses existing dependencies:

- OpenAI SDK (already installed)
- Supabase client (already configured)
- React components (NextUI)

## Usage Examples

### Deal Coach AI

```typescript
import { aiService } from "../services/aiService";

// Generate coaching suggestions for a deal
const suggestions = await aiService.generateDealCoachSuggestions(deal, {
  tasks: dealTasks,
  communications: dealCommunications,
  purchaseHistory: customerPurchases,
});

// Get saved suggestions from database
import { DealCoachService } from "../services/dealCoachService";
const savedSuggestions = await DealCoachService.getSuggestionsByDeal(dealId);
```

### Customer Persona Builder

```typescript
import { aiService } from "../services/aiService";

// Generate persona for a contact
const persona = await aiService.generateContactPersona({
  contact_id: contactId,
  contact_data: {
    contact: contactInfo,
    deals: contactDeals,
    communications: contactCommunications,
    purchaseHistory: contactPurchases,
  },
});

// Get latest persona from database
import { ContactPersonaService } from "../services/contactPersonaService";
const latestPersona = await ContactPersonaService.getLatestPersona(contactId);
```

### Objection Handler

```typescript
import { aiService } from "../services/aiService";

// Generate objection response
const response = await aiService.generateObjectionResponse({
  objection: "Your price is too high",
  context: {
    contact: customerInfo,
    deal: currentDeal,
    industry: "Technology",
    product_service: "CRM Software",
  },
});

// Search previous responses
import { ObjectionResponseService } from "../services/objectionResponseService";
const similarResponses = await ObjectionResponseService.searchByObjection(
  "price"
);
```

### Win-Loss Explainer

```typescript
import { aiService } from "../services/aiService";

// Generate win-loss analysis
const analysis = await aiService.generateWinLossExplanation({
  deal: closedDeal,
  context: {
    tasks: dealTasks,
    communications: dealCommunications,
    purchaseHistory: customerHistory,
    contact: customerInfo,
  },
});

// Get high-confidence analyses
import { WinLossAnalysisService } from "../services/winLossAnalysisService";
const highConfidenceAnalyses =
  await WinLossAnalysisService.getHighConfidenceAnalyses();
```

## Database Schema Details

### contact_personas

```sql
- id: UUID (Primary Key)
- contact_id: UUID (Foreign Key to contacts)
- persona_summary: TEXT
- behavioral_traits: TEXT[]
- communication_preferences: TEXT[]
- buying_patterns: TEXT[]
- generated_at: TIMESTAMP
- created_by: UUID (Foreign Key to auth.users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### deal_coach_suggestions

```sql
- id: UUID (Primary Key)
- deal_id: UUID (Foreign Key to deals)
- suggestions: TEXT
- deal_context: JSONB
- generated_at: TIMESTAMP
- created_by: UUID (Foreign Key to auth.users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### objection_responses

```sql
- id: UUID (Primary Key)
- objection: TEXT
- suggested_response: TEXT
- response_strategy: VARCHAR(255)
- key_points: TEXT[]
- tone: VARCHAR(50) CHECK (professional|empathetic|confident|consultative)
- context_data: JSONB
- generated_at: TIMESTAMP
- created_by: UUID (Foreign Key to auth.users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### win_loss_analyses

```sql
- id: UUID (Primary Key)
- deal_id: UUID (Foreign Key to deals)
- outcome: VARCHAR(10) CHECK (won|lost)
- explanation: TEXT
- key_factors: TEXT[]
- lessons_learned: TEXT[]
- recommendations: TEXT[]
- confidence_score: INTEGER (1-100)
- context_data: JSONB
- generated_at: TIMESTAMP
- created_by: UUID (Foreign Key to auth.users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Security Features

### Row Level Security (RLS)

- All AI feature tables have RLS enabled
- Users can only access their own AI responses
- Policies enforce user isolation at the database level

### Data Privacy

- AI responses are stored per-user
- Context data is sanitized before sending to OpenAI
- No sensitive customer data is exposed in logs

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns
- Efficient query patterns in service classes
- Pagination support for large datasets

### AI Response Caching

- Database storage serves as natural caching layer
- Reduces redundant API calls to OpenAI
- Enables historical analysis and trends

### Error Handling

- Graceful degradation if database saves fail
- Fallback responses for AI generation failures
- User-friendly error messages

## Analytics and Insights

### Available Statistics

Each service class provides analytics methods:

```typescript
// Deal Coach Statistics
const coachStats = await DealCoachService.getSuggestionStats();
// Returns: totalSuggestions, thisMonthSuggestions, dealsWithSuggestions

// Persona Statistics
const personaStats = await ContactPersonaService.getPersonaStats();
// Returns: totalPersonas, thisMonthPersonas, contactsWithPersonas

// Objection Response Statistics
const objectionStats = await ObjectionResponseService.getObjectionStats();
// Returns: totalResponses, responsesByTone, topObjections

// Win-Loss Analysis Statistics
const analysisStats = await WinLossAnalysisService.getAnalysisStats();
// Returns: totalAnalyses, wonAnalyses, lostAnalyses, averageConfidenceScore
```

## Future Enhancements

### Planned Features

1. **AI Response Rating**: Allow users to rate AI response quality
2. **Custom Prompts**: Enable users to customize AI prompts
3. **Bulk Operations**: Generate personas/analyses for multiple records
4. **Integration Webhooks**: Trigger AI generation on specific events
5. **Advanced Analytics**: Trend analysis and success correlation

### Scalability Considerations

1. **Rate Limiting**: Implement OpenAI API rate limiting
2. **Background Processing**: Move AI generation to background jobs
3. **Response Caching**: Implement Redis caching for frequent requests
4. **Model Fine-tuning**: Train custom models on user data

## Troubleshooting

### Common Issues

1. **OpenAI API Key Missing**

   - Ensure `VITE_OPENAI_API_KEY` is set in environment variables
   - Verify API key has sufficient credits and permissions

2. **Database Connection Errors**

   - Check Supabase connection configuration
   - Verify RLS policies are correctly applied

3. **AI Response Parsing Errors**

   - AI service includes robust JSON parsing with fallbacks
   - Check OpenAI API response format changes

4. **Permission Denied Errors**
   - Verify user authentication status
   - Check RLS policies for the specific table

### Debug Mode

Enable debug logging by setting:

```env
VITE_DEBUG_AI=true
```

This will log AI prompts, responses, and database operations to the console.

## Support

For issues or questions about the AI features implementation:

1. Check the troubleshooting section above
2. Review the service class implementations
3. Verify database schema and policies
4. Test with sample data to isolate issues

The implementation is designed to be robust and self-healing, with graceful fallbacks for most error conditions.
