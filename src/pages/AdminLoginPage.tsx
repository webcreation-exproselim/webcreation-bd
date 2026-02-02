import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Check if already logged in as admin
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setTimeout(() => {
          checkAdminAndRedirect(session.user.id);
        }, 100);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkAdminAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminAndRedirect = async (userId: string) => {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();
    
    if (roleData) {
      navigate("/admin");
    } else {
      // Not an admin, sign out and show error
      await supabase.auth.signOut();
      toast({
        title: "অ্যাক্সেস নেই",
        description: "আপনার অ্যাডমিন অ্যাক্সেস নেই",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "লগইন ব্যর্থ",
          description: error.message.includes("Invalid login credentials") 
            ? "ইমেইল বা পাসওয়ার্ড সঠিক নয়" 
            : error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Check if admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .single();

        if (roleData) {
          toast({
            title: "সফল!",
            description: "অ্যাডমিন ড্যাশবোর্ডে স্বাগতম",
          });
          navigate("/admin");
        } else {
          await supabase.auth.signOut();
          toast({
            title: "অ্যাক্সেস নেই",
            description: "আপনার অ্যাডমিন অ্যাক্সেস নেই",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      toast({
        title: "ত্রুটি",
        description: "কিছু ভুল হয়েছে, আবার চেষ্টা করুন",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Admin Login Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          {/* Admin Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bengali font-bold text-white text-center mb-2">
            অ্যাডমিন লগইন
          </h1>
          <p className="text-white/60 text-center font-bengali mb-8">
            অ্যাডমিন ড্যাশবোর্ডে অ্যাক্সেস করুন
          </p>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white/80 font-bengali">
                অ্যাডমিন ইমেইল
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-white/80 font-bengali">
                পাসওয়ার্ড
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white font-bengali font-semibold py-6 rounded-xl hover:from-red-600 hover:to-red-800 transition-all"
            >
              {loading ? "লোড হচ্ছে..." : "অ্যাডমিন লগইন"}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
            <p className="text-white/60 text-sm font-bengali text-center">
              🔒 এই পেজ শুধুমাত্র অনুমোদিত অ্যাডমিনদের জন্য
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
