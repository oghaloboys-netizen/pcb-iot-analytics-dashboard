import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Cpu, Network, Radio, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'PCB Analytics',
    href: '/pcb',
    icon: Cpu,
  },
  {
    title: 'IoT Edge',
    href: '/iot-edge',
    icon: Network,
  },
  {
    title: 'ESP32 Devices',
    href: '/esp32-devices',
    icon: Radio,
  },
  {
    title: 'Real Devices',
    href: '/real-devices',
    icon: Plug,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

  return (
    <div className={cn('pb-12 w-64', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Analytics
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      isActive && 'bg-secondary'
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
