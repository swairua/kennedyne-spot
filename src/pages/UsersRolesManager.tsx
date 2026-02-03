import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Mail, Shield, UserCheck, Users, Crown, Edit, Trash2, Plus, Search, Check, ChevronsUpDown, UserPlus, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface UserRoleData {
  user_id: string;
  email: string;
  role: AppRole;
  created_at: string;
}

interface AuthUser {
  id: string;
  email: string;
  display_name: string | null;
}

const ROLE_OPTIONS = [
  { value: 'super_admin' as AppRole, label: 'Super Admin', description: 'Full system access' },
  { value: 'admin' as AppRole, label: 'Admin', description: 'Administrative access' },
  { value: 'editor' as AppRole, label: 'Editor', description: 'Content management' },
  { value: 'viewer' as AppRole, label: 'Viewer', description: 'Read-only access' }
];

// Error message mapping
const getErrorMessage = (error: string): string => {
  switch (error) {
    case 'user_not_found':
      return 'User with this email address was not found.';
    case 'role_already_exists':
      return 'User already has this role assigned.';
    case 'role_not_found':
      return 'User does not have this role.';
    case 'cannot_demote_self':
      return 'You cannot remove your own super admin role.';
    case 'cannot_remove_last_super_admin':
      return 'Cannot remove the last super admin. Assign the role to another user first.';
    case 'forbidden':
      return 'You do not have permission to perform this action.';
    default:
      return error || 'An unexpected error occurred.';
  }
};

export default function UsersRolesManager() {
  const { isSuperAdmin, loading: rolesLoading } = useUserRoles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [useEmailInput, setUseEmailInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<AppRole | 'all'>('all');
  const [revokeDialog, setRevokeDialog] = useState<{ user: UserRoleData; role: string } | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createDisplayName, setCreateDisplayName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<AppRole>('viewer');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user roles with TanStack Query
  const { data: userRoles = [], isLoading: rolesQueryLoading, error: rolesError } = useQuery({
    queryKey: ['userRoles'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('list_all_roles');
      if (error) throw error;
      return data as UserRoleData[];
    },
    enabled: isSuperAdmin,
  });

  // Fetch auth users for combobox
  const { data: authUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['authUsers'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('list_auth_users');
      if (error) throw error;
      return data as AuthUser[];
    },
    enabled: isSuperAdmin && isDialogOpen,
  });

  // Grant role mutation
  const grantRoleMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      const { error } = await supabase.rpc('grant_role_by_email', {
        _email: email,
        _role: role
      });
      if (error) throw error;
    },
    onSuccess: (_, { email }) => {
      toast({
        title: "Success",
        description: `Role granted successfully to ${email}`,
      });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: getErrorMessage(error.message),
        variant: "destructive",
      });
    },
  });

  // Revoke role mutation  
  const revokeRoleMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      const { error } = await supabase.rpc('revoke_role_by_email', {
        _email: email,
        _role: role
      });
      if (error) throw error;
    },
    onSuccess: (_, { email, role }) => {
      toast({
        title: "Success",
        description: `${role} role revoked from ${email}`,
      });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: getErrorMessage(error.message),
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async ({ email, display_name, password, role }: { email: string; display_name: string; password: string; role: AppRole }) => {
      console.log('Creating user:', { email, display_name, role });
      
      const { data, error } = await supabase.functions.invoke('admin_create_user', {
        body: { email, display_name, password, role }
      });
      
      console.log('Create response:', { data, error });
      
      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      if (data?.error) {
        console.error('Application error:', data.error, data.message);
        throw new Error(JSON.stringify(data));
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('User created successfully');
      toast({
        title: "User created successfully",
        description: "The user account has been created and role assigned.",
      });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      queryClient.invalidateQueries({ queryKey: ['authUsers'] });
      setCreateDialog(false);
      setCreateEmail('');
      setCreateDisplayName('');
      setCreatePassword('');
      setCreateRole('viewer');
    },
    onError: (error: any) => {
      console.error('Create user error:', error);
      
      let message = "Failed to create user";
      let errorData = error;
      
      // Parse error if it's a JSON string
      if (typeof error.message === 'string' && error.message.startsWith('{')) {
        try {
          errorData = JSON.parse(error.message);
        } catch (e) {
          console.error('Failed to parse error:', e);
        }
      }
      
      if (errorData.error === 'forbidden') {
        message = "You don't have permission to create users";
      } else if (errorData.error === 'user_already_exists') {
        message = "A user with this email already exists";
      } else if (errorData.error === 'user_creation_failed') {
        message = errorData.message || "Failed to create user account";
      } else if (errorData.error === 'role_assignment_failed') {
        message = "User created but role assignment failed";
      } else if (errorData.error === 'missing_required_fields') {
        message = "All fields are required";
      } else if (errorData.message) {
        message = errorData.message;
      } else if (error.message) {
        message = `Failed to create user: ${error.message}`;
      }
      
      toast({
        title: "Error creating user",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleGrantRole = (e: React.FormEvent) => {
    e.preventDefault();
    
    const email = selectedUser?.email || userEmail;
    if (!email || !selectedRole) {
      toast({
        title: "Error",
        description: "Please select a user and role",
        variant: "destructive",
      });
      return;
    }

    grantRoleMutation.mutate({ email, role: selectedRole });
  };

  const handleRevokeRole = (userRole: UserRoleData) => {
    setRevokeDialog({ user: userRole, role: userRole.role });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createEmail || !createDisplayName || !createPassword || !createRole) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate({ 
      email: createEmail, 
      display_name: createDisplayName, 
      password: createPassword,
      role: createRole 
    });
  };

  const confirmRevokeRole = () => {
    if (!revokeDialog) return;
    
    revokeRoleMutation.mutate({ 
      email: revokeDialog.user.email, 
      role: revokeDialog.role as AppRole
    });
    setRevokeDialog(null);
  };

  const resetForm = () => {
    setSelectedUser(null);
    setUserEmail('');
    setSelectedRole('');
    setUseEmailInput(false);
    setIsDialogOpen(false);
  };

  // Filter and search logic
  const filteredRoles = userRoles.filter(role => {
    const matchesSearch = role.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || role.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Group roles by count for summary cards
  const roleStats = ROLE_OPTIONS.map(roleOption => ({
    ...roleOption,
    count: userRoles.filter(ur => ur.role === roleOption.value).length
  }));

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'editor':
        return <Edit className="h-4 w-4" />;
      case 'viewer':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You need super admin privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users & Roles</h1>
          <p className="text-muted-foreground">Manage user access and permissions</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={createDialog} onOpenChange={setCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Create a new user account and assign them a role.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="create-email">Email Address</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="create-display-name">Display Name</Label>
                  <Input
                    id="create-display-name"
                    type="text"
                    value={createDisplayName}
                    onChange={(e) => setCreateDisplayName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="create-password">Password</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <Label htmlFor="create-role">Role</Label>
                  <Select value={createRole} onValueChange={(value) => setCreateRole(value as AppRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(role.value)}
                            <div>
                              <div>{role.label}</div>
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                  💡 The user will be created immediately with the specified role.
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCreateDialog(false)}
                    disabled={createUserMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create User
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Grant Role
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Grant Role to User</DialogTitle>
              <DialogDescription>
                Assign a role to a user by selecting from existing users or entering an email
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGrantRole} className="space-y-4">
              <div>
                <Label>User Selection</Label>
                <div className="flex items-center space-x-2 mb-2">
                  <Button
                    type="button"
                    variant={!useEmailInput ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseEmailInput(false)}
                  >
                    Select User
                  </Button>
                  <Button
                    type="button"
                    variant={useEmailInput ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseEmailInput(true)}
                  >
                    Enter Email
                  </Button>
                </div>
                
                {useEmailInput ? (
                  <Input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                ) : (
                  <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isComboboxOpen}
                        className="w-full justify-between"
                        disabled={usersLoading}
                      >
                        {selectedUser ? selectedUser.email : "Select user..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search users..." />
                        <CommandList>
                          <CommandEmpty>
                            {usersLoading ? "Loading users..." : "No users found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {authUsers.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={user.email}
                                onSelect={() => {
                                  setSelectedUser(user);
                                  setIsComboboxOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div>
                                  <div className="font-medium">{user.email}</div>
                                  {user.display_name && (
                                    <div className="text-sm text-muted-foreground">{user.display_name}</div>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(role.value)}
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-sm text-muted-foreground">{role.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={grantRoleMutation.isPending}
                >
                  {grantRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Grant Role
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Revoke Role Confirmation Dialog */}
        <AlertDialog open={!!revokeDialog} onOpenChange={() => setRevokeDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke Role</AlertDialogTitle>
              <AlertDialogDescription>
                {revokeDialog && (
                  <>
                    Are you sure you want to revoke the <strong>{revokeDialog.role}</strong> role from{' '}
                    <strong>{revokeDialog.user.email}</strong>?
                    {revokeDialog.role === 'super_admin' && (
                      <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                        Warning: This will remove super admin privileges. Ensure another super admin exists before proceeding.
                      </div>
                    )}
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRevokeRole}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={revokeRoleMutation.isPending}
              >
                {revokeRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Revoke Role
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {rolesQueryLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-8 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))
        ) : (
          roleStats.map((stat) => (
            <Card key={stat.value}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                {getRoleIcon(stat.value)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>
                Manage user roles and permissions
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-64"
                />
              </div>
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as AppRole | 'all')}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rolesQueryLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Granted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {searchTerm || roleFilter ? 'No roles match your filters' : 'No roles assigned yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((userRole, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{userRole.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleVariant(userRole.role)}>
                          <div className="flex items-center space-x-1">
                            {getRoleIcon(userRole.role)}
                            <span>{ROLE_OPTIONS.find(r => r.value === userRole.role)?.label || userRole.role}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(userRole.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeRole(userRole)}
                          className="text-destructive hover:text-destructive"
                          disabled={revokeRoleMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}