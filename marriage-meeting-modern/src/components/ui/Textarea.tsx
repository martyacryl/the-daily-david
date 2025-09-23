import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 
          transition-all duration-200 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white
          ${error ? 'bg-red-50 dark:bg-red-900/20 focus:ring-red-500 focus:bg-red-50 dark:focus:bg-red-900/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
