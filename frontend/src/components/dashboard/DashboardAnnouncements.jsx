import { useEffect, useState } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { ANNOUNCEMENT_API_URL } from "../../utils/api";

const DashboardAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(
        ANNOUNCEMENT_API_URL
      );

      const result = await response.json();

      if (result.success) {
        const activeAnnouncements = (result.data || []).filter(
          (announcement) => {
            if (Number(announcement.status) !== 1) {
              return false;
            }
            if (
              !announcement.expiry_date ||
              !announcement.expiry_time
            ) {
              return true;
            }

            const expiryDate = new Date(announcement.expiry_date);

            const year = expiryDate.getFullYear();
            const month = String(expiryDate.getMonth() + 1).padStart(
              2,
              "0"
            );
            const day = String(expiryDate.getDate()).padStart(2, "0");

            const expiryDateTime = new Date(
              `${year}-${month}-${day}T${announcement.expiry_time}`
            );

            return expiryDateTime > new Date();
          }
        );

        setAnnouncements(activeAnnouncements);
      }
    } catch (error) {
      console.error("Fetch Announcements Error:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  if (announcements.length === 0) {
    return null;
  }

  return (
 
    <section className="mb-5 space-y-3 lg:mb-6">
      {announcements.map((announcement) => {
        const isAlert =
          String(announcement.type).toLowerCase() === "alert";

        const AnnouncementIcon = isAlert ? AlertTriangle : Info;

        return (
          <div
            key={announcement.id}
            className={`
              flex
              w-full
              flex-col
              gap-2.5
              overflow-hidden
              rounded-2xl
              border
              p-4
              sm:flex-row
              sm:items-start
              sm:gap-3
              sm:p-4
              ${
                isAlert
                  ? `
                    border-deem-red/25
                    bg-deem-red/[0.05]
                    dark:border-deem-red/30
                    dark:bg-deem-red/[0.08]
                  `
                  : `
                    border-green-200/70
                    bg-[#f0fdf4]
                    dark:border-green-800/50
                    dark:bg-green-950/40
                  `
              }
            `}
          >
            <span
              aria-hidden="true"
              className={`
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                ${
                  isAlert
                    ? "bg-deem-red/10 text-deem-red dark:bg-deem-red/15"
                    : "bg-green-600/10 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                }
              `}
            >
              <AnnouncementIcon
                size={17}
                strokeWidth={2}
              />
            </span>

            <div className="min-w-0 flex-1">
              <p
                className={`
                  text-sm
                  font-semibold
                  tracking-tight
                  ${
                    isAlert
                      ? "text-deem-red dark:text-red-400"
                      : "text-green-800 dark:text-green-300"
                  }
                `}
              >
                Latest Announcement
              </p>

              <p
                className={`
                  mt-0.5
                  text-sm
                  font-medium
                  leading-6
                  break-words
                  ${
                    isAlert
                      ? "text-red-950/75 dark:text-red-100/80"
                      : "text-green-900/75 dark:text-green-100/80"
                  }
                `}
              >
                {announcement.announce}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default DashboardAnnouncements;