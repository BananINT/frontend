export interface PersonaInfo {
  id: string;
  name: string;
  title: string;
  tagline: string;
  avatar: string;
  icon?: string;
  accent_color: string;
  tools_count: number;
  prompt_cost?: number;
  energy_cost?: number;
  presets?: string[];
}

export interface ChatSession {
  id: string;
  persona_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_generating?: boolean;
}

export interface ToolCallDetail {
  name: string;
  arguments?: Record<string, unknown>;
  result?: Record<string, unknown> | unknown;
  status?: 'running' | 'completed' | 'error';
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: (string | ToolCallDetail)[] | null;
  created_at?: string;
}

export interface ActiveToolStatus {
  name: string;
  arguments?: Record<string, unknown>;
  result?: Record<string, unknown>;
  status: 'running' | 'completed';
}

export interface EnergyStatus {
  current: number;
  max: number;
  cost_normal: number;
  cost_palantint: number;
  recharge_rate_per_sec: number;
  recharge_seconds_total?: number;
}

export interface RateLimitStatus {
  cooldown_remaining_seconds: number;
  hourly_quota_max?: number;
  hourly_quota_remaining?: number;
  is_in_flight: boolean;
  energy?: EnergyStatus;
}

export interface LabConfig {
  personas: PersonaInfo[];
  prompt_cost: number;
  palantint_cost?: number;
  user_bananas: number;
  limits: RateLimitStatus;
  inference_configured: boolean;
}

export interface HtmlAppPreview {
  title: string;
  htmlCode: string;
  viewportMode: 'desktop' | 'mobile';
}
