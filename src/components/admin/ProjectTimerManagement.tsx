import { useState, useEffect } from "react";
import { Plus, Timer, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProjectTimerCard } from "./ProjectTimerCard";
import { CreateProjectModal } from "./CreateProjectModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
}

interface ProjectTimerManagementProps {
  orders: Order[];
  invoices: Invoice[];
}

export function ProjectTimerManagement({ orders, invoices }: ProjectTimerManagementProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjects(data as unknown as Project[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel("admin-projects-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => fetchProjects()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCreate = async (form: any) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + form.duration_days * 24 * 60 * 60 * 1000);

    const insertData: any = {
      title: form.title,
      description: form.description || null,
      client_name: form.client_name,
      client_phone: form.client_phone || null,
      order_id: form.order_id || null,
      invoice_id: form.invoice_id || null,
      duration_days: form.duration_days,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: "active",
      created_by: userData.user.id,
    };

    const { error } = await supabase.from("projects" as any).insert(insertData);

    if (!error) {
      toast({ title: "প্রজেক্ট তৈরি হয়েছে ✓" });
      setIsModalOpen(false);
      fetchProjects();
    } else {
      toast({ title: "সমস্যা হয়েছে", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdate = async (form: any) => {
    if (!editingProject) return;

    const updateData: any = {
      title: form.title,
      description: form.description || null,
      client_name: form.client_name,
      client_phone: form.client_phone || null,
      order_id: form.order_id || null,
      invoice_id: form.invoice_id || null,
      duration_days: form.duration_days,
    };

    const { error } = await supabase
      .from("projects" as any)
      .update(updateData)
      .eq("id", editingProject.id);

    if (!error) {
      toast({ title: "প্রজেক্ট আপডেট হয়েছে ✓" });
      setEditingProject(null);
      setIsModalOpen(false);
      fetchProjects();
    } else {
      toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  const handlePause = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    const remainingMs = new Date(project.end_date).getTime() - Date.now();

    const { error } = await supabase
      .from("projects" as any)
      .update({
        status: "paused",
        paused_at: new Date().toISOString(),
        remaining_duration_ms: Math.max(0, remainingMs),
      } as any)
      .eq("id", id);

    if (!error) {
      toast({ title: "টাইমার পজ হয়েছে" });
      fetchProjects();
    }
  };

  const handleResume = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project || !project.remaining_duration_ms) return;

    const newEndDate = new Date(Date.now() + project.remaining_duration_ms);

    const { error } = await supabase
      .from("projects" as any)
      .update({
        status: "active",
        end_date: newEndDate.toISOString(),
        paused_at: null,
        remaining_duration_ms: null,
      } as any)
      .eq("id", id);

    if (!error) {
      toast({ title: "টাইমার চালু হয়েছে" });
      fetchProjects();
    }
  };

  const handleComplete = async (id: string) => {
    const { error } = await supabase
      .from("projects" as any)
      .update({ status: "completed" } as any)
      .eq("id", id);

    if (!error) {
      toast({ title: "প্রজেক্ট সম্পন্ন ✓" });
      fetchProjects();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("projects" as any)
      .delete()
      .eq("id", id);

    if (!error) {
      toast({ title: "প্রজেক্ট ডিলিট হয়েছে" });
      setDeleteConfirm(null);
      fetchProjects();
    }
  };

  const handleSendReminder = (project: Project) => {
    if (!project.client_phone) {
      toast({ title: "ক্লায়েন্টের ফোন নম্বর নেই", variant: "destructive" });
      return;
    }
    const phone = project.client_phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `[Web Creation BD]\n\nপ্রিয় ${project.client_name},\n\nআপনার "${project.title}" প্রজেক্টের ডেডলাইন আসছে।\nশেষ তারিখ: ${new Date(project.end_date).toLocaleDateString("bn-BD")}\n\nধন্যবাদ,\nWeb Creation BD`
    );
    window.open(`https://wa.me/88${phone}?text=${message}`, "_blank");
  };

  const filteredProjects = statusFilter === "all"
    ? projects
    : projects.filter(p => p.status === statusFilter);

  const activeCount = projects.filter(p => p.status === "active").length;
  const overdueCount = projects.filter(p => p.status === "active" && new Date(p.end_date).getTime() < Date.now()).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-bengali flex items-center gap-2">
            <Timer className="w-6 h-6 text-cyan-400" />
            প্রজেক্ট টাইমার
          </h2>
          <p className="text-sm text-slate-400 font-bengali mt-1">
            {activeCount} সক্রিয় • {overdueCount} ওভারডিউ • {projects.length} মোট
          </p>
        </div>
        <Button
          onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bengali shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          নতুন প্রজেক্ট
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: "all", label: "সব" },
          { key: "active", label: "সক্রিয়" },
          { key: "paused", label: "বিরতি" },
          { key: "completed", label: "সম্পন্ন" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bengali whitespace-nowrap transition-all ${
              statusFilter === f.key
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Project Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-16 text-center">
          <Timer className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-bengali">কোনো প্রজেক্ট নেই</p>
          <Button
            onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
            variant="outline"
            className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-700 font-bengali"
          >
            <Plus className="w-4 h-4 mr-2" />
            প্রথম প্রজেক্ট তৈরি করুন
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <ProjectTimerCard
              key={project.id}
              project={project}
              onPause={handlePause}
              onResume={handleResume}
              onComplete={handleComplete}
              onEdit={(p) => { setEditingProject(p); setIsModalOpen(true); }}
              onDelete={(id) => setDeleteConfirm(id)}
              onSendReminder={handleSendReminder}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreateProjectModal
        open={isModalOpen}
        onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingProject(null); }}
        onSave={editingProject ? handleUpdate : handleCreate}
        orders={orders}
        invoices={invoices}
        editingProject={editingProject}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali text-white">প্রজেক্ট ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription className="font-bengali text-slate-400">
              এই প্রজেক্ট এবং এর টাইমার স্থায়ীভাবে ডিলিট হয়ে যাবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bengali bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700 font-bengali"
            >
              ডিলিট করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
