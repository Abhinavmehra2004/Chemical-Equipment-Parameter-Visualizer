import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { EquipmentRecord } from '@/types/equipment';

interface DataTableProps {
  data: EquipmentRecord[];
}

const statusColors: Record<string, string> = {
  operational: 'bg-success/10 text-success border-success/30',
  maintenance: 'bg-accent/10 text-accent-foreground border-accent/30',
  faulty: 'bg-destructive/10 text-destructive border-destructive/30',
  retired: 'bg-muted text-muted-foreground border-muted',
};

const PAGE_SIZE = 10;

export function DataTable({ data }: DataTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof EquipmentRecord>('equipment_id');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(lowerSearch)
        )
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return result;
  }, [data, search, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (field: keyof EquipmentRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const SortHeader = ({ field, children }: { field: keyof EquipmentRecord; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
    </TableHead>
  );

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>No data to display. Upload a CSV file to get started.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {paginatedData.length} of {filteredData.length} records
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader field="equipment_id">ID</SortHeader>
              <SortHeader field="equipment_type">Type</SortHeader>
              <SortHeader field="manufacturer">Manufacturer</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="location">Location</SortHeader>
              <SortHeader field="cost">Cost</SortHeader>
              <SortHeader field="efficiency_rating">Efficiency</SortHeader>
              <SortHeader field="runtime_hours">Runtime</SortHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, idx) => (
              <TableRow key={item.id || idx} className="hover:bg-muted/30">
                <TableCell className="font-mono text-sm">{item.equipment_id}</TableCell>
                <TableCell>{item.equipment_type}</TableCell>
                <TableCell>{item.manufacturer}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={statusColors[item.status] || statusColors.retired}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell className="font-mono">${item.cost?.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${item.efficiency_rating}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{item.efficiency_rating}%</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono">{item.runtime_hours?.toLocaleString()}h</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
