import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL, ROLE_API_URL } from "../../utils/api";

const NotificationTable = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalPages = Math.ceil(notifications.length / recordsPerPage);

  const startIndex = (currentPage - 1) * recordsPerPage;

  const currentNotifications = notifications.slice(
    startIndex,
    startIndex + recordsPerPage,
  );

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/notifications`);

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const result = await response.json();

      setNotifications(result.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await fetch(ROLE_API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      const result = await response.json();

      if (result.success) {
        setRoles(result.data || []);
      }
    } catch (err) {
      console.error("Fetch Roles Error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [currentPage, totalPages]);

  // Convert role IDs into role names
  const getRoleNames = (roleValue) => {
    if (!roleValue) return "-";

    const roleIds = String(roleValue)
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    return roleIds
      .map((id) => {
        const role = roles.find((item) => String(item.id) === String(id));

        return role?.role || id;
      })
      .join(", ");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
    } catch (err) {
      setError(err.message || "Failed to delete notification");
    }
  };

  const handleEdit = (id) => {
    navigate(`/notifications/add?id=${id}`);
  };

  const getStatusLabel = (status) => {
    return Number(status) === 1 ? "Active" : "Inactive";
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-[#11161d] dark:text-white/60">
        Loading notifications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-[#11161d] dark:text-white/60">
        No notifications found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#11161d]">
      <table className="w-full min-w-187.5 text-left">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
              Title
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
              Notification
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
              Role
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
              Status
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/60">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
          {currentNotifications.map((notification) => (
            <tr
              key={notification.id}
              className="transition hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <td className="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white">
                {notification.title}
              </td>

              <td className="max-w-100 px-4 py-4">
                <div
                  className="line-clamp-2 text-sm text-gray-600 dark:text-white/70"
                  dangerouslySetInnerHTML={{
                    __html: notification.notify,
                  }}
                />
              </td>

              <td className="px-4 py-4">
                <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-deem-red dark:bg-red-950/30 dark:text-red-400">
                  {getRoleNames(notification.role)}
                </span>
              </td>

              <td className="px-4 py-4">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    Number(notification.status) === 1
                      ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                      : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/50"
                  }`}
                >
                  {getStatusLabel(notification.status)}
                </span>
              </td>

              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(notification.id)}
                    title="Edit Notification"
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-deem-red hover:text-deem-red dark:border-white/10 dark:text-white/60 dark:hover:border-deem-red dark:hover:text-deem-red"
                  >
                    <Edit size={16} strokeWidth={1.8} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(notification.id)}
                    title="Delete Notification"
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-deem-red hover:text-deem-red dark:border-white/10 dark:text-white/60 dark:hover:border-deem-red dark:hover:text-deem-red"
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {notifications.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 px-4 py-4">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + recordsPerPage, notifications.length)} of{" "}
            {notifications.length} notifications
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    currentPage === page
                      ? "border-deem-blue bg-deem-blue text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage >= totalPages}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTable;
