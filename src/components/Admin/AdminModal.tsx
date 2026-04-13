import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MapPin, 
  Zap, 
  BarChart3, 
  Settings, 
  X,
  Shield,
  Activity,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAdminPermissions } from '@/hooks/useAdminAuth';
import { User, ChargingSpot, ChargingRequest } from '@/types';
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
import { Input } from '@/components/ui/input';

interface AdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ open, onOpenChange }) => {
  const { canViewAdminDashboard, canManageUsers, canManageSpots, canManageRequests } = useAdminPermissions();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [spots, setSpots] = useState<ChargingSpot[]>([]);
  const [requests, setRequests] = useState<ChargingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Mock data - in real implementation, this would be API calls
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
        notifications: { email: true, push: true, sms: false, newSpots: true, requestUpdates: true, promotions: false },
        location: { enabled: true, coordinates: { lat: 19.0760, lng: 72.8777 }, city: 'Mumbai', state: 'Maharashtra' },
      },
      stats: { watts: 1250, level: 5, requestsCompleted: 23, reviewsGiven: 18, favoritesCount: 12, referralCount: 3, joinDate: new Date('2024-01-15') },
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
        notifications: { email: true, push: true, sms: true, newSpots: false, requestUpdates: true, promotions: true },
        location: { enabled: true, coordinates: { lat: 19.0760, lng: 72.8777 }, city: 'Mumbai', state: 'Maharashtra' },
      },
      stats: { watts: 3450, level: 8, requestsCompleted: 67, reviewsGiven: 45, favoritesCount: 8, referralCount: 7, joinDate: new Date('2024-02-01') },
    },
  ];

  const mockSpots: ChargingSpot[] = [
    {
      id: '1',
      hostId: '2',
      hostName: 'Sarah Smith',
      hostEmail: 'sarah.smith@example.com',
      hostPhone: '+91 98765 43211',
      name: 'Cafe Coffee Day - Bandra',
      description: 'Comfortable cafe with reliable charging.',
      address: 'Linking Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      coordinates: { lat: 19.0596, lng: 72.8295 },
      category: 'cafe',
      outletType: 'standard_3pin',
      chargingSpeed: 'slow',
      availableHours: '8:00 AM - 11:00 PM',
      pricePerHour: 50,
      pricePerMinute: 2,
      amenities: [
        { id: '1', name: 'WiFi', icon: 'wifi', available: true },
        { id: '2', name: 'Coffee', icon: 'coffee', available: true },
      ],
      photos: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop'],
      rating: 4.8,
      reviews: [],
      totalCharges: 156,
      status: 'active',
      isVerified: true,
      isFeatured: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-25'),
    },
  ];

  const mockRequests: ChargingRequest[] = [
    {
      id: '1',
      spotId: '1',
      userId: '1',
      userName: 'John Doe',
      userPhone: '+91 98765 43210',
      userEmail: 'john.doe@example.com',
      requestedAt: new Date('2024-03-25T10:30:00'),
      requestedTime: new Date('2024-03-26T14:00:00'),
      duration: 60,
      status: 'pending',
      message: 'Need to charge my laptop for an important meeting.',
    },
  ];

  React.useEffect(() => {
    if (open) {
      setUsers(mockUsers);
      setSpots(mockSpots);
      setRequests(mockRequests);
    }
  }, [open]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN').format(date);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'host': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const DashboardContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Charging Spots</p>
              <p className="text-2xl font-bold">{spots.length}</p>
            </div>
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold">{requests.length}</p>
            </div>
            <Zap className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">System Health</p>
              <p className="text-2xl font-bold text-green-600">Healthy</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const UsersContent = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.filter(user => 
            user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Users className="w-full h-full p-1.5 text-primary" />
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
                  <span className="text-sm">{user.isVerified ? 'Verified' : 'Not Verified'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{formatDate(user.createdAt)}</div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        setSelectedItem(user);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const SpotsContent = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search spots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Spot</TableHead>
            <TableHead>Host</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spots.filter(spot => 
            spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            spot.hostName.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((spot) => (
            <TableRow key={spot.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 overflow-hidden">
                    {spot.photos.length > 0 ? (
                      <img src={spot.photos[0]} alt={spot.name} className="w-full h-full object-cover" />
                    ) : (
                      <MapPin className="w-full h-full p-3 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{spot.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {spot.address}, {spot.city}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{spot.hostName}</div>
                  <div className="text-sm text-muted-foreground">{spot.hostEmail}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(spot.status)}>
                  {spot.status.charAt(0).toUpperCase() + spot.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-medium">{formatCurrency(spot.pricePerHour)}/hr</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">{'\u2605'}</span>
                  <span className="font-medium">{spot.rating.toFixed(1)}</span>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Spot
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        setSelectedItem(spot);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Spot
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const RequestsContent = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.filter(request => 
            request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{request.userName}</div>
                  <div className="text-sm text-muted-foreground">{request.userEmail}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{request.duration} minutes</span>
                  </div>
                  {request.message && (
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {request.message}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {new Intl.DateTimeFormat('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  }).format(request.requestedTime)}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(request.status)}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {request.status === 'pending' && (
                      <>
                        <DropdownMenuItem>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (!canViewAdminDashboard) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Panel
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="spots" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Spots
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Requests
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <TabsContent value="dashboard" className="mt-0">
                <DashboardContent />
              </TabsContent>
              <TabsContent value="users" className="mt-0">
                {canManageUsers ? <UsersContent /> : <div>Access Denied</div>}
              </TabsContent>
              <TabsContent value="spots" className="mt-0">
                {canManageSpots ? <SpotsContent /> : <div>Access Denied</div>}
              </TabsContent>
              <TabsContent value="requests" className="mt-0">
                {canManageRequests ? <RequestsContent /> : <div>Access Denied</div>}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                console.log('Deleting item:', selectedItem);
                setDeleteDialogOpen(false);
                setSelectedItem(null);
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminModal;
