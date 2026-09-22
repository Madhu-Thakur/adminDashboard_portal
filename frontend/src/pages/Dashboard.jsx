import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardGrid from "../components/dashboard/DashboardGrid";
import DashboardAnnouncements from "../components/dashboard/DashboardAnnouncements";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-deem-bg dark:bg-[#0b0f14] transition-colors duration-300">
      {/* UI CHANGE: Tightened page padding so the dashboard uses the available content width. */}
      <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <DashboardHeader />
        <DashboardAnnouncements />
        <DashboardGrid />
      </main>
    </div>
  );
};

export default Dashboard;