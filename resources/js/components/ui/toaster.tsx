import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  getToastIcon,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ErrorBoundary>
      <ToastProvider>
        {toasts.map(function ({ id, title, description, action, variant, ...props }) {
          return (
            <ErrorBoundary key={id}>
              <Toast variant={variant} {...props}>
                <div className="flex items-start space-x-3">
                  {variant && (
                    <div className="flex-shrink-0 mt-0.5">
                      {getToastIcon(variant)}
                    </div>
                  )}
                  <div className="grid gap-1 flex-1">
                    {title && <ToastTitle>{title}</ToastTitle>}
                    {description && (
                      <ToastDescription>{description}</ToastDescription>
                    )}
                  </div>
                </div>
                {action}
                <ToastClose />
              </Toast>
            </ErrorBoundary>
          )
        })}
        <ToastViewport />
      </ToastProvider>
    </ErrorBoundary>
  )
}