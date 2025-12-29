import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, ClipboardList, Dices, LayoutDashboard } from 'lucide-react';

// Import komponen admin
import AdminHeader from './AdminHeader';
import AdminOverview from './AdminOverview';
import AdminUserManagement from './AdminUserManagement';
import AdminPemainManagement from './AdminPemainManagement';
import AdminPenilaianManagement from './AdminPenilaianManagement';
import AdminGenerator from './AdminGenerator';

// Konfigurasi tabs
const ADMIN_TABS = [
  {
    value: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    value: 'users',
    label: 'Pengguna',
    icon: Users,
  },
  {
    value: 'pemain',
    label: 'Pemain',
    icon: UserCheck,
  },
  {
    value: 'penilaian',
    label: 'Penilaian',
    icon: ClipboardList,
  },
  {
    value: 'generator',
    label: 'Generator',
    icon: Dices,
  },
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-5 mb-8">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview">
            <AdminOverview onTabChange={setActiveTab} />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="pemain">
            <AdminPemainManagement />
          </TabsContent>

          <TabsContent value="penilaian">
            <AdminPenilaianManagement />
          </TabsContent>

          <TabsContent value="generator">
            <AdminGenerator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default AdminDashboard;
