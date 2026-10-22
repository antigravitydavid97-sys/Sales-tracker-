import { Metadata } from 'next';
import { AdminPanel } from '@/components/admin/AdminPanel';

export const metadata: Metadata = {
  title: 'Panel de Administración | TE@M Sales Tracker',
  description: 'Panel de autenticación y control de administración para modificación de ventas y configuración.',
};

export default function AdminPage() {
  return <AdminPanel />;
}
