export type ServiceCategory =
  | 'core'
  | 'education'
  | 'health'
  | 'travel'
  | 'home_services'
  | 'jobs'
  | 'admin_legal'
  | 'finance';

export type ServiceStatus =
  | 'active'          // Service is fully implemented and operational
  | 'beta'            // Service is in open testing
  | 'in_development' // Service is actively being built
  | 'planned';        // Service is scheduled on the roadmap

export interface ServicePermission {
  key: string;
  labelAr: string;
  descriptionAr: string;
  requiresVerification?: boolean;
}

export interface ModularService {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  titleFr: string;
  descriptionAr: string;
  descriptionEn: string;
  category: ServiceCategory;
  icon: string;
  status: ServiceStatus;
  badgeAr?: string;
  badgeEn?: string;
  isCore: boolean;
  requiresAuth: boolean;
  requiredPermissions?: string[];
  backendEndpoint?: string;
  targetTab?: 'home' | 'academic' | 'commerce' | 'real_estate' | 'taxi' | 'food' | 'bookings' | 'chat' | 'more_services';
  metrics?: {
    usersCount?: string;
    rating?: number;
    launchTarget?: string;
  };
  features?: string[];
}

export interface ServiceNotificationRequest {
  serviceId: string;
  serviceTitle: string;
  requestedAt: string;
  notified: boolean;
}
