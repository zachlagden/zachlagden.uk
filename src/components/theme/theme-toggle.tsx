"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-6 left-6 z-50">
            {/* Glass effect container */}
            <div className={cn(
              "rounded-full p-2",
              "bg-white/30 dark:bg-gray-900/30",
              "backdrop-blur-md",
              "transition-colors duration-150"
            )}>
              {/* Custom iOS-style switch */}
              <button
                role="switch"
                aria-checked={isDark}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={cn(
                  "relative inline-flex h-8 w-14 shrink-0 cursor-pointer",
                  "items-center rounded-full",
                  "bg-neutral-200 dark:bg-neutral-700",
                  "transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-neutral-950 focus-visible:ring-offset-2",
                  "dark:focus-visible:ring-neutral-300"
                )}
              >
                {/* Sliding thumb with icon */}
                <span
                  className={cn(
                    "pointer-events-none flex h-6 w-6 items-center justify-center",
                    "rounded-full bg-white shadow-lg",
                    "transition-transform duration-150",
                    isDark ? "translate-x-7" : "translate-x-1"
                  )}
                >
                  {isDark ? (
                    <Moon className="h-4 w-4 text-neutral-700" />
                  ) : (
                    <Sun className="h-4 w-4 text-yellow-500" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {isDark ? "Switch to light mode" : "Switch to dark mode"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
