import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, User, Shield } from "lucide-react";

const USER_EMAIL = "mfw@gmail.com";
const USER_PASSWORD = "mfw@123";
const ADMIN_EMAIL = "admin@mediafirewall.ai";
const ADMIN_PASSWORD = "admin@123";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("user");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (activeTab === "user") {
      if (email === USER_EMAIL && password === USER_PASSWORD) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("isAdmin", "false");
        toast({
          title: "Welcome!",
          description: "Login successful",
        });
        navigate("/personas");
      } else {
        toast({
          title: "Invalid credentials",
          description: "Please check your email and password",
          variant: "destructive",
        });
      }
    } else {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("isAdmin", "true");
        toast({
          title: "Welcome Admin!",
          description: "Login successful",
        });
        navigate("/admin");
      } else {
        toast({
          title: "Invalid admin credentials",
          description: "Please check your email and password",
          variant: "destructive",
        });
      }
    }

    setIsLoading(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <img 
              src="https://mediafirewall.ai/images/logo.png" 
              alt="Media Firewall Logo" 
              className="h-16 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {activeTab === "user" 
                ? "Sign in to chat with Suniel Shetty" 
                : "Sign in to configure persona settings"}
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                USER
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                ADMIN
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-secondary/50 border-border focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-secondary/50 border-border focus:border-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gold-gradient text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter admin email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-secondary/50 border-border focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Admin Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-secondary/50 border-border focus:border-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gold-gradient text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  {isLoading ? "Signing in..." : "Sign In as Admin"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
