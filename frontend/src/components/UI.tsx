
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const Card = ({ children, title, subtitle, className = "" }: CardProps) => (
  <div className={`bg-white rounded-xl shadow-sm border border-soft-cream overflow-hidden ${className}`}>
    {(title || subtitle) && (
      <div className="px-6 py-4 border-b border-soft-cream bg-faded-white/50">
        {title && <h3 className="text-lg font-bold text-luxury-brown">{title}</h3>}
        {subtitle && <p className="text-xs text-warm-taupe font-medium mt-0.5">{subtitle}</p>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost" | "gold";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = ({ children, variant = "primary", className = "", ...props }: ButtonProps) => {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-luxury-brown hover:bg-[#3a2c20] text-white shadow-sm",
    secondary: "bg-white border border-soft-cream text-warm-taupe hover:bg-faded-white",
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    ghost: "text-warm-taupe hover:bg-faded-white hover:text-luxury-brown",
    gold: "bg-furniture-gold hover:bg-[#b08e48] text-white",
  };
  
  return (
    <button 
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = "", ...props }: InputProps) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-xs font-bold text-luxury-brown ml-1">{label}</label>}
    <input 
      className={`px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all border-soft-cream bg-white text-sm placeholder:text-warm-taupe/40 ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    />
    {error && <span className="text-[10px] font-medium text-red-600 ml-1">{error}</span>}
  </div>
);

type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "purple" | "gold";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

export const Badge = ({ children, variant = "neutral" }: BadgeProps) => {
  const variants: Record<BadgeVariant, string> = {
    neutral: "bg-faded-white text-warm-taupe border-soft-cream",
    primary: "bg-luxury-brown text-white border-luxury-brown",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    purple: "bg-indigo-50 text-indigo-700 border-indigo-200",
    gold: "bg-amber-50 text-amber-800 border-amber-200",
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${variants[variant]}`}>
      {children}
    </span>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-brown/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-soft-cream">
        <div className="px-6 py-4 border-b border-soft-cream flex justify-between items-center bg-faded-white/50">
          <h3 className="text-lg font-bold text-luxury-brown">{title}</h3>
          <button onClick={onClose} className="p-2 text-warm-taupe hover:text-luxury-brown transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
