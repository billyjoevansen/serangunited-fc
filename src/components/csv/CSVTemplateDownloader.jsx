import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateCSVTemplate, downloadCSV } from '@/utils/csvParser';

const CSVTemplateDownloader = () => {
  const handleDownload = () => {
    const template = generateCSVTemplate();
    downloadCSV(template, 'template_pemain.csv');
  };

  return (
    <Button variant="outline" onClick={handleDownload}>
      <Download className="w-4 h-4 mr-2" />
      Download Template
    </Button>
  );
};

export default CSVTemplateDownloader;
