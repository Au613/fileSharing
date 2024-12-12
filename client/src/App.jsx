import { Switch, Route } from "wouter";
import LandingPage from "./pages/LandingPage.jsx";
import SignupPage from "./pages/SignupPage.js";
import LoginPage from "./pages/LoginPage.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { useUser } from "./hooks/use-user.js";
import { Loader2 } from "lucide-react";

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/admin" component={AdminDashboard} />
        {user && <Route path="/dashboard" component={UserDashboard} />}
        <Route>404 Page Not Found</Route>
      </Switch>
    </div>
  );
}

export default App;
