import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ready for Supabase Auth integration
    console.log("Login submitted");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black/95 backdrop-blur-xl border border-yellow-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bengali font-bold text-center text-gradient-gold">
            স্বাগতম
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400 font-bengali">
            আপনার অ্যাকাউন্টে লগইন করুন
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300 font-bengali">ইমেইল</Label>
            <Input
              id="email"
              type="email"
              placeholder="আপনার ইমেইল দিন"
              required
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-yellow-500/20 font-bengali"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300 font-bengali">পাসওয়ার্ড</Label>
            <Input
              id="password"
              type="password"
              placeholder="আপনার পাসওয়ার্ড দিন"
              required
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-yellow-500/20 font-bengali"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bengali font-semibold hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 transition-all duration-300"
          >
            লগইন
          </Button>
          <p className="text-center text-sm text-gray-500 font-bengali">
            অ্যাকাউন্ট নেই?{" "}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-yellow-400 hover:text-yellow-300 hover:underline font-medium transition-colors"
            >
              সাইন আপ করুন
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
