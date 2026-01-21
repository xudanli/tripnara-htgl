'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DataDebugView } from './DataDebugView';
import type { ChecklistCategory } from '@/types/api';

// 清单分类选项
const CHECKLIST_CATEGORIES: { value: ChecklistCategory; label: string }[] = [
  { value: 'documents', label: '证件文件' },
  { value: 'clothing', label: '服装穿着' },
  { value: 'gear', label: '装备器材' },
  { value: 'electronics', label: '电子设备' },
  { value: 'toiletries', label: '洗漱用品' },
  { value: 'medicine', label: '药品医疗' },
  { value: 'food', label: '食品饮料' },
  { value: 'emergency', label: '应急物品' },
  { value: 'booking', label: '预订确认' },
  { value: 'other', label: '其他' },
];

interface ChecklistItem {
  id?: string;
  title?: string;
  description?: string;
  required?: boolean;
  category?: ChecklistCategory;
  priority?: number;
  [key: string]: unknown;
}

interface ChecklistsEditorProps {
  value: ChecklistItem[];
  onChange: (checklists: ChecklistItem[]) => void;
}

export function ChecklistsEditor({ value = [], onChange }: ChecklistsEditorProps) {
  const [checklists, setChecklists] = useState<ChecklistItem[]>(Array.isArray(value) ? value : []);
  const valueRef = useRef<string>('');

  useEffect(() => {
    const valueStr = JSON.stringify(value);
    if (valueStr !== valueRef.current) {
      valueRef.current = valueStr;
      if (Array.isArray(value)) {
        console.log('ChecklistsEditor: updating checklists from value', value);
        setChecklists(value);
      }
    }
  }, [value]);

  const handleAdd = () => {
    const newItem: ChecklistItem = {
      title: '',
      description: '',
      required: false,
      category: 'other',
      priority: checklists.length + 1,
    };
    const updated = [...checklists, newItem];
    setChecklists(updated);
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = checklists.filter((_, i) => i !== index);
    setChecklists(updated);
    onChange(updated);
  };

  const handleChange = (index: number, field: string, value: unknown) => {
    const updated = [...checklists];
    updated[index] = { ...updated[index], [field]: value };
    setChecklists(updated);
    onChange(updated);
  };

  const handleJsonEdit = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        setChecklists(parsed);
        onChange(parsed);
      }
    } catch (e) {
      // 无效JSON，忽略
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">清单列表</label>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加清单项
        </Button>
      </div>

      {/* 调试视图 */}
      <DataDebugView data={checklists} label="清单数据调试" />

      {checklists.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
          暂无清单项，点击"添加清单项"按钮添加
        </div>
      ) : (
        <div className="space-y-3">
          {checklists.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm font-medium">清单项 #{index + 1}</span>
                  {item.category && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted">
                      {CHECKLIST_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                    </span>
                  )}
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
                  <label className="block text-xs font-medium mb-1">标题</label>
                  <Input
                    value={typeof item.title === 'string' ? item.title : ''}
                    onChange={(e) => handleChange(index, 'title', e.target.value)}
                    placeholder="清单项标题"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">描述</label>
                  <Textarea
                    value={typeof item.description === 'string' ? item.description : ''}
                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                    placeholder="清单项描述"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">分类</label>
                    <select
                      value={item.category || 'other'}
                      onChange={(e) => handleChange(index, 'category', e.target.value as ChecklistCategory)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      {CHECKLIST_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">优先级</label>
                    <Input
                      type="number"
                      min={1}
                      value={item.priority || index + 1}
                      onChange={(e) => handleChange(index, 'priority', parseInt(e.target.value) || 1)}
                      placeholder="1"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      checked={item.required || false}
                      onChange={(e) => handleChange(index, 'required', e.target.checked)}
                      className="rounded"
                      id={`required-${index}`}
                    />
                    <label htmlFor={`required-${index}`} className="text-xs font-medium cursor-pointer">
                      必填项
                    </label>
                  </div>
                </div>
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
            value={JSON.stringify(checklists, null, 2)}
            onChange={(e) => handleJsonEdit(e.target.value)}
            className="font-mono text-xs min-h-[200px]"
            placeholder="JSON 格式"
          />
        </div>
      </details>
    </div>
  );
}
