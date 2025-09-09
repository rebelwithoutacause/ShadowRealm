import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from '@getmocha/users-service/react';
import HomePage from "@/react-app/pages/Home";
import AuthPage from "@/react-app/pages/Auth";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import WelcomePage from "@/react-app/pages/Welcome";
import ExplorePage from "@/react-app/pages/Explore";
import GamePage from "@/react-app/pages/Game";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
