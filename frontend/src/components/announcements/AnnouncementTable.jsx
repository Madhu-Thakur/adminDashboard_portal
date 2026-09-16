import { Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL, ROLE_API_URL } from "../../utils/api";

const ANNOUNCEMENT_API_URL = `${API_BASE_URL}/api/announcements`;

const AnnouncementTable = () => {
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(ANNOUNCEMENT_API_URL);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch announcements",
        );
      }

      setAnnouncements(result.data || []);
    } catch (error) {
      console.error("Fetch Announcements Error:", error);
      setError("Unable to load announcements.");
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
    } catch (error) {
      console.error("Fetch Roles Error:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchRoles();
  }, []);

  // Convert role IDs into role names
  const getRoleNames = (roleValue) => {
    if (!roleValue) return "-";

    const roleIds = String(roleValue)
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    return roleIds
      .map((id) => {
        const role = roles.find(
          (item) => String(item.id) === String(id),
        );

        return role?.display_name || id;
      })
      .join(", ");
  };

  const handleEdit = (id) => {
    navigate(`/announcements/add?id=${id}`);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this announcement?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${ANNOUNCEMENT_API_URL}/${id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete announcement",
        );
      }

      setAnnouncements((prev) =>
        prev.filter(
          (announcement) => announcement.id !== id,
        ),
      );
    } catch (error) {
      console.error("Delete Announcement Error:", error);
      setError("Unable to delete announcement.");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-[#11161c]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading announcements...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-deem-red/20 bg-red-50 p-5 text-sm text-deem-red">
        {error}
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-[#11161c]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No announcements found.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#11161c]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-175">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              {/* Announcement */}
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Announcement
              </th>

              {/* Type */}
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Type
              </th>

              {/* Expiry Date */}
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Expiry Date
              </th>

              {/* Expiry Time */}
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Expiry Time
              </th>

              {/* Role */}
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Role
              </th>

              {/* Status */}
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Status
              </th>

              {/* Actions */}
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {announcements.map((announcement) => (
              <tr
                key={announcement.id}
                className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/30"
              >
                {/* Announcement */}
                <td className="max-w-105 px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className="block truncate">
                    {announcement.announce || "-"}
                  </span>
                </td>

                {/* Type */}
                <td className="px-5 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                  <span
                    className={
                      String(announcement.type).toLowerCase() ===
                      "alert"
                        ? "font-medium text-deem-red"
                        : "font-medium text-green-600"
                    }
                  >
                    {announcement.type
                      ? announcement.type.charAt(0).toUpperCase() +
                        announcement.type.slice(1).toLowerCase()
                      : "-"}
                  </span>
                </td>

                {/* Expiry Date */}
                <td className="px-5 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                  {announcement.expiry_date || "-"}
                </td>

                {/* Expiry Time */}
                <td className="px-5 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                  {announcement.expiry_time
                    ? String(announcement.expiry_time).slice(0, 5)
                    : "-"}
                </td>

                {/* Role */}
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-deem-red dark:bg-red-950/30 dark:text-red-400">
                    {getRoleNames(announcement.role)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      Number(announcement.status) === 1
                        ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {Number(announcement.status) === 1
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(announcement.id)}
                      title="Edit Announcement"
                      className="
                        flex
                        h-9
                        w-9
                        cursor-pointer
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-gray-200
                        text-gray-500
                        transition
                        hover:border-deem-red
                        hover:text-deem-red
                        dark:border-gray-700
                        dark:text-gray-400
                      "
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(announcement.id)
                      }
                      title="Delete Announcement"
                      className="
                        flex
                        h-9
                        w-9
                        cursor-pointer
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-gray-200
                        text-gray-500
                        transition
                        hover:border-deem-red
                        hover:text-deem-red
                        dark:border-gray-700
                        dark:text-gray-400
                      "
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnnouncementTable;