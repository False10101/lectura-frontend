import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import ProtectedRoute from "./lib/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NoteDetail from "./pages/NoteDetail";
import { LandingPageRedirect } from "./pages/LandingPageRedirect";
import { Quiz } from "./pages/Quiz";
import UserDetail from "./pages/UserDetail";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LandingPageRedirect />
              </ProtectedRoute>
            }
          />


           <Route
            path="/note"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

           <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/note/:noteId"
            element={
              <NoteDetail/>
            }
          /> 
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
