'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  getReadinessPackById,
  updateReadinessPack,
  createReadinessPack,
} from '@/services/readiness';
import type { ReadinessPack, UpdateReadinessPackRequest } from '@/types/api';
import { RulesEditor } from '@/components/readiness/RulesEditor';
import { ChecklistsEditor } from '@/components/readiness/ChecklistsEditor';
import { HazardsEditor } from '@/components/readiness/HazardsEditor';

export default function ReadinessPackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const packId = params.id as string;
  const isNew = packId === 'new';

  const [pack, setPack] = useState<ReadinessPack | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ReadinessPack>>({
    packId: '',
    destinationId: '',
    displayName: { en: '', zh: '' },
    version: '1.0.0',
    geo: {
      countryCode: '',
      region: '',
      city: '',
    },
    supportedSeasons: [],
    rules: [],
    checklists: [],
    hazards: [],
    isActive: true,
  });

  useEffect(() => {
    if (!isNew && packId) {
      loadPack();
    }
  }, [packId, isNew]);

  async function loadPack() {
    setLoading(true);
    try {
      const packData = await getReadinessPackById(packId);
      if (packData) {
        console.log('加载的Pack数据:', packData);
        console.log('规则数据:', packData.rules);
        console.log('清单数据:', packData.checklists);
        console.log('风险数据:', packData.hazards);
        setPack(packData);
        setFormData(packData);
      }
    } catch (error) {
      console.error('加载Pack详情失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      let result: ReadinessPack | null = null;
      
      if (isNew) {
        result = await createReadinessPack({
          pack: {
            ...formData,
            packId: formData.packId!,
            destinationId: formData.destinationId!,
            displayName: formData.displayName!,
            version: formData.version || '1.0.0',
            lastReviewedAt: new Date().toISOString(),
            geo: formData.geo!,
            supportedSeasons: formData.supportedSeasons || [],
            rules: formData.rules || [],
            checklists: formData.checklists || [],
            hazards: formData.hazards || [],
            isActive: formData.isActive ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as ReadinessPack,
        });
      } else {
        result = await updateReadinessPack(packId, {
          pack: formData as ReadinessPack,
        });
      }

      if (result) {
        alert('保存成功');
        if (isNew) {
          router.push(`/admin/readiness/${result.packId}`);
        } else {
          setPack(result);
        }
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  const displayName = typeof formData.displayName === 'string'
    ? { en: formData.displayName, zh: '' }
    : formData.displayName || { en: '', zh: '' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/readiness">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {isNew ? '创建Pack' : 'Pack详情'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isNew ? '创建新的准备度Pack' : '编辑Pack信息'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Pack ID *</label>
              <input
                type="text"
                value={formData.packId || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, packId: e.target.value }))
                }
                disabled={!isNew}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="pack.is.iceland"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">目的地ID *</label>
              <input
                type="text"
                value={formData.destinationId || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, destinationId: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="IS-ICELAND"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">显示名称 (英文) *</label>
              <input
                type="text"
                value={displayName.en}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayName: { ...displayName, en: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">显示名称 (中文)</label>
              <input
                type="text"
                value={displayName.zh || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayName: { ...displayName, zh: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">版本号</label>
              <input
                type="text"
                value={formData.version || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, version: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="1.0.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">激活状态</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="rounded"
                />
                <span className="text-sm">激活</span>
              </label>
            </div>
          </div>

          {/* 地理位置 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">地理位置</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">国家代码 *</label>
                <input
                  type="text"
                  value={formData.geo?.countryCode || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      geo: { ...prev.geo, countryCode: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="IS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">区域</label>
                <input
                  type="text"
                  value={formData.geo?.region || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      geo: { ...prev.geo, region: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">城市</label>
                <input
                  type="text"
                  value={formData.geo?.city || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      geo: { ...prev.geo, city: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* 支持的季节 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">支持的季节</h3>
            <div className="flex flex-wrap gap-2">
              {['summer', 'winter', 'spring', 'autumn'].map((season) => (
                <label key={season} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.supportedSeasons?.includes(season) || false}
                    onChange={(e) => {
                      const seasons = formData.supportedSeasons || [];
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          supportedSeasons: [...seasons, season],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          supportedSeasons: seasons.filter((s) => s !== season),
                        }));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{season}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 规则编辑器 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">规则</h3>
            <RulesEditor
              value={formData.rules || []}
              onChange={(rules) => setFormData((prev) => ({ ...prev, rules }))}
            />
          </div>

          {/* 清单编辑器 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">清单</h3>
            <ChecklistsEditor
              value={formData.checklists || []}
              onChange={(checklists) => setFormData((prev) => ({ ...prev, checklists }))}
            />
          </div>

          {/* 风险编辑器 */}
          {formData.hazards !== undefined && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">风险</h3>
              <HazardsEditor
                value={formData.hazards || []}
                onChange={(hazards) => setFormData((prev) => ({ ...prev, hazards }))}
              />
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? '保存中...' : '保存'}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
