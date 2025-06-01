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

### 🤖 AI-Powered Features

- **Deal Coach AI**: Get intelligent next-step recommendations for deals
- **Customer Persona Builder**: Auto-generate behavioral profiles from interaction data
- **Objection Handler**: AI-powered responses to customer objections
- **Win-Loss Explainer**: Understand why deals were won or lost

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
- OpenAI API key

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
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and run the contents of `scripts/setup-ai-features.sql`
4. This will create all necessary tables and security policies

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📊 AI Features Setup

### OpenAI Configuration

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add it to your `.env.local` file as `VITE_OPENAI_API_KEY`
3. Ensure your OpenAI account has sufficient credits

### Database Schema

The AI features require additional database tables. Run the setup script:

```sql
-- Copy contents of scripts/setup-ai-features.sql
-- Paste and execute in Supabase SQL Editor
```

### Testing AI Features

Run the test script to verify everything works:

```bash
npm run test:ai-features
```

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
├── services/           # API and business logic
│   ├── aiService.ts           # Central AI service
│   ├── contactPersonaService.ts
│   ├── dealCoachService.ts
│   ├── objectionResponseService.ts
│   └── winLossAnalysisService.ts
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

database/               # Database schemas
docs/                   # Documentation
scripts/                # Setup and utility scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test:ai-features` - Test AI features

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

### AI Features Usage

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
- **API Security**: Environment variables for sensitive keys

## 📈 Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes
- **AI Response Caching**: Database storage reduces redundant API calls
- **Lazy Loading**: Components load on demand
- **Error Boundaries**: Graceful error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [AI Features Implementation Guide](docs/AI_FEATURES_IMPLEMENTATION.md)
- [Database Schema](database/ai-features-schema.sql)
- [API Documentation](docs/api-documentation.md)

## 🐛 Troubleshooting

### Common Issues

1. **AI Features Not Working**

   - Check OpenAI API key is set correctly
   - Verify API key has sufficient credits
   - Ensure database schema is set up

2. **Database Connection Issues**

   - Verify Supabase URL and keys
   - Check RLS policies are applied
   - Ensure user is authenticated

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

### Getting Help

- Check the [troubleshooting guide](docs/AI_FEATURES_IMPLEMENTATION.md#troubleshooting)
- Review error messages in browser console
- Verify all environment variables are set

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the backend infrastructure
- [OpenAI](https://openai.com/) for AI capabilities
- [NextUI](https://nextui.org/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Built with ❤️ for modern sales teams**
