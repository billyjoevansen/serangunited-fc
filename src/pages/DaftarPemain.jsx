import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePemain } from '@/hooks';
import { PageContainer } from '@/components/layout';
import { PemainSearchBar, PemainList } from '@/components/pemain';
import { CSVImporter } from '@/components/csv';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileSpreadsheet, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

function DaftarPemain() {
  const { canRate } = useAuth();
  const { pemain, loading, refetch, importPemain } = usePemain();
  const [searchTerm, setSearchTerm] = useState('');
  const [importing, setImporting] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  const handleImport = async (validData) => {
    setImporting(true);
    try {
      const results = await importPemain(validData);
      if (results.success > 0) {
        refetch();
      }
      return results;
    } finally {
      setImporting(false);
    }
  };

  const filteredPemain = pemain.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.posisi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer loading={loading}>
      <PemainSearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* CSV Importer - Hanya Admin & Penilai */}
      {canRate && (
        <Collapsible open={showImporter} onOpenChange={setShowImporter} className="mb-6">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="gap-2 text-muted-foreground w-full justify-start">
              <FileSpreadsheet className="w-4 h-4" />
              {showImporter ? 'Sembunyikan' : 'Tampilkan'} Import CSV
              <ChevronDown
                className={cn('w-4 h-4 transition-transform ml-auto', showImporter && 'rotate-180')}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <CSVImporter onImport={handleImport} importing={importing} />
          </CollapsibleContent>
        </Collapsible>
      )}

      <PemainList pemainList={filteredPemain} />
    </PageContainer>
  );
}

export default DaftarPemain;
