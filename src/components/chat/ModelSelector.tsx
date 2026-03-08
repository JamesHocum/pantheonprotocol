import { Bot, Zap, Brain, Sparkles, Eye, Image, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Model {
  id: string;
  name: string;
  speed: 'fastest' | 'fast' | 'medium' | 'slow';
  description: string;
  icon: React.ReactNode;
}

const AVAILABLE_MODELS: Model[] = [
  // Google models
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    speed: 'fast',
    description: 'Balanced speed & multimodal reasoning',
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: 'google/gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    speed: 'fastest',
    description: 'Cheapest & fastest, simple tasks',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    speed: 'slow',
    description: 'Top-tier visual + text + complex reasoning',
    icon: <Brain className="h-4 w-4" />,
  },
  {
    id: 'google/gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    speed: 'medium',
    description: 'Next-gen reasoning model preview',
    icon: <Brain className="h-4 w-4" />,
  },
  {
    id: 'google/gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    speed: 'fast',
    description: 'Fast next-gen balanced model',
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: 'google/gemini-3-pro-image-preview',
    name: 'Gemini 3 Pro Image',
    speed: 'medium',
    description: 'Next-gen image generation',
    icon: <Image className="h-4 w-4" />,
  },
  // OpenAI models
  {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    speed: 'slow',
    description: 'Powerful all-rounder, best accuracy',
    icon: <Bot className="h-4 w-4" />,
  },
  {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    speed: 'medium',
    description: 'Strong reasoning at lower cost',
    icon: <Bot className="h-4 w-4" />,
  },
  {
    id: 'openai/gpt-5-nano',
    name: 'GPT-5 Nano',
    speed: 'fast',
    description: 'Speed & cost optimized',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: 'openai/gpt-5.2',
    name: 'GPT-5.2',
    speed: 'slow',
    description: 'Latest enhanced reasoning',
    icon: <Eye className="h-4 w-4" />,
  },
];

const SPEED_COLORS = {
  fastest: 'bg-secondary text-secondary-foreground',
  fast: 'bg-primary/80 text-primary-foreground',
  medium: 'bg-accent text-accent-foreground',
  slow: 'bg-muted text-muted-foreground',
};

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  compact?: boolean;
}

export const ModelSelector = ({ 
  selectedModel, 
  onModelChange,
  compact = false 
}: ModelSelectorProps) => {
  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  if (compact) {
    return (
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-auto h-8 bg-card/50 border-border/50 text-xs gap-1">
          {currentModel.icon}
          <SelectValue>{currentModel.name}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id} className="text-xs">
              <div className="flex items-center gap-2">
                {model.icon}
                <span>{model.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={selectedModel} onValueChange={onModelChange}>
      <SelectTrigger className="w-full bg-card/50 border-border/50">
        <div className="flex items-center gap-2">
          {currentModel.icon}
          <span className="font-mono">{currentModel.name}</span>
          <Badge className={`text-[10px] ${SPEED_COLORS[currentModel.speed]}`}>
            {currentModel.speed}
          </Badge>
        </div>
      </SelectTrigger>
      <SelectContent>
        {AVAILABLE_MODELS.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex items-center gap-2">
                {model.icon}
                <div>
                  <p className="font-mono text-sm">{model.name}</p>
                  <p className="text-xs text-muted-foreground">{model.description}</p>
                </div>
              </div>
              <Badge className={`text-[10px] ${SPEED_COLORS[model.speed]}`}>
                {model.speed}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export { AVAILABLE_MODELS };
