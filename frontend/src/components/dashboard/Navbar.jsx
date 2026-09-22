import { Bell, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NOTIFICATION_API_URL } from "../../utils/api";

import ThemeToggle from "../common/ThemeToggle";
import ProfileMenu from "./ProfileMenu";

const Navbar = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(NOTIFICATION_API_URL);

      const result = await response.json();

      if (result.success) {
        const activeNotifications = (result.data || []).filter(
          (notification) => Number(notification.status) === 1,
        );

        setNotifications(activeNotifications);
      }
    } catch (error) {
      console.error("Fetch Notifications Error:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

 return (
  <header
    className="
      h-16
      px-5
      bg-white
      dark:bg-[#111827]
      border-b
      border-gray-200
      dark:border-gray-700
      flex
      items-center
      justify-between
      transition-colors
      duration-300
    "
  >
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleMobileMenu}
        title="Menu"
        aria-label="Toggle menu"
        className="
          lg:hidden
          w-10
          h-10
          rounded-lg
          flex
          items-center
          justify-center
          text-gray-600
          dark:text-gray-300
          hover:bg-gray-100
          dark:hover:bg-gray-800
          transition
          cursor-pointer
        "
      >
        <Menu size={21} />
      </button>

      {/* <button
        type="button"
        onClick={() => navigate("/dashboard")}
        title="Dashboard"
        className="
          w-10
          h-10
          rounded-lg
          flex
          items-center
          justify-center
          text-deem-blue
          dark:text-gray-200
          hover:bg-gray-100
          dark:hover:bg-gray-800
          transition
          cursor-pointer
        "
      >
        <LayoutDashboard size={21} />
      </button> */}
    </div>

    <div className="flex items-center gap-2">
      <ThemeToggle />

      {/* Notifications */}
      <div className="relative" ref={notificationRef}>
        <button
          type="button"
          title="Notifications"
          aria-label="Notifications"
          onClick={() => setShowNotifications((previous) => !previous)}
          className="
            relative
            w-10
            h-10
            rounded-full
            flex
            items-center
            justify-center
            text-gray-600
            dark:text-gray-300
            hover:bg-gray-100
            dark:hover:bg-gray-800
            transition
            cursor-pointer
          "
        >
          <Bell size={19} />

          {notifications.length > 0 && (
            <span
              className="
                absolute
                top-2
                right-2
                w-2
                h-2
                rounded-full
                bg-deem-red
              "
            />
          )}
        </button>
 
       {showNotifications && (
  <div
    className="
      fixed
      left-2
      right-2
      top-16
      w-auto
      max-w-none
      bg-white
      dark:bg-[#111827]
      border
      border-gray-200
      dark:border-gray-700
      rounded-xl
      shadow-lg
      overflow-hidden
      z-50
      sm:absolute
      sm:left-auto
      sm:right-0
      sm:top-12
      sm:w-80
      sm:max-w-80
    "
  >
    {/* Header */}
    <div
      className="
        px-4
        py-3
        border-b
        border-gray-200
        dark:border-gray-700
        flex
        items-center
        justify-between
      "
    >
      <h3
        className="
          text-sm
          font-semibold
          text-gray-900
          dark:text-white
        "
      >
        Notifications
      </h3>
    </div>

    {/* Notification List */}
    <div className="max-h-80 overflow-y-auto">
      {notifications.length === 0 ? (
        <div
          className="
            px-4
            py-8
            text-center
            text-sm
            text-gray-500
            dark:text-gray-400
          "
        >
          No notifications
        </div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            className="
              px-4
              py-3
              border-b
              border-gray-100
              dark:border-gray-700
              last:border-b-0
              hover:bg-gray-50
              dark:hover:bg-gray-800
              transition
            "
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className="
                  min-w-0
                  flex-1
                  wrap-break-words
                  text-sm
                  font-semibold
                  text-gray-900
                  dark:text-white
                "
              >
                {notification.title}
              </p>

              <span
                className="
                  shrink-0
                  whitespace-nowrap
                  text-xs
                  text-gray-500
                  dark:text-gray-400
                "
              >
                {notification.notification_date
                  ? new Date(
                      notification.notification_date
                    ).toLocaleDateString("en-IN")
                  : "-"}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)}
      </div>

      <ProfileMenu />
    </div>
  </header>
);
};

export default Navbar;
