import './ShinyText.css';

interface ShinyTextProps {
    text: string;
    speed?: number;
    className?: string;
}

export default function ShinyText({ text, speed = 4, className = "" }: ShinyTextProps) {
    const animationStyle = { '--shiny-speed': `${speed}s` } as React.CSSProperties;

    return (
        <div 
            className={`shiny-text inline-block ${className}`}
            style={animationStyle}
        >
            {text}
        </div>
    );
};

