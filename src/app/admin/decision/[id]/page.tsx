'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { getDecisionLogDetail } from '@/services/decision-admin';
import type { DecisionLogDetail } from '@/types/api';
import { Loader2 } from 'lucide-react';

export default function DecisionLogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [log, setLog] = useState<DecisionLogDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  async function loadDetail() {
    setLoading(true);
    try {
      const result = await getDecisionLogDetail(id);
      if (result) {
        setLog(result);
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

  if (!log) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/decision">
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
        <Link href="/admin/decision">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">决策日志详情</h1>
          <p className="text-muted-foreground mt-2">ID: {log.id}</p>
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
              <Label>决策 ID</Label>
              <div className="text-sm font-mono mt-1">{log.id}</div>
            </div>
            {log.tripId && (
              <div>
                <Label>Trip ID</Label>
                <div className="text-sm mt-1">{log.tripId}</div>
              </div>
            )}
            <div>
              <Label>Persona</Label>
              <div className="mt-1">
                <Badge>{log.persona}</Badge>
              </div>
            </div>
            <div>
              <Label>Action</Label>
              <div className="mt-1">
                <Badge
                  variant={
                    log.action === 'ALLOW'
                      ? 'default'
                      : log.action === 'REJECT'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {log.action}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Decision Source</Label>
              <div className="mt-1">
                <Badge variant="outline">{log.decisionSource}</Badge>
              </div>
            </div>
            <div>
              <Label>Decision Stage</Label>
              <div className="text-sm mt-1">{log.decisionStage}</div>
            </div>
            {log.countryCode && (
              <div>
                <Label>Country Code</Label>
                <div className="text-sm mt-1">{log.countryCode}</div>
              </div>
            )}
            {log.routeDirectionId && (
              <div>
                <Label>Route Direction ID</Label>
                <div className="text-sm mt-1">{log.routeDirectionId}</div>
              </div>
            )}
            <div>
              <Label>时间</Label>
              <div className="text-sm mt-1">
                {new Date(log.timestamp).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm whitespace-pre-wrap">{log.explanation}</div>
        </CardContent>
      </Card>

      {/* Reason Codes */}
      {log.reasonCodes && log.reasonCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reason Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {log.reasonCodes.map((code, idx) => (
                <Badge key={idx} variant="outline">
                  {code}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
