'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { getContextPackageDetail } from '@/services/context';
import type { GetContextPackageDetailResponse, ContextBlock } from '@/types/api';
import { Loader2 } from 'lucide-react';

export default function ContextPackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<GetContextPackageDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  async function loadDetail() {
    setLoading(true);
    try {
      const result = await getContextPackageDetail(id);
      if (result) {
        setData(result);
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

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/context">
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

  const { package: pkg, metrics } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/context">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Context Package 详情</h1>
          <p className="text-muted-foreground mt-2">ID: {pkg.id}</p>
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
              <Label>Context ID</Label>
              <div className="text-sm font-mono mt-1">{pkg.id}</div>
            </div>
            {pkg.tripId && (
              <div>
                <Label>Trip ID</Label>
                <div className="text-sm mt-1">{pkg.tripId}</div>
              </div>
            )}
            <div>
              <Label>Phase</Label>
              <div className="mt-1">
                <Badge>{pkg.phase}</Badge>
              </div>
            </div>
            <div>
              <Label>Agent</Label>
              <div className="mt-1">
                <Badge>{pkg.agent}</Badge>
              </div>
            </div>
            <div className="col-span-2">
              <Label>User Query</Label>
              <div className="text-sm mt-1 p-2 bg-muted rounded-md">{pkg.userQuery}</div>
            </div>
            <div>
              <Label>Total Tokens</Label>
              <div className="text-sm mt-1">
                {pkg.totalTokens} / {pkg.tokenBudget}
                {pkg.totalTokens > pkg.tokenBudget && (
                  <Badge variant="destructive" className="ml-2">超预算</Badge>
                )}
              </div>
            </div>
            <div>
              <Label>Compressed</Label>
              <div className="mt-1">
                {pkg.compressed ? (
                  <Badge variant="default">是</Badge>
                ) : (
                  <Badge variant="outline">否</Badge>
                )}
              </div>
            </div>
            <div>
              <Label>创建时间</Label>
              <div className="text-sm mt-1">
                {new Date(pkg.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocks */}
      <Card>
        <CardHeader>
          <CardTitle>Blocks ({pkg.blocks.length})</CardTitle>
          <CardDescription>Context Package 包含的所有块</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {pkg.blocks.map((block: ContextBlock, idx: number) => (
              <div key={idx} className="p-4 border rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge>{block.type}</Badge>
                    <span className="text-sm font-mono text-muted-foreground">{block.key}</span>
                    <Badge variant={block.visibility === 'public' ? 'default' : 'secondary'}>
                      {block.visibility}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Priority: {block.priority} | Tokens: {block.estimatedTokens}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {block.text}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  来源: {block.provenance.source} / {block.provenance.identifier} |{' '}
                  {new Date(block.provenance.timestamp).toLocaleString('zh-CN')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>质量指标</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tokens</Label>
                <div className="text-sm space-y-1 mt-1">
                  <div>
                    总计: {metrics.tokens.total} / {metrics.tokens.budget}
                    {metrics.tokens.overBudget && (
                      <Badge variant="destructive" className="ml-2">超预算</Badge>
                    )}
                  </div>
                  <div>使用率: {(metrics.tokens.overBudgetRate * 100).toFixed(1)}%</div>
                </div>
              </div>
              <div>
                <Label>Blocks</Label>
                <div className="text-sm space-y-1 mt-1">
                  <div>总计: {metrics.blocks.total}</div>
                  <div>Public: {metrics.blocks.public}</div>
                  <div>Private: {metrics.blocks.private}</div>
                  <div>Compressed: {metrics.blocks.compressed ? '是' : '否'}</div>
                </div>
              </div>
              <div>
                <Label>质量</Label>
                <div className="text-sm space-y-1 mt-1">
                  <div>
                    等级: <Badge>{metrics.quality.quality}</Badge>
                  </div>
                  <div>命中率: {(metrics.quality.hitRate * 100).toFixed(1)}%</div>
                  <div>噪音率: {(metrics.quality.noiseRate * 100).toFixed(1)}%</div>
                  <div>相关性: {metrics.quality.relevanceScore.toFixed(2)}</div>
                </div>
              </div>
              <div>
                <Label>性能</Label>
                <div className="text-sm space-y-1 mt-1">
                  <div>构建时间: {metrics.performance.buildTimeMs}ms</div>
                  <div>
                    缓存: {metrics.performance.cacheHit ? (
                      <Badge variant="default">命中</Badge>
                    ) : (
                      <Badge variant="outline">未命中</Badge>
                    )}
                  </div>
                  {metrics.performance.skillsCalled && metrics.performance.skillsCalled.length > 0 && (
                    <div>
                      Skills: {metrics.performance.skillsCalled.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
