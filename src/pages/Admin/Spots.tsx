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
  MapPin, 
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { useAdminPermissions } from '@/hooks/useAdminAuth';
import { ChargingSpot } from '@/types';
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

const AdminSpots: React.FC = () => {
  const { canManageSpots, canEditSpots, canDeleteSpots } = useAdminPermissions();
  const [spots, setSpots] = useState<ChargingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<ChargingSpot | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | ChargingSpot['status']>('all');

  useEffect(() => {
    if (!canManageSpots) return;
    fetchSpots();
  }, [canManageSpots]);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      // Mock data - in real implementation, this would be an API call
      const mockSpots: ChargingSpot[] = [
        {
          id: '1',
          hostId: '2',
          hostName: 'Sarah Smith',
          hostEmail: 'sarah.smith@example.com',
          hostPhone: '+91 98765 43211',
          name: 'Cafe Coffee Day - Bandra',
          description: 'Comfortable cafe with reliable charging. Perfect for working while your device charges.',
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
            { id: '3', name: 'Air Conditioning', icon: 'wind', available: true },
          ],
          photos: [
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
          ],
          rating: 4.8,
          reviews: [],
          totalCharges: 156,
          status: 'active',
          isVerified: true,
          isFeatured: true,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-03-25'),
        },
        {
          id: '2',
          hostId: '2',
          hostName: 'Sarah Smith',
          hostEmail: 'sarah.smith@example.com',
          hostPhone: '+91 98765 43211',
          name: 'Home Charging - Andheri',
          description: 'Residential charging spot in quiet neighborhood. Safe and reliable.',
          address: 'Gulmohar Society, Andheri East',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400069',
          coordinates: { lat: 19.1196, lng: 72.8650 },
          category: 'home',
          outletType: '16_amp',
          chargingSpeed: 'fast',
          availableHours: '6:00 PM - 10:00 PM',
          pricePerHour: 80,
          pricePerMinute: 4,
          amenities: [
            { id: '1', name: 'Covered Parking', icon: 'car', available: true },
            { id: '2', name: 'Security', icon: 'shield', available: true },
          ],
          photos: [
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
          ],
          rating: 4.9,
          reviews: [],
          totalCharges: 89,
          status: 'pending',
          isVerified: true,
          isFeatured: false,
          createdAt: new Date('2024-02-15'),
          updatedAt: new Date('2024-03-24'),
        },
        {
          id: '3',
          hostId: '3',
          hostName: 'Mike Johnson',
          hostEmail: 'mike.j@example.com',
          hostPhone: '+91 98765 43213',
          name: 'WeWork - BKC',
          description: 'Modern coworking space with multiple charging points.',
          address: 'Plot No. C-56, G Block, BKC',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400051',
          coordinates: { lat: 19.0669, lng: 72.8693 },
          category: 'coworking',
          outletType: 'type2_ev',
          chargingSpeed: 'fast',
          availableHours: '24/7',
          pricePerHour: 120,
          pricePerMinute: 6,
          amenities: [
            { id: '1', name: 'High-Speed WiFi', icon: 'wifi', available: true },
            { id: '2', name: 'Meeting Rooms', icon: 'users', available: true },
          ],
          photos: [
            'https://images.unsplash.com/photo-1497366214047-5125e2adffe3?w=800&h=600&fit=crop',
          ],
          rating: 4.7,
          reviews: [],
          totalCharges: 234,
          status: 'inactive',
          isVerified: true,
          isFeatured: true,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-03-23'),
        },
      ];
      
      setSpots(mockSpots);
    } catch (error) {
      console.error('Error fetching spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSpots = spots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || spot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteSpot = async () => {
    if (!selectedSpot || !canDeleteSpots) return;

    try {
      // API call to delete spot
      console.log('Deleting spot:', selectedSpot.id);
      setSpots(spots.filter(s => s.id !== selectedSpot.id));
      setDeleteDialogOpen(false);
      setSelectedSpot(null);
    } catch (error) {
      console.error('Error deleting spot:', error);
    }
  };

  const getStatusBadgeColor = (status: ChargingSpot['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: ChargingSpot['status']) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'inactive':
        return XCircle;
      case 'suspended':
        return XCircle;
      default:
        return MapPin;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN').format(date);
  };

  if (!canManageSpots) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to manage charging spots.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Charging Spots</h1>
          <p className="text-muted-foreground">Manage charging locations and availability</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Spot
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search spots by name, host, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spots Table */}
      <Card>
        <CardHeader>
          <CardTitle>Charging Spots ({filteredSpots.length})</CardTitle>
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
                  <TableHead>Spot</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSpots.map((spot) => (
                  <TableRow key={spot.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 overflow-hidden">
                          {spot.photos.length > 0 ? (
                            <img
                              src={spot.photos[0]}
                              alt={spot.name}
                              className="w-full h-full object-cover"
                            />
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
                      <div className="flex items-center gap-2">
                        {React.createElement(getStatusIcon(spot.status), {
                          className: `w-4 h-4 ${getStatusBadgeColor(spot.status).split(' ')[0]}`
                        })}
                        <Badge className={getStatusBadgeColor(spot.status)}>
                          {spot.status.charAt(0).toUpperCase() + spot.status.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(spot.pricePerHour)}/hr</div>
                      {spot.pricePerMinute && (
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(spot.pricePerMinute)}/min
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{spot.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({spot.reviews.length} reviews)
                        </span>
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
                          {canEditSpots && (
                            <>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Spot
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {canDeleteSpots && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedSpot(spot);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Spot
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
            <AlertDialogTitle>Delete Charging Spot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSpot?.name}"? This action cannot be undone and will remove all associated data including charging history and reviews.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSpot}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSpots;
