'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { getPlanningSessionDetail } from '@/services/planning-workbench';
import type { PlanningSessionDetail } from '@/types/api';
import { Loader2 } from 'lucide-react';

export default function PlanningSessionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [session, setSession] = useState<PlanningSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  async function loadDetail() {
    setLoading(true);
    try {
      const result = await getPlanningSessionDetail(id);
      if (result) {
        setSession(result);
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

  if (!session) {
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
          <h1 className="text-3xl font-bold">规划会话详情</h1>
          <p className="text-muted-foreground mt-2">ID: {session.id}</p>
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
              <Label>会话 ID</Label>
              <div className="text-sm font-mono mt-1">{session.id}</div>
            </div>
            <div>
              <Label>Trip ID</Label>
              <div className="text-sm mt-1">{session.tripId}</div>
            </div>
            <div>
              <Label>User ID</Label>
              <div className="text-sm mt-1">{session.userId}</div>
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1">
                <Badge
                  variant={
                    session.status === 'COMPLETED'
                      ? 'default'
                      : session.status === 'CANCELLED'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {session.status === 'ACTIVE' ? '活跃' : session.status === 'COMPLETED' ? '已完成' : '已取消'}
                </Badge>
              </div>
            </div>
            {session.currentPlanId && (
              <div>
                <Label>Current Plan ID</Label>
                <div className="text-sm mt-1">{session.currentPlanId}</div>
              </div>
            )}
            <div>
              <Label>创建时间</Label>
              <div className="text-sm mt-1">
                {new Date(session.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
            {session.updatedAt && (
              <div>
                <Label>更新时间</Label>
                <div className="text-sm mt-1">
                  {new Date(session.updatedAt).toLocaleString('zh-CN')}
                </div>
              </div>
            )}
            {session.completedAt && (
              <div>
                <Label>完成时间</Label>
                <div className="text-sm mt-1">
                  {new Date(session.completedAt).toLocaleString('zh-CN')}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interactions */}
      {session.interactions && session.interactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>交互历史 ({session.interactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {session.interactions.map((interaction) => (
                <div key={interaction.id} className="p-4 border rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{interaction.type}</Badge>
                    <div className="text-xs text-muted-foreground">
                      {new Date(interaction.timestamp).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <div className="text-sm whitespace-pre-wrap mt-2">
                    {interaction.content}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
