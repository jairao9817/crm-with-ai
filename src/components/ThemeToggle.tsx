import React from "react";
import { Switch } from "@headlessui/react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  showLabel = true,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-text-secondary">
          {isDark ? "Dark" : "Light"} mode
        </span>
      )}

      <Switch
        checked={isDark}
        onChange={toggleTheme}
        className={`
          ${isDark ? "bg-primary-600" : "bg-neutral-200"}
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 
          focus:ring-offset-2 focus:ring-offset-background
        `}
      >
        <span className="sr-only">Toggle theme</span>
        <span
          className={`
            ${isDark ? "translate-x-5" : "translate-x-0"}
            pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white 
            shadow ring-0 transition duration-200 ease-in-out
          `}
        >
          <span
            className={`
              ${
                isDark
                  ? "opacity-0 duration-100 ease-out"
                  : "opacity-100 duration-200 ease-in"
              }
              absolute inset-0 flex h-full w-full items-center justify-center transition-opacity
            `}
            aria-hidden="true"
          >
            <SunIcon className="h-3 w-3 text-warning-500" />
          </span>
          <span
            className={`
              ${
                isDark
                  ? "opacity-100 duration-200 ease-in"
                  : "opacity-0 duration-100 ease-out"
              }
              absolute inset-0 flex h-full w-full items-center justify-center transition-opacity
            `}
            aria-hidden="true"
          >
            <MoonIcon className="h-3 w-3 text-primary-600" />
          </span>
        </span>
      </Switch>
    </div>
  );
};
