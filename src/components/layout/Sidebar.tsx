'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  MapPin,
  Package,
  Route,
  FileText,
  Brain,
  Plane,
  GitBranch,
  Monitor,
  PlayCircle,
  Workflow,
  Search,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '仪表盘', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: '用户管理', href: '/admin/users', icon: Users },
  { name: '联系消息', href: '/admin/messages', icon: MessageSquare },
  { name: '准备度Pack', href: '/admin/readiness', icon: Package },
  { name: '地点管理', href: '/admin/places', icon: MapPin },
  { name: '路线方向', href: '/admin/route-directions', icon: Route },
  { name: 'Context管理', href: '/admin/context', icon: FileText },
  { name: 'RL Training', href: '/admin/training', icon: Brain },
  { name: '行程管理', href: '/admin/trips', icon: Plane },
  { name: '决策日志', href: '/admin/decision', icon: GitBranch },
  { name: 'Agent运行', href: '/admin/agent-runs', icon: PlayCircle },
  { name: '规划工作台', href: '/admin/planning-workbench', icon: Workflow },
  { name: '系统监控', href: '/admin/system', icon: Monitor },
  { name: 'RAG管理', href: '/admin/rag', icon: Search },
  { name: 'LLM管理', href: '/admin/llm', icon: Cpu },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">TripNara 管理后台</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
