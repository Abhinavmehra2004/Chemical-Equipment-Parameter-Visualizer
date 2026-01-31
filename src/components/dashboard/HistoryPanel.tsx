import { useState } from 'react';
import { History, FileText, Calendar, BarChart3, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UploadHistory } from '@/types/equipment';

interface HistoryPanelProps {
  history: UploadHistory[];
  onSelectDataset: (id: string) => void;
  selectedId?: string;
}

export function HistoryPanel({ history, onSelectDataset, selectedId }: HistoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (history.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Upload History</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          No upload history yet. Upload a CSV file to get started.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div 
        className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Upload History</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Last {history.length}
          </span>
        </div>
        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </div>

      {isExpanded && (
        <ScrollArea className="max-h-80">
          <div className="divide-y">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectDataset(item.id)}
                className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                  selectedId === item.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-sm truncate">{item.filename}</span>
                  </div>
                  {selectedId === item.id && (
                    <span className="text-xs text-primary font-medium flex-shrink-0">Active</span>
                  )}

                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.uploaded_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    <span>{item.record_count} records</span>
                  </div>
                </div>

                {item.summary && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(item.summary.equipment_type_distribution)
                      .slice(0, 3)
                      .map(([type, count]) => (
                        <span 
                          key={type} 
                          className="text-xs bg-muted px-2 py-0.5 rounded"
                        >
                          {type}: {count}
                        </span>
                      ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
