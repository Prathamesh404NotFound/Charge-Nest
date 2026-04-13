import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  MapPin, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useAdminPermissions } from '@/hooks/useAdminAuth';
import { apiService } from '@/services/api';

interface DashboardStats {
  totalUsers: number;
  totalSpots: number;
  totalRequests: number;
  totalRevenue: number;
  activeUsers: number;
  pendingRequests: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentActivity: Array<{
    id: string;
    type: 'user' | 'spot' | 'request';
    action: string;
    timestamp: string;
    user: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { canViewAnalytics } = useAdminPermissions();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSpots: 0,
    totalRequests: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingRequests: 0,
    systemHealth: 'healthy',
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canViewAnalytics) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real implementation, these would be API calls
        const mockStats: DashboardStats = {
          totalUsers: 1247,
          totalSpots: 342,
          totalRequests: 2847,
          totalRevenue: 142350,
          activeUsers: 892,
          pendingRequests: 47,
          systemHealth: 'healthy',
          recentActivity: [
            {
              id: '1',
              type: 'user',
              action: 'New user registration',
              timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
              user: 'John Doe'
            },
            {
              id: '2',
              type: 'spot',
              action: 'New charging spot added',
              timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
              user: 'Sarah Smith'
            },
            {
              id: '3',
              type: 'request',
              action: 'Charging request completed',
              timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              user: 'Mike Johnson'
            },
            {
              id: '4',
              type: 'user',
              action: 'User role updated to host',
              timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
              user: 'Emma Wilson'
            },
            {
              id: '5',
              type: 'request',
              action: 'New charging request',
              timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              user: 'Alex Chen'
            }
          ]
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [canViewAnalytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getHealthStatusColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthStatusIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return Users;
      case 'spot':
        return MapPin;
      case 'request':
        return Zap;
      default:
        return Activity;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  if (!canViewAnalytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  <span className="text-green-500">+12% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Charging Spots</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSpots.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  <span className="text-green-500">+8% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  <span className="text-green-500">+23% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  <span className="text-green-500">+15% from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Currently online</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{stats.pendingRequests}</div>
                <div className="text-xs text-muted-foreground">Awaiting approval</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                {React.createElement(getHealthStatusIcon(stats.systemHealth), {
                  className: `h-4 w-4 ${getHealthStatusColor(stats.systemHealth).split(' ')[0]}`
                })}
              </CardHeader>
              <CardContent>
                <Badge className={getHealthStatusColor(stats.systemHealth)}>
                  {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
                </Badge>
                <div className="text-xs text-muted-foreground mt-2">All systems operational</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {React.createElement(getActivityIcon(activity.type), {
                        className: "w-4 h-4 text-primary"
                      })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{activity.action}</div>
                      <div className="text-xs text-muted-foreground">
                        by {activity.user} • {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
