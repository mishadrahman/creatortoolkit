import React from "react";
import { cn } from "../../lib/utils";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" }>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 disabled:pointer-events-none disabled:opacity-50 font-bold",
          "h-10 px-4 py-2",
          variant === "default" && "bg-white text-slate-950 hover:bg-slate-200 shadow-md",
          variant === "outline" && "border-2 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white",
          variant === "ghost" && "text-slate-400 hover:bg-slate-800 hover:text-white",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-xs font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex gap-2 items-center text-slate-400 uppercase tracking-widest", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-slate-800 bg-slate-900 text-slate-200 flex flex-col", className)} {...props} />;
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-5", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-bold leading-none tracking-tight text-white", className)} {...props} />;
}
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-slate-500 leading-relaxed", className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0 flex-1 flex flex-col", className)} {...props} />;
}
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-5 pt-0", className)} {...props} />;
}
