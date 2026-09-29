import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AUTH_LOGOUT_URL } from "../../utils/api";

const SidebarActions = ({ collapsed }) => {

const navigate = useNavigate();

const handleLogout = async () => {
  try {
    const response = await fetch(
      AUTH_LOGOUT_URL ,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Logout failed:", data.message);
      return;
    }

    console.log("Logout successful");

    navigate("/login");
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

  return (
    <div className="mt-6 pt-5 border-t border-white/10 space-y-1.5">
      <button
        type="button"
        title={collapsed ? "Settings" : ""}
        className={`
          group
          flex
          items-center
          w-full
          rounded-xl
          text-white/80
          hover:bg-white/10
          hover:text-white
          transition-all
          duration-200
          cursor-pointer
          ${
            collapsed
              ? "justify-center h-12"
              : "gap-3 px-3 h-12"
          }
        `}
      >
        <Settings size={21} strokeWidth={1.8} />

        {!collapsed && (
          <span className="text-sm font-medium">
            Settings
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={handleLogout}
        title={collapsed ? "Logout" : ""}
        className={`
          group
          flex
          items-center
          w-full
          rounded-xl
          text-white/80
          hover:bg-red-500/20
          hover:text-red-300
          transition-all
          duration-200
          cursor-pointer
          ${
            collapsed
              ? "justify-center h-12"
              : "gap-3 px-3 h-12"
          }
        `}
      >
        <LogOut size={21} strokeWidth={1.8} />

        {!collapsed && (
          <span className="text-sm font-medium">
            Logout
          </span>
        )}
      </button>
    </div>
  );
};

export default SidebarActions;