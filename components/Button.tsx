import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'white';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  to, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  type = 'button',
  disabled = false
}) => {
  // Base styles: Removed fixed padding/text size to allow dynamic sizing
  const baseStyles = "inline-flex items-center justify-center border font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variants = {
    primary: "border-transparent text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500",
    secondary: "border-transparent text-primary-700 bg-primary-100 hover:bg-primary-200 focus:ring-primary-500",
    outline: "border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-500",
    white: "border-transparent text-primary-600 bg-white hover:bg-gray-50 focus:ring-white",
  };

  const styles = `${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={styles} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;