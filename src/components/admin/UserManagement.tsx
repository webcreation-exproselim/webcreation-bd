import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Search, 
  Loader2, 
  Mail, 
  Phone, 
  Shield,
  RefreshCw,
  Crown,
  Briefcase,
  UserCog,
  Ban,
  ShieldCheck,
  Trash2,
  UserX,
  Eye
} from "lucide-react";

interface UserProfile {
  profile_id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'client' | 'staff' | 'manager';
}

type AppRole = 'admin' | 'client' | 'staff' | 'manager';

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, AppRole[]>>({});
  const [blockedUsers, setBlockedUsers] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("client");
  const [assigning, setAssigning] = useState(false);
  const [blockingUser, setBlockingUser] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  // New user form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState<AppRole>("client");
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_admin_users');

      if (usersError) throw usersError;
      setUsers((usersData || []) as UserProfile[]);

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const rolesMap: Record<string, AppRole[]> = {};
      (rolesData || []).forEach((r: UserRole) => {
        if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
        rolesMap[r.user_id].push(r.role);
      });
      setUserRoles(rolesMap);

      // Fetch blocked status
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, is_blocked');
      
      const blockedMap: Record<string, boolean> = {};
      (profilesData || []).forEach((p: any) => {
        blockedMap[p.user_id] = p.is_blocked || false;
      });
      setBlockedUsers(blockedMap);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const profilesChannel = supabase
      .channel('user-mgmt-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchUsers()
      )
      .subscribe();

    const rolesChannel = supabase
      .channel('user-mgmt-roles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(rolesChannel);
    };
  }, []);

  const handleBlockToggle = async (userId: string, currentlyBlocked: boolean) => {
    setBlockingUser(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: !currentlyBlocked })
        .eq('user_id', userId);

      if (error) throw error;

      setBlockedUsers(prev => ({ ...prev, [userId]: !currentlyBlocked }));
      toast({
        title: !currentlyBlocked ? "🚫 ইউজার ব্লক করা হয়েছে" : "✅ ইউজার আনব্লক করা হয়েছে",
        description: !currentlyBlocked 
          ? "এই ইউজার আর ড্যাশবোর্ড অ্যাক্সেস করতে পারবে না" 
          : "ইউজার এখন ড্যাশবোর্ড অ্যাক্সেস করতে পারবে",
      });
    } catch (error) {
      console.error('Error toggling block:', error);
      toast({ title: "Error", description: "Failed to update user status", variant: "destructive" });
    } finally {
      setBlockingUser(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      // Delete user roles first
      await supabase.from('user_roles').delete().eq('user_id', deleteConfirm.user_id);
      // Delete profile
      await supabase.from('profiles').delete().eq('user_id', deleteConfirm.user_id);
      
      toast({
        title: "🗑️ ইউজার ডিলিট হয়েছে",
        description: `${deleteConfirm.full_name || deleteConfirm.email} সফলভাবে ডিলিট করা হয়েছে`,
      });
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleAddRole = async () => {
    if (!selectedUser) return;
    
    setAssigning(true);
    try {
      const existingRoles = userRoles[selectedUser.user_id] || [];
      if (existingRoles.includes(newRole)) {
        toast({ title: "Role exists", description: `User already has ${newRole} role`, variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: selectedUser.user_id, role: newRole });

      if (error) throw error;

      toast({ title: "✅ Role assigned", description: `${newRole} role added successfully` });
      setShowRoleModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error adding role:', error);
      toast({ title: "Error", description: "Failed to assign role", variant: "destructive" });
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    if (role === 'client') {
      toast({ title: "Cannot remove", description: "Client role is default and cannot be removed", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      toast({ title: "✅ Role removed", description: `${role} role removed successfully` });
      fetchUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast({ title: "Error", description: "Failed to remove role", variant: "destructive" });
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast({ title: "Required fields", description: "Email and password are required", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: { data: { full_name: newUserName } },
      });

      if (authError) throw authError;

      if (authData.user) {
        if (newUserPhone) {
          await supabase
            .from('profiles')
            .update({ phone: newUserPhone, full_name: newUserName })
            .eq('user_id', authData.user.id);
        }

        if (newUserRole !== 'client') {
          await supabase
            .from('user_roles')
            .insert({ user_id: authData.user.id, role: newUserRole });
        }

        toast({ title: "✅ User created", description: `${newUserEmail} created with ${newUserRole} role` });
        setShowAddModal(false);
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserName("");
        setNewUserPhone("");
        setNewUserRole("client");
        setTimeout(fetchUsers, 1000);
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({ title: "Error", description: error.message || "Failed to create user", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = search.toLowerCase();
    return (
      (user.full_name?.toLowerCase().includes(searchLower)) ||
      (user.email?.toLowerCase().includes(searchLower)) ||
      (user.phone?.includes(search))
    );
  });

  const getRoleBadgeStyle = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'manager': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'staff': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'client': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3" />;
      case 'manager': return <Briefcase className="w-3 h-3" />;
      case 'staff': return <UserCog className="w-3 h-3" />;
      default: return null;
    }
  };

  const blockedCount = Object.values(blockedUsers).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-gray-100 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg">User Management</span>
                <p className="text-xs text-gray-500 font-normal">{users.length} জন ইউজার</p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchUsers}
                variant="outline"
                size="sm"
                className="border-gray-200 hover:bg-gray-100 text-gray-600"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-600/20">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-gray-200">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900">Create New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="text-gray-700">Email *</Label>
                      <Input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="user@example.com" className="bg-gray-50 border-gray-200" />
                    </div>
                    <div>
                      <Label className="text-gray-700">Password *</Label>
                      <Input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Min 6 characters" className="bg-gray-50 border-gray-200" />
                    </div>
                    <div>
                      <Label className="text-gray-700">Full Name</Label>
                      <Input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="John Doe" className="bg-gray-50 border-gray-200" />
                    </div>
                    <div>
                      <Label className="text-gray-700">Phone</Label>
                      <Input value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} placeholder="01XXXXXXXXX" className="bg-gray-50 border-gray-200" />
                    </div>
                    <div>
                      <Label className="text-gray-700">Role</Label>
                      <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as AppRole)}>
                        <SelectTrigger className="bg-gray-50 border-gray-200"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateUser} disabled={creating} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create User'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or phone..." className="pl-10 bg-gray-50 border-gray-200" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {[
              { label: "Total Users", value: users.length, color: "from-cyan-500 to-blue-500", icon: Users },
              { label: "Admins", value: Object.values(userRoles).filter(r => r.includes('admin')).length, color: "from-red-500 to-orange-500", icon: Crown },
              { label: "Managers", value: Object.values(userRoles).filter(r => r.includes('manager')).length, color: "from-purple-500 to-violet-500", icon: Briefcase },
              { label: "Staff", value: Object.values(userRoles).filter(r => r.includes('staff')).length, color: "from-blue-500 to-indigo-500", icon: UserCog },
              { label: "Blocked", value: blockedCount, color: "from-red-600 to-red-500", icon: Ban },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 text-center shadow-lg relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -mr-3 -mt-3" />
                <stat.icon className="w-4 h-4 text-white/80 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="text-gray-500">User</TableHead>
                    <TableHead className="text-gray-500">Contact</TableHead>
                    <TableHead className="text-gray-500">Roles</TableHead>
                    <TableHead className="text-gray-500">Status</TableHead>
                    <TableHead className="text-gray-500">Joined</TableHead>
                    <TableHead className="text-gray-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => {
                    const isBlocked = blockedUsers[user.user_id] || false;
                    return (
                      <motion.tr
                        key={user.profile_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`border-gray-100 hover:bg-gray-50/50 transition-colors ${isBlocked ? 'opacity-60' : ''}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold relative ${
                              isBlocked 
                                ? 'bg-gradient-to-br from-red-600 to-red-800' 
                                : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                            }`}>
                              {isBlocked && <Ban className="w-4 h-4 absolute -top-1 -right-1 text-red-500 bg-white rounded-full p-0.5" />}
                              {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className={`font-medium ${isBlocked ? 'text-red-500 line-through' : 'text-gray-900'}`}>
                                {user.full_name || 'No Name'}
                              </p>
                              <p className="text-xs text-gray-400">{user.user_id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.email && (
                              <div className="flex items-center gap-1 text-sm text-gray-700">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="truncate max-w-[150px]">{user.email}</span>
                              </div>
                            )}
                            {user.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-700">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(userRoles[user.user_id] || ['client']).map((role) => (
                              <Badge
                                key={role}
                                className={`${getRoleBadgeStyle(role)} cursor-pointer text-xs flex items-center gap-1 border`}
                                onClick={() => role !== 'client' && handleRemoveRole(user.user_id, role)}
                              >
                                {getRoleIcon(role)}
                                {role}
                                {role !== 'client' && <span className="ml-1">×</span>}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isBlocked ? (
                            <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs">
                              <Ban className="w-3 h-3 mr-1" />
                              Blocked
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(user.created_at).toLocaleDateString('en-GB')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-200 hover:bg-gray-100 text-gray-600 h-8 px-2"
                              onClick={() => { setSelectedUser(user); setShowRoleModal(true); }}
                              title="Add Role"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-8 px-2 ${isBlocked 
                                ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50' 
                                : 'border-amber-200 text-amber-600 hover:bg-amber-50'
                              }`}
                              onClick={() => handleBlockToggle(user.user_id, isBlocked)}
                              disabled={blockingUser === user.user_id}
                              title={isBlocked ? "Unblock" : "Block"}
                            >
                              {blockingUser === user.user_id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isBlocked ? (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              ) : (
                                <Ban className="w-3.5 h-3.5" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-500 hover:bg-red-50 h-8 px-2"
                              onClick={() => setDeleteConfirm(user)}
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <UserX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  No users found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Assignment Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Assign Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="font-medium text-gray-900">{selectedUser.full_name || 'No Name'}</p>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
              <div>
                <Label className="text-gray-700">Current Roles</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(userRoles[selectedUser.user_id] || ['client']).map((role) => (
                    <Badge key={role} className={getRoleBadgeStyle(role)}>{role}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-gray-700">Add New Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddRole} disabled={assigning} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                {assigning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Assigning...</> : 'Assign Role'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali flex items-center gap-2 text-gray-900">
              <Trash2 className="w-5 h-5 text-red-500" />
              ইউজার ডিলিট করবেন?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-bengali text-gray-500">
              <span className="text-gray-900 font-medium">{deleteConfirm?.full_name || deleteConfirm?.email}</span> এর প্রোফাইল এবং সমস্ত রোল স্থায়ীভাবে ডিলিট হয়ে যাবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 font-bengali"
            >
              {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />ডিলিট হচ্ছে...</> : 'ডিলিট করুন'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
