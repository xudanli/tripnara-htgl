'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GripVertical, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DataDebugView } from './DataDebugView';
import type { HazardType, HazardLevel, SeasonType } from '@/types/api';

// 危险类型选项
const HAZARD_TYPES: { value: HazardType; label: string; icon?: string }[] = [
  { value: 'AVALANCHE', label: '雪崩', icon: '🏔️' },
  { value: 'WEATHER', label: '天气', icon: '🌪️' },
  { value: 'TERRAIN', label: '地形', icon: '⛰️' },
  { value: 'WILDLIFE', label: '野生动物', icon: '🐻' },
  { value: 'VOLCANIC', label: '火山', icon: '🌋' },
  { value: 'FLOOD', label: '洪水', icon: '🌊' },
  { value: 'EARTHQUAKE', label: '地震', icon: '📳' },
  { value: 'TSUNAMI', label: '海啸', icon: '🌊' },
  { value: 'ROAD', label: '道路', icon: '🚗' },
  { value: 'ALTITUDE', label: '高海拔', icon: '🏔️' },
  { value: 'COLD', label: '严寒', icon: '❄️' },
  { value: 'HEAT', label: '酷热', icon: '☀️' },
  { value: 'UV', label: '紫外线', icon: '🔆' },
  { value: 'WATER', label: '水域', icon: '💧' },
  { value: 'OTHER', label: '其他', icon: '⚠️' },
];

// 危险等级选项
const HAZARD_LEVELS: { value: HazardLevel; label: string; color: string }[] = [
  { value: 'CRITICAL', label: '极度危险', color: 'bg-red-600 text-white' },
  { value: 'HIGH', label: '高风险', color: 'bg-orange-500 text-white' },
  { value: 'MEDIUM', label: '中等风险', color: 'bg-yellow-500 text-black' },
  { value: 'LOW', label: '低风险', color: 'bg-green-500 text-white' },
  { value: 'INFO', label: '信息提示', color: 'bg-blue-500 text-white' },
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
  { value: 'hurricane', label: '飓风季' },
  { value: 'monsoon', label: '季风季' },
];

interface HazardItem {
  zoneId?: string;
  type?: HazardType;
  level?: HazardLevel;
  seasons?: SeasonType[];
  metadata?: {
    description?: string;
    schedule?: string;
    affectedAreas?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface HazardsEditorProps {
  value: HazardItem[];
  onChange: (hazards: HazardItem[]) => void;
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
      type: 'OTHER',
      level: 'MEDIUM',
      seasons: ['all'],
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

  const handleChange = (index: number, field: string, value: unknown) => {
    const updated = [...hazards];
    updated[index] = { ...updated[index], [field]: value };
    setHazards(updated);
    onChange(updated);
  };

  const handleMetadataChange = (index: number, field: string, value: unknown) => {
    const updated = [...hazards];
    updated[index] = {
      ...updated[index],
      metadata: { ...updated[index].metadata, [field]: value },
    };
    setHazards(updated);
    onChange(updated);
  };

  const handleSeasonsChange = (index: number, season: SeasonType, checked: boolean) => {
    const updated = [...hazards];
    const currentSeasons = updated[index].seasons || [];
    if (checked) {
      updated[index].seasons = [...currentSeasons, season];
    } else {
      updated[index].seasons = currentSeasons.filter(s => s !== season);
    }
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

  const getLevelInfo = (level?: HazardLevel) => {
    return HAZARD_LEVELS.find(l => l.value === level) || HAZARD_LEVELS[2];
  };

  const getTypeInfo = (type?: HazardType) => {
    return HAZARD_TYPES.find(t => t.value === type) || HAZARD_TYPES[HAZARD_TYPES.length - 1];
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
          {hazards.map((item, index) => {
            const levelInfo = getLevelInfo(item.level);
            const typeInfo = getTypeInfo(item.type);
            
            return (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">风险项 #{index + 1}</span>
                    {item.type && (
                      <span className="text-xs px-2 py-0.5 rounded bg-muted">
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                    )}
                    {item.level && (
                      <span className={`text-xs px-2 py-0.5 rounded ${levelInfo.color}`}>
                        {levelInfo.label}
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
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">危险类型</label>
                      <select
                        value={item.type || 'OTHER'}
                        onChange={(e) => handleChange(index, 'type', e.target.value as HazardType)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      >
                        {HAZARD_TYPES.map(t => (
                          <option key={t.value} value={t.value}>
                            {t.icon} {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">严重程度</label>
                      <select
                        value={item.level || 'MEDIUM'}
                        onChange={(e) => handleChange(index, 'level', e.target.value as HazardLevel)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      >
                        {HAZARD_LEVELS.map(l => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">区域ID</label>
                      <Input
                        value={item.zoneId || ''}
                        onChange={(e) => handleChange(index, 'zoneId', e.target.value)}
                        placeholder="如: zone-001"
                      />
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
                            checked={item.seasons?.includes(season.value) || false}
                            onChange={(e) => handleSeasonsChange(index, season.value, e.target.checked)}
                            className="rounded"
                          />
                          {season.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 元数据 */}
                  <div className="border rounded p-3 bg-muted/50">
                    <label className="block text-xs font-medium mb-2">详细信息</label>
                    <div className="space-y-2">
                      <Textarea
                        value={item.metadata?.description || ''}
                        onChange={(e) => handleMetadataChange(index, 'description', e.target.value)}
                        placeholder="风险描述"
                        rows={2}
                      />
                      <Input
                        value={item.metadata?.schedule || ''}
                        onChange={(e) => handleMetadataChange(index, 'schedule', e.target.value)}
                        placeholder="时间安排，如: 全年运行、冬季高发"
                      />
                    </div>
                  </div>
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
