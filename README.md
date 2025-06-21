# CRM with AI - Customer Relationship Management System

- https://melodic-mochi-f9e8c0.netlify.app/

A modern, AI-powered CRM application built with React, TypeScript, and Supabase. This comprehensive system helps sales teams manage contacts, deals, tasks, and communications while providing intelligent insights through advanced AI-powered features.

## 🚀 Current Features

### Core CRM Functionality

- **Contact Management**: Complete customer information management with company details, job titles, and preferences
- **Deal Pipeline**: Advanced sales pipeline with drag-and-drop functionality across 5 stages (Lead, Prospect, Negotiation, Closed-Won, Closed-Lost)
- **Task Management**: Create, assign, and track follow-up tasks with due dates and status tracking
- **Communication Tracking**: Comprehensive logging of emails, calls, meetings, and notes with detailed history
- **Purchase History**: Complete transaction tracking with product/service details, amounts, and status
- **Activity Feed**: Centralized activity tracking across all CRM modules
- **Dashboard Analytics**: Real-time visual insights with key metrics, pipeline overview, and revenue trends
- **User Profile Management**: Personalized user profiles with preferences and settings
- **Advanced Search & Filtering**: Powerful search capabilities across all modules

### 🤖 AI-Powered Features

- **Deal Coach AI**: Intelligent next-step recommendations for deals based on context and history
- **Customer Persona Builder**: Auto-generate detailed behavioral profiles from interaction data and purchase history
- **Objection Handler**: AI-powered responses to customer objections with multiple tone options
- **Win-Loss Explainer**: Comprehensive analysis of why deals were won or lost with actionable insights
- **Personal API Key Management**: Secure per-user OpenAI API key configuration through settings
- **Context-Aware AI**: All AI features leverage complete customer context for better recommendations

### 🔧 Advanced Features

- **Communication Notes**: Detailed note-taking system for communications with categorization
- **Deal Close Management**: Structured deal closing process with outcome tracking
- **Real-time Updates**: Live data synchronization across all modules
- **Responsive Design**: Fully responsive interface optimized for desktop and mobile
- **Dark/Light Theme**: Toggle between dark and light themes
- **Data Export**: Export capabilities for reports and analytics
- **User Settings**: Comprehensive settings for notifications, privacy, preferences, and AI configuration

## 🛠️ Technology Stack

### Frontend

- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5.8.3** - Type-safe development
- **Vite 6.3.5** - Fast build tool and development server
- **React Router DOM 7.6.1** - Client-side routing
- **React Hook Form 7.56.4** - Form management with validation
- **Zod 3.25.42** - Schema validation

### UI & Styling

- **HeroUI 2.7.8** - Modern React component library
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Heroicons 2.2.0** - Beautiful SVG icons
- **Framer Motion 12.15.0** - Animation library
- **Headless UI 2.2.4** - Unstyled, accessible UI components

### Backend & Database

- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security (RLS)** - Secure data access policies
- **Supabase Auth** - Authentication and user management
- **Real-time subscriptions** - Live data updates

### AI Integration

- **OpenAI GPT-4o-mini** - Advanced AI capabilities
- **OpenAI API 5.0.1** - Official OpenAI SDK
- **Dynamic API Key Management** - Per-user or system-wide configuration

### Development Tools

- **ESLint 9.25.0** - Code linting and quality
- **TypeScript ESLint 8.30.1** - TypeScript-specific linting
- **PostCSS 8.5.4** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixing

### Additional Libraries

- **@dnd-kit** - Drag and drop functionality for pipeline
- **dotenv 16.5.0** - Environment variable management

## 📋 Prerequisites

- **Node.js 18+** and npm
- **Supabase account** and project
- **OpenAI API key** (can be configured per-user or system-wide)

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

```sql
-- 1. Core CRM tables (contacts, deals)
-- Copy and run: database/schema.sql

-- 2. Extended features (tasks, communications, purchase history)
-- Copy and run: database/phase3-schema.sql

-- 3. Communication notes system
-- Copy and run: database/phase4-communication-notes.sql

-- 4. AI features (personas, objection handling, win-loss analysis, deal coaching)
-- Copy and run: database/ai-features-schema.sql

-- 5. User settings and preferences
-- Copy and run: database/user-settings-schema.sql
```

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

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Shared components (ContactCard, DealCard, etc.)
│   └── ui/             # UI-specific components (forms, modals, layouts)
├── context/            # React context providers (Auth, Theme)
├── hooks/              # Custom React hooks (useDashboard, useAuth, etc.)
├── lib/                # Library configurations (Supabase client)
├── pages/              # Page components
│   ├── DashboardPage.tsx      # Analytics dashboard
│   ├── ContactsPage.tsx       # Contact management
│   ├── DealsPage.tsx          # Deal pipeline
│   ├── TasksPage.tsx          # Task management
│   ├── CommunicationsPage.tsx # Communication tracking
│   ├── PurchaseHistoryPage.tsx# Purchase tracking
│   ├── ActivityPage.tsx       # Activity feed
│   ├── SettingsPage.tsx       # User settings with API key config
│   └── ProfilePage.tsx        # User profile management
├── services/           # API and business logic
│   ├── aiService.ts           # Central AI service with dynamic client
│   ├── settingsService.ts     # User settings management
│   ├── contactPersonaService.ts
│   ├── dealCoachService.ts
│   ├── objectionResponseService.ts
│   ├── winLossAnalysisService.ts
│   ├── contactService.ts
│   ├── dealService.ts
│   ├── taskService.ts
│   ├── communicationService.ts
│   ├── purchaseHistoryService.ts
│   └── dashboardService.ts
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

database/               # Database schemas
├── schema.sql                 # Core tables (contacts, deals)
├── phase3-schema.sql          # Extended features
├── phase4-communication-notes.sql
├── ai-features-schema.sql     # AI features tables
└── user-settings-schema.sql   # User settings
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📖 Usage Guide

### Managing Contacts

1. Navigate to the **Contacts** page
2. Click **"Add Contact"** to create new contacts
3. Use search and filter options to find contacts
4. Click on any contact to view detailed information and generate AI personas

### Deal Pipeline Management

1. Go to the **Deals** page to see your pipeline
2. Drag and drop deals between stages (Lead → Prospect → Negotiation → Closed)
3. Click on deals to view details, add tasks, and access AI coaching
4. Use AI features for coaching and objection handling
5. Close deals with structured outcome tracking

### Task Management

1. Navigate to **Tasks** to view all tasks
2. Create tasks linked to specific deals
3. Set due dates and track completion status
4. Filter by status, deal, or due date

### Communication Tracking

1. Go to **Communications** to log interactions
2. Record phone calls, emails, meetings, and notes
3. Link communications to specific contacts and deals
4. Add detailed notes with categorization

### Purchase History

1. Access **Purchase History** to track transactions
2. Record completed, pending, refunded, or cancelled purchases
3. Link purchases to contacts and deals
4. Track revenue and purchase patterns

### AI Features Usage

#### Setting Up AI Features

1. Go to **Settings** → **AI Configuration**
2. Enter your OpenAI API key
3. Click **Test** to verify it works
4. Save your settings

#### Deal Coach AI

- Open any deal detail page
- Click **"AI Deal Coach"** button
- Get personalized recommendations for next steps based on deal context

#### Customer Persona Builder

- Go to a contact's detail page
- Use the persona generator to create behavioral profiles
- View insights about communication preferences and buying patterns

#### Objection Handler

- In deal details, click **"Handle Objection"**
- Enter the customer's objection
- Get AI-powered response suggestions with different tones

#### Win-Loss Explainer

- Available for closed deals (won or lost)
- Click **"Why Did We Win/Lose?"** button
- Get detailed analysis with key factors and recommendations

## 📊 Dashboard Analytics

The dashboard provides comprehensive insights including:

- **Key Metrics**: Total contacts, active deals, monthly revenue, conversion rates
- **Pipeline Overview**: Visual representation of deals across all stages
- **Revenue Trends**: Historical revenue tracking and forecasting
- **Performance Summary**: Total revenue, completed tasks, overdue items
- **Quick Actions**: Fast access to create new records

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication**: Secure user authentication via Supabase Auth
- **Data Privacy**: AI responses are stored per-user with secure access
- **API Key Security**: User API keys are encrypted and stored securely
- **Environment Variables**: System-wide keys stored as environment variables
- **Input Validation**: Comprehensive validation using Zod schemas

## 📈 Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes on all tables
- **AI Response Caching**: Database storage reduces redundant API calls
- **Dynamic AI Client**: OpenAI client created on-demand with user's API key
- **Lazy Loading**: Components and routes load on demand
- **Error Boundaries**: Graceful error handling throughout the application
- **Real-time Optimization**: Efficient Supabase subscriptions

## 🔮 Future Scope

### Phase 1: Enhanced AI Capabilities

- **Email Template Generator**: AI-powered email templates based on customer personas
- **Meeting Scheduler AI**: Intelligent meeting scheduling with availability optimization
- **Sentiment Analysis**: Analyze communication tone and customer satisfaction
- **Predictive Analytics**: Forecast deal closure probability and revenue projections
- **Smart Lead Scoring**: AI-driven lead qualification and prioritization

### Phase 2: Advanced Integrations

- **Email Integration**: Direct Gmail/Outlook integration for seamless communication
- **Calendar Sync**: Two-way calendar synchronization with Google Calendar/Outlook
- **VoIP Integration**: Built-in calling functionality with call recording
- **Social Media Integration**: LinkedIn and social media profile enrichment
- **Zapier/Make Integration**: Connect with 1000+ third-party applications

### Phase 3: Mobile & Collaboration

- **Mobile App**: Native iOS and Android applications
- **Team Collaboration**: Shared deals, team performance dashboards
- **Real-time Chat**: Built-in team messaging and collaboration tools
- **Advanced Permissions**: Role-based access control and team management
- **Multi-language Support**: Internationalization for global teams

### Phase 4: Enterprise Features

- **Advanced Reporting**: Custom report builder with data visualization
- **Workflow Automation**: Custom automation rules and triggers
- **API Development**: RESTful API for third-party integrations
- **White-label Solution**: Customizable branding and deployment options
- **Advanced Security**: SSO, 2FA, audit logs, and compliance features

### Phase 5: AI-Driven Insights

- **Customer Journey Mapping**: Visual customer interaction timelines
- **Churn Prediction**: AI-powered customer retention insights
- **Revenue Forecasting**: Advanced predictive revenue modeling
- **Competitive Analysis**: AI-driven market and competitor insights
- **Voice AI**: Voice-to-text note-taking and voice commands

### Phase 6: Advanced Analytics

- **Business Intelligence**: Advanced BI dashboard with custom metrics
- **A/B Testing**: Built-in testing framework for sales strategies
- **Performance Benchmarking**: Industry comparison and benchmarking
- **Custom AI Models**: Train custom AI models on company data
- **Real-time Notifications**: Smart alerts and notification system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

1. **AI Features Not Working**

   - Check OpenAI API key is configured in Settings
   - Use the Test button to verify your API key
   - Verify API key has sufficient credits in OpenAI dashboard
   - Ensure all AI-related database tables are created

2. **"API key not found" Error**

   - Go to Settings → AI Configuration
   - Enter your OpenAI API key and save
   - Alternatively, set VITE_OPENAI_API_KEY environment variable

3. **Database Connection Issues**

   - Verify Supabase URL and keys in .env.local
   - Check RLS policies are applied correctly
   - Ensure user is authenticated
   - Run all database setup scripts in correct order

4. **Build Errors**

   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run build`
   - Verify all environment variables are set

5. **Performance Issues**
   - Check database indexes are created
   - Verify Supabase connection limits
   - Monitor API usage and rate limits

### Getting Help

- Check browser console for detailed error messages
- Verify all database tables are created with proper RLS policies
- Test your OpenAI API key in Settings
- Review Supabase logs for backend issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the backend infrastructure and real-time capabilities
- [OpenAI](https://openai.com/) for advanced AI capabilities
- [HeroUI](https://heroui.dev/) for the modern component library
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [React](https://react.dev/) for the powerful frontend framework
- [Vite](https://vitejs.dev/) for the fast development experience

---

**Built with ❤️ for modern sales teams seeking AI-powered efficiency**
