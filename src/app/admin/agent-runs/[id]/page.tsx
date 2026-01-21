'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { getAgentRunDetail } from '@/services/agent-runs';
import type { TripRunDetail } from '@/types/api';
import { Loader2 } from 'lucide-react';

export default function AgentRunDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [run, setRun] = useState<TripRunDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  async function loadDetail() {
    setLoading(true);
    try {
      const result = await getAgentRunDetail(id);
      if (result) {
        setRun(result);
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

  if (!run) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/agent-runs">
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
        <Link href="/admin/agent-runs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Agent 运行详情</h1>
          <p className="text-muted-foreground mt-2">ID: {run.id}</p>
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
              <Label>运行 ID</Label>
              <div className="text-sm font-mono mt-1">{run.id}</div>
            </div>
            <div>
              <Label>Trip ID</Label>
              <div className="text-sm mt-1">{run.tripId}</div>
            </div>
            <div>
              <Label>User ID</Label>
              <div className="text-sm mt-1">{run.userId}</div>
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1">
                <Badge
                  variant={
                    run.status === 'COMPLETED'
                      ? 'default'
                      : run.status === 'FAILED'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {run.status === 'IN_PROGRESS' ? '进行中' : run.status === 'COMPLETED' ? '已完成' : '失败'}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Planning Phase</Label>
              <div className="mt-1">
                <Badge variant="outline">{run.planningPhase}</Badge>
              </div>
            </div>
            <div>
              <Label>Current Agent</Label>
              <div className="mt-1">
                <Badge variant="outline">{run.currentAgent}</Badge>
              </div>
            </div>
            {run.duration !== undefined && (
              <div>
                <Label>Duration</Label>
                <div className="text-sm mt-1">{run.duration}s</div>
              </div>
            )}
            <div>
              <Label>创建时间</Label>
              <div className="text-sm mt-1">
                {new Date(run.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
            {run.updatedAt && (
              <div>
                <Label>更新时间</Label>
                <div className="text-sm mt-1">
                  {new Date(run.updatedAt).toLocaleString('zh-CN')}
                </div>
              </div>
            )}
            {run.completedAt && (
              <div>
                <Label>完成时间</Label>
                <div className="text-sm mt-1">
                  {new Date(run.completedAt).toLocaleString('zh-CN')}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Query */}
      <Card>
        <CardHeader>
          <CardTitle>User Query</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm whitespace-pre-wrap">{run.userQuery}</div>
        </CardContent>
      </Card>

      {/* Attempts */}
      {run.attempts && run.attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attempts ({run.attempts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {run.attempts.map((attempt) => (
                <div key={attempt.id} className="p-4 border rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Badge variant="outline">Attempt #{attempt.attemptNumber}</Badge>
                      <span className="ml-2 text-sm text-muted-foreground">{attempt.id}</span>
                    </div>
                    <Badge>{attempt.status}</Badge>
                  </div>
                  {attempt.planOutline && (
                    <div className="text-sm mt-2 whitespace-pre-wrap text-muted-foreground">
                      {attempt.planOutline}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(attempt.createdAt).toLocaleString('zh-CN')}
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
