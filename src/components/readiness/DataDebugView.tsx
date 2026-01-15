'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataDebugViewProps {
  data: any;
  label: string;
}

export function DataDebugView({ data, label }: DataDebugViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded p-2 bg-muted/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-6 px-2 text-xs"
        >
          {isOpen ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
          {isOpen ? '隐藏' : '显示'}原始数据
        </Button>
      </div>
      {isOpen && (
        <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
      <div className="text-xs text-muted-foreground mt-1">
        数据数量: {Array.isArray(data) ? data.length : 'N/A'} | 
        类型: {Array.isArray(data) ? 'Array' : typeof data}
      </div>
    </div>
  );
}
