import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "w-fit",
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "space-y-4",
        month_caption: "relative flex h-8 items-center justify-center",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous:
          "inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-foreground opacity-70 transition-colors hover:bg-muted hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        button_next:
          "inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-foreground opacity-70 transition-colors hover:bg-muted hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 rounded-md text-center text-[0.8rem] font-normal text-muted-foreground",
        week: "mt-2 flex w-full",
        day: "relative size-9 p-0 text-center text-sm",
        day_button:
          "inline-flex size-9 items-center justify-center rounded-md text-sm font-normal transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
        today:
          "[&>button]:border [&>button]:border-primary [&>button]:text-primary",
        outside:
          "text-muted-foreground opacity-50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        range_start:
          "[&>button]:rounded-l-md [&>button]:bg-primary [&>button]:text-primary-foreground",
        range_middle:
          "[&>button]:rounded-none [&>button]:bg-muted [&>button]:text-foreground",
        range_end:
          "[&>button]:rounded-r-md [&>button]:bg-primary [&>button]:text-primary-foreground",
        dropdowns: "flex items-center justify-center gap-2",
        dropdown:
          "rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring",
        dropdown_root: "relative",
        ...classNames,
      }}
      components={{
        Chevron: ({
          orientation,
          className: chevronClassName,
          size,
          disabled,
          ...iconProps
        }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "right"
                ? ChevronRight
                : ChevronDown;

          return (
            <Icon
              className={cn("size-4", chevronClassName)}
              size={size || 16}
              aria-hidden="true"
              data-disabled={disabled ? "" : undefined}
              {...iconProps}
            />
          );
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
