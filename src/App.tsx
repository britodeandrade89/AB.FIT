import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeContext";
import { BackgroundWrapper, SideNav, GlobalSyncIndicator, Logo } from "./components/Layout";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

// Page Imports
import Login from "./pages/Login";
import Home from "./pages/Home";
import Workouts from "./pages/Workouts";
import WorkoutDetail from "./pages/WorkoutDetail";
import Nutrition from "./pages/Nutrition";
import Profile from "./pages/Profile";
import Periodization from "./pages/Periodization";
import RunTrack from "./pages/RunTrack";
import ProfessorDashboard from "./pages/ProfessorDashboard";

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Checking local session...");
    const savedUser = localStorage.getItem('abfit-session');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsProfessor(parsedUser.role === 'professor' || parsedUser.email === 'Britodeandrade@gmail.com');
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    localStorage.setItem('abfit-session', JSON.stringify(userData));
    setUser(userData);
    setIsProfessor(userData.role === 'professor' || userData.email === 'Britodeandrade@gmail.com');
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('abfit-session');
    setUser(null);
    setIsProfessor(false);
    navigate('/login');
  };

  const getActiveView = () => {
    const path = location.pathname;
    if (path === '/') return isProfessor ? 'PROFESSOR_DASH' : 'DASHBOARD';
    if (path.startsWith('/workouts')) return 'WORKOUTS';
    if (path.startsWith('/nutrition')) return 'NUTRITION';
    if (path.startsWith('/profile')) return 'SETTINGS';
    if (path.startsWith('/periodization')) return 'STUDENT_PERIODIZATION';
    if (path.startsWith('/run')) return 'RUNTRACK_STUDENT';
    if (path.startsWith('/professor')) return 'PROFESSOR_DASH';
    return 'DASHBOARD';
  };

  const handleNavigate = (view: string) => {
    switch (view) {
      case 'DASHBOARD': navigate('/'); break;
      case 'PROFESSOR_DASH': navigate('/professor'); break;
      case 'WORKOUTS': navigate('/workouts'); break;
      case 'NUTRITION': navigate('/nutrition'); break;
      case 'SETTINGS': navigate('/profile'); break;
      case 'STUDENT_PERIODIZATION': navigate('/periodization'); break;
      case 'RUNTRACK_STUDENT': navigate('/run'); break;
      default: navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-8">
          <Logo size="text-4xl" subSize="text-[8px]" />
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]"></div>
        </div>
      </div>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="flex min-h-screen">
        {user && (
          <>
            <SideNav 
              isOpen={isSideNavOpen} 
              onClose={() => setIsSideNavOpen(false)} 
              activeView={getActiveView()}
              onNavigate={handleNavigate}
              isProfessor={isProfessor}
            />
            <button 
              onClick={() => setIsSideNavOpen(true)}
              className="fixed top-6 left-6 z-[70] p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground shadow-2xl transition-all hover:scale-110"
            >
              <Menu size={20} />
            </button>
          </>
        )}
        <main className={`flex-1 overflow-auto transition-all duration-500 ${user ? 'pt-20 lg:pt-0' : ''}`}>
          <Routes>
            <Route path="/" element={user ? (isProfessor ? <Navigate to="/professor" /> : <Home />) : <Navigate to="/login" />} />
            <Route path="/professor" element={user && isProfessor ? <ProfessorDashboard /> : <Navigate to="/" />} />
            <Route path="/workouts" element={user ? <Workouts /> : <Navigate to="/login" />} />
            <Route path="/workouts/:id" element={user ? <WorkoutDetail /> : <Navigate to="/login" />} />
            <Route path="/nutrition" element={user ? <Nutrition /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/periodization" element={user ? <Periodization /> : <Navigate to="/login" />} />
            <Route path="/run" element={user ? <RunTrack /> : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <GlobalSyncIndicator status="synced" />
      </div>
    </BackgroundWrapper>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
