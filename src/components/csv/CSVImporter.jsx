import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2, X, Info } from 'lucide-react';
import CSVTemplateDownloader from './CSVTemplateDownloader';
import { parseCSV, mapCSVToDatabase, validatePemainData } from '@/utils/csvParser';

const CSVImporter = ({ onImport, importing = false }) => {
  const fileInputRef = useRef(null);
  const [importResult, setImportResult] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setImportResult({
        success: false,
        message: 'File harus berformat CSV! ',
        details: [],
      });
      return;
    }

    try {
      const text = await file.text();
      const csvData = parseCSV(text);

      if (csvData.length === 0) {
        throw new Error('File CSV kosong atau format tidak valid');
      }

      const validData = [];
      const errors = [];

      for (let i = 0; i < csvData.length; i++) {
        const mappedData = mapCSVToDatabase(csvData[i]);
        const validationErrors = validatePemainData(mappedData);

        if (validationErrors.length > 0) {
          errors.push({
            row: i + 2,
            nama: mappedData.nama || `Baris ${i + 2}`,
            errors: validationErrors,
          });
        } else {
          validData.push(mappedData);
        }
      }

      if (validData.length > 0) {
        const results = await onImport(validData);

        setImportResult({
          success: true,
          message: `Import selesai! ${results.success} berhasil, ${
            results.failed + errors.length
          } gagal.`,
          details: [...errors, ...results.errors],
        });
      } else {
        setImportResult({
          success: false,
          message: 'Semua data tidak valid! ',
          details: errors,
        });
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      setImportResult({
        success: false,
        message: 'Gagal mengimport file: ' + error.message,
        details: [],
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Import Data dari CSV
        </CardTitle>
        <CardDescription>
          Upload file CSV untuk menambahkan data pemain secara massal
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={importing}
              className="cursor-pointer"
            />
          </div>

          <CSVTemplateDownloader />
        </div>

        {/* Info format */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <span className="font-medium">Format CSV yang didukung:</span>{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              nama, tanggal_lahir (YYYY-MM-DD), posisi, tinggi_badan, berat_badan, no_telepon, email
            </code>
          </AlertDescription>
        </Alert>

        {/* Loading indicator */}
        {importing && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Mengimport data...</span>
          </div>
        )}

        {/* Import result */}
        {importResult && (
          <Alert variant={importResult.success ? 'default' : 'destructive'}>
            {importResult.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="font-medium">{importResult.message}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setImportResult(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {importResult.details.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Detail error:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.details.map((detail, index) => (
                      <div key={index} className="text-sm">
                        <Badge variant="outline" className="mr-2">
                          Baris {detail.row}
                        </Badge>
                        <span>
                          ({detail.nama}): {detail.errors.join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default CSVImporter;
