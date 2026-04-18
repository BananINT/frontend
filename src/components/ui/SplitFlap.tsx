import { useEffect, useState } from 'react';
import './SplitFlap.css';

// ─── Single Character Flap ────────────────────────────────────────

const DEFAULT_CHARS = [
    ' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ',',
    'k', 'M', 'B', 'T', 'Q', 'a', 'i', 'S', 'x', 'p', 'O', 'c', 'N', 'o', 'D', '∞'
];

interface FlapProps {
    value: string;
    /** Total flip duration per step in ms (e.g. 100) */
    duration?: number;
    chars?: string[];
}

function Flap({ value, duration = 100, chars = DEFAULT_CHARS }: FlapProps) {
    const targetIndex = Math.max(0, chars.indexOf(value));
    const [currentIndex, setCurrentIndex] = useState(targetIndex);

    // This effect runs whenever currentIndex or targetIndex changes.
    // If not at target, it waits `duration` ms and advances currentIndex by 1, wrapping around.
    useEffect(() => {
        if (currentIndex === targetIndex) return;

        const timer = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % chars.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [currentIndex, targetIndex, duration, chars.length]);

    const displayChar = chars[currentIndex];
    const nextChar = chars[(currentIndex + 1) % chars.length];
    
    // Animate if we haven't reached the target index yet.
    const isAnimating = currentIndex !== targetIndex;

    return (
        <div 
            className="sf-char" 
            style={{ '--sf-duration': `${duration}ms` } as React.CSSProperties}
        >
            {/* ── Static layers (always visible behind the flaps) ── */}
            {/* Upper bg: shows NEXT character (revealed when top flap falls away) */}
            <div className="sf-panel sf-top sf-static">
                <div className="sf-text">{isAnimating ? nextChar : displayChar}</div>
            </div>

            {/* Lower bg: shows CURRENT character */}
            <div className="sf-panel sf-bottom sf-static">
                <div className="sf-text">{displayChar}</div>
            </div>

            {/* ── Animated flaps ── */}
            {/* Top flap: shows CURRENT, folds down to reveal upper bg (next) */}
            {isAnimating && (
                <div key={`top-${currentIndex}`} className="sf-panel sf-top sf-flap-top">
                    <div className="sf-text">{displayChar}</div>
                </div>
            )}

            {/* Bottom flap: shows NEXT, folds in from above */}
            {isAnimating && (
                <div key={`btm-${currentIndex}`} className="sf-panel sf-bottom sf-flap-btm">
                    <div className="sf-text">{nextChar}</div>
                </div>
            )}

            {/* Hinge */}
            <div className="sf-hinge" />
        </div>
    );
}

// ─── Multi-character Display ──────────────────────────────────────

interface SplitFlapProps {
    value: string;
    /** Duration in ms per flip (default 80 for rapid spinning) */
    duration?: number;
    /** Fixed number of flaps. Left-pads with spaces. */
    minLength?: number;
    className?: string;
    chars?: string[];
}

export default function SplitFlapDisplay({
    value,
    duration = 80,
    minLength = 0,
    className = '',
    chars = DEFAULT_CHARS,
}: SplitFlapProps) {
    // Pad the string so we always have a fixed number of physical flaps.
    // If value="10" and minLength=5, it becomes "   10".
    const padded = value.padStart(minLength, ' ');

    return (
        <div className={`sf-display ${className}`}>
            {padded.split('').map((char, i) => (
                <Flap
                    key={i} // Index is safe here because we guarantee fixed length padding
                    value={char}
                    duration={duration}
                    chars={chars}
                />
            ))}
        </div>
    );
}
