import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { Box } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated } = useAuth();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.payload || "Login failed");
      }

      setIsAuthenticated(true);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-t from-[#05020A] to-[#100A14] text-white overflow-hidden">
      <div className="hidden xl:flex w-1/2 p-12 items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_#241A3A_0%,_#07020D_100%)]">
        <div className="relative z-10 text-center">
          <Box
            size={100}
            color="#B388FF"
            className="mx-auto mb-6 drop-shadow-[0_0_10px_rgba(179,136,255,0.7)]"
          />
          <h1 className="font-orbitron text-6xl font-bold text-[#C6A6FF] drop-shadow-[0_0_15px_rgba(198,166,255,0.7)]">
            Lectura
          </h1>
          <p className="mt-4 text-xl font-lexend text-white/80 max-w-sm mx-auto">
            Your personal dashboard for a more organized life.
          </p>
        </div>
      </div>
      <div className="w-full xl:w-1/2 flex items-center justify-center p-8 relative z-20">
        <div className="w-full max-w-md p-8 bg-[radial-gradient(ellipse_at_center,_#241A3A_0%,_#07020D_100%)] rounded-xl shadow-lg border-[1px] border-[#B388FF]/50">
          <h2 className="text-3xl font-orbitron font-bold text-center text-[#C6A6FF] mb-2">
            Log In
          </h2>
          <p className="text-center text-white/70 mb-8">
            Welcome back! Please enter your details.
          </p>
          {error && (
            <div className="p-3 mb-4 text-sm text-red-300 bg-red-900/40 rounded-md border border-red-500">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium text-white/90 mb-1"
                htmlFor="username"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-white/5 border border-[#B388FF]/50 focus:outline-none focus:ring-2 focus:ring-[#DA8FFF] transition-colors duration-200 text-white"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-white/90 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-white/5 border border-[#B388FF]/50 focus:outline-none focus:ring-2 focus:ring-[#DA8FFF] transition-colors duration-200 text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#B388FF] to-[#DA8FFF] text-white font-semibold shadow-lg hover:from-[#DA8FFF] hover:to-[#B388FF] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-white/70">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#DA8FFF] hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
