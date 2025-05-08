import React from 'react';

interface MaterialIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
  filled?: boolean;
}

const MaterialIcon: React.FC<MaterialIconProps> = ({ 
  name, 
  className = '', 
  size = 24, 
  color = 'currentColor',
  filled = true
}) => {
  // Base URL for Google Material Icons
  const baseUrl = filled 
    ? "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" 
    : "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0";
  
  // Add the font stylesheet dynamically if it doesn't exist
  React.useEffect(() => {
    if (!document.querySelector(`link[href="${baseUrl}"]`)) {
      const link = document.createElement('link');
      link.href = baseUrl;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [baseUrl]);

  return (
    <span 
      className={`material-symbols-${filled ? 'rounded' : 'outlined'} ${className}`}
      style={{ 
        fontSize: `${size}px`, 
        color,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}`
      }}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
