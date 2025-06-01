# AI Persona Generation Feature

## Overview

The AI Persona Generation feature automatically creates behavioral profiles for leads/contacts based on their interaction history using OpenAI's GPT-4 model.

## Implementation

### Files Added/Modified

1. **src/types/index.ts** - Added persona types:

   - `ContactPersona` interface
   - `GeneratePersonaInput` interface

2. **src/services/aiService.ts** - New AI service for OpenAI integration:

   - `generateContactPersona()` function
   - Handles data aggregation and prompt engineering
   - Returns structured persona data

3. **src/components/PersonaGenerator.tsx** - New React component:

   - UI for generating and displaying personas
   - Loading states and error handling
   - Beautiful display of persona insights

4. **src/pages/ContactDetailPage.tsx** - Updated to include:
   - New "AI Persona" tab
   - Integration with PersonaGenerator component

### Features

- **Behavioral Analysis**: Analyzes communication patterns, deal history, and purchase behavior
- **Actionable Insights**: Provides specific recommendations for:
  - Communication preferences (email vs phone, formal vs casual)
  - Decision-making patterns (quick vs deliberate, price-sensitive)
  - Engagement patterns (responsive vs needs follow-up)
  - Buying behavior (seasonal patterns, budget considerations)
- **Real-time Generation**: On-demand persona generation with loading states
- **Error Handling**: Graceful error handling with retry functionality
- **Regeneration**: Ability to regenerate personas for updated insights

### Setup Instructions

1. **Environment Configuration**:
   Create a `.env` file in the project root with:

   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

2. **OpenAI API Key**:

   - Sign up at https://platform.openai.com/
   - Create an API key in your dashboard
   - Add the key to your environment file

3. **Dependencies**:
   The OpenAI package is already included in package.json:
   ```json
   "openai": "^5.0.1"
   ```

### Usage

1. Navigate to any contact's detail page
2. Click on the "AI Persona" tab
3. Click "Generate Persona" button
4. Wait for AI analysis (typically 5-10 seconds)
5. Review the generated insights:
   - Profile Summary
   - Behavioral Traits
   - Communication Preferences
   - Buying Patterns

### Technical Details

- **Model**: Uses GPT-4o-mini for cost-effective analysis
- **Prompt Engineering**: Structured prompts for consistent output
- **Data Processing**: Aggregates contact history for comprehensive analysis
- **Response Format**: JSON-structured responses for reliable parsing
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Security Considerations

- **Client-side API calls**: Currently configured for development (dangerouslyAllowBrowser: true)
- **Production recommendation**: Move API calls to server-side for security
- **API Key protection**: Never commit API keys to version control

### Future Enhancements

- **Persona Storage**: Save generated personas to database
- **Similarity Search**: Find similar customer personas using vector embeddings
- **Persona History**: Track persona changes over time
- **Team Sharing**: Share persona insights across team members
- **Integration**: Connect with email/CRM tools for automated insights

### Cost Considerations

- **Token Usage**: Approximately 500-1000 tokens per persona generation
- **Cost**: ~$0.001-0.002 per persona with GPT-4o-mini
- **Optimization**: Limit historical data to reduce token usage if needed

## Testing

To test the feature:

1. Ensure you have contacts with communication and deal history
2. Configure your OpenAI API key
3. Navigate to a contact detail page
4. Generate a persona and verify the output quality
5. Test error scenarios (invalid API key, network issues)
