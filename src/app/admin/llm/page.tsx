'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getLLMModels, getLLMUsage, getLLMCost } from '@/services/rag-llm';
import type {
  LLMModelsResponse,
  LLMUsageStats,
  LLMUsageStatsBySubAgent,
  LLMCostResponse,
} from '@/types/api';
import { Loader2, Cpu, BarChart3, DollarSign, RefreshCw } from 'lucide-react';

export default function LLMPage() {
  // 模型列表
  const [models, setModels] = useState<LLMModelsResponse | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);

  // Token 使用统计
  const [usageStats, setUsageStats] = useState<LLMUsageStats | LLMUsageStatsBySubAgent | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageParams, setUsageParams] = useState({
    subAgent: '',
    provider: '',
    startTime: '',
    endTime: '',
  });

  // 成本统计
  const [costStats, setCostStats] = useState<LLMCostResponse | null>(null);
  const [costLoading, setCostLoading] = useState(false);
  const [costParams, setCostParams] = useState({
    subAgent: '',
    provider: '',
    startTime: '',
    endTime: '',
  });

  // 加载模型列表
  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    setModelsLoading(true);
    try {
      const result = await getLLMModels();
      if (result) {
        setModels(result);
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
    } finally {
      setModelsLoading(false);
    }
  }

  // 获取 Token 使用统计
  async function handleGetUsage() {
    setUsageLoading(true);
    try {
      const params: any = {};
      if (usageParams.subAgent) params.subAgent = usageParams.subAgent;
      if (usageParams.provider && usageParams.provider !== 'all') params.provider = usageParams.provider;
      if (usageParams.startTime) params.startTime = usageParams.startTime;
      if (usageParams.endTime) params.endTime = usageParams.endTime;

      const result = await getLLMUsage(params);
      if (result) {
        setUsageStats(result);
      }
    } catch (error) {
      console.error('获取 Token 使用统计失败:', error);
      alert('获取统计失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setUsageLoading(false);
    }
  }

  // 获取成本统计
  async function handleGetCost() {
    setCostLoading(true);
    try {
      const params: any = {};
      if (costParams.subAgent) params.subAgent = costParams.subAgent;
      if (costParams.provider && costParams.provider !== 'all') params.provider = costParams.provider;
      if (costParams.startTime) params.startTime = costParams.startTime;
      if (costParams.endTime) params.endTime = costParams.endTime;

      const result = await getLLMCost(params);
      if (result) {
        setCostStats(result);
      }
    } catch (error) {
      console.error('获取成本统计失败:', error);
      alert('获取成本统计失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setCostLoading(false);
    }
  }

  // 判断是否为按 Sub-Agent 的统计
  const isSubAgentStats = (stats: LLMUsageStats | LLMUsageStatsBySubAgent): stats is LLMUsageStatsBySubAgent => {
    return 'subAgent' in stats;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">LLM 管理</h1>
        <p className="text-muted-foreground mt-2">管理 LLM 模型、Token 使用和成本统计</p>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">
            <Cpu className="mr-2 h-4 w-4" />
            模型列表
          </TabsTrigger>
          <TabsTrigger value="usage">
            <BarChart3 className="mr-2 h-4 w-4" />
            Token 使用
          </TabsTrigger>
          <TabsTrigger value="cost">
            <DollarSign className="mr-2 h-4 w-4" />
            成本统计
          </TabsTrigger>
        </TabsList>

        {/* 模型列表 */}
        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>可用模型列表</CardTitle>
              <CardDescription>查看系统中可用的 LLM 模型</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={loadModels} disabled={modelsLoading}>
                {modelsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新
                  </>
                )}
              </Button>

              {models && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">默认提供商</div>
                      <div className="text-lg font-semibold">{models.defaultProvider}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">总模型数</div>
                      <div className="text-lg font-semibold">{models.totalModels}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">可用模型数</div>
                      <div className="text-lg font-semibold">{models.availableModels}</div>
                    </div>
                  </div>

                  {models.models.map((providerGroup, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-lg">{providerGroup.provider}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {providerGroup.models.map((model, modelIdx) => (
                            <div
                              key={modelIdx}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <div className="font-medium">{model.label}</div>
                                <div className="text-sm text-muted-foreground">{model.name}</div>
                              </div>
                              <Badge variant={model.available ? 'default' : 'secondary'}>
                                {model.available ? '可用' : '不可用'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Token 使用统计 */}
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token 使用统计</CardTitle>
              <CardDescription>查看 LLM Token 使用情况</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usageSubAgent">Sub-Agent（可选）</Label>
                  <Select
                    value={usageParams.subAgent || 'all'}
                    onValueChange={(value) => setUsageParams({ ...usageParams, subAgent: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger id="usageSubAgent">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="PlannerAgent">PlannerAgent</SelectItem>
                      <SelectItem value="GatekeeperAgent">GatekeeperAgent</SelectItem>
                      <SelectItem value="NarratorAgent">NarratorAgent</SelectItem>
                      <SelectItem value="ComplianceAgent">ComplianceAgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="usageProvider">提供商（可选）</Label>
                  <Select
                    value={usageParams.provider}
                    onValueChange={(value) => setUsageParams({ ...usageParams, provider: value })}
                  >
                    <SelectTrigger id="usageProvider">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                      <SelectItem value="gemini">Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="usageStartTime">开始时间（可选）</Label>
                  <Input
                    id="usageStartTime"
                    type="datetime-local"
                    value={usageParams.startTime}
                    onChange={(e) => setUsageParams({ ...usageParams, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="usageEndTime">结束时间（可选）</Label>
                  <Input
                    id="usageEndTime"
                    type="datetime-local"
                    value={usageParams.endTime}
                    onChange={(e) => setUsageParams({ ...usageParams, endTime: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleGetUsage} disabled={usageLoading}>
                {usageLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    获取统计
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {usageStats && (
            <div className="space-y-4">
              {isSubAgentStats(usageStats) ? (
                <Card>
                  <CardHeader>
                    <CardTitle>按 Sub-Agent 统计</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Sub-Agent</div>
                      <div className="text-lg font-semibold">{usageStats.subAgent.sub_agent}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">总 Token</div>
                        <div className="text-lg font-semibold">{usageStats.subAgent.tokens.total_tokens.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Prompt Token</div>
                        <div className="text-lg font-semibold">{usageStats.subAgent.tokens.total_prompt_tokens.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Completion Token</div>
                        <div className="text-lg font-semibold">{usageStats.subAgent.tokens.total_completion_tokens.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">总调用次数</div>
                        <div className="text-lg font-semibold">{usageStats.subAgent.calls.total_calls}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">成功率</div>
                        <div className="text-lg font-semibold">
                          {(usageStats.subAgent.calls.success_rate * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>总体统计</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">总 Token</div>
                        <div className="text-lg font-semibold">{usageStats.totalTokens.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Prompt Token</div>
                        <div className="text-lg font-semibold">{usageStats.totalPromptTokens.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Completion Token</div>
                        <div className="text-lg font-semibold">{usageStats.totalCompletionTokens.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">总调用次数</div>
                        <div className="text-lg font-semibold">{usageStats.totalCalls}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">成功率</div>
                        <div className="text-lg font-semibold">{(usageStats.successRate * 100).toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">平均 Token/调用</div>
                        <div className="text-lg font-semibold">{usageStats.avgTokensPerCall.toLocaleString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* 成本统计 */}
        <TabsContent value="cost" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>成本统计</CardTitle>
              <CardDescription>查看 LLM 调用成本</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="costSubAgent">Sub-Agent（可选）</Label>
                  <Select
                    value={costParams.subAgent || 'all'}
                    onValueChange={(value) => setCostParams({ ...costParams, subAgent: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger id="costSubAgent">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="PlannerAgent">PlannerAgent</SelectItem>
                      <SelectItem value="GatekeeperAgent">GatekeeperAgent</SelectItem>
                      <SelectItem value="NarratorAgent">NarratorAgent</SelectItem>
                      <SelectItem value="ComplianceAgent">ComplianceAgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="costProvider">提供商（可选）</Label>
                  <Select
                    value={costParams.provider}
                    onValueChange={(value) => setCostParams({ ...costParams, provider: value })}
                  >
                    <SelectTrigger id="costProvider">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                      <SelectItem value="gemini">Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="costStartTime">开始时间（可选）</Label>
                  <Input
                    id="costStartTime"
                    type="datetime-local"
                    value={costParams.startTime}
                    onChange={(e) => setCostParams({ ...costParams, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="costEndTime">结束时间（可选）</Label>
                  <Input
                    id="costEndTime"
                    type="datetime-local"
                    value={costParams.endTime}
                    onChange={(e) => setCostParams({ ...costParams, endTime: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleGetCost} disabled={costLoading}>
                {costLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    获取成本统计
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {costStats && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>总成本</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${costStats.totalCost.toFixed(4)} {costStats.currency}
                  </div>
                </CardContent>
              </Card>

              {costStats.byProvider && Object.keys(costStats.byProvider).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>按提供商分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(costStats.byProvider).map(([provider, cost]) => (
                        <div key={provider} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-medium">{provider}</span>
                          <span className="text-lg">${cost.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {costStats.bySubAgent && Object.keys(costStats.bySubAgent).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>按 Sub-Agent 分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(costStats.bySubAgent).map(([subAgent, cost]) => (
                        <div key={subAgent} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-medium">{subAgent}</span>
                          <span className="text-lg">${cost.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {costStats.breakdown && costStats.breakdown.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>详细分解</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {costStats.breakdown.map((item, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium">{item.provider} - {item.model}</div>
                              <div className="text-sm text-muted-foreground">
                                调用: {item.calls} | Token: {item.tokens.toLocaleString()}
                              </div>
                            </div>
                            <div className="text-lg font-semibold">${item.cost.toFixed(4)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
