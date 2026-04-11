interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 64 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Diamond shape with geometric triangular pattern - Alumco style */}
      <g transform="translate(60, 60)">
        {/* Top triangle - Light green */}
        <path
          d="M 0,-45 L -12,-20 L 12,-20 Z"
          fill="#A4CE95"
        />
        
        {/* Left upper triangle - Coral/Red */}
        <path
          d="M -35,-25 L -15,-10 L -15,-30 Z"
          fill="#EF5350"
        />
        
        {/* Right upper triangle - Dark blue */}
        <path
          d="M 35,-25 L 15,-30 L 15,-10 Z"
          fill="#415A77"
        />
        
        {/* Left middle upper triangle - Yellow/Gold */}
        <path
          d="M -40,-5 L -18,-5 L -29,-18 Z"
          fill="#F9A825"
        />
        
        {/* Center diamond - Coral */}
        <path
          d="M -7,0 L 0,-8 L 7,0 L 0,8 Z"
          fill="#EF5350"
        />
        
        {/* Right middle upper triangle - Coral */}
        <path
          d="M 40,-5 L 18,-5 L 29,-18 Z"
          fill="#E57373"
        />
        
        {/* Left middle lower triangle - Yellow/Gold */}
        <path
          d="M -40,10 L -18,10 L -29,23 Z"
          fill="#FFB74D"
        />
        
        {/* Right middle lower triangle - Coral */}
        <path
          d="M 40,10 L 18,10 L 29,23 Z"
          fill="#EF5350"
        />
        
        {/* Bottom left triangle - Light green */}
        <path
          d="M -35,30 L -15,15 L -15,35 Z"
          fill="#A5D6A7"
        />
        
        {/* Bottom center triangle - Light green */}
        <path
          d="M 0,45 L -12,25 L 12,25 Z"
          fill="#A4CE95"
        />
        
        {/* Bottom right triangle - Light green */}
        <path
          d="M 35,30 L 15,35 L 15,15 Z"
          fill="#A5D6A7"
        />
      </g>
    </svg>
  );
}