interface AronLogoProps {
  width?: number;
  height?: number;
  primaryColor: string;
  accentColor?: string;
}

export function AronLogo({ width = 160, height = 40, primaryColor, accentColor }: AronLogoProps) {
  const scale = height / 100;
  const scaledWidth = 400 * scale;
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 400 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: accentColor ? `drop-shadow(0 0 10px ${accentColor})` : undefined }}
    >
      {/* A icon */}
      <g transform="translate(0, 0)">
        <path 
          d="M25 80 L50 25 L75 80" 
          stroke={primaryColor} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none"
        />
        <line 
          x1="32" 
          y1="60" 
          x2="68" 
          y2="60" 
          stroke={primaryColor} 
          strokeWidth="4" 
          strokeLinecap="round"
        />
        <circle cx="50" cy="25" r="6" fill={primaryColor}/>
        <circle cx="32" cy="60" r="6" fill={primaryColor}/>
        <circle cx="68" cy="60" r="6" fill={primaryColor}/>
      </g>
      
      {/* R icon - Angle */}
      <g transform="translate(98, 0)">
        <path 
          d="M30 75 L30 35 L70 35" 
          stroke={primaryColor} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none"
        />
        <circle cx="30" cy="75" r="6" fill={primaryColor}/>
        <circle cx="30" cy="35" r="6" fill={primaryColor}/>
        <circle cx="70" cy="35" r="6" fill={primaryColor}/>
      </g>
      
      {/* O icon - Community Hexagon */}
      <g transform="translate(196, 0)">
        <path 
          d="M50 25 L70 37.5 L70 62.5 L50 75 L30 62.5 L30 37.5 Z" 
          stroke={primaryColor} 
          strokeWidth="3" 
          fill="none"
        />
        <circle cx="50" cy="25" r="4" fill={primaryColor}/>
        <circle cx="70" cy="37.5" r="4" fill={primaryColor}/>
        <circle cx="70" cy="62.5" r="4" fill={primaryColor}/>
        <circle cx="50" cy="75" r="4" fill={primaryColor}/>
        <circle cx="30" cy="62.5" r="4" fill={primaryColor}/>
        <circle cx="30" cy="37.5" r="4" fill={primaryColor}/>
      </g>
      
      {/* N icon - Aron Kodesh */}
      <g transform="translate(294, 0)">
        <path 
          d="M25 80 L25 45 Q25 25, 50 25 Q75 25, 75 45 L75 80" 
          stroke={primaryColor} 
          strokeWidth="3" 
          strokeLinecap="round" 
          fill="none"
        />
        <line 
          x1="25" 
          y1="80" 
          x2="75" 
          y2="80" 
          stroke={primaryColor} 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        <line 
          x1="50" 
          y1="80" 
          x2="50" 
          y2="30" 
          stroke={primaryColor} 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        <path 
          d="M42 38 L50 30 L58 38" 
          stroke={primaryColor} 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
