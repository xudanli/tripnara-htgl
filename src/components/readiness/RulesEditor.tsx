'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GripVertical, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DataDebugView } from './DataDebugView';
import type { ReadinessCategory, SeasonType } from '@/types/api';

// 准备度分类选项
const READINESS_CATEGORIES: { value: ReadinessCategory; label: string }[] = [
  { value: 'entry_transit', label: '入境/过境' },
  { value: 'safety_hazards', label: '安全/危险' },
  { value: 'health_insurance', label: '健康/保险' },
  { value: 'gear_packing', label: '装备/打包' },
  { value: 'activities_bookings', label: '活动/预订' },
  { value: 'logistics', label: '物流/交通' },
];

// 规则严重程度
const RULE_SEVERITIES: { value: string; label: string; color: string }[] = [
  { value: 'critical', label: '关键', color: 'bg-red-500 text-white' },
  { value: 'high', label: '高', color: 'bg-orange-500 text-white' },
  { value: 'medium', label: '中', color: 'bg-yellow-500 text-black' },
  { value: 'low', label: '低', color: 'bg-green-500 text-white' },
  { value: 'info', label: '信息', color: 'bg-blue-500 text-white' },
];

// Then 级别选项
const THEN_LEVELS: { value: string; label: string }[] = [
  { value: 'must', label: '必须 (must)' },
  { value: 'should', label: '应该 (should)' },
  { value: 'could', label: '可以 (could)' },
  { value: 'info', label: '信息 (info)' },
];

// 季节选项
const SEASONS: { value: SeasonType; label: string }[] = [
  { value: 'all', label: '全年' },
  { value: 'winter', label: '冬季' },
  { value: 'summer', label: '夏季' },
  { value: 'shoulder', label: '过渡季' },
  { value: 'polar_night', label: '极夜' },
  { value: 'polar_day', label: '极昼' },
  { value: 'rainy', label: '雨季' },
  { value: 'dry', label: '旱季' },
];

interface RuleItem {
  id?: string;
  category?: ReadinessCategory;
  severity?: string;
  message?: string;
  seasons?: SeasonType[];
  then?: {
    level?: string;
    message?: string;
    [key: string]: unknown;
  };
  when?: {
    [key: string]: unknown;
  };
  tasks?: Array<{
    title?: string;
    tags?: string[];
    dueOffsetDays?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface RulesEditorProps {
  value: RuleItem[];
  onChange: (rules: RuleItem[]) => void;
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
      category: 'gear_packing',
      severity: 'medium',
      message: '',
      seasons: ['all'],
      then: {
        level: 'should',
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

  const handleChange = (index: number, field: string, value: unknown) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated);
    onChange(updated);
  };

  const handleThenChange = (index: number, field: string, value: unknown) => {
    const updated = [...rules];
    updated[index] = {
      ...updated[index],
      then: { ...updated[index].then, [field]: value },
    };
    setRules(updated);
    onChange(updated);
  };

  const handleSeasonsChange = (index: number, season: SeasonType, checked: boolean) => {
    const updated = [...rules];
    const currentSeasons = updated[index].seasons || [];
    if (checked) {
      updated[index].seasons = [...currentSeasons, season];
    } else {
      updated[index].seasons = currentSeasons.filter(s => s !== season);
    }
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

  const getSeverityInfo = (severity?: string) => {
    return RULE_SEVERITIES.find(s => s.value === severity) || RULE_SEVERITIES[2];
  };

  const getCategoryLabel = (category?: ReadinessCategory) => {
    return READINESS_CATEGORIES.find(c => c.value === category)?.label || category;
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
          {rules.map((rule, index) => {
            const severityInfo = getSeverityInfo(rule.severity);
            
            return (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">规则 #{index + 1}</span>
                    {rule.category && (
                      <span className="text-xs px-2 py-0.5 rounded bg-muted">
                        {getCategoryLabel(rule.category)}
                      </span>
                    )}
                    {rule.severity && (
                      <span className={`text-xs px-2 py-0.5 rounded ${severityInfo.color}`}>
                        {severityInfo.label}
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
                      <select
                        value={rule.category || 'gear_packing'}
                        onChange={(e) => handleChange(index, 'category', e.target.value as ReadinessCategory)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      >
                        {READINESS_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">严重程度</label>
                      <select
                        value={rule.severity || 'medium'}
                        onChange={(e) => handleChange(index, 'severity', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      >
                        {RULE_SEVERITIES.map(sev => (
                          <option key={sev.value} value={sev.value}>
                            {sev.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 适用季节 */}
                  <div>
                    <label className="block text-xs font-medium mb-2">适用季节</label>
                    <div className="flex flex-wrap gap-2">
                      {SEASONS.map(season => (
                        <label key={season.value} className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={rule.seasons?.includes(season.value) || false}
                            onChange={(e) => handleSeasonsChange(index, season.value, e.target.checked)}
                            className="rounded"
                          />
                          {season.label}
                        </label>
                      ))}
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

                  {/* Then 条件 */}
                  <div className="border rounded p-3 bg-muted/50">
                    <label className="block text-xs font-medium mb-2">Then 条件</label>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">级别</label>
                        <select
                          value={rule.then?.level || 'should'}
                          onChange={(e) => handleThenChange(index, 'level', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        >
                          {THEN_LEVELS.map(lvl => (
                            <option key={lvl.value} value={lvl.value}>
                              {lvl.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Textarea
                        value={rule.then?.message || ''}
                        onChange={(e) => handleThenChange(index, 'message', e.target.value)}
                        placeholder="Then message"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* 任务列表 */}
                  {rule.tasks && Array.isArray(rule.tasks) && rule.tasks.length > 0 && (
                    <div className="border rounded p-3 bg-muted/50">
                      <label className="block text-xs font-medium mb-2">
                        任务列表 ({rule.tasks.length} 项)
                      </label>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        {rule.tasks.map((task, taskIndex) => (
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
            );
          })}
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
