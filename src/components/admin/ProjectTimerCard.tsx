import { useState, useEffect } from "react";
import { Pause, Play, CheckCircle, Clock, Send, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  description: string | null;
  client_name: string;
  client_phone: string | null;
  order_id: string | null;
  invoice_id: string | null;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: string;
  paused_at: string | null;
  remaining_duration_ms: number | null;
  reminder_sent_1day: boolean;
  reminder_sent_3day: boolean;
  reminder_sent_same_day: boolean;
  created_by: string;
  created_at: string;
}

interface ProjectTimerCardProps {
  project: Project;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onComplete: (id: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onSendReminder: (project: Project) => void;
}

function useCountdown(endDate: string, isPaused: boolean, remainingMs: number | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });

  useEffect(() => {
    const calculate = () => {
      let ms: number;
      if (isPaused && remainingMs !== null) {
        ms = remainingMs;
      } else {
        ms = new Date(endDate).getTime() - Date.now();
      }
      if (ms < 0) ms = 0;

      setTimeLeft({
        days: Math.floor(ms / (1000 * 60 * 60 * 24)),
        hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((ms % (1000 * 60)) / 1000),
        totalMs: ms,
      });
    };

    calculate();
    if (!isPaused) {
      const interval = setInterval(calculate, 1000);
      return () => clearInterval(interval);
    }
  }, [endDate, isPaused, remainingMs]);

  return timeLeft;
}

export function ProjectTimerCard({
  project,
  onPause,
  onResume,
  onComplete,
  onEdit,
  onDelete,
  onSendReminder,
}: ProjectTimerCardProps) {
  const isPaused = project.status === "paused";
  const isCompleted = project.status === "completed";
  const timeLeft = useCountdown(project.end_date, isPaused, project.remaining_duration_ms);

  const totalDurationMs = project.duration_days * 24 * 60 * 60 * 1000;
  const elapsed = totalDurationMs - timeLeft.totalMs;
  const progressPercent = totalDurationMs > 0 ? Math.min(100, Math.max(0, (elapsed / totalDurationMs) * 100)) : 0;

  const getStatusColor = () => {
    if (isCompleted) return "text-emerald-600";
    if (timeLeft.totalMs <= 0) return "text-red-500";
    if (timeLeft.days < 1) return "text-red-500";
    if (timeLeft.days <= 3) return "text-amber-500";
    return "text-emerald-600";
  };

  const getStatusBorder = () => {
    if (isCompleted) return "border-emerald-200";
    if (timeLeft.totalMs <= 0) return "border-red-200";
    if (timeLeft.days < 1) return "border-red-200";
    if (timeLeft.days <= 3) return "border-amber-200";
    return "border-gray-100";
  };

  const getProgressColor = () => {
    if (isCompleted) return "bg-emerald-500";
    if (timeLeft.totalMs <= 0) return "bg-red-500";
    if (timeLeft.days < 1) return "bg-red-500";
    if (timeLeft.days <= 3) return "bg-amber-500";
    return "bg-blue-500";
  };

  const getStatusLabel = () => {
    if (isCompleted) return "সম্পন্ন";
    if (isPaused) return "বিরতি";
    if (timeLeft.totalMs <= 0) return "ওভারডিউ";
    return "সক্রিয়";
  };

  const getStatusBadgeClass = () => {
    if (isCompleted) return "bg-emerald-50 text-emerald-600 border-emerald-200";
    if (isPaused) return "bg-gray-100 text-gray-500 border-gray-200";
    if (timeLeft.totalMs <= 0) return "bg-red-50 text-red-600 border-red-200";
    return "bg-blue-50 text-blue-600 border-blue-200";
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl border p-5 transition-all duration-300 hover:shadow-md shadow-sm",
      getStatusBorder()
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-bengali font-bold text-gray-900 text-lg truncate">{project.title}</h3>
          <p className="text-sm text-gray-500 font-bengali mt-0.5">
            ক্লায়েন্ট: {project.client_name}
          </p>
          {project.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{project.description}</p>
          )}
        </div>
        <span className={cn("px-3 py-1 rounded-full text-xs font-medium border shrink-0 ml-3", getStatusBadgeClass())}>
          {getStatusLabel()}
        </span>
      </div>

      {/* Countdown */}
      {!isCompleted && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className={cn("w-4 h-4", getStatusColor())} />
            <span className={cn("text-2xl font-mono font-bold tracking-wider", getStatusColor())}>
              {timeLeft.totalMs <= 0 ? (
                "সময় শেষ!"
              ) : (
                `${timeLeft.days}d ${String(timeLeft.hours).padStart(2, '0')}h ${String(timeLeft.minutes).padStart(2, '0')}m ${String(timeLeft.seconds).padStart(2, '0')}s`
              )}
            </span>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-500 font-bengali">অগ্রগতি</span>
          <span className="text-gray-600 font-bold">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", getProgressColor())}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span>সময়কাল: {project.duration_days} দিন</span>
        {project.order_id && <span className="text-blue-600">অর্ডার লিংক ✓</span>}
        {project.invoice_id && <span className="text-blue-600">ইনভয়েস লিংক ✓</span>}
      </div>

      {/* Reminders sent */}
      <div className="flex gap-2 mb-4">
        <span className={cn("px-2 py-0.5 rounded text-[10px] border", project.reminder_sent_3day ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200")}>
          ৩ দিন
        </span>
        <span className={cn("px-2 py-0.5 rounded text-[10px] border", project.reminder_sent_1day ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200")}>
          ১ দিন
        </span>
        <span className={cn("px-2 py-0.5 rounded text-[10px] border", project.reminder_sent_same_day ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200")}>
          আজ
        </span>
      </div>

      {/* Actions */}
      {!isCompleted && (
        <div className="flex flex-wrap gap-2">
          {isPaused ? (
            <Button size="sm" onClick={() => onResume(project.id)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 font-bengali text-xs shadow-none">
              <Play className="w-3 h-3 mr-1" /> চালু
            </Button>
          ) : (
            <Button size="sm" onClick={() => onPause(project.id)} variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 font-bengali text-xs">
              <Pause className="w-3 h-3 mr-1" /> বিরতি
            </Button>
          )}
          <Button size="sm" onClick={() => onComplete(project.id)} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 font-bengali text-xs shadow-none">
            <CheckCircle className="w-3 h-3 mr-1" /> সম্পন্ন
          </Button>
          <Button size="sm" onClick={() => onSendReminder(project)} className="bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200 font-bengali text-xs shadow-none">
            <Send className="w-3 h-3 mr-1" /> রিমাইন্ডার
          </Button>
          <Button size="sm" onClick={() => onEdit(project)} variant="ghost" className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-xs">
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button size="sm" onClick={() => onDelete(project.id)} variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50 text-xs">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
