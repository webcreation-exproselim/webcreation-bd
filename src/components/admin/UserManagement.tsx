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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  UserCog
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("client");
  const [assigning, setAssigning] = useState(false);
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
      // Fetch users via secure RPC function (security definer)
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_admin_users');

      if (usersError) throw usersError;
      setUsers((usersData || []) as UserProfile[]);

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Group roles by user_id
      const rolesMap: Record<string, AppRole[]> = {};
      (rolesData || []).forEach((r: UserRole) => {
        if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
        rolesMap[r.user_id].push(r.role);
      });
      setUserRoles(rolesMap);
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

    // Real-time subscription for profiles and user_roles
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

  const handleAddRole = async () => {
    if (!selectedUser) return;
    
    setAssigning(true);
    try {
      // Check if role already exists
      const existingRoles = userRoles[selectedUser.user_id] || [];
      if (existingRoles.includes(newRole)) {
        toast({
          title: "Role exists",
          description: `User already has ${newRole} role`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUser.user_id,
          role: newRole,
        });

      if (error) throw error;

      toast({
        title: "✅ Role assigned",
        description: `${newRole} role added successfully`,
      });

      setShowRoleModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    if (role === 'client') {
      toast({
        title: "Cannot remove",
        description: "Client role is default and cannot be removed",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast({
        title: "✅ Role removed",
        description: `${role} role removed successfully`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast({
        title: "Required fields",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            full_name: newUserName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile with phone if provided
        if (newUserPhone) {
          await supabase
            .from('profiles')
            .update({ phone: newUserPhone, full_name: newUserName })
            .eq('user_id', authData.user.id);
        }

        // Add role if not client (client is default)
        if (newUserRole !== 'client') {
          await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: newUserRole,
            });
        }

        toast({
          title: "✅ User created",
          description: `${newUserEmail} created with ${newUserRole} role`,
        });

        setShowAddModal(false);
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserName("");
        setNewUserPhone("");
        setNewUserRole("client");
        
        // Refresh after a delay to allow profile trigger to complete
        setTimeout(fetchUsers, 1000);
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
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

  const getRoleBadgeColor = (role: AppRole) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-slate-700/50 bg-slate-800/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              User Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchUsers}
                variant="outline"
                size="sm"
                className="border-slate-600 hover:bg-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label>Password *</Label>
                      <Input
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="John Doe"
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as AppRole)}>
                        <SelectTrigger className="bg-slate-800 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleCreateUser}
                      disabled={creating}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create User'
                      )}
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="pl-10 bg-slate-800 border-slate-600"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-xs text-slate-400">Total Users</p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-3 text-center border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">
                {Object.values(userRoles).filter(r => r.includes('admin')).length}
              </p>
              <p className="text-xs text-slate-400">Admins</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-3 text-center border border-purple-500/20">
              <p className="text-2xl font-bold text-purple-400">
                {Object.values(userRoles).filter(r => r.includes('manager')).length}
              </p>
              <p className="text-xs text-slate-400">Managers</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-3 text-center border border-blue-500/20">
              <p className="text-2xl font-bold text-blue-400">
                {Object.values(userRoles).filter(r => r.includes('staff')).length}
              </p>
              <p className="text-xs text-slate-400">Staff</p>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">User</TableHead>
                    <TableHead className="text-slate-400">Contact</TableHead>
                    <TableHead className="text-slate-400">Roles</TableHead>
                    <TableHead className="text-slate-400">Joined</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.profile_id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {user.full_name || 'No Name'}
                            </p>
                            <p className="text-xs text-slate-400">{user.user_id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.email && (
                            <div className="flex items-center gap-1 text-sm text-slate-300">
                              <Mail className="w-3 h-3 text-slate-500" />
                              {user.email}
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-1 text-sm text-slate-300">
                              <Phone className="w-3 h-3 text-slate-500" />
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
                              className={`${getRoleBadgeColor(role)} cursor-pointer text-xs flex items-center gap-1`}
                              onClick={() => role !== 'client' && handleRemoveRole(user.user_id, role)}
                            >
                              {getRoleIcon(role)}
                              {role}
                              {role !== 'client' && <span className="ml-1">×</span>}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {new Date(user.created_at).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600 hover:bg-slate-700"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Add Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  No users found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Assignment Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800 rounded-lg">
                <p className="font-medium">{selectedUser.full_name || 'No Name'}</p>
                <p className="text-sm text-slate-400">{selectedUser.email}</p>
              </div>

              <div>
                <Label>Current Roles</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(userRoles[selectedUser.user_id] || ['client']).map((role) => (
                    <Badge key={role} className={getRoleBadgeColor(role)}>
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Add New Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAddRole}
                disabled={assigning}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
              >
                {assigning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Role'
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
