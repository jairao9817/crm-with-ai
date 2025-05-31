import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ContactsPage from "./pages/ContactsPage";
import DealsPage from "./pages/DealsPage";
import "./App.css";

const AppRouter: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/home" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/home" replace /> : <SignupPage />}
      />
      <Route
        path="/forgot-password"
        element={
          user ? <Navigate to="/home" replace /> : <ForgotPasswordPage />
        }
      />
      <Route
        path="/reset-password"
        element={user ? <Navigate to="/home" replace /> : <ResetPasswordPage />}
      />

      {/* Protected routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <ContactsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deals"
        element={
          <ProtectedRoute>
            <DealsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={<Navigate to={user ? "/home" : "/login"} replace />}
      />

      {/* Catch all route */}
      <Route
        path="*"
        element={<Navigate to={user ? "/home" : "/login"} replace />}
      />
    </Routes>
  );
};

function App() {
  return (
    <HeroUIProvider>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </HeroUIProvider>
  );
}

export default App;
