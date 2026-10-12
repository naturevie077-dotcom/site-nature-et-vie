import AdminApp from '@/components/admin/AdminApp';

export const metadata = {
  title: 'Administration',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return <AdminApp />;
}
