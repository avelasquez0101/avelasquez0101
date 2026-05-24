import clsx from 'clsx';

export default function Input({ label, error, className, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        className={clsx(
          "w-full px-4 py-2 bg-arcade-surface border rounded-lg focus:outline-none focus:ring-2 focus:ring-arcade-primary transition-colors",
          error ? "border-red-500 focus:ring-red-500" : "border-gray-700 text-white",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
