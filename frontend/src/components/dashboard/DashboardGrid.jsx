import { useNavigate } from "react-router-dom";
import { modules } from "../../data/moduleData";
import FeaturedModuleCard from "./module-card/FeaturedModuleCard";
import SmallModuleCard from "./module-card/SmallModuleCard";

const DashboardGrid = () => {
  const navigate = useNavigate();

  const getModule = (title) =>
    modules.find((module) => module.title === title);

  const employees = getModule("Employees");
  const attendance = getModule("Attendance");

  const sideModules = [
    getModule("Customers"),
    getModule("Students"),
    getModule("Invoices"),
    getModule("Users"),
  ].filter(Boolean);

  const bottomModules = [
    getModule("Teams"),
    getModule("Accounts"),
    getModule("Tasks"),
    getModule("Interview"),
    getModule("New Joining"),
    getModule("Leave"),
     getModule("Announcement"),
     getModule("Notification"),
  ].filter(Boolean);

  
  const desktopClass = (title) => {
    const positions = {
      Customers: "lg:col-start-1 lg:row-start-1",
      Students: "lg:col-start-1 lg:row-start-2",
      Invoices: "lg:col-start-6 lg:row-start-1",
      Users: "lg:col-start-6 lg:row-start-2",
      Teams: "lg:col-start-1 lg:row-start-3",
      Accounts: "lg:col-start-2 lg:row-start-3",
      Tasks: "lg:col-start-3 lg:row-start-3",
      Interview: "lg:col-start-4 lg:row-start-3",
      "New Joining": "lg:col-start-5 lg:row-start-3",
      Leave: "lg:col-start-6 lg:row-start-3",
      Announcement: "lg:col-start-1 lg:row-start-4",
      Notification: "lg:col-start-2 lg:row-start-4",
    };

    return positions[title] || "";
  };

  return (
   
    <div className="space-y-5 lg:space-y-6">
 
      <div
        className="
          grid
          grid-cols-2
          gap-3
          sm:gap-4
          md:grid-cols-4
          lg:grid-cols-6
          lg:grid-rows-[120px_120px]
          lg:gap-5
        "
      >
 
        <div className="col-span-2 md:col-span-2 lg:col-start-2 lg:col-span-2 lg:row-start-1 lg:row-span-2">
          <FeaturedModuleCard
            module={employees}
            onClick={() => navigate(employees.path)}
            type="employees"
          />
        </div>

        <div className="col-span-2 md:col-span-2 lg:col-start-4 lg:col-span-2 lg:row-start-1 lg:row-span-2">
          <FeaturedModuleCard
            module={attendance}
            onClick={() => navigate(attendance.path)}
            type="attendance"
          />
        </div>
 
        {sideModules.map((module) => (
          <div key={module.title} className={desktopClass(module.title)}>
            <SmallModuleCard
              module={module}
              onClick={() => navigate(module.path)}
            />
          </div>
        ))}
      </div>
 
      <section
        className="
          rounded-2xl
          border
          border-[#e6edf2]
          p-3.5
          sm:p-4
          lg:p-5
          dark:border-gray-700/70
        "
      >
 
        <div className="mb-3 flex items-center gap-2.5 lg:mb-4">
          <span
            aria-hidden="true"
            className="h-3.5 w-1 shrink-0 rounded-full bg-deem-red"
          />

          <h2
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-deem-blue/70
              dark:text-gray-400
            "
          >
            Quick Access
          </h2>

          <span
            aria-hidden="true"
            className="
              h-px
              flex-1
              bg-linear-to-r
              from-[#e6edf2]
              to-transparent
              dark:from-gray-700
            "
          />
        </div>
 
        <div
          className="
            grid
            grid-cols-2
            gap-2
            sm:grid-cols-3
            sm:gap-2.5
            md:grid-cols-4
            lg:auto-rows-[104px]
            lg:gap-3
            xl:auto-rows-[76px]
          "
        >
          {bottomModules.map((module) => (
            <SmallModuleCard
              key={module.title}
              module={module}
              onClick={() => navigate(module.path)}
              variant="compact"
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardGrid;