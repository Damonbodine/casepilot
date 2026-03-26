import { toast } from "sonner";

export function useToast() {
  return {
    toast: (opts: { title?: string; description?: string; variant?: string }) => {
      if (opts.variant === "destructive") {
        toast.error(opts.title ?? opts.description ?? "Error");
      } else {
        toast.success(opts.title ?? opts.description ?? "Success");
      }
    },
  };
}
