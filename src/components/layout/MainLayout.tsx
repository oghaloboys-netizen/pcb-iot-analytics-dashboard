import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useMetricsContext } from '@/contexts/MetricsContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { metrics } = useMetricsContext();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <aside className="hidden md:block border-r">
          <Sidebar />
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <ChatWindow metricsContext={metrics} />
    </div>
  );
}
