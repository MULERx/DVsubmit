import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Toast } from "@/hooks/use-toast"

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  toast: Toast
  onDismiss: (id: string) => void
}

const ToastComponent = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ toast, onDismiss, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
          toast.variant === "destructive"
            ? "border-destructive bg-destructive text-destructive-foreground"
            : "border bg-background text-foreground",
          className
        )}
        {...props}
      >
        <div className="grid gap-1">
          {toast.title && (
            <div className="text-sm font-semibold">{toast.title}</div>
          )}
          {toast.description && (
            <div className="text-sm opacity-90">{toast.description}</div>
          )}
        </div>
        <button
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          onClick={() => onDismiss(toast.id)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }
)
ToastComponent.displayName = "Toast"

export { ToastComponent as Toast }