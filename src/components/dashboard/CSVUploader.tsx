import { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { EquipmentRecord } from '@/types/equipment';

interface CSVUploaderProps {
  onDataLoaded: (file: File, filename: string) => void;
  isLoading?: boolean;
}

export function CSVUploader({ onDataLoaded, isLoading }: CSVUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setError(null);
    setFileName(file.name);

    // Instead of parsing here, we pass the file directly
    onDataLoaded(file, file.name);
  }, [onDataLoaded]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  return (
    <Card
      className={`relative border-2 border-dashed transition-all duration-200 ${
        dragActive
          ? 'border-primary bg-primary/5 shadow-glow'
          : 'border-border hover:border-primary/50'
      } ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
          fileName && !error ? 'bg-success/10' : 'bg-primary/10'
        }`}>
          {fileName && !error ? (
            <CheckCircle2 className="w-8 h-8 text-success" />
          ) : (
            <Upload className={`w-8 h-8 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2">
          {fileName && !error ? 'File Ready' : 'Upload Equipment Data'}
        </h3>

        {fileName && !error ? (
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="font-mono text-sm">{fileName}</span>
          </div>
        ) : (
          <p className="text-muted-foreground mb-4 max-w-sm">
            Drag and drop your CSV file here, or click to browse. 
            Supports equipment data with columns like type, status, cost, etc.
          </p>
        )}

        {error && (
          <div className="flex items-center gap-2 text-destructive mb-4 bg-destructive/10 px-4 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant={fileName && !error ? 'outline' : 'default'}
            className="relative"
            disabled={isLoading}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {fileName && !error ? 'Choose Different File' : 'Select CSV File'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Maximum file size: 10MB • Supported format: CSV
        </p>
      </div>
    </Card>
  );
}
