import { ArrowUpRight, ChevronRight } from "lucide-react";

const SmallModuleCard = ({ module, onClick, variant }) => {
  const Icon = module.icon;
 
  const isCompact = variant === "compact";
 
  return (
    <div
      onClick={onClick}
      className={`
        group
        relative
        flex
        h-full
        flex-col
        items-center
        justify-center
        gap-2.5
        text-center
        cursor-pointer
        transition-all
        duration-300
        ${
          isCompact
            ? `
              rounded-xl
              bg-white/60
              px-2
              py-3
              hover:bg-white
              hover:shadow-[0_10px_22px_-14px_rgba(20,70,103,0.35)]
              dark:bg-white/[0.03]
              dark:hover:bg-white/[0.07]
              xl:flex-row
              xl:justify-start
              xl:gap-3
              xl:px-3.5
              xl:text-left
            `
            : `
              overflow-hidden
              rounded-xl
              border
              border-[#e6edf2]
              bg-white
              px-3
              py-3.5
              hover:-translate-y-0.5
              hover:border-deem-red/40
              hover:shadow-[0_10px_24px_-14px_rgba(20,70,103,0.3)]
              dark:border-gray-700
              dark:bg-[#161b22]
              dark:hover:border-deem-red/40
            `
        }
      `}
    >
 
      <div
        className={`
          flex
          shrink-0
          items-center
          justify-center
          transition-all
          duration-300
          ${
            isCompact
              ? `
                w-9
                h-9
                rounded-lg
                bg-deem-blue/[0.07]
                text-deem-blue/70
                group-hover:bg-deem-red/10
                group-hover:text-deem-red
                dark:bg-white/[0.07]
                dark:text-gray-300
              `
              : `
                w-10
                h-10
                rounded-xl
                bg-[#fff1ef]
                ring-1
                ring-deem-red/10
                group-hover:scale-105
                dark:bg-[#2a1b19]
                dark:ring-deem-red/20
              `
          }
        `}
      >
        <Icon
          size={isCompact ? 18 : 20}
          strokeWidth={1.8}
          className={isCompact ? undefined : "text-deem-red"}
        />
      </div>
 
      <h3
        className={`
          transition-colors
          duration-300
          ${
            isCompact
              ? `
                text-xs
                font-medium
                text-deem-blue/80
                group-hover:text-deem-red
                dark:text-gray-300
                dark:group-hover:text-white
                xl:text-[13px]
              `
              : `
                text-[13px]
                font-semibold
                tracking-tight
                text-deem-blue
                dark:text-white
              `
          }
        `}
      >
        {module.title}
      </h3>
 
      {isCompact && (
        <ChevronRight
          size={16}
          aria-hidden="true"
          className="
            hidden
            xl:ml-auto
            xl:inline-flex
            xl:shrink-0
            text-deem-blue/30
            transition-all
            duration-300
            group-hover:translate-x-0.5
            group-hover:text-deem-red
            dark:text-gray-600
          "
        />
      )}
 
      {!isCompact && (
        <span
          aria-hidden="true"
          className="
            absolute
            top-2.5
            right-2.5
            text-deem-blue/25
            transition-all
            duration-300
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
            group-hover:text-deem-red
            dark:text-gray-600
          "
        >
          <ArrowUpRight size={13} />
        </span>
      )}
    </div>
  );
};

export default SmallModuleCard;