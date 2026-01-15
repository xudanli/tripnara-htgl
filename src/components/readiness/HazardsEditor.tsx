'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DataDebugView } from './DataDebugView';

interface HazardItem {
  zoneId?: string;
  type?: string;
  level?: string;
  metadata?: {
    description?: string;
    schedule?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface HazardsEditorProps {
  value: any[];
  onChange: (hazards: any[]) => void;
}

export function HazardsEditor({ value = [], onChange }: HazardsEditorProps) {
  const [hazards, setHazards] = useState<HazardItem[]>(Array.isArray(value) ? value : []);
  const valueRef = useRef<string>('');

  useEffect(() => {
    const valueStr = JSON.stringify(value);
    if (valueStr !== valueRef.current) {
      valueRef.current = valueStr;
      if (Array.isArray(value)) {
        console.log('HazardsEditor: updating hazards from value', value);
        setHazards(value);
      }
    }
  }, [value]);

  const handleAdd = () => {
    const newItem: HazardItem = {
      zoneId: `zone-${Date.now()}`,
      type: '',
      level: '',
      metadata: {
        description: '',
      },
    };
    const updated = [...hazards, newItem];
    setHazards(updated);
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = hazards.filter((_, i) => i !== index);
    setHazards(updated);
    onChange(updated);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...hazards];
    updated[index] = { ...updated[index], [field]: value };
    setHazards(updated);
    onChange(updated);
  };

  const handleJsonEdit = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        setHazards(parsed);
        onChange(parsed);
      }
    } catch (e) {
      // 无效JSON，忽略
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">风险列表</label>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加风险项
        </Button>
      </div>

      {/* 调试视图 */}
      <DataDebugView data={hazards} label="风险数据调试" />

      {hazards.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
          暂无风险项，点击"添加风险项"按钮添加
        </div>
      ) : (
        <div className="space-y-3">
          {hazards.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm font-medium">风险项 #{index + 1}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">区域ID</label>
                  <Input
                    value={item.zoneId || ''}
                    onChange={(e) => handleChange(index, 'zoneId', e.target.value)}
                    placeholder="如: zone-001"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">类型</label>
                    <Input
                      value={item.type || ''}
                      onChange={(e) => handleChange(index, 'type', e.target.value)}
                      placeholder="如: AVALANCHE, WEATHER, TERRAIN"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">等级</label>
                    <Input
                      value={item.level || ''}
                      onChange={(e) => handleChange(index, 'level', e.target.value)}
                      placeholder="如: HIGH, MEDIUM, LOW"
                    />
                  </div>
                </div>
                {item.metadata && (
                  <div className="border rounded p-3 bg-muted/50">
                    <label className="block text-xs font-medium mb-2">元数据</label>
                    <div className="space-y-2">
                      <Textarea
                        value={item.metadata.description || ''}
                        onChange={(e) => {
                          const updated = [...hazards];
                          updated[index] = {
                            ...updated[index],
                            metadata: { ...updated[index].metadata, description: e.target.value },
                          };
                          setHazards(updated);
                          onChange(updated);
                        }}
                        placeholder="描述"
                        rows={2}
                      />
                      <Input
                        value={item.metadata.schedule || ''}
                        onChange={(e) => {
                          const updated = [...hazards];
                          updated[index] = {
                            ...updated[index],
                            metadata: { ...updated[index].metadata, schedule: e.target.value },
                          };
                          setHazards(updated);
                          onChange(updated);
                        }}
                        placeholder="时间表，如: 全年运行"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JSON 视图/编辑（折叠） */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
          高级：JSON 编辑
        </summary>
        <div className="mt-2">
          <Textarea
            value={JSON.stringify(hazards, null, 2)}
            onChange={(e) => handleJsonEdit(e.target.value)}
            className="font-mono text-xs min-h-[200px]"
            placeholder="JSON 格式"
          />
        </div>
      </details>
    </div>
  );
}
