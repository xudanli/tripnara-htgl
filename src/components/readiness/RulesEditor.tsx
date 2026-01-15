'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DataDebugView } from './DataDebugView';

interface RuleItem {
  id?: string;
  category?: string;
  severity?: string;
  message?: string;
  then?: {
    level?: string;
    message?: string;
    [key: string]: any;
  };
  when?: {
    [key: string]: any;
  };
  tasks?: Array<{
    title?: string;
    tags?: string[];
    dueOffsetDays?: number;
    [key: string]: any;
  }>;
  [key: string]: any;
}

interface RulesEditorProps {
  value: any[];
  onChange: (rules: any[]) => void;
}

export function RulesEditor({ value = [], onChange }: RulesEditorProps) {
  const [rules, setRules] = useState<RuleItem[]>(Array.isArray(value) ? value : []);
  const valueRef = useRef<string>('');

  useEffect(() => {
    const valueStr = JSON.stringify(value);
    if (valueStr !== valueRef.current) {
      valueRef.current = valueStr;
      if (Array.isArray(value)) {
        console.log('RulesEditor: updating rules from value', value);
        setRules(value);
      }
    }
  }, [value]);

  const handleAdd = () => {
    const newRule: RuleItem = {
      id: `rule.${Date.now()}`,
      category: '',
      severity: '',
      message: '',
      then: {
        level: '',
        message: '',
      },
      tasks: [],
    };
    const updated = [...rules, newRule];
    setRules(updated);
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = rules.filter((_, i) => i !== index);
    setRules(updated);
    onChange(updated);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated);
    onChange(updated);
  };

  const handleJsonEdit = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        setRules(parsed);
        onChange(parsed);
      }
    } catch (e) {
      // 无效JSON，忽略
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">规则列表</label>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加规则
        </Button>
      </div>

      {/* 调试视图 */}
      <DataDebugView data={rules} label="规则数据调试" />

      {rules.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
          暂无规则，点击"添加规则"按钮添加
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm font-medium">规则 #{index + 1}</span>
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
                  <label className="block text-xs font-medium mb-1">ID</label>
                  <Input
                    value={rule.id || ''}
                    onChange={(e) => handleChange(index, 'id', e.target.value)}
                    placeholder="规则ID，如: rule.is.weather.layered-clothing"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">分类</label>
                    <Input
                      value={rule.category || ''}
                      onChange={(e) => handleChange(index, 'category', e.target.value)}
                      placeholder="如: gear_packing, safety_hazards"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">严重程度</label>
                    <Input
                      value={rule.severity || ''}
                      onChange={(e) => handleChange(index, 'severity', e.target.value)}
                      placeholder="如: high, medium, low"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">消息</label>
                  <Textarea
                    value={rule.message || ''}
                    onChange={(e) => handleChange(index, 'message', e.target.value)}
                    placeholder="规则消息"
                    rows={2}
                  />
                </div>
                {rule.then && (
                  <div className="border rounded p-3 bg-muted/50">
                    <label className="block text-xs font-medium mb-2">Then 条件</label>
                    <div className="space-y-2">
                      <Input
                        value={rule.then.level || ''}
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[index] = {
                            ...updated[index],
                            then: { ...updated[index].then, level: e.target.value },
                          };
                          setRules(updated);
                          onChange(updated);
                        }}
                        placeholder="Level，如: must, should"
                      />
                      <Textarea
                        value={rule.then.message || ''}
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[index] = {
                            ...updated[index],
                            then: { ...updated[index].then, message: e.target.value },
                          };
                          setRules(updated);
                          onChange(updated);
                        }}
                        placeholder="Then message"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
                {rule.tasks && Array.isArray(rule.tasks) && rule.tasks.length > 0 && (
                  <div className="border rounded p-3 bg-muted/50">
                    <label className="block text-xs font-medium mb-2">
                      任务列表 ({rule.tasks.length} 项)
                    </label>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {rule.tasks.map((task: any, taskIndex: number) => (
                        <div key={taskIndex} className="p-2 bg-background rounded">
                          <div className="font-medium">{task.title || '未命名任务'}</div>
                          {task.tags && task.tags.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              标签: {task.tags.join(', ')}
                            </div>
                          )}
                          {task.dueOffsetDays !== undefined && (
                            <div className="text-xs text-muted-foreground">
                              到期偏移: {task.dueOffsetDays} 天
                            </div>
                          )}
                        </div>
                      ))}
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
            value={JSON.stringify(rules, null, 2)}
            onChange={(e) => handleJsonEdit(e.target.value)}
            className="font-mono text-xs min-h-[200px]"
            placeholder="JSON 格式"
          />
        </div>
      </details>
    </div>
  );
}
