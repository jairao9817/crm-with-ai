# OpenAI API Key Setup

This CRM application includes AI-powered features that require an OpenAI API key. You can now configure your own API key through the application settings instead of relying on environment variables.

## Features Powered by OpenAI

- **Contact Personas**: Generate behavioral profiles for contacts based on their interaction history
- **Objection Handling**: Get AI-powered responses to customer objections
- **Win-Loss Analysis**: Analyze why deals were won or lost
- **Deal Coaching**: Get AI suggestions for next steps on active deals

## Setting Up Your OpenAI API Key

### 1. Get Your API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account (or create one if needed)
3. Click "Create new secret key"
4. Copy the generated API key (it starts with `sk-`)

### 2. Configure in the Application

1. Navigate to **Settings** in the application
2. Find the **AI Configuration** section
3. Paste your API key in the "OpenAI API Key" field
4. Click the **Test** button to verify the key works
5. Click **Save AI Settings**

### 3. Using AI Features

Once your API key is configured, you can use AI features throughout the application:

- **Contact Detail Page**: Generate personas for contacts
- **Deal Detail Page**: Get AI coaching suggestions
- **Communications**: Handle objections with AI assistance
- **Deal Analysis**: Generate win-loss explanations

## Security & Privacy

- Your API key is stored securely in the database with user-level access controls
- The key is only used for AI features within the application
- You can update or remove your API key at any time in Settings
- API keys are encrypted and only accessible to your user account

## Fallback Behavior

If you don't configure a personal API key, the application will attempt to use the system-wide environment variable `VITE_OPENAI_API_KEY` if available. However, for the best experience and to ensure AI features work reliably, we recommend setting up your own API key.

## Troubleshooting

### "API key not found" Error

- Make sure you've entered your API key in Settings
- Verify the key is valid by using the Test button
- Check that you have sufficient credits in your OpenAI account

### "Invalid API key" Error

- Double-check that you copied the entire key correctly
- Ensure the key hasn't been revoked in your OpenAI account
- Try generating a new key if the current one isn't working

### AI Features Not Working

- Verify your API key is saved in Settings
- Check your OpenAI account for usage limits or billing issues
- Try refreshing the page after updating your API key

## API Usage and Costs

- The application uses the `gpt-4o-mini` model for cost efficiency
- Typical requests use 100-1000 tokens depending on the feature
- Monitor your usage in the [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- Set usage limits in your OpenAI account to control costs

## Support

If you encounter issues with the OpenAI integration, please check:

1. Your API key is correctly configured in Settings
2. Your OpenAI account has sufficient credits
3. The OpenAI service is operational at [status.openai.com](https://status.openai.com)
