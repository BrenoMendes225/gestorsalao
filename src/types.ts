export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  last_visit?: string;
  status: 'active' | 'inactive';
  is_vip: boolean;
}

export interface Service {
  id: number;
  name: string;
  category: string;
  duration: number;
  price: number;
  image_url?: string;
}

export interface Appointment {
  id: number;
  client_id: number;
  service_id: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  professional_name: string;
  client_name?: string;
  service_name?: string;
  price?: number;
}

export interface DashboardStats {
  revenue: number;
  appointmentsToday: number;
  totalClients: number;
}
