'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { getPlanningPlanDetail } from '@/services/planning-workbench';
import type { PlanningPlanDetail } from '@/types/api';
import { Loader2 } from 'lucide-react';

export default function PlanningPlanDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [plan, setPlan] = useState<PlanningPlanDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  async function loadDetail() {
    setLoading(true);
    try {
      const result = await getPlanningPlanDetail(id);
      if (result) {
        setPlan(result);
      }
    } catch (error) {
      console.error('加载详情失败:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/planning-workbench">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            未找到数据
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/planning-workbench">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">规划方案详情</h1>
          <p className="text-muted-foreground mt-2">ID: {plan.id}</p>
        </div>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>方案 ID</Label>
              <div className="text-sm font-mono mt-1">{plan.id}</div>
            </div>
            <div>
              <Label>Session ID</Label>
              <div className="text-sm mt-1">{plan.sessionId}</div>
            </div>
            <div>
              <Label>Trip ID</Label>
              <div className="text-sm mt-1">{plan.tripId}</div>
            </div>
            <div>
              <Label>User ID</Label>
              <div className="text-sm mt-1">{plan.userId}</div>
            </div>
            <div>
              <Label>Version</Label>
              <div className="mt-1">
                <Badge variant="outline">v{plan.version}</Badge>
              </div>
            </div>
            <div>
              <Label>创建时间</Label>
              <div className="text-sm mt-1">
                {new Date(plan.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
            {plan.updatedAt && (
              <div>
                <Label>更新时间</Label>
                <div className="text-sm mt-1">
                  {new Date(plan.updatedAt).toLocaleString('zh-CN')}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Data */}
      {plan.planData && Object.keys(plan.planData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>方案数据</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(plan.planData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {plan.metadata && Object.keys(plan.metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(plan.metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
