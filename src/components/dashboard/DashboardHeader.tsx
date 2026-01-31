import { Database, Wifi, WifiOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PDFExport } from './PDFExport';
import type { EquipmentRecord, DataSummary } from '@/types/equipment';

interface DashboardHeaderProps {
  isConnected: boolean;
  data: EquipmentRecord[];
  summary: DataSummary | null;
  filename?: string;
}

export function DashboardHeader({ isConnected, data, summary, filename }: DashboardHeaderProps) {
  return (
    <header className="gradient-header text-white">
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Equipment Analytics</h1>
              <div className="flex items-center gap-2 text-sm text-white/70">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    <span>Connected to Django API</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
          
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PDFExport data={data} summary={summary} filename={filename} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="text-xs text-muted-foreground">
                    API URL: {import.meta.env.VITE_API_URL || 'Not configured'}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  Configure API (Coming Soon)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
