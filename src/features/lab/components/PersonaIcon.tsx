import { Bot, Gamepad2, TrendingUp, EyeOff, Cpu, Terminal } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface PersonaIconProps extends LucideProps {
  name?: string;
}

export function PersonaIcon({ name, ...props }: PersonaIconProps) {
  switch (name?.toLowerCase()) {
    case 'bot':
    case 'bananabot':
      return <Bot {...props} />;
    case 'gamepad2':
    case 'gamepad':
    case 'cyberarchitect':
      return <Gamepad2 {...props} />;
    case 'trendingup':
    case 'trending-up':
    case 'boursebot':
      return <TrendingUp {...props} />;
    case 'eyeoff':
    case 'eye-off':
    case 'palantint':
      return <EyeOff {...props} />;
    case 'terminal':
    case 'code':
      return <Terminal {...props} />;
    default:
      return <Cpu {...props} />;
  }
}
