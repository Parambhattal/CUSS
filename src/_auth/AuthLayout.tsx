import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated } = useUserContext();

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <div className="min-h-screen w-full bg-[url('/assets/images/bgg.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center">
          {/* Semi-transparent overlay for readability */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Login Form Section */}
          <div className="relative z-10 w-full max-w-[400px] bg-black/80 backdrop-blur-sm rounded-lg p-8">
            <Outlet />
          </div>
        </div>
      )}
    </>
  );
}
