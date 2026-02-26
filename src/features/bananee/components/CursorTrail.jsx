import React, { useEffect, useRef } from 'react';

const DOT_COUNT = 12;

export default function CursorTrail() {
  // On utilise des Refs pour éviter de déclencher des re-renders React
  const dotsRef = useRef([]);

  useEffect(() => {
    const mouse = { x: 0, y: 0 };
    const dots = dotsRef.current;

    // Initialisation des positions
    dots.forEach(dot => {
      dot.x = 0;
      dot.y = 0;
    });

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    // La boucle d'animation (60fps) via le navigateur, pas via React
    let animationFrame;
    const animate = () => {
      let x = mouse.x;
      let y = mouse.y;

      dots.forEach((dot, index) => {
        // Calcul du suivi (effet élastique)
        dot.x += (x - dot.x) * 0.5;
        dot.y += (y - dot.y) * 0.5;
        
        // Mise à jour directe du DOM (ultra performant)
        dot.style.transform = `translate(${dot.x}px, ${dot.y}px) scale(${(DOT_COUNT - index) / DOT_COUNT})`;
        
        x = dot.x;
        y = dot.y;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      {[...Array(DOT_COUNT)].map((_, i) => (
        <div
          key={i}
          ref={(el) => (dotsRef.current[i] = el)}
          className="absolute h-3 w-3 rounded-full"
          style={{
            backgroundColor: 'var(--banan-primary)',
            boxShadow: '0 0 10px rgba(var(--banan-primary-rgb, 250, 255, 0), 0.7)',
            left: -6, // Centrage du point
            top: -6,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}