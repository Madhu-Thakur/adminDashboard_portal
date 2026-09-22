import { ArrowUpRight } from "lucide-react";
import { dashboardStats } from "../../../data/dashboardData";

const FeaturedModuleCard = ({ module, onClick, type }) => {
  const Icon = module.icon;
  const stats = dashboardStats[type];
 
  return (
    <div
      onClick={onClick}
      className="
        group
        relative
        flex
        h-full
        flex-col
        justify-between
        overflow-hidden
        rounded-2xl
        border
        border-[#dbe6ee]
        bg-linear-to-br
        from-[#f4f9fc]
        via-white
        to-[#fff6f4]
        cursor-pointer
        p-5
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-deem-blue/25
        hover:shadow-[0_18px_38px_-20px_rgba(20,70,103,0.38)]
        dark:border-gray-700
        dark:from-[#131a22]
        dark:via-[#161b22]
        dark:to-[#1e1615]
        dark:hover:border-deem-blue/40
        dark:hover:shadow-[0_18px_38px_-20px_rgba(0,0,0,0.85)]
        sm:p-6
      "
    >
  
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -top-16
          -right-12
          w-40
          h-40
          rounded-full
          bg-deem-red/10
          blur-3xl
          dark:bg-deem-red/15
        "
      />

 
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="
              flex
              w-11
              h-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-deem-blue
              text-white
              shadow-sm
              shadow-deem-blue/25
              transition-transform
              duration-300
              group-hover:scale-105
              dark:bg-[#1d6493]
            "
          >
            <Icon size={21} strokeWidth={1.9} />
          </span>

          <h2 className="text-sm font-semibold tracking-tight text-deem-blue sm:text-[15px] dark:text-white">
            {module.title}
          </h2>
        </div>
 
        <span
          aria-hidden="true"
          className="
            flex
            w-7
            h-7
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-[#dbe6ee]
            text-deem-blue/40
            transition-all
            duration-300
            group-hover:border-deem-red
            group-hover:bg-deem-red
            group-hover:text-white
            dark:border-gray-700
            dark:text-gray-500
          "
        >
          <ArrowUpRight size={15} />
        </span>
      </div>
 
      <div className="relative mt-5">
        <p className="text-4xl font-bold leading-none tracking-tight text-deem-blue sm:text-5xl dark:text-white">
          {stats.value}
        </p>
 
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-deem-blue/55 dark:text-gray-400">
          {stats.label}
        </p>
      </div>
    </div>
  );
};

export default FeaturedModuleCard;