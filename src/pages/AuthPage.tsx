import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Function to check role and redirect
  const checkRoleAndRedirect = async (userId: string) => {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();
    
    if (roleData) {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  // Check if already logged in
  useEffect(() => {
    // Detect password recovery flow from URL hash FIRST
    // Supabase recovery links typically arrive with a hash like: #access_token=...&type=recovery
    const hash = window.location.hash;
    const isRecoveryFlow = hash && hash.includes("type=recovery");
    
    if (isRecoveryFlow) {
      setIsPasswordRecovery(true);
      setIsLogin(true);
      // Don't redirect - let user set new password
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip redirect if in password recovery mode
      const currentHash = window.location.hash;
      if (currentHash && currentHash.includes("type=recovery")) {
        setIsPasswordRecovery(true);
        return;
      }
      
      if (event === "SIGNED_IN" && session) {
        // Defer to avoid potential deadlock
        setTimeout(() => {
          checkRoleAndRedirect(session.user.id);
        }, 100);
      }
    });

    // THEN check for existing session (but not during recovery)
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentHash = window.location.hash;
      if (currentHash && currentHash.includes("type=recovery")) {
        setIsPasswordRecovery(true);
        return;
      }
      if (session) {
        checkRoleAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSendResetEmail = async () => {
    if (!email) {
      toast({
        title: "ইমেইল দিন",
        description: "পাসওয়ার্ড রিসেট লিংক পাঠাতে ইমেইল প্রয়োজন",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        toast({
          title: "ত্রুটি",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "লিংক পাঠানো হয়েছে",
        description: "ইমেইল চেক করুন—পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে",
      });
    } catch {
      toast({
        title: "ত্রুটি",
        description: "কিছু ভুল হয়েছে, আবার চেষ্টা করুন",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({
        title: "পাসওয়ার্ড দুর্বল",
        description: "কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "মিলছে না",
        description: "দুইবার একই পাসওয়ার্ড দিন",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({
          title: "ত্রুটি",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "সফল!",
        description: "পাসওয়ার্ড আপডেট হয়েছে—এখন লগইন করুন",
      });
      // Clear recovery hash and state
      window.location.hash = "";
      setIsPasswordRecovery(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({
        title: "ত্রুটি",
        description: "কিছু ভুল হয়েছে, আবার চেষ্টা করুন",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "লগইন ব্যর্থ",
              description: "ইমেইল বা পাসওয়ার্ড সঠিক নয়",
              variant: "destructive",
            });
          } else if (error.message.includes("Email not confirmed")) {
            toast({
              title: "ইমেইল ভেরিফাই করুন",
              description: "আপনার ইমেইলে পাঠানো লিংকে ক্লিক করে ভেরিফাই করুন",
              variant: "destructive",
            });
          } else {
            toast({
              title: "ত্রুটি",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "সফল!",
            description: "সফলভাবে লগইন হয়েছে",
          });
        }
      } else {
        // Signup
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "অ্যাকাউন্ট আছে",
              description: "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট তৈরি হয়েছে। লগইন করুন।",
              variant: "destructive",
            });
          } else {
            toast({
              title: "ত্রুটি",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "সফল!",
            description: "আপনার ইমেইলে একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে",
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          title: "ত্রুটি",
          description: "Google লগইন ব্যর্থ হয়েছে",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "ত্রুটি",
        description: "কিছু ভুল হয়েছে",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
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
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bengali">হোমে ফিরে যান</span>
        </Link>

        {/* Auth Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30">
              <span className="text-white font-bold text-3xl font-bengali">W</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bengali font-bold text-white text-center mb-2">
            {isLogin ? "অ্যাকাউন্টে লগইন করুন" : "নতুন অ্যাকাউন্ট তৈরি করুন"}
          </h1>
          <p className="text-white/60 text-center font-bengali mb-8">
            {isLogin
              ? "আপনার ড্যাশবোর্ডে অ্যাক্সেস করুন"
              : "আজই শুরু করুন আপনার ডিজিটাল জার্নি"}
          </p>

          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full bg-white text-gray-800 hover:bg-gray-100 font-medium py-6 rounded-xl mb-6 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? "লোড হচ্ছে..." : "Google দিয়ে চালিয়ে যান"}
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/40 font-bengali">অথবা</span>
            </div>
          </div>

           {/* Email Form */}
           <form onSubmit={isPasswordRecovery ? handleUpdatePassword : handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="fullName" className="text-white/80 font-bengali">
                    পুরো নাম
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="আপনার নাম"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 font-bengali"
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white/80 font-bengali">
                    ফোন নম্বর
                  </Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-white/80 font-bengali">
                ইমেইল
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-white/80 font-bengali">
                 {isPasswordRecovery ? "নতুন পাসওয়ার্ড" : "পাসওয়ার্ড"}
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                   value={isPasswordRecovery ? newPassword : password}
                   onChange={(e) =>
                     isPasswordRecovery
                       ? setNewPassword(e.target.value)
                       : setPassword(e.target.value)
                   }
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

             {isPasswordRecovery && (
               <div>
                 <Label htmlFor="confirmPassword" className="text-white/80 font-bengali">
                   পাসওয়ার্ড নিশ্চিত করুন
                 </Label>
                 <div className="relative mt-1">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                   <Input
                     id="confirmPassword"
                     type={showPassword ? "text" : "password"}
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     placeholder="••••••••"
                     className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                     required
                     minLength={6}
                   />
                 </div>
               </div>
             )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white font-bengali font-semibold py-6 rounded-xl hover:from-red-600 hover:to-red-800 transition-all"
            >
              {loading
                ? "লোড হচ্ছে..."
                 : isPasswordRecovery
                 ? "পাসওয়ার্ড আপডেট করুন"
                 : isLogin
                ? "লগইন করুন"
                : "অ্যাকাউন্ট তৈরি করুন"}
            </Button>

             {isLogin && !isPasswordRecovery && (
               <button
                 type="button"
                 onClick={handleSendResetEmail}
                 className="w-full text-sm text-white/60 hover:text-white font-bengali underline underline-offset-4"
               >
                 পাসওয়ার্ড ভুলে গেছেন?
               </button>
             )}
          </form>

          {/* Toggle Login/Signup */}
           {!isPasswordRecovery && (
             <p className="text-center text-white/60 font-bengali mt-6">
               {isLogin ? "অ্যাকাউন্ট নেই?" : "ইতিমধ্যে অ্যাকাউন্ট আছে?"}{" "}
               <button
                 onClick={() => setIsLogin(!isLogin)}
                 className="text-yellow-400 hover:text-yellow-300 font-medium"
               >
                 {isLogin ? "সাইন আপ করুন" : "লগইন করুন"}
               </button>
             </p>
           )}
        </div>
      </motion.div>
    </div>
  );
}
