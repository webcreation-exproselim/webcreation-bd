 import { useState } from "react";
 import { Timer, X, Check, Clock, Edit3 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
 
 interface CooldownEditorProps {
   cooldownMinutes: number;
   onUpdate: (minutes: number) => void;
 }
 
 const PRESETS = [
   { label: "5 মি.", value: 5 },
   { label: "30 মি.", value: 30 },
   { label: "1 ঘন্টা", value: 60 },
   { label: "6 ঘন্টা", value: 360 },
   { label: "1 দিন", value: 1440 },
   { label: "7 দিন", value: 10080 },
   { label: "30 দিন", value: 43200 },
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
         <button className="group flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-800 transition-all duration-200 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md w-full sm:w-auto">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm flex-shrink-0">
             <Clock className="w-4 h-4 text-white" />
           </div>
           <div className="flex flex-col items-start flex-1 min-w-0">
             <span className="text-[10px] text-gray-500 font-bengali leading-tight">অর্ডার Cooldown</span>
             <span className="font-bold text-sm font-bengali text-gray-900 truncate">{formatCooldownTime(cooldownMinutes)}</span>
           </div>
           <Edit3 className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-600 flex-shrink-0" />
         </button>
       </PopoverTrigger>
       <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 p-0 overflow-hidden" align="start" sideOffset={8}>
         {/* Header */}
         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 sm:p-4 text-white">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 sm:gap-3">
               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center">
                 <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
               </div>
               <div>
                 <h4 className="font-bold font-bengali text-sm sm:text-base">Cooldown সময়</h4>
                 <p className="text-[10px] sm:text-xs text-white/80 font-bengali">একই গ্রাহক আবার অর্ডার করতে পারবে</p>
               </div>
             </div>
             <button 
               onClick={() => setOpen(false)}
               className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
             >
               <X className="w-4 h-4" />
             </button>
           </div>
         </div>
         
         <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
           {/* Current Value Display */}
           <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200">
             <div className="flex items-center justify-between">
               <span className="text-xs sm:text-sm text-gray-600 font-bengali">বর্তমান সময়:</span>
               <span className="font-bold text-emerald-700 font-bengali text-base sm:text-lg">{formatCooldownTime(cooldownMinutes)}</span>
             </div>
           </div>
 
           {/* Quick Presets */}
           <div>
             <p className="text-[10px] sm:text-xs text-gray-500 mb-2 font-bengali font-medium">⚡ দ্রুত নির্বাচন:</p>
             <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
               {PRESETS.map((preset) => (
                 <button
                   key={preset.value}
                   onClick={() => handlePresetClick(preset.value)}
                   className={`py-2 px-1 sm:py-2.5 sm:px-2 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all duration-200 font-bengali ${
                     cooldownMinutes === preset.value
                       ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                   }`}
                 >
                   {preset.label}
                 </button>
               ))}
             </div>
           </div>
 
           {/* Divider */}
           <div className="flex items-center gap-2 sm:gap-3">
             <div className="flex-1 h-px bg-gray-200" />
             <span className="text-[10px] sm:text-xs text-gray-400 font-bengali">অথবা</span>
             <div className="flex-1 h-px bg-gray-200" />
           </div>
 
           {/* Custom Input */}
           <div>
             <p className="text-[10px] sm:text-xs text-gray-500 mb-2 font-bengali font-medium">✏️ কাস্টম সময় (মিনিটে):</p>
             <div className="flex gap-2">
               <div className="relative flex-1">
                 <Input
                   type="number"
                   min="1"
                   value={customMinutes}
                   onChange={(e) => setCustomMinutes(e.target.value)}
                   className="h-10 sm:h-11 pr-14 text-base sm:text-lg font-bold"
                   placeholder="মিনিট"
                 />
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-gray-400 font-bengali">
                   মিনিট
                 </span>
               </div>
               <Button
                 onClick={handleCustomSave}
                 className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-10 sm:h-11 px-4 sm:px-5 rounded-xl shadow-lg"
               >
                 <Check className="w-4 h-4 sm:w-5 sm:h-5" />
               </Button>
             </div>
             <div className="mt-2 p-2 bg-gray-50 rounded-lg">
               <p className="text-[10px] sm:text-xs text-gray-500 font-bengali text-center">
                 = <span className="font-bold text-gray-700">{formatCooldownTime(parseInt(customMinutes) || 0)}</span>
               </p>
             </div>
           </div>
 
           {/* Info Note */}
           <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 sm:p-3">
             <p className="text-[10px] sm:text-xs text-amber-700 font-bengali leading-relaxed">
               💡 <strong>নোট:</strong> এই সময়ের মধ্যে একই ফোন/IP থেকে আবার অর্ডার আসলে Fraud Guard ব্লক করবে।
             </p>
           </div>
         </div>
       </PopoverContent>
     </Popover>
   );
 }