const DashboardHeader = () => {
  return (
    <header className="mb-5 lg:mb-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="flex items-center gap-3 sm:gap-4">
          <span
            aria-hidden="true"
            className="
              hidden
              h-12
              w-1
              shrink-0
              rounded-full
              bg-linear-to-b
              from-deem-blue
              to-deem-red
              sm:block
              dark:from-deem-red
              dark:to-white/25
            "
          />

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-deem-red/80 dark:text-deem-red">
              Overview
            </p>

            <h1 className="mt-0.5 text-2xl font-bold leading-tight tracking-tight text-deem-blue sm:text-3xl dark:text-white">
              Dashboard
            </h1>
          </div>
        </div>
 
        <p className="text-sm text-gray-500 sm:pb-0.5 dark:text-gray-400">
          Welcome back — here&apos;s what&apos;s happening today.
        </p>
      </div>
 
      <div
        aria-hidden="true"
        className="
          mt-4
          h-px
          w-full
          bg-linear-to-r
          from-deem-red/60
          via-deem-blue/20
          to-transparent
          dark:from-deem-red/50
          dark:via-white/10
        "
      />
    </header>
  );
};

export default DashboardHeader;