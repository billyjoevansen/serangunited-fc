import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  ClipboardList,
  TrendingUp,
  CheckCircle,
  Clock,
  Dices,
} from 'lucide-react';
import { formatDateTime } from '@/utils/formatters';

const AdminOverview = ({ onTabChange }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPemain: 0,
    totalPenilaian: 0,
    pemainLolos: 0,
    pemainTidakLolos: 0,
    pemainBelumDinilai: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch pemain dengan nilai
      const { data: pemainData } = await supabase.from('pemain_dengan_nilai').select('*');

      // Fetch penilaian count
      const { count: penilaianCount } = await supabase
        .from('penilaian')
        .select('*', { count: 'exact', head: true });

      // Calculate stats
      const lolos = pemainData?.filter((p) => p.status_kelayakan === 'LOLOS').length || 0;
      const tidakLolos =
        pemainData?.filter((p) => p.status_kelayakan === 'TIDAK LOLOS').length || 0;
      const belumDinilai =
        pemainData?.filter((p) => p.status_kelayakan === 'BELUM DINILAI').length || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalPemain: pemainData?.length || 0,
        totalPenilaian: penilaianCount || 0,
        pemainLolos: lolos,
        pemainTidakLolos: tidakLolos,
        pemainBelumDinilai: belumDinilai,
      });

      // Fetch recent activities
      const { data: recentPemain } = await supabase
        .from('pemain')
        .select('id, nama, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: recentPenilaian } = await supabase
        .from('penilaian')
        .select('id, penilai_nama, created_at, pemain: pemain_id(nama)')
        .order('created_at', { ascending: false })
        .limit(3);

      const activities = [
        ...(recentPemain?.map((p) => ({
          type: 'pemain',
          message: `Pemain "${p.nama}" didaftarkan`,
          time: p.created_at,
          icon: UserCheck,
        })) || []),
        ...(recentPenilaian?.map((p) => ({
          type: 'penilaian',
          message: `Penilaian oleh ${p.penilai_nama} untuk "${p.pemain?.nama}"`,
          time: p.created_at,
          icon: ClipboardList,
        })) || []),
      ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5);

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Pengguna',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      label: 'Total Pemain',
      value: stats.totalPemain,
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      label: 'Total Penilaian',
      value: stats.totalPenilaian,
      icon: ClipboardList,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
    {
      label: 'Lolos Seleksi',
      value: stats.pemainLolos,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{loading ? '-' : stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Pemain & Recent Activities */}
      <div className="grid lg:grid-cols-2 gap-6">
        <StatusPemainCard stats={stats} loading={loading} />
        <RecentActivitiesCard activities={recentActivities} loading={loading} />
      </div>

      {/* Quick Actions */}
      <QuickActionsCard onTabChange={onTabChange} />
    </div>
  );
};

// Sub-component:  Status Pemain
const StatusPemainCard = ({ stats, loading }) => {
  const getPercentage = (value) => {
    if (stats.totalPemain === 0) return 0;
    return Math.round((value / stats.totalPemain) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Status Pemain</CardTitle>
        <CardDescription>Distribusi status seleksi pemain</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <StatusRow
            label="Lolos Seleksi"
            value={stats.pemainLolos}
            percentage={getPercentage(stats.pemainLolos)}
            color="green"
            loading={loading}
          />
          <StatusRow
            label="Tidak Lolos"
            value={stats.pemainTidakLolos}
            percentage={getPercentage(stats.pemainTidakLolos)}
            color="red"
            loading={loading}
          />
          <StatusRow
            label="Belum Dinilai"
            value={stats.pemainBelumDinilai}
            percentage={getPercentage(stats.pemainBelumDinilai)}
            color="gray"
            loading={loading}
          />

          {/* Progress Bar Visual */}
          <div className="h-4 bg-muted rounded-full overflow-hidden flex mt-4">
            {stats.totalPemain > 0 && (
              <>
                <div
                  className="bg-green-500 h-full transition-all"
                  style={{ width: `${getPercentage(stats.pemainLolos)}%` }}
                />
                <div
                  className="bg-red-500 h-full transition-all"
                  style={{ width: `${getPercentage(stats.pemainTidakLolos)}%` }}
                />
                <div
                  className="bg-gray-400 h-full transition-all"
                  style={{ width: `${getPercentage(stats.pemainBelumDinilai)}%` }}
                />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Sub-component: Status Row
const StatusRow = ({ label, value, percentage, color, loading }) => {
  const colorClasses = {
    green: 'bg-green-500 text-green-600',
    red: 'bg-red-500 text-red-600',
    gray: 'bg-gray-400 text-gray-600',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${colorClasses[color].split(' ')[0]}`} />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-bold ${colorClasses[color].split(' ')[1]}`}>
          {loading ? '-' : value}
        </span>
        <Badge variant="outline" className={colorClasses[color].split(' ')[1]}>
          {loading ? '-' : `${percentage}%`}
        </Badge>
      </div>
    </div>
  );
};

// Sub-component: Recent Activities
const RecentActivitiesCard = ({ activities, loading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
        <CardDescription>Log aktivitas sistem</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
            <p>Memuat... </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Belum ada aktivitas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div
                    className={`p-2 rounded-lg ${
                      activity.type === 'pemain'
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'bg-green-100 dark:bg-green-900'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        activity.type === 'pemain' ? 'text-blue-600' : 'text-green-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(activity.time)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Sub-component:  Quick Actions
const QuickActionsCard = ({ onTabChange }) => {
  const actions = [
    {
      label: 'Tambah Pemain',
      description: 'Daftarkan pemain baru',
      icon: UserCheck,
      href: '/dashboard/tambah-pemain',
    },
    {
      label: 'Kelola Pengguna',
      description: 'Manage user & role',
      icon: Users,
      tab: 'users',
    },
    {
      label: 'Generator Dummy',
      description: 'Generate data testing',
      icon: Dices,
      tab: 'generator',
    },
    {
      label: 'Hasil Seleksi',
      description: 'Lihat peringkat',
      icon: TrendingUp,
      href: '/dashboard/hasil-seleksi',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Aksi Cepat</CardTitle>
        <CardDescription>Navigasi cepat ke fitur admin</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;

            if (action.href) {
              return (
                <Button
                  key={index}
                  className="w-full justify-start h-auto py-4"
                  variant="outline"
                  asChild
                >
                  <Link to={action.href}>
                    <Icon className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                </Button>
              );
            }

            return (
              <Button
                key={index}
                className="w-full justify-start h-auto py-4"
                variant="outline"
                onClick={() => onTabChange?.(action.tab)}
              >
                <Icon className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminOverview;
