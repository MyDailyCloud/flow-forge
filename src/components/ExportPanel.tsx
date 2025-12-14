import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ExportPanelProps {
  exportData: () => string;
}

export function ExportPanel({ exportData }: ExportPanelProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    const data = exportData();
    await navigator.clipboard.writeText(data);
    setCopied(true);
    toast({
      title: '已复制',
      description: 'SOP 数据已复制到剪贴板',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sop-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: '下载成功',
      description: 'SOP 数据已下载为 JSON 文件',
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? (
          <Check className="w-4 h-4 mr-1" />
        ) : (
          <Copy className="w-4 h-4 mr-1" />
        )}
        {copied ? '已复制' : '复制'}
      </Button>
      <Button variant="glow" size="sm" onClick={handleDownload}>
        <Download className="w-4 h-4 mr-1" />
        导出 JSON
      </Button>
    </div>
  );
}
