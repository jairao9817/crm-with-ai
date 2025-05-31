# CRM Application with AI

A modern Customer Relationship Management (CRM) application built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Phase 1 - Foundation (COMPLETED)

### ✅ Authentication & User Management - Must Have Features

- **✅ Supabase project configuration** - Complete authentication setup
- **✅ Email/password authentication providers** - Full auth flow implemented
- **✅ Login page with React Hook Form validation** - Professional form with validation
- **✅ Signup page with React Hook Form validation** - Complete registration flow
- **✅ Authentication context and hooks** - Centralized auth state management
- **✅ Session persistence and management** - Automatic session handling
- **✅ Protected route components and middleware** - Route protection implemented
- **✅ Authentication error handling** - Comprehensive error management
- **✅ Password reset flow** - Complete forgot/reset password functionality
- **✅ Email verification for new accounts** - Email confirmation flow
- **✅ User profile management UI** - Complete profile management interface
- **✅ User settings page** - Comprehensive settings management
- **✅ Session timeout handling** - Automatic session timeout with activity detection

### 🎯 Key Features Implemented

1. **Complete Authentication System**

   - Login, Signup, Forgot Password, Reset Password
   - Email verification flow
   - React Hook Form validation on all forms
   - Professional error handling and user feedback

2. **User Profile Management**

   - Profile information editing
   - Password change functionality
   - Account information display
   - Form validation with React Hook Form

3. **User Settings**

   - Appearance settings (theme toggle)
   - Notification preferences
   - Privacy & security settings
   - Regional preferences (language, timezone, currency)

4. **Session Management**
   - Automatic session persistence
   - Session timeout with activity detection
   - Protected routes with authentication checks

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **UI Components**: HeroUI, Heroicons
- **Forms**: React Hook Form
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd crm-with-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Set up your Supabase project:

   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Go to Settings > API
   - Copy your project URL and anon key

3. Update your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Configuration

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL: `http://localhost:5173`
3. Add redirect URLs for password reset: `http://localhost:5173/reset-password`
4. Enable email confirmations if desired

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🎨 Design System

The application uses a comprehensive design system with:

- **Color Palette**: Primary, secondary, success, warning, error colors
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standardized spacing scale
- **Components**: Reusable UI components with consistent styling
- **Dark/Light Mode**: Full theme support

## 🔐 Authentication Features

### Login

- Email/password authentication
- Form validation with React Hook Form
- Error handling and user feedback
- "Remember me" functionality
- Forgot password link

### Signup

- User registration with email verification
- Password confirmation validation
- Name collection for personalization
- Automatic redirect after verification

### Password Reset

- Secure password reset flow
- Email-based reset links
- New password validation
- Confirmation step

### Profile Management

- Update profile information
- Change password securely
- View account details
- Email verification status

### Settings

- Theme preferences (light/dark mode)
- Notification settings
- Privacy controls
- Regional preferences

## 🛡️ Security Features

- **Protected Routes**: Authentication required for app access
- **Session Management**: Automatic session handling and persistence
- **Session Timeout**: Configurable timeout with activity detection
- **Form Validation**: Client-side validation with React Hook Form
- **Error Handling**: Comprehensive error management
- **Secure Password Reset**: Token-based password reset flow

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile devices

## 🚀 What's Next - Phase 2

The next phase will include:

- **Contact Management**: Add, edit, delete, and search contacts
- **Deal Pipeline**: Visual deal management with drag-and-drop
- **Task Management**: Create and manage tasks linked to deals
- **Communication Tracking**: Log and track customer communications
- **Purchase History**: Track customer purchase history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your Supabase configuration
3. Ensure all environment variables are set correctly
4. Check that your Supabase project is properly configured

For additional help, please create an issue in the repository.
