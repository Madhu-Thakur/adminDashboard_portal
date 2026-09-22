 
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

import { useState } from "react";
import { modules } from "../../data/moduleData";

const SidebarMenu = ({ collapsed, onNavigate }) => {
  const [openGroups, setOpenGroups] = useState({});
  const location = useLocation();

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isGroupOpen = (key) => !!openGroups[key];

  const isLeafActive = (leaf) => {
    const leafPath = leaf.path.split("?")[0];
    return location.pathname === leafPath;
  };

  const renderModule = (module) => {
    const Icon = module.icon;
    const moduleKey = module.path;
    const hasChildren =
      Array.isArray(module.children) && module.children.length > 0;

    const rowClass = `
      group
      flex
      items-center
      gap-3
      px-3
      h-12
      rounded-xl
      transition-all
      duration-200
    `;

    const showsSubmenu = !collapsed && hasChildren;

    if (!hasChildren) {
      return (
        <NavLink
          key={module.path}
          to={module.path}
          onClick={onNavigate}
          title={collapsed ? module.title : ""}
          className={({ isActive }) => `
            ${rowClass}
            ${collapsed ? "justify-center w-full h-12" : ""}
            ${
              isActive
                ? "bg-white text-deem-blue! shadow-sm"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }
          `}
        >
          <Icon size={21} strokeWidth={1.8} className="shrink-0" />

          {!collapsed && (
            <span className="text-sm font-medium truncate">
              {module.title}
            </span>
          )}
        </NavLink>
      );
    }

    const isOpen = isGroupOpen(moduleKey);

    return (
      <div key={module.path}>
        <button
          type="button"
          onClick={() => toggleGroup(moduleKey)}
          title={collapsed ? module.title : ""}
          className={`
            ${rowClass}
            w-full
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <Icon size={21} strokeWidth={1.8} className="shrink-0" />

          {!collapsed && (
            <span className="text-sm font-medium truncate flex-1 text-left">
              {module.title}
            </span>
          )}

          {!collapsed && (
            <span className="shrink-0">
              {isOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
          )}
        </button>

        {showsSubmenu && renderChildren(module, moduleKey)}
      </div>
    );
  };

  const renderChildren = (module, moduleKey) => {
    return (
      <div className="mt-1 ml-2 space-y-1">
        {module.children.map((child) => {
          const isLeaf = !(
            Array.isArray(child.children) && child.children.length > 0
          );

          if (isLeaf) {
            const childActive = isLeafActive(child);

            return (
              <NavLink
                key={`${moduleKey}-${child.title}`}
                to={child.path}
                onClick={onNavigate}
                className={`
                  flex
                  items-center
                  gap-2
                  px-3
                  h-9
                  rounded-lg
                  text-[13px]
                  transition
                  ${
                    childActive
                      ? "bg-white text-deem-blue! shadow-sm font-medium"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <span
                  className={
                    childActive
                      ? "text-deem-blue/40"
                      : "text-white/40"
                  }
                >
                  -
                </span>

                <span className="truncate">{child.title}</span>
              </NavLink>
            );
          }

          const groupKey = `${moduleKey}-${child.title}`;
          const groupOpen = isGroupOpen(groupKey);

          return (
            <div key={groupKey}>
              <button
                type="button"
                onClick={() => toggleGroup(groupKey)}
                className="
                  w-full
                  flex
                  items-center
                  justify-between
                  gap-2
                  px-3
                  py-2
                  rounded-lg
                  text-[13px]
                  font-medium
                  text-white/70
                  hover:bg-white/10
                  hover:text-white
                  transition
                  cursor-pointer
                "
              >
                <span className="truncate text-left">
                  {child.title}
                </span>

                {groupOpen ? (
                  <ChevronDown size={14} className="shrink-0" />
                ) : (
                  <ChevronRight size={14} className="shrink-0" />
                )}
              </button>

              {groupOpen && (
                <div className="mt-1 ml-4 space-y-1">
                  {child.children.map((leaf) => {
                    const leafActive = isLeafActive(leaf);

                    return (
                      <NavLink
                        key={`${groupKey}-${leaf.title}`}
                        to={leaf.path}
                        onClick={onNavigate}
                        className={`
                          flex
                          items-center
                          gap-2
                          px-3
                          h-9
                          rounded-lg
                          text-[13px]
                          transition
                          ${
                            leafActive
                              ? "bg-white text-deem-blue shadow-sm font-medium"
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                          }
                        `}
                      >
                        <span
                          className={
                            leafActive
                              ? "text-deem-blue/40"
                              : "text-white/40"
                          }
                        >
                          -
                        </span>

                        <span className="truncate">
                          {leaf.title}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <nav className="mt-5 px-3">
      {!collapsed && (
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">
          Modules
        </p>
      )}

      <div className="space-y-1.5">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          onClick={onNavigate}
          title={collapsed ? "Dashboard" : ""}
          className={({ isActive }) => `
            group
            flex
            h-12
            items-center
            gap-3
            rounded-xl
            px-3
            transition-all
            duration-200
            ${collapsed ? "w-full justify-center" : ""}
            ${
              isActive
                ? "bg-white text-deem-blue! shadow-sm"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }
          `}
        >
          <LayoutDashboard
            size={21}
            strokeWidth={1.8}
            className="shrink-0"
          />

          {!collapsed && (
            <span className="truncate text-sm font-medium">
              Dashboard
            </span>
          )}
        </NavLink>

        {/* Existing Modules */}
        {modules.map((module) => renderModule(module))}
      </div>
    </nav>
  );
};

export default SidebarMenu;