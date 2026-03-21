import type { ElementType } from 'react';
import {
  Shield, Navigation, Star, LayoutGrid, Tag, Layers,
  MousePointer, LayoutDashboard, Smartphone, Tablet, Monitor,
  FormInput, Table, Maximize2, PanelLeft, UserCircle, Settings,
  Bell, MessageSquare, HelpCircle, Megaphone, BarChart3,
  ShoppingBag, FileText, AlertTriangle, Rocket, PieChart,
  Mail, Users, Zap, Clock,
} from 'lucide-react';

export const CATEGORIES = [
  { value: 'auth',          label: 'Authentication',  icon: Shield },
  { value: 'navbar',        label: 'Navbars',          icon: Navigation },
  { value: 'hero',          label: 'Hero Sections',    icon: Star },
  { value: 'cards',         label: 'Cards',            icon: LayoutGrid },
  { value: 'forms',         label: 'Forms',            icon: FormInput },
  { value: 'tables',        label: 'Tables',           icon: Table },
  { value: 'modals',        label: 'Modals & Dialogs', icon: Maximize2 },
  { value: 'sidebars',      label: 'Sidebars',         icon: PanelLeft },
  { value: 'pricing',       label: 'Pricing',          icon: Tag },
  { value: 'features',      label: 'Features',         icon: Zap },
  { value: 'testimonials',  label: 'Testimonials',     icon: MessageSquare },
  { value: 'faq',           label: 'FAQ',              icon: HelpCircle },
  { value: 'cta',           label: 'Call to Action',   icon: Megaphone },
  { value: 'stats',         label: 'Stats & Metrics',  icon: BarChart3 },
  { value: 'profiles',      label: 'Profiles',         icon: UserCircle },
  { value: 'settings',      label: 'Settings',         icon: Settings },
  { value: 'notifications', label: 'Notifications',    icon: Bell },
  { value: 'ecommerce',     label: 'E-Commerce',       icon: ShoppingBag },
  { value: 'blog',          label: 'Blog',             icon: FileText },
  { value: 'contact',       label: 'Contact',          icon: Mail },
  { value: 'team',          label: 'Team',             icon: Users },
  { value: 'charts',        label: 'Charts',           icon: PieChart },
  { value: 'timeline',      label: 'Timeline',         icon: Clock },
  { value: 'error',         label: 'Error Pages',      icon: AlertTriangle },
  { value: 'onboarding',    label: 'Onboarding',       icon: Rocket },
  { value: 'footer',        label: 'Footers',          icon: Layers },
  { value: 'buttons',       label: 'Buttons & Inputs', icon: MousePointer },
  { value: 'dashboard',     label: 'Dashboards',       icon: LayoutDashboard },
] as const;

export type TabType = 'preview' | 'code';
export type Resolution = 'mobile' | 'tablet' | 'desktop';

export interface Message { role: 'user' | 'assistant'; content: string; }

export const RESOLUTIONS: { value: Resolution; icon: ElementType; label: string; width: string }[] = [
  { value: 'mobile',  icon: Smartphone, label: 'Mobile',  width: '375px' },
  { value: 'tablet',  icon: Tablet,     label: 'Tablet',  width: '768px' },
  { value: 'desktop', icon: Monitor,    label: 'Desktop', width: '100%'  },
];