import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { INavLink } from "@/types";
import { sidebarLinks } from "@/constants";
import { Loader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { useUserContext, INITIAL_USER } from "@/context/AuthContext";
import { Layout, Home, Compass, Users, Book, LogOut, PlusCircle } from "lucide-react";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, setUser, setIsAuthenticated, isLoading } = useUserContext();

  const { mutate: signOut } = useSignOutAccount();

  const handleSignOut = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    navigate("/sign-in");
  };

  return (
    <nav className="hidden md:flex w-64 backdrop-blur-xl bg-black/40 p-4 flex-col border-r border-white/10 min-h-screen">
      <div className="flex items-center gap-3 mb-8 px-3">
        <div className="flex justify-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={110}
            height={50}
            style={{ marginLeft: "40px" }}
          />
        </div>
      </div>

      {isLoading || !user.email ? (
        <Loader />
      ) : (
        <Link to={`/profile/${user.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/20 transition-all duration-300">
          <img
            src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="profile"
            className="h-14 w-14 rounded-full border-2 border-indigo-400"
          />
          <div className="flex flex-col">
            <p className="font-semibold text-white">{user.name}</p>
            <p className="text-sm text-gray-400">@{user.uid}</p>
          </div>
        </Link>
      )}

      <nav className="space-y-3 mt-4">
        {sidebarLinks.map((link: INavLink) => {
          const isActive = pathname === link.route;
          return (
            <NavLink
              key={link.label}
              to={link.route}
              className={({ isActive }) =>
                `flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${isActive ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-300" : "hover:bg-white/20"}`
              }
            >
              <img
                src={link.imgURL}
                alt={link.label}
                className={`w-6 h-6 ${isActive ? "invert" : ""}`}
              />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <Button
        variant="ghost"
        className="flex items-center gap-4 mt-auto p-3 rounded-xl hover:bg-red-500/20 transition-all duration-300"
        onClick={handleSignOut}
      >
        <LogOut className="w-6 h-6 text-red-500" />
        <span className="text-red-500">Logout</span>
      </Button>
    </nav>
  );
};

export default LeftSidebar;
