import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

export default function Home({ onNavigate }) {
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const {
    user,
    isAuthenticated,
    getAccessTokenSilently
  } = useAuth0();

  useEffect(() => {
    const fetchTokenAndRoles = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);

        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const roles = payload["https://social-insper.com/roles"] || [];
        setIsAdmin(roles.includes("ADMIN"));
      } catch (e) {
        console.error("Erro ao buscar token:", e);
      }
    };

    if (isAuthenticated) {
      fetchTokenAndRoles();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Navigation Menu */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <nav className="flex gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('times')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
            >
              Times
            </button>
            <button
              onClick={() => onNavigate('partidas')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
            >
              Partidas
            </button>
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={user.picture}
              alt={user.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              {isAdmin && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded">
                  Admin
                </span>
              )}
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* JWT Token Section */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Token JWT</h2>
          <div className="bg-gray-100 p-4 rounded border border-gray-300">
            <p className="text-sm text-gray-600 mb-2 font-semibold">Access Token:</p>
            <code className="block text-xs break-all font-mono text-gray-800 max-h-32 overflow-y-auto">
              {token || "Carregando..."}
            </code>
          </div>

          {token && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2 font-semibold">Payload Decodificado:</p>
              <pre className="bg-gray-100 p-4 rounded border border-gray-300 text-xs overflow-x-auto max-h-32 overflow-y-auto">
                {JSON.stringify(
                  JSON.parse(atob(token.split(".")[1])),
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
