# CRM with AI - Customer Relationship Management System

A modern, AI-powered CRM application built with React, TypeScript, and Supabase. This system helps sales teams manage contacts, deals, tasks, and communications while providing intelligent insights through AI-powered features.

## 🚀 Features

### Core CRM Functionality

- **Contact Management**: Store and organize customer information
- **Deal Pipeline**: Track sales opportunities through customizable stages
- **Task Management**: Create and manage follow-up tasks
- **Communication Tracking**: Log emails, calls, meetings, and notes
- **Purchase History**: Track customer purchase patterns
- **Dashboard Analytics**: Visual insights into sales performance
- **User Settings**: Personalized preferences and AI configuration

### 🤖 AI-Powered Features

- **Deal Coach AI**: Get intelligent next-step recommendations for deals
- **Customer Persona Builder**: Auto-generate behavioral profiles from interaction data
- **Objection Handler**: AI-powered responses to customer objections
- **Win-Loss Explainer**: Understand why deals were won or lost
- **Personal API Key Management**: Configure your own OpenAI API key through the settings

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: NextUI (React components)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI Integration**: OpenAI GPT-4o-mini
- **State Management**: React hooks and context
- **Icons**: Heroicons

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- OpenAI API key (can be configured per-user or system-wide)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd crm-with-ai
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional: System-wide OpenAI API key (users can override in settings)
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following scripts in order:
   - Copy and run the contents of `database/schema.sql` (core tables)
   - Copy and run the contents of `scripts/setup-ai-features.sql` (AI features)
   - Copy and run the contents of `scripts/setup-user-settings.sql` (user settings)

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔑 OpenAI API Key Configuration

### Option 1: User-Configured API Keys (Recommended)

Users can configure their own OpenAI API keys through the application:

1. Navigate to **Settings** in the application
2. Find the **AI Configuration** section
3. Enter your OpenAI API key
4. Click **Test** to verify the key works
5. Click **Save AI Settings**

**Benefits:**

- Each user controls their own AI usage and costs
- No shared API key limits
- Better security and privacy
- Users can update keys independently

### Option 2: System-Wide API Key

Set `VITE_OPENAI_API_KEY` in your environment variables for a fallback system-wide key.

**Note:** User-configured keys take priority over the system-wide key.

## 📊 AI Features Setup

### OpenAI Configuration

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Configure it either:
   - **Per-user**: Through the Settings page in the application
   - **System-wide**: Add to `.env.local` as `VITE_OPENAI_API_KEY`
3. Ensure your OpenAI account has sufficient credits

### Database Schema

The AI features require additional database tables. Run the setup scripts:

```sql
-- 1. Core CRM tables
-- Copy contents of database/schema.sql

-- 2. AI features tables
-- Copy contents of scripts/setup-ai-features.sql

-- 3. User settings table
-- Copy contents of scripts/setup-user-settings.sql
```

### Testing AI Features

After setting up your API key in Settings, test the AI features:

1. Go to any contact and generate a persona
2. Open a deal and try the AI coach
3. Test objection handling in communications

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Shared components
│   └── ui/             # UI-specific components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Library configurations
├── pages/              # Page components
│   └── SettingsPage.tsx    # User settings with API key config
├── services/           # API and business logic
│   ├── aiService.ts           # Central AI service with dynamic client
│   ├── settingsService.ts     # User settings management
│   ├── contactPersonaService.ts
│   ├── dealCoachService.ts
│   ├── objectionResponseService.ts
│   └── winLossAnalysisService.ts
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

database/               # Database schemas
docs/                   # Documentation
├── OPENAI_API_KEY_SETUP.md  # Detailed API key setup guide
scripts/                # Setup and utility scripts
├── setup-ai-features.sql
└── setup-user-settings.sql
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📖 Usage Guide

### Managing Contacts

1. Navigate to the Contacts page
2. Click "Add Contact" to create new contacts
3. Use the search and filter options to find contacts
4. Click on any contact to view detailed information

### Deal Pipeline

1. Go to the Deals page to see your pipeline
2. Drag and drop deals between stages
3. Click on deals to view details and add tasks
4. Use AI features for coaching and objection handling

### User Settings

1. Navigate to **Settings** from the main menu
2. Configure your preferences:
   - **AI Configuration**: Set your OpenAI API key
   - **Notifications**: Email and push notification preferences
   - **Privacy**: Data sharing and profile visibility
   - **Preferences**: Language, timezone, date format, currency

### AI Features Usage

#### Setting Up AI Features

1. Go to **Settings** → **AI Configuration**
2. Enter your OpenAI API key
3. Click **Test** to verify it works
4. Save your settings

#### Deal Coach AI

- Open any deal detail page
- Click "AI Deal Coach" button
- Get personalized recommendations for next steps

#### Customer Persona Builder

- Go to a contact's detail page
- Use the persona generator to create behavioral profiles
- View insights about communication preferences and buying patterns

#### Objection Handler

- In deal details, click "Handle Objection"
- Enter the customer's objection
- Get AI-powered response suggestions with different tones

#### Win-Loss Explainer

- Available for closed deals (won or lost)
- Click "Why Did We Win/Lose?" button
- Get detailed analysis with key factors and recommendations

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication**: Secure user authentication via Supabase Auth
- **Data Privacy**: AI responses are stored per-user
- **API Key Security**: User API keys are stored securely with user-level access
- **Environment Variables**: System-wide keys stored as environment variables

## 📈 Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes
- **AI Response Caching**: Database storage reduces redundant API calls
- **Dynamic AI Client**: OpenAI client created on-demand with user's API key
- **Lazy Loading**: Components load on demand
- **Error Boundaries**: Graceful error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [OpenAI API Key Setup Guide](docs/OPENAI_API_KEY_SETUP.md)
- [Database Schema](database/schema.sql)
- [AI Features Schema](scripts/setup-ai-features.sql)
- [User Settings Schema](scripts/setup-user-settings.sql)

## 🐛 Troubleshooting

### Common Issues

1. **AI Features Not Working**

   - Check OpenAI API key is configured in Settings
   - Use the Test button to verify your API key
   - Verify API key has sufficient credits in OpenAI dashboard
   - Ensure user_settings table is created in database

2. **"API key not found" Error**

   - Go to Settings → AI Configuration
   - Enter your OpenAI API key and save
   - Alternatively, set VITE_OPENAI_API_KEY environment variable

3. **Database Connection Issues**

   - Verify Supabase URL and keys
   - Check RLS policies are applied
   - Ensure user is authenticated
   - Run all database setup scripts

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

### Getting Help

- Check the [OpenAI API Key Setup Guide](docs/OPENAI_API_KEY_SETUP.md)
- Review error messages in browser console
- Verify all database tables are created
- Test your API key in Settings

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the backend infrastructure
- [OpenAI](https://openai.com/) for AI capabilities
- [NextUI](https://nextui.org/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Built with ❤️ for modern sales teams**
