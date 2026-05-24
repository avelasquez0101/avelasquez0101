import clsx from 'clsx';

export default function Button({ children, variant = 'primary', className, loading, ...props }) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-arcade-dark disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-arcade-primary hover:bg-indigo-500 text-white focus:ring-arcade-primary",
    secondary: "bg-arcade-surface hover:bg-gray-700 text-white border border-gray-600 focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    outline: "bg-transparent border-2 border-arcade-primary text-arcade-primary hover:bg-arcade-primary/10"
  };

  return (
    <button 
      className={clsx(baseStyles, variants[variant], className)}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </span>
      ) : children}
    </button>
  );
}
