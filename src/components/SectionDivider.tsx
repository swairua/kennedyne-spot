interface SectionDividerProps {
  variant?: 'angled' | 'curved' | 'wave';
  flip?: boolean;
  className?: string;
  pathColor?: string;
}

export function SectionDivider({ variant = 'angled', flip = false, className = '', pathColor }: SectionDividerProps) {
  const getPath = () => {
    switch (variant) {
      case 'curved':
        return flip 
          ? "M0,96L48,80C96,64,192,32,288,32C384,32,480,64,576,69.3C672,75,768,43,864,37.3C960,32,1056,64,1152,69.3C1248,75,1344,43,1392,26.7L1440,0V96H0Z"
          : "M0,0L48,16C96,32,192,64,288,64C384,64,480,32,576,26.7C672,21,768,53,864,58.7C960,64,1056,32,1152,26.7C1248,21,1344,53,1392,69.3L1440,96V0H0Z";
      case 'wave':
        return flip
          ? "M0,0L60,16C120,32,240,64,360,69.3C480,75,600,43,720,42.7C840,43,960,75,1080,85.3C1200,96,1320,64,1380,48L1440,32V96H0Z"
          : "M0,96L60,80C120,64,240,32,360,26.7C480,21,600,53,720,53.3C840,53,960,21,1080,10.7C1200,0,1320,32,1380,48L1440,64V0H0Z";
      default: // angled
        return flip ? "M0,0L1440,96H0Z" : "M0,96L1440,0H1440V96H0Z";
    }
  };

  return (
    <div className={`relative w-full h-12 lg:h-16 ${className}`}>
      <svg 
        className="absolute bottom-0 w-full h-full" 
        viewBox="0 0 1440 96" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path 
          d={getPath()} 
          fill="currentColor"
          className={pathColor || "text-background"}
        />
      </svg>
    </div>
  );
}