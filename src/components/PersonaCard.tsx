import { Button } from "@/components/ui/button";
import { Briefcase, Dumbbell, Heart, Clapperboard, Target } from "lucide-react";

interface PersonaCardProps {
  title: string;
  subtitle: string;
  icon: "actor" | "businessman" | "fitness" | "life_coach" | "kl_rahul";
  image: string;
  onChat: () => void;
  isLoading?: boolean;
}

const iconMap = {
  actor: Clapperboard,
  businessman: Briefcase,
  fitness: Dumbbell,
  life_coach: Heart,
  kl_rahul: Target,
};

export const PersonaCard = ({ title, subtitle, icon, image, onChat, isLoading }: PersonaCardProps) => {
  const Icon = iconMap[icon];

  return (
    <div className="group relative bg-card border border-border rounded-xl overflow-hidden card-hover">
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-secondary/80 backdrop-blur-sm flex items-center justify-center border border-border">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm mb-5">{subtitle}</p>
        
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
