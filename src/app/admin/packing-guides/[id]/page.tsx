'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  getPackingGuideDetail,
  updatePackingGuide,
} from '@/services/packing-guides-admin';
import type { PackingGuideDetail } from '@/types/api';

export default function PackingGuideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guide, setGuide] = useState<PackingGuideDetail | null>(null);
  const [guideDataJson, setGuideDataJson] = useState('');

  useEffect(() => {
    if (id && id !== 'new') {
      loadGuide();
    } else {
      setLoading(false);
    }
  }, [id]);

  async function loadGuide() {
    setLoading(true);
    try {
      const data = await getPackingGuideDetail(id);
      if (data) {
        setGuide(data);
        setGuideDataJson(JSON.stringify(data.guideData, null, 2));
      } else {
        // 如果返回 null，可能是 404 或其他错误
        // 检查是否是后端接口未实现（404）
        console.warn('获取指南详情返回 null，可能是后端接口未实现或资源不存在');
      }
    } catch (error) {
      console.error('加载指南详情失败:', error);
      // 不显示 alert，让页面显示"指南不存在"的友好提示
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!guide) return;

    setSaving(true);
    try {
      let guideData;
      try {
        guideData = JSON.parse(guideDataJson);
      } catch (e) {
        alert('指南数据 JSON 格式错误，请检查');
        setSaving(false);
        return;
      }

      const result = await updatePackingGuide(id, {
        guideData,
        lastUpdated: new Date().toISOString(),
      });

      if (result) {
        alert('保存成功');
        router.push('/admin/packing-templates');
      } else {
        alert('保存失败，请重试');
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!guide && id !== 'new') {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <div className="text-center space-y-2">
          <div className="text-muted-foreground">指南不存在</div>
          <div className="text-sm text-muted-foreground">
            {loading ? '加载中...' : '可能是后端接口未实现或该ID的指南不存在'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {id === 'new' ? '创建指南' : `指南详情 - ${guide?.version || ''}`}
            </h1>
            <p className="text-muted-foreground mt-2">查看和编辑打包指南</p>
          </div>
        </div>
        {id !== 'new' && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存
              </>
            )}
          </Button>
        )}
      </div>

      {guide && (
        <>
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID</Label>
                  <div className="mt-1 text-sm font-mono">{guide.id}</div>
                </div>
                <div>
                  <Label>版本</Label>
                  <div className="mt-1 text-sm">{guide.version}</div>
                </div>
                <div>
                  <Label>状态</Label>
                  <div className="mt-1">
                    <Badge
                      variant={guide.isActive ? 'default' : 'secondary'}
                      className={
                        guide.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {guide.isActive ? '激活' : '未激活'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>最后更新</Label>
                  <div className="mt-1 text-sm">
                    {new Date(guide.lastUpdated).toLocaleString('zh-CN')}
                  </div>
                </div>
                <div>
                  <Label>创建时间</Label>
                  <div className="mt-1 text-sm">
                    {new Date(guide.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
                <div>
                  <Label>更新时间</Label>
                  <div className="mt-1 text-sm">
                    {new Date(guide.updatedAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 指南数据 */}
          <Card>
            <CardHeader>
              <CardTitle>指南数据</CardTitle>
              <CardDescription>编辑 JSON 格式的指南数据</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={guideDataJson}
                onChange={(e) => setGuideDataJson(e.target.value)}
                className="font-mono text-sm"
                rows={30}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
