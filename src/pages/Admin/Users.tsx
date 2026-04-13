import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Shield,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Filter,
  MoreHorizontal,
  Eye,
  Ban
} from 'lucide-react';
import { useAdminPermissions } from '@/hooks/useAdminAuth';
import { User } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AdminUsers: React.FC = () => {
  const { canManageUsers, canEditUsers, canDeleteUsers } = useAdminPermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<User['role']>('user');
  const [filter, setFilter] = useState<'all' | 'users' | 'hosts' | 'admins'>('all');

  useEffect(() => {
    if (!canManageUsers) return;
    fetchUsers();
  }, [canManageUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock data - in real implementation, this would be an API call
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'john.doe@example.com',
          displayName: 'John Doe',
          photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          phone: '+91 98765 43210',
          role: 'user',
          isVerified: true,
          createdAt: new Date('2024-01-15'),
          lastLoginAt: new Date(),
          preferences: {
            theme: 'light',
            notifications: {
              email: true,
              push: true,
              sms: false,
              newSpots: true,
              requestUpdates: true,
              promotions: false,
            },
            location: {
              enabled: true,
              coordinates: { lat: 19.0760, lng: 72.8777 },
              city: 'Mumbai',
              state: 'Maharashtra',
            },
          },
          stats: {
            watts: 1250,
            level: 5,
            requestsCompleted: 23,
            reviewsGiven: 18,
            favoritesCount: 12,
            referralCount: 3,
            joinDate: new Date('2024-01-15'),
          },
        },
        {
          id: '2',
          email: 'sarah.smith@example.com',
          displayName: 'Sarah Smith',
          photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          phone: '+91 98765 43211',
          role: 'host',
          isVerified: true,
          createdAt: new Date('2024-02-01'),
          lastLoginAt: new Date(),
          preferences: {
            theme: 'dark',
            notifications: {
              email: true,
              push: true,
              sms: true,
              newSpots: false,
              requestUpdates: true,
              promotions: true,
            },
            location: {
              enabled: true,
              coordinates: { lat: 19.0760, lng: 72.8777 },
              city: 'Mumbai',
              state: 'Maharashtra',
            },
          },
          stats: {
            watts: 3450,
            level: 8,
            requestsCompleted: 67,
            reviewsGiven: 45,
            favoritesCount: 8,
            referralCount: 7,
            joinDate: new Date('2024-02-01'),
          },
        },
        {
          id: '3',
          email: 'admin@chargenest.com',
          displayName: 'Admin User',
          photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          phone: '+91 98765 43212',
          role: 'admin',
          isVerified: true,
          createdAt: new Date('2024-01-01'),
          lastLoginAt: new Date(),
          preferences: {
            theme: 'system',
            notifications: {
              email: true,
              push: true,
              sms: true,
              newSpots: true,
              requestUpdates: true,
              promotions: true,
            },
            location: {
              enabled: false,
            },
          },
          stats: {
            watts: 10000,
            level: 15,
            requestsCompleted: 150,
            reviewsGiven: 100,
            favoritesCount: 25,
            referralCount: 20,
            joinDate: new Date('2024-01-01'),
          },
        },
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'users' && user.role === 'user') ||
      (filter === 'hosts' && user.role === 'host') ||
      (filter === 'admins' && user.role === 'admin');
    return matchesSearch && matchesFilter;
  });

  const handleDeleteUser = async () => {
    if (!selectedUser || !canDeleteUsers) return;

    try {
      // API call to delete user
      console.log('Deleting user:', selectedUser.id);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      // API call to update user role
      console.log('Updating user role:', selectedUser.id, selectedRole);
      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, role: selectedRole } : u
      ));
      setRoleDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'host':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN').format(date);
  };

  if (!canManageUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        {canEditUsers && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'users' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('users')}
              >
                Users
              </Button>
              <Button
                variant={filter === 'hosts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('hosts')}
              >
                Hosts
              </Button>
              <Button
                variant={filter === 'admins' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('admins')}
              >
                Admins
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-full h-full p-1.5 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.displayName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-sm">
                          {user.isVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(user.lastLoginAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {canEditUsers && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSelectedRole(user.role);
                                  setRoleDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {canDeleteUsers && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.displayName}? This action cannot be undone and will remove all of their data including charging spots and requests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Change Dialog */}
      <AlertDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Change the role for {selectedUser?.displayName} from {selectedUser?.role} to:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateRole}>
              Update Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
