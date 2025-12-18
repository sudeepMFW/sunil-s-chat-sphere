import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { setExpertise, setHumor, setExpertLevel } from "@/lib/api";

type ExpertiseOption = "actor" | "businessman" | "fitness" | "life_coach";
type HumorOption = "calm" | "happy" | "strict" | "funny";
type ExpertLevelOption = "basic" | "normal" | "advanced" | "elite";

const expertiseOptions: { value: ExpertiseOption; label: string }[] = [
  { value: "actor", label: "Actor" },
  { value: "businessman", label: "Businessman" },
  { value: "fitness", label: "Fitness" },
  { value: "life_coach", label: "Life Coach" },
];

const humorOptions: { value: HumorOption; label: string }[] = [
  { value: "calm", label: "Calm" },
  { value: "happy", label: "Happy" },
  { value: "strict", label: "Strict" },
  { value: "funny", label: "Funny" },
];

const expertLevelOptions: { value: ExpertLevelOption; label: string }[] = [
  { value: "basic", label: "Basic" },
  { value: "normal", label: "Normal" },
  { value: "advanced", label: "Advanced" },
  { value: "elite", label: "Elite" },
];

const AdminConfig = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedExpertise, setSelectedExpertise] = useState<ExpertiseOption | undefined>(undefined);
  const [selectedHumor, setSelectedHumor] = useState<HumorOption | undefined>(undefined);
  const [selectedExpertLevel, setSelectedExpertLevel] = useState<ExpertLevelOption | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleExpertiseChange = async (value: ExpertiseOption) => {
    setIsLoading("expertise");
    try {
      await setExpertise([value]);
      setSelectedExpertise(value);
      toast({
        title: "Success",
        description: "Expertise updated globally",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update expertise",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleHumorChange = async (value: HumorOption) => {
    setIsLoading("humor");
    try {
      await setHumor(value);
      setSelectedHumor(value);
      toast({
        title: "Success",
        description: "Humor updated globally",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update humor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleExpertLevelChange = async (value: ExpertLevelOption) => {
    setIsLoading("expertLevel");
    try {
      await setExpertLevel(value);
      setSelectedExpertLevel(value);
      toast({
        title: "Success",
        description: "Expert level updated globally",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update expert level",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Admin Configuration</h1>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Configuration Card */}
        <Card className="border-border/50 shadow-xl shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-foreground">Global Persona Settings</CardTitle>
            <p className="text-sm text-muted-foreground">
              These settings affect all users chatting with Suniel Shetty
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Expertise Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Expertise</label>
              <Select 
                value={selectedExpertise} 
                onValueChange={handleExpertiseChange}
                disabled={isLoading === "expertise"}
              >
                <SelectTrigger className="w-full bg-gradient-to-r from-secondary to-secondary/80 border-primary/30 hover:border-primary/50 transition-all duration-300">
                  <SelectValue placeholder="Select Expertise" />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/30 shadow-xl shadow-primary/10">
                  {expertiseOptions.map((opt) => (
                    <SelectItem 
                      key={opt.value} 
                      value={opt.value}
                      className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer transition-colors"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Humor Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Humor</label>
              <Select 
                value={selectedHumor} 
                onValueChange={handleHumorChange}
                disabled={isLoading === "humor"}
              >
                <SelectTrigger className="w-full bg-gradient-to-r from-secondary to-secondary/80 border-primary/30 hover:border-primary/50 transition-all duration-300">
                  <SelectValue placeholder="Select Humor" />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/30 shadow-xl shadow-primary/10">
                  {humorOptions.map((opt) => (
                    <SelectItem 
                      key={opt.value} 
                      value={opt.value}
                      className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer transition-colors"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expert Level Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Expert Level</label>
              <Select 
                value={selectedExpertLevel} 
                onValueChange={handleExpertLevelChange}
                disabled={isLoading === "expertLevel"}
              >
                <SelectTrigger className="w-full bg-gradient-to-r from-secondary to-secondary/80 border-primary/30 hover:border-primary/50 transition-all duration-300">
                  <SelectValue placeholder="Select Expert Level" />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/30 shadow-xl shadow-primary/10">
                  {expertLevelOptions.map((opt) => (
                    <SelectItem 
                      key={opt.value} 
                      value={opt.value}
                      className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer transition-colors"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminConfig;
