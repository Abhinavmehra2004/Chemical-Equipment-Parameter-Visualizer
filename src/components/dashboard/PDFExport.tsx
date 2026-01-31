import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface PDFExportProps {
  data: any[]; 
  summary: any | null;
  filename?: string;
}

export function PDFExport({ data, summary, filename = 'equipment_report' }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = async () => {
    setIsGenerating(true);

    try {
      // 1. Get the auth token
      const token = localStorage.getItem('access') || localStorage.getItem('token'); 

      if (!token) {
        toast.error('You must be logged in to download reports');
        setIsGenerating(false);
        return;
      }

      // 2. Fetch the PDF from the Backend
      const response = await fetch('http://localhost:8000/api/export/pdf/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No dataset available to export');
        }
        throw new Error('Failed to export PDF');
      }

      // 3. Convert response to a Blob
      const blob = await response.blob();
      
      // 4. Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `${filename}_${dateStr}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      // 5. Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF report exported successfully!');

    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={downloadPDF} 
      disabled={isGenerating}
      variant="outline"
      className="gap-2 text-blue-500 border-blue-200 hover:bg-blue-50"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      {isGenerating ? 'Exporting...' : 'Export PDF'}
    </Button>
  );
}