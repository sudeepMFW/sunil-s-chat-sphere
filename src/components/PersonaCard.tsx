import { Button } from "@/components/ui/button";
import { Briefcase, Dumbbell, Heart, Clapperboard } from "lucide-react";

interface PersonaCardProps {
  title: string;
  subtitle: string;
  icon: "actor" | "businessman" | "fitness" | "life_coach";
  onChat: () => void;
  isLoading?: boolean;
}

const iconMap = {
  actor: Clapperboard,
  businessman: Briefcase,
  fitness: Dumbbell,
  life_coach: Heart,
};

export const PersonaCard = ({ title, subtitle, icon, onChat, isLoading }: PersonaCardProps) => {
  const Icon = iconMap[icon];

  return (
    <div className="group relative bg-card border border-border rounded-lg p-6 card-hover">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-6">{subtitle}</p>
        
        <Button 
          onClick={onChat} 
          disabled={isLoading}
          className="w-full gold-gradient text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          {isLoading ? "Connecting..." : "Chat"}
        </Button>
      </div>
    </div>
  );
};
