import { useState, useCallback, useEffect } from 'react';
import Papa from 'papaparse'; // Import PapaParse for client-side parsing after upload
import {
  DashboardHeader,
  CSVUploader,
  StatsCards,
  ChartsGrid,
  DataTable,
  HistoryPanel,
} from '@/components/dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Table, Upload } from 'lucide-react';
import type { EquipmentRecord, DataSummary, UploadHistory } from '@/types/equipment';
import { calculateSummary, generateMockRecords, generateMockHistory } from '@/services/mockData';
import { useMockMode, uploadCSV, fetchDataSummary, fetchDatasetRecords, fetchUploadHistory } from '@/services/api'; // Import API functions
import { useToast } from '@/hooks/use-toast'; // Import useToast for notifications

const Index = () => {
  const [data, setData] = useState<EquipmentRecord[]>([]);
  const [summary, setSummary] = useState<DataSummary | null>(null);
  const [history, setHistory] = useState<UploadHistory[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | undefined>();
  const [currentFilename, setCurrentFilename] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('charts');
  const { toast } = useToast();

  const isMockMode = useMockMode();

  // Load initial demo data
  useEffect(() => {
    if (isMockMode) {
      const mockHistory = generateMockHistory();
      setHistory(mockHistory);
      
      // Load the first history item as initial data
      if (mockHistory.length > 0) {
        const initialRecords = generateMockRecords(mockHistory[0].record_count);
        setData(initialRecords);
        setSummary(mockHistory[0].summary);
        setSelectedDatasetId(mockHistory[0].id);
        setCurrentFilename(mockHistory[0].filename);
      }
    } else {
      // In non-mock mode, fetch real history and latest summary
      const fetchInitialData = async () => {
        try {
          const fetchedHistory = await fetchUploadHistory(); // Assuming fetchUploadHistory is also in api.ts
          setHistory(fetchedHistory);
          if (fetchedHistory.length > 0) {
            const latestHistoryItem = fetchedHistory[0];
            const fetchedSummary = await fetchDataSummary(latestHistoryItem.id);
            const fetchedRecords = await fetchDatasetRecords(latestHistoryItem.id);
            setData(fetchedRecords);
            setSummary(fetchedSummary);
            setSelectedDatasetId(latestHistoryItem.id);
            setCurrentFilename(latestHistoryItem.filename);
          }
        } catch (error) {
          toast({
            title: 'Error fetching initial data',
            description: error instanceof Error ? error.message : 'An unknown error occurred',
            variant: 'destructive',
          });
        }
      };
      fetchInitialData();
    }
  }, [isMockMode]);

  const handleDataLoaded = useCallback(async (file: File, filename: string) => { // Changed signature
    setIsLoading(true);

    if (isMockMode) {
      // Existing mock data logic
      setTimeout(() => {
        Papa.parse(file, { // Client-side parsing for mock mode
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const records = results.data as EquipmentRecord[];
            setData(records);
            const newSummary = calculateSummary(records);
            setSummary(newSummary);
            setCurrentFilename(filename);
            
            const newHistoryItem: UploadHistory = {
              id: `upload-${Date.now()}`,
              filename,
              uploaded_at: new Date().toISOString(),
              record_count: records.length,
              summary: newSummary,
            };
            
            setHistory(prev => [newHistoryItem, ...prev.slice(0, 4)]);
            setSelectedDatasetId(newHistoryItem.id);
            setIsLoading(false);
            setActiveTab('charts');
          },
          error: (err) => {
            toast({
              title: 'Error parsing CSV (Mock Mode)',
              description: err.message,
              variant: 'destructive',
            });
            setIsLoading(false);
          },
        });
      }, 500);
    } else {
      // API call for real backend
      try {
        const uploadResponse = await uploadCSV(file); // Call API
        const newSummary = uploadResponse.summary;
        const newDatasetId = uploadResponse.id;

        // After successful upload, fetch the records for DataTable display
        const records = await fetchDatasetRecords(newDatasetId);
        
        setData(records);
        setSummary(newSummary);
        setCurrentFilename(filename);

        // Update history (fetch again or add from response if API supports)
        const fetchedHistory = await fetchUploadHistory();
        setHistory(fetchedHistory);
        
        setSelectedDatasetId(newDatasetId);
        setActiveTab('charts');
        toast({
          title: 'Upload Successful',
          description: `${filename} processed by backend.`,
        });
      } catch (error) {
        toast({
          title: 'Upload Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [isMockMode, toast]);

  const handleSelectDataset = useCallback(async (id: string) => { // Made async
    const historyItem = history.find(h => h.id === id);
    if (historyItem) {
      if (isMockMode) {
        const records = generateMockRecords(historyItem.record_count);
        setData(records);
        setSummary(calculateSummary(records));
      } else {
        // Fetch real data from API
        try {
          const fetchedSummary = await fetchDataSummary(id);
          const fetchedRecords = await fetchDatasetRecords(id);
          setData(fetchedRecords);
          setSummary(fetchedSummary);
        } catch (error) {
          toast({
            title: 'Error fetching dataset',
            description: error instanceof Error ? error.message : 'An unknown error occurred',
            variant: 'destructive',
          });
        }
      }
      setSelectedDatasetId(id);
      setCurrentFilename(historyItem.filename);
    }
  }, [history, isMockMode, toast]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        isConnected={!isMockMode} 
        data={data} 
        summary={summary}
        filename={currentFilename ? currentFilename.replace('.csv', '') : ''}
      />

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* CSV Upload Section */}
            <section>
              <CSVUploader onDataLoaded={handleDataLoaded} isLoading={isLoading} />
            </section>

            {/* Stats Cards */}
            <section className="animate-fade-in">
              <StatsCards summary={summary} />
            </section>

            {/* Tabs for Charts and Table */}
            <section>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="charts" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Charts
                  </TabsTrigger>
                  <TabsTrigger value="table" className="gap-2">
                    <Table className="w-4 h-4" />
                    Data Table
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="charts" className="animate-fade-in">
                  <ChartsGrid summary={summary} />
                </TabsContent>

                <TabsContent value="table" className="animate-fade-in">
                  <DataTable data={data} />
                </TabsContent>
              </Tabs>
            </section>
          </div>

          {/* Sidebar - History Panel */}
          <aside className="space-y-6">
            <HistoryPanel 
              history={history} 
              onSelectDataset={handleSelectDataset}
              selectedId={selectedDatasetId}
            />

          </aside>
        </div>
      </main>
    </div>
  );
};

export default Index;
