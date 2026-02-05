 import { useState } from "react";
 import { Timer, X, Check } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
 
 interface CooldownEditorProps {
   cooldownMinutes: number;
   onUpdate: (minutes: number) => void;
 }
 
 const PRESETS = [
   { label: "5m", value: 5 },
   { label: "30m", value: 30 },
   { label: "1h", value: 60 },
   { label: "6h", value: 360 },
   { label: "1d", value: 1440 },
   { label: "7d", value: 10080 },
   { label: "30d", value: 43200 },
 ];
 
 export function formatCooldownTime(minutes: number): string {
   if (minutes < 60) return `${minutes} মিনিট`;
   if (minutes < 1440) {
     const hours = Math.floor(minutes / 60);
     const mins = minutes % 60;
     return mins > 0 ? `${hours} ঘন্টা ${mins} মি.` : `${hours} ঘন্টা`;
   }
   const days = Math.floor(minutes / 1440);
   const remainingHours = Math.floor((minutes % 1440) / 60);
   return remainingHours > 0 ? `${days} দিন ${remainingHours} ঘ.` : `${days} দিন`;
 }
 
 export function CooldownEditor({ cooldownMinutes, onUpdate }: CooldownEditorProps) {
   const [open, setOpen] = useState(false);
   const [customMinutes, setCustomMinutes] = useState(cooldownMinutes.toString());
 
   const handlePresetClick = (minutes: number) => {
     onUpdate(minutes);
     setOpen(false);
   };
 
   const handleCustomSave = () => {
     const mins = parseInt(customMinutes);
     if (!isNaN(mins) && mins >= 1) {
       onUpdate(mins);
       setOpen(false);
     }
   };
 
   return (
     <Popover open={open} onOpenChange={setOpen}>
       <PopoverTrigger asChild>
         <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm transition-colors border border-slate-200">
           <Timer className="w-4 h-4 text-slate-500" />
           <span className="font-medium font-bengali">{formatCooldownTime(cooldownMinutes)}</span>
         </button>
       </PopoverTrigger>
       <PopoverContent className="w-72 p-4" align="start">
         <div className="space-y-4">
           <div className="flex items-center justify-between">
             <h4 className="font-semibold text-gray-900 font-bengali flex items-center gap-2">
               <Timer className="w-4 h-4 text-blue-600" />
               Cooldown পরিবর্তন
             </h4>
             <button 
               onClick={() => setOpen(false)}
               className="text-gray-400 hover:text-gray-600"
             >
               <X className="w-4 h-4" />
             </button>
           </div>
 
           {/* Quick Presets */}
           <div>
             <p className="text-xs text-gray-500 mb-2 font-bengali">Quick Select:</p>
             <div className="flex flex-wrap gap-1.5">
               {PRESETS.map((preset) => (
                 <button
                   key={preset.value}
                   onClick={() => handlePresetClick(preset.value)}
                   className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                     cooldownMinutes === preset.value
                       ? "bg-blue-600 text-white"
                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                   }`}
                 >
                   {preset.label}
                 </button>
               ))}
             </div>
           </div>
 
           {/* Custom Input */}
           <div>
             <p className="text-xs text-gray-500 mb-2 font-bengali">অথবা কাস্টম (মিনিটে):</p>
             <div className="flex gap-2">
               <Input
                 type="number"
                 min="1"
                 value={customMinutes}
                 onChange={(e) => setCustomMinutes(e.target.value)}
                 className="flex-1 h-9"
                 placeholder="মিনিট"
               />
               <Button
                 onClick={handleCustomSave}
                 size="sm"
                 className="bg-blue-600 hover:bg-blue-700 h-9 px-3"
               >
                 <Check className="w-4 h-4" />
               </Button>
             </div>
             <p className="text-xs text-gray-400 mt-1.5 font-bengali">
               = {formatCooldownTime(parseInt(customMinutes) || 0)}
             </p>
           </div>
         </div>
       </PopoverContent>
     </Popover>
   );
 }