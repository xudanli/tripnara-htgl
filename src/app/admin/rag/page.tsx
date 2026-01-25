'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getRAGStats,
  indexRAGDocument,
  batchIndexRAGDocuments,
  refreshComplianceRules,
  generateSegmentNarrative,
  refreshLocalInsight,
  getRAGDocuments,
  getRAGDocument,
  updateRAGDocument,
  deleteRAGDocument,
  // RAG 评估
  evaluateRAG,
  evaluateRAGBatch,
  // query-document 对收集
  collectQueryPair,
  collectQueryPairFromQuery,
  collectQueryPairBatch,
  getQueryPairs,
  exportQueryPairsForEvaluation,
  // 新接口
  retrieveChunks,
  searchRAG,
  retrieveRAG,
  rebuildKnowledgeBaseIndex,
  clearKnowledgeBaseIndex,
  generateRouteNarrative,
  extractRailPassRules,
  extractTrailAccessRules,
  extractComplianceRules,
  getLocalInsight,
  answerRouteQuestion,
  explainWhyNotOtherRoute,
  getDestinationInsights,
  // 评估与测试集
  evaluateChunkRetrieval,
  evaluateChunkRetrievalBatch,
  getEvaluationTestset,
  saveEvaluationTestset,
  runEvaluationTestset,
  findChunksForTestset,
  listChunksForTestset,
  // 监控指标
  getRAGMonitoringMetrics,
  getRAGPerformanceMetrics,
  getRAGQualityMetrics,
  getRAGCostMetrics,
  resetRAGMonitoringMetrics,
  // 缓存管理
  getRAGCacheStats,
  resetRAGCacheStats,
  clearRAGCache,
  // 新接口
  ragRetrieveWithFallback,
  ragChat,
  gateEvaluate,
  getRAGPrometheusMetrics,
  getRAGMetricsStats,
  ragToolWeather,
  ragToolPlaces,
  ragToolBrowse,
  runRAGEvaluationTestset,
} from '@/services/rag-llm';
import type {
  RAGStatsResponse,
  RAGIndexDocumentRequest,
  RAGSegmentNarrativeResponse,
  RAGLocalInsightRefreshResponse,
  RAGDocumentsResponse,
  RAGDocument,
  UpdateRAGDocumentRequest,
  // RAG 评估
  EvaluateRAGRequest,
  EvaluateRAGResponse,
  EvaluateRAGBatchRequest,
  EvaluateRAGBatchResponse,
  // query-document 对收集
  CollectQueryPairRequest,
  CollectQueryPairResponse,
  CollectQueryPairFromQueryRequest,
  CollectQueryPairFromQueryResponse,
  CollectQueryPairBatchRequest,
  CollectQueryPairBatchResponse,
  GetQueryPairsParams,
  GetQueryPairsResponse,
  ExportQueryPairsForEvaluationRequest,
  ExportQueryPairsForEvaluationResponse,
} from '@/types/api';
import {
  Loader2,
  BarChart3,
  Upload,
  Shield,
  BookOpen,
  RefreshCw,
  FileText,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileCheck,
  Download,
  Database,
  MessageSquare,
  MapPin,
  Sparkles,
  Activity,
  TrendingUp,
  DollarSign,
  HardDrive,
  Tag,
  Cloud,
  Globe,
  Wrench,
  Gauge,
  ShieldCheck,
} from 'lucide-react';

export default function RAGPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">RAG 管理</h1>
        <p className="text-muted-foreground mt-2">管理 RAG 知识库和搜索</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 h-4 w-4" />
            概览
          </TabsTrigger>
          <TabsTrigger value="knowledge-base">
            <Database className="mr-2 h-4 w-4" />
            知识库
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="mr-2 h-4 w-4" />
            内容管理
          </TabsTrigger>
          <TabsTrigger value="testing">
            <CheckCircle className="mr-2 h-4 w-4" />
            测试评估
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Activity className="mr-2 h-4 w-4" />
            监控优化
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Sparkles className="mr-2 h-4 w-4" />
            高级功能
          </TabsTrigger>
        </TabsList>

        {/* 概览 */}
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>

        {/* 知识库管理 */}
        <TabsContent value="knowledge-base" className="space-y-4">
          <KnowledgeBaseManagementTab />
        </TabsContent>

        {/* 内容管理 */}
        <TabsContent value="content" className="space-y-4">
          <ContentManagementTab />
        </TabsContent>

        {/* 测试评估 */}
        <TabsContent value="testing" className="space-y-4">
          <TestingEvaluationTab />
        </TabsContent>

        {/* 监控优化 */}
        <TabsContent value="monitoring" className="space-y-4">
          <MonitoringOptimizationTab />
        </TabsContent>

        {/* 高级功能 */}
        <TabsContent value="advanced" className="space-y-4">
          <AdvancedFeaturesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 文档管理标签页组件
function DocumentsManagementTab() {
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [pagination, setPagination] = useState<{ page: number; pageSize: number; total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 筛选条件
  const [filters, setFilters] = useState({
    collection: '',
    countryCode: '',
    tags: '',
    search: '',
    page: 1,
    pageSize: 20,
  });

  // 选中的文档（用于编辑/删除）
  const [selectedDocument, setSelectedDocument] = useState<RAGDocument | null>(null);
  const [editForm, setEditForm] = useState<Partial<UpdateRAGDocumentRequest>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // 加载文档列表
  async function loadDocuments() {
    setLoading(true);
    try {
      const params: any = {
        page: filters.page,
        pageSize: filters.pageSize,
      };
      if (filters.collection && filters.collection !== 'all') params.collection = filters.collection;
      if (filters.countryCode) params.countryCode = filters.countryCode;
      if (filters.tags) params.tags = filters.tags;
      if (filters.search) params.search = filters.search;

      const result = await getRAGDocuments(params);
      if (result) {
        setDocuments(result.documents);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('加载文档列表失败:', error);
      alert('加载失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  }

  // 加载文档详情
  async function loadDocumentDetail(id: string) {
    try {
      const doc = await getRAGDocument(id);
      if (doc) {
        setSelectedDocument(doc);
        setEditForm({
          title: doc.title,
          content: doc.content,
          collection: doc.collection,
          countryCode: doc.countryCode,
          tags: doc.tags,
          source: doc.source,
          metadata: doc.metadata,
        });
      }
    } catch (error) {
      console.error('加载文档详情失败:', error);
      alert('加载失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  }

  // 更新文档
  async function handleUpdateDocument() {
    if (!selectedDocument) return;

    setEditLoading(true);
    try {
      const result = await updateRAGDocument(selectedDocument.id, editForm);
      if (result) {
        alert('文档更新成功');
        setSelectedDocument(null);
        setEditForm({});
        loadDocuments();
      }
    } catch (error) {
      console.error('更新文档失败:', error);
      alert('更新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setEditLoading(false);
    }
  }

  // 关闭编辑对话框
  function handleCloseDialog() {
    setSelectedDocument(null);
    setEditForm({});
  }

  // 删除文档
  async function handleDeleteDocument(id: string) {
    if (!confirm('确定要删除这个文档吗？此操作不可恢复。')) return;

    setDeleteLoading(id);
    try {
      const result = await deleteRAGDocument(id);
      if (result) {
        alert('文档删除成功');
        if (selectedDocument?.id === id) {
          setSelectedDocument(null);
        }
        loadDocuments();
      }
    } catch (error) {
      console.error('删除文档失败:', error);
      alert('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setDeleteLoading(null);
    }
  }

  // 初始化加载
  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <div className="space-y-6">
      {/* 筛选条件 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                文档管理
              </CardTitle>
              <CardDescription>查看和管理 RAG 知识库中的文档</CardDescription>
            </div>
            <Button onClick={loadDocuments} disabled={loading} variant="outline" size="sm">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  刷新中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新
                </>
              )}
            </Button>
          </div>
        </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="filterCollection">集合</Label>
                <Select
                  value={filters.collection}
                  onValueChange={(value) => {
                    setFilters({ ...filters, collection: value, page: 1 });
                    setTimeout(loadDocuments, 0);
                  }}
                >
                  <SelectTrigger id="filterCollection">
                    <SelectValue placeholder="全部集合" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部集合</SelectItem>
                    <SelectItem value="travel_guides">travel_guides</SelectItem>
                    <SelectItem value="compliance_rules">compliance_rules</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filterCountryCode">国家代码</Label>
                <Input
                  id="filterCountryCode"
                  value={filters.countryCode}
                  onChange={(e) => setFilters({ ...filters, countryCode: e.target.value })}
                  placeholder="IS, JP..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setFilters({ ...filters, page: 1 });
                      loadDocuments();
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="filterTags">标签（逗号分隔）</Label>
                <Input
                  id="filterTags"
                  value={filters.tags}
                  onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                  placeholder="attractions, tips..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setFilters({ ...filters, page: 1 });
                      loadDocuments();
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="filterSearch">搜索关键词</Label>
                <div className="flex gap-2">
                  <Input
                    id="filterSearch"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="搜索标题或内容..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setFilters({ ...filters, page: 1 });
                        loadDocuments();
                      }
                    }}
                  />
                  <Button onClick={() => { setFilters({ ...filters, page: 1 }); loadDocuments(); }} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 文档列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>文档列表</CardTitle>
              {pagination && (
                <Badge variant="outline">
                  共 {pagination.total} 条文档
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>

            {loading && documents.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无文档</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Card 
                    key={doc.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedDocument?.id === doc.id ? 'ring-2 ring-primary shadow-md' : ''}`}
                    onClick={() => loadDocumentDetail(doc.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base truncate">{doc.title || '无标题'}</h3>
                            <Badge variant="outline" className="text-xs">{doc.collection}</Badge>
                            {doc.countryCode && (
                              <Badge variant="secondary" className="text-xs">{doc.countryCode}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {doc.contentPreview || doc.content.substring(0, 150)}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            {doc.source && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                来源: {doc.source}
                              </span>
                            )}
                            {doc.tags && doc.tags.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                标签: {doc.tags.slice(0, 3).join(', ')}{doc.tags.length > 3 ? '...' : ''}
                              </span>
                            )}
                            <span>创建: {new Date(doc.createdAt).toLocaleDateString('zh-CN')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadDocumentDetail(doc.id);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(doc.id);
                            }}
                            disabled={deleteLoading === doc.id}
                          >
                            {deleteLoading === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* 分页 */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      共 {pagination.total} 条，第 {pagination.page} / {pagination.totalPages} 页
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (filters.page > 1) {
                            setFilters({ ...filters, page: filters.page - 1 });
                            setTimeout(loadDocuments, 0);
                          }
                        }}
                        disabled={filters.page <= 1 || loading}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        上一页
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (pagination && filters.page < pagination.totalPages) {
                            setFilters({ ...filters, page: filters.page + 1 });
                            setTimeout(loadDocuments, 0);
                          }
                        }}
                        disabled={!pagination || filters.page >= pagination.totalPages || loading}
                      >
                        下一页
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      {/* 编辑对话框 */}
      <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑文档</DialogTitle>
            <DialogDescription>
              {selectedDocument ? `文档 ID: ${selectedDocument.id}` : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editTitle">标题</Label>
                <Input
                  id="editTitle"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editCollection">集合</Label>
                <Select
                  value={editForm.collection || ''}
                  onValueChange={(value) => setEditForm({ ...editForm, collection: value })}
                >
                  <SelectTrigger id="editCollection">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="travel_guides">travel_guides</SelectItem>
                    <SelectItem value="compliance_rules">compliance_rules</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editCountryCode">国家代码</Label>
                  <Input
                    id="editCountryCode"
                    value={editForm.countryCode || ''}
                    onChange={(e) => setEditForm({ ...editForm, countryCode: e.target.value })}
                    placeholder="IS"
                  />
                </div>
                <div>
                  <Label htmlFor="editSource">来源</Label>
                  <Input
                    id="editSource"
                    value={editForm.source || ''}
                    onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editTags">标签（逗号分隔）</Label>
                <Input
                  id="editTags"
                  value={editForm.tags?.join(',') || ''}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="attractions, tips..."
                />
              </div>
              <div>
                <Label htmlFor="editContent">内容 *</Label>
                <Textarea
                  id="editContent"
                  value={editForm.content || ''}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={12}
                  placeholder="文档内容..."
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  字符数: {editForm.content?.length || 0}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button onClick={handleUpdateDocument} disabled={editLoading}>
              {editLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 文档索引标签页组件
function DocumentIndexTab() {
  const [indexForm, setIndexForm] = useState<Partial<RAGIndexDocumentRequest>>({
    content: '',
    title: '',
    collection: 'travel_guides',
    countryCode: '',
    tags: [],
    source: '',
  });
  const [indexLoading, setIndexLoading] = useState(false);
  const [indexResult, setIndexResult] = useState<string | null>(null);

  const [batchDocuments, setBatchDocuments] = useState<string>('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<{ ids: string[]; count: number } | null>(null);

  async function handleIndexDocument() {
    if (!indexForm.content || !indexForm.collection) {
      alert('请填写内容和集合名称');
      return;
    }

    setIndexLoading(true);
    try {
      const result = await indexRAGDocument({
        content: indexForm.content!,
        collection: indexForm.collection!,
        title: indexForm.title || undefined,
        countryCode: indexForm.countryCode || undefined,
        tags: indexForm.tags && indexForm.tags.length > 0 ? indexForm.tags : undefined,
        source: indexForm.source || undefined,
      });

      if (result) {
        setIndexResult(result.id);
        setIndexForm({ ...indexForm, content: '', title: '' });
      }
    } catch (error) {
      console.error('索引文档失败:', error);
      alert('索引失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIndexLoading(false);
    }
  }

  async function handleBatchIndex() {
    if (!batchDocuments.trim()) {
      alert('请输入文档内容（JSON 数组格式）');
      return;
    }

    setBatchLoading(true);
    try {
      const docs = JSON.parse(batchDocuments);
      const result = await batchIndexRAGDocuments(docs);
      if (result) {
        setBatchResult({ ids: result.ids, count: result.count });
        setBatchDocuments('');
      }
    } catch (error) {
      console.error('批量索引失败:', error);
      alert('批量索引失败: ' + (error instanceof Error ? error.message : 'JSON 格式错误'));
    } finally {
      setBatchLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">单次索引</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{indexResult ? 1 : 0}</div>
            <div className="text-xs text-muted-foreground mt-1">本次会话已索引</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">批量索引</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batchResult?.count || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">本次会话已批量索引</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">总索引数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(indexResult ? 1 : 0) + (batchResult?.count || 0)}</div>
            <div className="text-xs text-muted-foreground mt-1">本次会话总计</div>
          </CardContent>
        </Card>
      </div>

      {/* 索引表单 - 使用 Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>文档索引</CardTitle>
          <CardDescription>将文档添加到 RAG 知识库索引</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">单个索引</TabsTrigger>
              <TabsTrigger value="batch">批量索引</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="indexContent">文档内容 *</Label>
                  <Textarea
                    id="indexContent"
                    value={indexForm.content}
                    onChange={(e) => setIndexForm({ ...indexForm, content: e.target.value })}
                    placeholder="输入文档内容..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    字符数: {indexForm.content?.length || 0}
                  </p>
                </div>
                <div>
                  <Label htmlFor="indexTitle">标题</Label>
                  <Input
                    id="indexTitle"
                    value={indexForm.title}
                    onChange={(e) => setIndexForm({ ...indexForm, title: e.target.value })}
                    placeholder="文档标题"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="indexCollection">集合 *</Label>
                  <Select
                    value={indexForm.collection}
                    onValueChange={(value) => setIndexForm({ ...indexForm, collection: value })}
                  >
                    <SelectTrigger id="indexCollection" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="travel_guides">travel_guides</SelectItem>
                      <SelectItem value="compliance_rules">compliance_rules</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="indexCountryCode">国家代码</Label>
                  <Input
                    id="indexCountryCode"
                    value={indexForm.countryCode}
                    onChange={(e) => setIndexForm({ ...indexForm, countryCode: e.target.value })}
                    placeholder="IS, JP..."
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="indexTags">标签（逗号分隔）</Label>
                  <Input
                    id="indexTags"
                    value={indexForm.tags?.join(',') || ''}
                    onChange={(e) =>
                      setIndexForm({
                        ...indexForm,
                        tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      })
                    }
                    placeholder="attractions, tips..."
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="indexSource">来源</Label>
                  <Input
                    id="indexSource"
                    value={indexForm.source}
                    onChange={(e) => setIndexForm({ ...indexForm, source: e.target.value })}
                    placeholder="文档来源"
                    className="h-9"
                  />
                </div>
              </div>
              <Button onClick={handleIndexDocument} disabled={indexLoading} className="w-full">
                {indexLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    索引中...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    索引文档
                  </>
                )}
              </Button>
              {indexResult && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm font-medium text-green-800">✓ 文档已成功索引</div>
                  <div className="text-xs text-green-700 mt-1">文档 ID: {indexResult}</div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="batch" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="batchDocuments">文档列表（JSON 数组格式）*</Label>
                <Textarea
                  id="batchDocuments"
                  value={batchDocuments}
                  onChange={(e) => setBatchDocuments(e.target.value)}
                  placeholder='[\n  {\n    "content": "文档1内容...",\n    "title": "文档1",\n    "collection": "travel_guides",\n    "countryCode": "IS",\n    "tags": ["attractions"]\n  },\n  ...\n]'
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  字符数: {batchDocuments.length} | 行数: {batchDocuments.split('\n').length}
                </p>
              </div>
              <Button onClick={handleBatchIndex} disabled={batchLoading} className="w-full">
                {batchLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    批量索引中...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    批量索引
                  </>
                )}
              </Button>
              {batchResult && (
                <div className="p-4 bg-green-50 border border-green-200 rounded space-y-2">
                  <div className="text-sm font-medium text-green-800">
                    ✓ 成功索引 {batchResult.count} 个文档
                  </div>
                  <div className="text-xs text-green-700">
                    <div className="font-medium mb-1">文档 IDs (前10个):</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {batchResult.ids.slice(0, 10).map((id, idx) => (
                        <div key={idx} className="font-mono">{id}</div>
                      ))}
                      {batchResult.ids.length > 10 && (
                        <div className="text-muted-foreground">... 还有 {batchResult.ids.length - 10} 个</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// 合规规则标签页组件
function ComplianceRulesTab() {
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [refreshResult, setRefreshResult] = useState<string | null>(null);
  const [refreshHistory, setRefreshHistory] = useState<Array<{ type: 'compliance' | 'local'; time: Date; result: string }>>([]);

  const [localInsightRefreshForm, setLocalInsightRefreshForm] = useState({
    countryCode: '',
    tags: '',
    region: '',
  });
  const [localInsightRefreshLoading, setLocalInsightRefreshLoading] = useState(false);
  const [localInsightRefreshResult, setLocalInsightRefreshResult] = useState<RAGLocalInsightRefreshResponse | null>(null);

  async function handleRefreshCompliance() {
    setRefreshLoading(true);
    try {
      const result = await refreshComplianceRules();
      if (result) {
        setRefreshResult(result.message);
        setRefreshHistory(prev => [{ type: 'compliance', time: new Date(), result: result.message }, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('刷新合规规则失败:', error);
      alert('刷新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setRefreshLoading(false);
    }
  }

  async function handleRefreshLocalInsight() {
    if (!localInsightRefreshForm.countryCode || !localInsightRefreshForm.tags) {
      alert('请填写国家代码和标签');
      return;
    }

    setLocalInsightRefreshLoading(true);
    try {
      const result = await refreshLocalInsight({
        countryCode: localInsightRefreshForm.countryCode,
        tags: localInsightRefreshForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        region: localInsightRefreshForm.region || undefined,
      });
      if (result) {
        setLocalInsightRefreshResult(result);
        setRefreshHistory(prev => [{
          type: 'local',
          time: new Date(),
          result: `${result.countryCode} - ${result.tags.join(', ')}${result.region ? ` (${result.region})` : ''}`
        }, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('刷新当地洞察失败:', error);
      alert('刷新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLocalInsightRefreshLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* 左侧：操作表单 (2/3) */}
      <div className="col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>刷新合规规则缓存</CardTitle>
          <CardDescription>
            手动触发合规规则缓存的刷新。当知识库中的合规规则文档更新后，需要调用此接口使缓存失效并重新加载最新规则。
            <br />
            <span className="text-xs text-muted-foreground">
              注意：刷新操作是异步的，返回成功只表示刷新任务已启动。
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRefreshCompliance} disabled={refreshLoading}>
            {refreshLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                刷新中...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                刷新合规规则
              </>
            )}
          </Button>
          {refreshResult && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-sm text-green-800">{refreshResult}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>提取 Rail Pass 规则</CardTitle>
          <CardDescription>从知识库中提取指定 Rail Pass 类型的规则</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RailPassExtractForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>提取 Trail Access 规则</CardTitle>
          <CardDescription>从知识库中提取指定路线的准入规则</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TrailAccessExtractForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>刷新当地洞察缓存</CardTitle>
          <CardDescription>
            手动触发指定地区的当地洞察信息缓存刷新。当更新了某个地区的旅行攻略、文化礼仪等信息后，调用此接口使对应的缓存失效。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="refreshLocalCountryCode">国家代码 *</Label>
              <Input
                id="refreshLocalCountryCode"
                value={localInsightRefreshForm.countryCode}
                onChange={(e) =>
                  setLocalInsightRefreshForm({ ...localInsightRefreshForm, countryCode: e.target.value.toUpperCase() })
                }
                placeholder="IS"
                maxLength={2}
              />
              <p className="text-xs text-muted-foreground mt-1">ISO 3166-1 alpha-2 格式</p>
            </div>
            <div>
              <Label htmlFor="refreshLocalTags">标签（逗号分隔） *</Label>
              <Input
                id="refreshLocalTags"
                value={localInsightRefreshForm.tags}
                onChange={(e) =>
                  setLocalInsightRefreshForm({ ...localInsightRefreshForm, tags: e.target.value })
                }
                placeholder="culture, tips, etiquette"
              />
              <p className="text-xs text-muted-foreground mt-1">
                可用标签: culture, tips, etiquette, hidden_gems, food, transport, travel-guide
              </p>
            </div>
            <div>
              <Label htmlFor="refreshLocalRegion">地区（可选）</Label>
              <Input
                id="refreshLocalRegion"
                value={localInsightRefreshForm.region}
                onChange={(e) =>
                  setLocalInsightRefreshForm({ ...localInsightRefreshForm, region: e.target.value })
                }
                placeholder="Reykjavik"
              />
              <p className="text-xs text-muted-foreground mt-1">不指定则刷新全国范围</p>
            </div>
          </div>
          <Button onClick={handleRefreshLocalInsight} disabled={localInsightRefreshLoading}>
            {localInsightRefreshLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                刷新中...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                刷新当地洞察
              </>
            )}
          </Button>
          {localInsightRefreshResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded space-y-2">
              <div className="text-sm font-medium text-green-800">刷新成功</div>
              <div className="text-xs text-green-700 space-y-1">
                <div>国家代码: {localInsightRefreshResult.countryCode}</div>
                <div>标签: {localInsightRefreshResult.tags.join(', ')}</div>
                {localInsightRefreshResult.region && <div>地区: {localInsightRefreshResult.region}</div>}
                <div>刷新时间: {new Date(localInsightRefreshResult.refreshedAt).toLocaleString('zh-CN')}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* 右侧：操作历史 (1/3) */}
      <div className="col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>操作历史</CardTitle>
            <CardDescription>最近的刷新操作记录</CardDescription>
          </CardHeader>
          <CardContent>
            {refreshHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                暂无操作记录
              </div>
            ) : (
              <div className="space-y-3">
                {refreshHistory.map((item, idx) => (
                  <div key={idx} className="p-3 border rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant={item.type === 'compliance' ? 'default' : 'secondary'} className="text-xs">
                        {item.type === 'compliance' ? '合规规则' : '当地洞察'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.time.toLocaleTimeString('zh-CN')}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {item.result}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// RAG 评估标签页组件 - 重新设计的信息架构
function RAGEvaluationTab() {
  const [evaluateLoading, setEvaluateLoading] = useState(false);
  const [batchEvaluateLoading, setBatchEvaluateLoading] = useState(false);
  
  // 单次评估参数
  const [query, setQuery] = useState('');
  const [collection, setCollection] = useState('compliance');
  const [countryCode, setCountryCode] = useState('IS');
  const [tags, setTags] = useState('');
  const [limit, setLimit] = useState(10);
  const [minScore, setMinScore] = useState(0.5);
  const [groundTruthIds, setGroundTruthIds] = useState('');
  const [evaluateResult, setEvaluateResult] = useState<EvaluateRAGResponse | null>(null);
  
  // 批量评估参数
  const [batchTestCases, setBatchTestCases] = useState('');
  const [batchEvaluateResult, setBatchEvaluateResult] = useState<EvaluateRAGBatchResponse | null>(null);

  // 单次评估
  async function handleEvaluate() {
    if (!query || !groundTruthIds) {
      alert('请填写查询和正确答案文档ID');
      return;
    }
    
    setEvaluateLoading(true);
    try {
      const request: EvaluateRAGRequest = {
        query,
        params: {
          query,
          collection,
          countryCode,
          tags: tags ? tags.split(',').map(s => s.trim()) : undefined,
          limit,
          minScore,
        },
        groundTruthDocumentIds: groundTruthIds.split(',').map(s => s.trim()),
      };
      
      const result = await evaluateRAG(request);
      if (result) {
        setEvaluateResult(result);
      }
    } catch (error) {
      console.error('评估失败:', error);
      alert('评估失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setEvaluateLoading(false);
    }
  }

  // 批量评估
  async function handleBatchEvaluate() {
    if (!batchTestCases) {
      alert('请填写测试用例（JSON格式）');
      return;
    }
    
    setBatchEvaluateLoading(true);
    try {
      let testCases;
      try {
        testCases = JSON.parse(batchTestCases);
      } catch (e) {
        alert('测试用例格式错误，请使用有效的JSON格式');
        return;
      }
      
      const request: EvaluateRAGBatchRequest = {
        testCases,
      };
      
      const result = await evaluateRAGBatch(request);
      if (result) {
        setBatchEvaluateResult(result);
      }
    } catch (error) {
      console.error('批量评估失败:', error);
      alert('批量评估失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setBatchEvaluateLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 两栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：评估结果展示（主要功能，占2/3） */}
        <div className="lg:col-span-2 space-y-4">
          {/* 单次评估结果 */}
          {evaluateResult && (
            <Card>
              <CardHeader>
                <CardTitle>单次评估结果</CardTitle>
                <CardDescription>查询: {query}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 关键指标卡片 */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {evaluateResult.recallAtK['10'] ? (evaluateResult.recallAtK['10'] * 100).toFixed(1) : '0'}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Recall@10</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {(evaluateResult.mrr * 100).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">MRR</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {evaluateResult.ndcg['10'] ? (evaluateResult.ndcg['10'] * 100).toFixed(1) : '0'}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">NDCG@10</p>
                    </CardContent>
                  </Card>
                </div>

                {/* 详细指标 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Recall@K</Label>
                    <div className="space-y-1">
                      {Object.entries(evaluateResult.recallAtK).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-sm">
                          <span>Recall@{k}:</span>
                          <Badge variant="secondary">{(v * 100).toFixed(1)}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">NDCG@K</Label>
                    <div className="space-y-1">
                      {Object.entries(evaluateResult.ndcg).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-sm">
                          <span>NDCG@{k}:</span>
                          <Badge variant="secondary">{(v * 100).toFixed(1)}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 检索结果 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">检索到的文档 ({evaluateResult.retrievedIds.length} 个)</Label>
                  <div className="flex flex-wrap gap-2">
                    {evaluateResult.retrievedIds.map((id, idx) => (
                      <Badge 
                        key={idx} 
                        variant={evaluateResult.retrievedIds.indexOf(id) < evaluateResult.retrievedIds.length ? "default" : "outline"}
                        className="text-xs"
                      >
                        {id} ({evaluateResult.scores[idx]?.toFixed(3)})
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 批量评估结果 */}
          {batchEvaluateResult && (
            <Card>
              <CardHeader>
                <CardTitle>批量评估结果</CardTitle>
                <CardDescription>
                  共评估 {batchEvaluateResult.perQueryResults.length} 个查询
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 平均指标卡片 */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {batchEvaluateResult.averageRecallAtK['10'] 
                          ? (batchEvaluateResult.averageRecallAtK['10'] * 100).toFixed(1) 
                          : '0'}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">平均 Recall@10</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {(batchEvaluateResult.averageMRR * 100).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">平均 MRR</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {batchEvaluateResult.averageNDCGAtK['10'] 
                          ? (batchEvaluateResult.averageNDCGAtK['10'] * 100).toFixed(1) 
                          : '0'}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">平均 NDCG@10</p>
                    </CardContent>
                  </Card>
                </div>

                {/* 详细指标 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">平均 Recall@K</Label>
                    <div className="space-y-1">
                      {Object.entries(batchEvaluateResult.averageRecallAtK).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-sm">
                          <span>Recall@{k}:</span>
                          <Badge variant="secondary">{(v * 100).toFixed(1)}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">平均 NDCG@K</Label>
                    <div className="space-y-1">
                      {Object.entries(batchEvaluateResult.averageNDCGAtK).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-sm">
                          <span>NDCG@{k}:</span>
                          <Badge variant="secondary">{(v * 100).toFixed(1)}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 每个查询的详细结果表格 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">每个查询的详细结果</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">查询</TableHead>
                          <TableHead className="w-[80px]">Recall@10</TableHead>
                          <TableHead className="w-[80px]">MRR</TableHead>
                          <TableHead className="w-[80px]">NDCG@10</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batchEvaluateResult.perQueryResults.map((result, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium max-w-[200px] truncate" title={result.query}>
                              {result.query}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {(result.recallAtK['10'] * 100).toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {(result.mrr * 100).toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {(result.ndcg['10'] * 100).toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 空状态提示 */}
          {!evaluateResult && !batchEvaluateResult && (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">暂无评估结果</p>
                <p className="text-sm text-muted-foreground mt-1">请在右侧表单中执行评估</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：评估表单（次要功能，占1/3） */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">评估配置</CardTitle>
              <CardDescription className="text-xs">配置评估参数并执行评估</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single" className="text-xs">单次评估</TabsTrigger>
                  <TabsTrigger value="batch" className="text-xs">批量评估</TabsTrigger>
                </TabsList>
                
                {/* 单次评估表单 */}
                <TabsContent value="single" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs">查询 *</Label>
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="冰岛 F-road 需要什么车辆？"
                      className="h-9"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs">集合</Label>
                      <Input
                        value={collection}
                        onChange={(e) => setCollection(e.target.value)}
                        placeholder="compliance"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">国家代码</Label>
                      <Input
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        placeholder="IS"
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">正确答案文档ID *</Label>
                    <Input
                      value={groundTruthIds}
                      onChange={(e) => setGroundTruthIds(e.target.value)}
                      placeholder="doc-123, doc-456"
                      className="h-9"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs">返回数量</Label>
                      <Input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(parseInt(e.target.value))}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">最小分数</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={minScore}
                        onChange={(e) => setMinScore(parseFloat(e.target.value))}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <Button onClick={handleEvaluate} disabled={evaluateLoading} className="w-full" size="sm">
                    {evaluateLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        评估中...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        执行评估
                      </>
                    )}
                  </Button>
                </TabsContent>

                {/* 批量评估表单 */}
                <TabsContent value="batch" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs">测试用例 (JSON格式) *</Label>
                    <Textarea
                      value={batchTestCases}
                      onChange={(e) => setBatchTestCases(e.target.value)}
                      placeholder={`[\n  {\n    "query": "...",\n    "params": {...},\n    "groundTruthDocumentIds": ["doc-123"]\n  }\n]`}
                      rows={8}
                      className="text-xs font-mono"
                    />
                  </div>
                  <Button onClick={handleBatchEvaluate} disabled={batchEvaluateLoading} className="w-full" size="sm">
                    {batchEvaluateLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        批量评估中...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        批量评估
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Query-Pairs 收集标签页组件 - 重新设计的信息架构
function QueryPairsTab() {
  const [collectLoading, setCollectLoading] = useState(false);
  const [collectFromQueryLoading, setCollectFromQueryLoading] = useState(false);
  const [batchCollectLoading, setBatchCollectLoading] = useState(false);
  const [getPairsLoading, setGetPairsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // 收集参数
  const [query, setQuery] = useState('');
  const [correctDocumentIds, setCorrectDocumentIds] = useState('');
  const [source, setSource] = useState<'USER_QUERY' | 'MANUAL_ANNOTATION' | 'AUTO_ANNOTATION'>('MANUAL_ANNOTATION');
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [collection, setCollection] = useState('compliance');
  const [countryCode, setCountryCode] = useState('IS');
  const [tags, setTags] = useState('');
  
  // 从查询自动收集参数
  const [autoQuery, setAutoQuery] = useState('');
  const [retrievedResults, setRetrievedResults] = useState('');
  const [clickedIds, setClickedIds] = useState('');
  const [relevantIds, setRelevantIds] = useState('');
  const [irrelevantIds, setIrrelevantIds] = useState('');
  
  // 批量收集参数
  const [batchPairs, setBatchPairs] = useState('');
  
  // 查询参数
  const [querySource, setQuerySource] = useState<'USER_QUERY' | 'MANUAL_ANNOTATION' | 'AUTO_ANNOTATION' | 'ALL' | ''>('');
  const [queryCollection, setQueryCollection] = useState('');
  const [queryCountryCode, setQueryCountryCode] = useState('');
  const [queryLimit, setQueryLimit] = useState(100);
  const [queryPairsResult, setQueryPairsResult] = useState<GetQueryPairsResponse | null>(null);
  
  // 导出参数
  const [exportPairs, setExportPairs] = useState('');
  const [exportResult, setExportResult] = useState<ExportQueryPairsForEvaluationResponse | null>(null);

  // 收集 query-document 对
  async function handleCollect() {
    if (!query || !correctDocumentIds) {
      alert('请填写查询和正确答案文档ID');
      return;
    }
    
    setCollectLoading(true);
    try {
      const request: CollectQueryPairRequest = {
        query,
        correctDocumentIds: correctDocumentIds.split(',').map(s => s.trim()),
        metadata: {
          source,
          userId: userId || undefined,
          sessionId: sessionId || undefined,
          collection: collection || undefined,
          countryCode: countryCode || undefined,
          tags: tags ? tags.split(',').map(s => s.trim()) : undefined,
        },
      };
      
      const result = await collectQueryPair(request);
      if (result) {
        alert(`收集成功: ${result.pairId}`);
        // 收集成功后刷新列表
        handleGetPairs();
        // 清空表单
        setQuery('');
        setCorrectDocumentIds('');
      }
    } catch (error) {
      console.error('收集失败:', error);
      alert('收集失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setCollectLoading(false);
    }
  }

  // 从用户查询自动收集
  async function handleCollectFromQuery() {
    if (!autoQuery || !retrievedResults) {
      alert('请填写查询和检索结果');
      return;
    }
    
    setCollectFromQueryLoading(true);
    try {
      let retrieved;
      try {
        retrieved = JSON.parse(retrievedResults);
      } catch (e) {
        alert('检索结果格式错误，请使用有效的JSON格式');
        return;
      }
      
      const request: CollectQueryPairFromQueryRequest = {
        query: autoQuery,
        retrievedResults: retrieved,
        userFeedback: {
          clickedDocumentIds: clickedIds ? clickedIds.split(',').map(s => s.trim()) : undefined,
          relevantDocumentIds: relevantIds ? relevantIds.split(',').map(s => s.trim()) : undefined,
          irrelevantDocumentIds: irrelevantIds ? irrelevantIds.split(',').map(s => s.trim()) : undefined,
        },
      };
      
      const result = await collectQueryPairFromQuery(request);
      if (result) {
        alert(`收集成功: ${result.pairId}\n正确答案: ${result.correctDocumentIds.join(', ')}`);
        // 收集成功后刷新列表
        handleGetPairs();
        // 清空表单
        setAutoQuery('');
        setRetrievedResults('');
        setClickedIds('');
        setRelevantIds('');
        setIrrelevantIds('');
      }
    } catch (error) {
      console.error('自动收集失败:', error);
      alert('自动收集失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setCollectFromQueryLoading(false);
    }
  }

  // 批量收集
  async function handleBatchCollect() {
    if (!batchPairs) {
      alert('请填写批量对（JSON格式）');
      return;
    }
    
    setBatchCollectLoading(true);
    try {
      let pairs;
      try {
        pairs = JSON.parse(batchPairs);
      } catch (e) {
        alert('批量对格式错误，请使用有效的JSON格式');
        return;
      }
      
      const request: CollectQueryPairBatchRequest = {
        pairs,
      };
      
      const result = await collectQueryPairBatch(request);
      if (result) {
        alert(`批量收集成功: ${result.successCount}/${result.totalCount}`);
        // 收集成功后刷新列表
        handleGetPairs();
        // 清空表单
        setBatchPairs('');
      }
    } catch (error) {
      console.error('批量收集失败:', error);
      alert('批量收集失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setBatchCollectLoading(false);
    }
  }

  // 获取 query-pairs
  async function handleGetPairs() {
    setGetPairsLoading(true);
    try {
      const params: GetQueryPairsParams = {
        source: querySource === 'ALL' ? undefined : (querySource || undefined),
        collection: queryCollection || undefined,
        countryCode: queryCountryCode || undefined,
        limit: queryLimit,
      };
      
      const result = await getQueryPairs(params);
      if (result) {
        setQueryPairsResult(result);
      }
    } catch (error) {
      console.error('获取query-pairs失败:', error);
      alert('获取query-pairs失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setGetPairsLoading(false);
    }
  }

  // 导出为评估数据集格式
  async function handleExport() {
    if (!exportPairs) {
      alert('请填写要导出的对（JSON格式）');
      return;
    }
    
    setExportLoading(true);
    try {
      let pairs;
      try {
        pairs = JSON.parse(exportPairs);
      } catch (e) {
        alert('导出对格式错误，请使用有效的JSON格式');
        return;
      }
      
      const request: ExportQueryPairsForEvaluationRequest = {
        pairs,
      };
      
      const result = await exportQueryPairsForEvaluation(request);
      if (result) {
        setExportResult(result);
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      {queryPairsResult && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{queryPairsResult.total}</div>
              <p className="text-xs text-muted-foreground mt-1">总收集数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {queryPairsResult.pairs.filter(p => p.metadata?.source === 'MANUAL_ANNOTATION').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">手动标注</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {queryPairsResult.pairs.filter(p => p.metadata?.source === 'AUTO_ANNOTATION').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">自动标注</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {queryPairsResult.pairs.filter(p => p.metadata?.source === 'USER_QUERY').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">用户查询</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 主要内容区域：两栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：任务列表（主要功能，占2/3） */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Query-Document 对任务列表</CardTitle>
                  <CardDescription>查看和管理已收集的 query-document 对</CardDescription>
                </div>
                {queryPairsResult && (
                  <Badge variant="secondary" className="text-sm">
                    共 {queryPairsResult.total} 条
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 筛选和搜索 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b">
                <div className="space-y-2">
                  <Label className="text-xs">来源</Label>
                  <Select value={querySource || undefined} onValueChange={(v) => setQuerySource(v === 'ALL' ? '' : (v as typeof querySource))}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">全部</SelectItem>
                      <SelectItem value="USER_QUERY">用户查询</SelectItem>
                      <SelectItem value="MANUAL_ANNOTATION">手动标注</SelectItem>
                      <SelectItem value="AUTO_ANNOTATION">自动标注</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">集合</Label>
                  <Input
                    value={queryCollection}
                    onChange={(e) => setQueryCollection(e.target.value)}
                    placeholder="compliance"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">国家代码</Label>
                  <Input
                    value={queryCountryCode}
                    onChange={(e) => setQueryCountryCode(e.target.value)}
                    placeholder="IS"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">数量限制</Label>
                  <Input
                    type="number"
                    value={queryLimit}
                    onChange={(e) => setQueryLimit(parseInt(e.target.value))}
                    className="h-9"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleGetPairs} disabled={getPairsLoading} size="sm">
                  {getPairsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      查询中...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      查询
                    </>
                  )}
                </Button>
                {queryPairsResult && (
                  <Button
                    variant="outline"
                    onClick={handleGetPairs}
                    disabled={getPairsLoading}
                    size="sm"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新
                  </Button>
                )}
              </div>
              
              {/* 任务列表表格 */}
              {queryPairsResult && (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">查询</TableHead>
                        <TableHead>正确答案文档</TableHead>
                        <TableHead className="w-[100px]">来源</TableHead>
                        <TableHead className="w-[100px]">集合</TableHead>
                        <TableHead className="w-[80px]">国家</TableHead>
                        <TableHead className="text-right w-[100px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queryPairsResult.pairs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            暂无数据，请先收集 query-document 对
                          </TableCell>
                        </TableRow>
                      ) : (
                        queryPairsResult.pairs.map((pair) => (
                          <TableRow key={pair.id}>
                            <TableCell className="font-medium max-w-[300px]">
                              <div className="truncate" title={pair.query}>
                                {pair.query}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {pair.correctDocumentIds.slice(0, 2).map((id, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {id}
                                  </Badge>
                                ))}
                                {pair.correctDocumentIds.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{pair.correctDocumentIds.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {pair.metadata?.source === 'MANUAL_ANNOTATION' ? '手动' :
                                 pair.metadata?.source === 'AUTO_ANNOTATION' ? '自动' :
                                 pair.metadata?.source === 'USER_QUERY' ? '用户' : '-'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{pair.metadata?.collection || '-'}</TableCell>
                            <TableCell className="text-sm">{pair.metadata?.countryCode || '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setQuery(pair.query);
                                    setCorrectDocumentIds(pair.correctDocumentIds.join(', '));
                                    setSource(pair.metadata?.source || 'MANUAL_ANNOTATION');
                                    setCollection(pair.metadata?.collection || '');
                                    setCountryCode(pair.metadata?.countryCode || '');
                                    setTags((pair.metadata?.tags as string[])?.join(', ') || '');
                                    document.getElementById('collect-section')?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  title="编辑"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    const exportData = [{
                                      query: pair.query,
                                      correctDocumentIds: pair.correctDocumentIds,
                                    }];
                                    setExportPairs(JSON.stringify(exportData, null, 2));
                                    document.getElementById('export-section')?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  title="导出"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：收集功能（次要功能，占1/3） */}
        <div className="space-y-4" id="collect-section">
          {/* 手动收集 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">快速收集</CardTitle>
              <CardDescription className="text-xs">手动添加 query-document 对</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">查询 *</Label>
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="冰岛 F-road 需要什么车辆？"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">正确答案文档ID *</Label>
                  <Input
                    value={correctDocumentIds}
                    onChange={(e) => setCorrectDocumentIds(e.target.value)}
                    placeholder="doc-123, doc-456"
                    className="h-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs">集合</Label>
                    <Input
                      value={collection}
                      onChange={(e) => setCollection(e.target.value)}
                      placeholder="compliance"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">国家代码</Label>
                    <Input
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      placeholder="IS"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">来源</Label>
                  <Select value={source} onValueChange={(v) => setSource(v as typeof source)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL_ANNOTATION">手动标注</SelectItem>
                      <SelectItem value="USER_QUERY">用户查询</SelectItem>
                      <SelectItem value="AUTO_ANNOTATION">自动标注</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCollect} disabled={collectLoading} className="w-full" size="sm">
                {collectLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    收集中...
                  </>
                ) : (
                  <>
                    <FileCheck className="mr-2 h-4 w-4" />
                    收集
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 高级收集选项（使用 Tabs） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">高级收集</CardTitle>
              <CardDescription className="text-xs">批量收集和自动收集</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="batch" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="batch" className="text-xs">批量收集</TabsTrigger>
                  <TabsTrigger value="auto" className="text-xs">自动收集</TabsTrigger>
                </TabsList>
                <TabsContent value="batch" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs">批量对 (JSON格式) *</Label>
                    <Textarea
                      value={batchPairs}
                      onChange={(e) => setBatchPairs(e.target.value)}
                      placeholder={`[\n  {\n    "query": "...",\n    "correctDocumentIds": ["doc-123"]\n  }\n]`}
                      rows={6}
                      className="text-xs font-mono"
                    />
                  </div>
                  <Button onClick={handleBatchCollect} disabled={batchCollectLoading} className="w-full" size="sm">
                    {batchCollectLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        批量收集中...
                      </>
                    ) : (
                      <>
                        <FileCheck className="mr-2 h-4 w-4" />
                        批量收集
                      </>
                    )}
                  </Button>
                </TabsContent>
                <TabsContent value="auto" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs">查询 *</Label>
                    <Input
                      value={autoQuery}
                      onChange={(e) => setAutoQuery(e.target.value)}
                      placeholder="冰岛 F-road 需要什么车辆？"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">检索结果 (JSON) *</Label>
                    <Textarea
                      value={retrievedResults}
                      onChange={(e) => setRetrievedResults(e.target.value)}
                      placeholder={`[{"id": "doc-123", "score": 0.85}]`}
                      rows={4}
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">相关文档ID (可选)</Label>
                    <Input
                      value={relevantIds}
                      onChange={(e) => setRelevantIds(e.target.value)}
                      placeholder="doc-123, doc-456"
                      className="h-9"
                    />
                  </div>
                  <Button onClick={handleCollectFromQuery} disabled={collectFromQueryLoading} className="w-full" size="sm">
                    {collectFromQueryLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        收集中...
                      </>
                    ) : (
                      <>
                        <FileCheck className="mr-2 h-4 w-4" />
                        自动收集
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 导出功能 */}
          <Card id="export-section">
            <CardHeader>
              <CardTitle className="text-lg">导出数据</CardTitle>
              <CardDescription className="text-xs">导出为评估数据集格式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">要导出的对 (JSON格式) *</Label>
                <Textarea
                  value={exportPairs}
                  onChange={(e) => setExportPairs(e.target.value)}
                  placeholder={`[\n  {\n    "query": "...",\n    "correctDocumentIds": ["doc-123"]\n  }\n]`}
                  rows={6}
                  className="text-xs font-mono"
                />
              </div>
              <Button onClick={handleExport} disabled={exportLoading} className="w-full" size="sm">
                {exportLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    导出中...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    导出
                  </>
                )}
              </Button>
              
              {exportResult && (
                <div className="mt-4 p-3 border rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm mb-2">评估数据集:</h4>
                  <pre className="text-xs bg-background p-2 rounded max-h-48 overflow-auto font-mono">
                    {JSON.stringify(exportResult.evaluationDataset, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 叙事生成标签页组件
function NarrativeGenerationTab() {
  const [segmentForm, setSegmentForm] = useState({
    segmentId: '',
    dayIndex: 1,
    name: '',
    description: '',
    countryCode: '',
  });
  const [segmentLoading, setSegmentLoading] = useState(false);
  const [segmentNarrative, setSegmentNarrative] = useState<RAGSegmentNarrativeResponse | null>(null);
  const [generationHistory, setGenerationHistory] = useState<Array<RAGSegmentNarrativeResponse>>([]);

  async function handleGenerateSegmentNarrative() {
    if (!segmentForm.segmentId || !segmentForm.name || !segmentForm.description || !segmentForm.countryCode) {
      alert('请填写所有必填字段');
      return;
    }

    setSegmentLoading(true);
    try {
      const result = await generateSegmentNarrative(segmentForm);
      if (result) {
        setSegmentNarrative(result);
        setGenerationHistory(prev => [result, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('生成路线段叙事失败:', error);
      alert('生成失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setSegmentLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* 左侧：生成表单 (2/3) */}
      <div className="col-span-2 space-y-4">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">本次生成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{segmentNarrative ? 1 : 0}</div>
              <div className="text-xs text-muted-foreground mt-1">当前会话已生成</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">历史记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{generationHistory.length}</div>
              <div className="text-xs text-muted-foreground mt-1">最近5次生成</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>生成路线叙事</CardTitle>
            <CardDescription>为指定路线方向生成完整叙事内容</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RouteNarrativeForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>生成路线段叙事</CardTitle>
            <CardDescription>为指定路线段生成叙事内容</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="segmentId">路线段 ID *</Label>
                <Input
                  id="segmentId"
                  value={segmentForm.segmentId}
                  onChange={(e) => setSegmentForm({ ...segmentForm, segmentId: e.target.value })}
                  placeholder="seg-001"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="dayIndex">天数索引 *</Label>
                <Input
                  id="dayIndex"
                  type="number"
                  value={segmentForm.dayIndex}
                  onChange={(e) => setSegmentForm({ ...segmentForm, dayIndex: Number(e.target.value) })}
                  min={1}
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="segmentName">名称 *</Label>
                <Input
                  id="segmentName"
                  value={segmentForm.name}
                  onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
                  placeholder="从雷克雅未克到辛格维利尔"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="segmentCountryCode">国家代码 *</Label>
                <Input
                  id="segmentCountryCode"
                  value={segmentForm.countryCode}
                  onChange={(e) => setSegmentForm({ ...segmentForm, countryCode: e.target.value.toUpperCase() })}
                  placeholder="IS"
                  maxLength={2}
                  className="h-9"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="segmentDescription">描述 *</Label>
                <Textarea
                  id="segmentDescription"
                  value={segmentForm.description}
                  onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })}
                  placeholder="早上出发..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  字符数: {segmentForm.description.length}
                </p>
              </div>
            </div>
            <Button onClick={handleGenerateSegmentNarrative} disabled={segmentLoading} className="w-full">
              {segmentLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  生成叙事
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 生成结果 */}
        {segmentNarrative && (
          <Card>
            <CardHeader>
              <CardTitle>生成结果</CardTitle>
              <CardDescription>最新生成的叙事内容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{segmentNarrative.narrative.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {segmentNarrative.narrative.content}
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-2 border-t">
                  {segmentNarrative.narrative.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">时长:</span>
                      <Badge variant="outline">{segmentNarrative.narrative.duration}</Badge>
                    </div>
                  )}
                  {segmentNarrative.narrative.scenery && segmentNarrative.narrative.scenery.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-muted-foreground">风景:</span>
                      <div className="flex flex-wrap gap-1">
                        {segmentNarrative.narrative.scenery.map((scenery, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {scenery}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 右侧：历史记录 (1/3) */}
      <div className="col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>生成历史</CardTitle>
            <CardDescription>最近生成的叙事记录</CardDescription>
          </CardHeader>
          <CardContent>
            {generationHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                暂无生成记录
              </div>
            ) : (
              <div className="space-y-3">
                {generationHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border rounded-lg space-y-2 cursor-pointer transition-colors ${
                      segmentNarrative?.narrative.title === item.narrative.title
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSegmentNarrative(item)}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm line-clamp-1">{item.narrative.title}</h4>
                      <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                        {item.segmentId}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.narrative.content}
                    </p>
                    {item.narrative.duration && (
                      <div className="text-xs text-muted-foreground">
                        时长: {item.narrative.duration}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 知识库管理标签页组件
function KnowledgeBaseTab() {
  const [rebuildLoading, setRebuildLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [rebuildResult, setRebuildResult] = useState<string | null>(null);
  const [clearResult, setClearResult] = useState<string | null>(null);

  async function handleRebuildIndex() {
    setRebuildLoading(true);
    setRebuildResult(null);
    try {
      const result = await rebuildKnowledgeBaseIndex();
      if (result) {
        setRebuildResult('知识库索引重建任务已启动，预计需要 10-20 分钟完成');
      } else {
        setRebuildResult('重建失败，请查看控制台错误信息');
      }
    } catch (error) {
      setRebuildResult(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setRebuildLoading(false);
    }
  }

  async function handleClearIndex() {
    if (!confirm('警告：此操作将删除所有知识库数据！确定要继续吗？')) {
      return;
    }
    setClearLoading(true);
    setClearResult(null);
    try {
      const result = await clearKnowledgeBaseIndex();
      if (result) {
        setClearResult('知识库索引已清空');
      } else {
        setClearResult('清空失败，请查看控制台错误信息');
      }
    } catch (error) {
      setClearResult(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setClearLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>知识库索引管理</CardTitle>
          <CardDescription>管理 RAG 知识库的索引，包括重建和清空操作</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">重建索引</CardTitle>
                <CardDescription>完整重建知识库索引，清空并重新索引所有文件</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>• 清空现有索引</p>
                  <p>• 扫描 KB_PATH 目录（默认: ./docs/iceland）</p>
                  <p>• 为每个 JSON 文件生成 embedding</p>
                  <p>• 存储到 knowledge_files 和 chunks 表</p>
                  <p className="mt-2 font-medium">执行时间: 约 10-20 分钟（23 个文件）</p>
                </div>
                <Button onClick={handleRebuildIndex} disabled={rebuildLoading} className="w-full">
                  {rebuildLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      重建中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      重建索引
                    </>
                  )}
                </Button>
                {rebuildResult && (
                  <div className={`p-3 rounded-lg text-sm ${rebuildResult.includes('失败') || rebuildResult.includes('错误') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    {rebuildResult}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">清空索引</CardTitle>
                <CardDescription>删除所有知识库数据（危险操作）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="text-destructive font-medium">⚠️ 警告：此操作将删除所有知识库数据！</p>
                  <p className="mt-2">• 删除所有 knowledge_files 记录</p>
                  <p>• 删除所有 chunks 记录</p>
                  <p>• 删除所有 embedding 向量</p>
                </div>
                <Button onClick={handleClearIndex} disabled={clearLoading} variant="destructive" className="w-full">
                  {clearLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      清空中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      清空索引
                    </>
                  )}
                </Button>
                {clearResult && (
                  <div className={`p-3 rounded-lg text-sm ${clearResult.includes('失败') || clearResult.includes('错误') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    {clearResult}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 检索测试标签页组件
function RetrieveTestTab() {
  const [retrieveType, setRetrieveType] = useState<'chunks' | 'search' | 'retrieve'>('chunks');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(5);
  const [credibilityMin, setCredibilityMin] = useState(0.5);
  const [collection, setCollection] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleRetrieve() {
    if (!query.trim()) {
      setError('请输入查询文本');
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      let result: any = null;
      if (retrieveType === 'chunks') {
        result = await retrieveChunks({
          query,
          limit,
          credibilityMin,
        });
      } else if (retrieveType === 'search') {
        result = await searchRAG({
          query,
          collection: collection || undefined,
          countryCode: countryCode || undefined,
          limit,
        });
      } else {
        result = await retrieveRAG({
          query,
          collection: collection || 'travel_guides',
          countryCode: countryCode || undefined,
          limit,
        });
      }
      if (result) {
        setResults(Array.isArray(result) ? result : result.data || []);
      } else {
        setError('检索失败，请查看控制台错误信息');
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>检索测试</CardTitle>
          <CardDescription>测试 RAG 检索接口，支持新的 Chunk 检索和传统检索</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>检索类型</Label>
            <Select value={retrieveType} onValueChange={(v: any) => setRetrieveType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chunks">Chunk 检索（新，推荐）⭐</SelectItem>
                <SelectItem value="search">RAG 搜索</SelectItem>
                <SelectItem value="retrieve">传统检索（旧）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="retrieveQuery">查询文本 *</Label>
            <Input
              id="retrieveQuery"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：冰岛租车保险"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retrieveLimit">返回数量</Label>
              <Input
                id="retrieveLimit"
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
                min={1}
                max={50}
              />
            </div>
            {retrieveType === 'chunks' && (
              <div>
                <Label htmlFor="credibilityMin">最小可信度</Label>
                <Input
                  id="credibilityMin"
                  type="number"
                  step="0.1"
                  value={credibilityMin}
                  onChange={(e) => setCredibilityMin(parseFloat(e.target.value) || 0.5)}
                  min={0}
                  max={1}
                />
              </div>
            )}
          </div>

          {(retrieveType === 'search' || retrieveType === 'retrieve') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="retrieveCollection">集合</Label>
                <Input
                  id="retrieveCollection"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  placeholder="travel_guides"
                />
              </div>
              <div>
                <Label htmlFor="retrieveCountryCode">国家代码</Label>
                <Input
                  id="retrieveCountryCode"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  placeholder="IS"
                />
              </div>
            </div>
          )}

          <Button onClick={handleRetrieve} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                检索中...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                开始检索
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">检索结果 ({results.length} 条)</div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((item, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {item.title && <div className="font-medium">{item.title}</div>}
                        {item.content && (
                          <div className="text-sm text-muted-foreground line-clamp-3">
                            {typeof item.content === 'string' ? item.content : JSON.stringify(item.content)}
                          </div>
                        )}
                        {item.similarity !== undefined && (
                          <Badge variant="outline">相似度: {(item.similarity * 100).toFixed(2)}%</Badge>
                        )}
                        {item.credibilityScore !== undefined && (
                          <Badge variant="outline">可信度: {(item.credibilityScore * 100).toFixed(2)}%</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 增强对话标签页组件
function ChatTab() {
  const [chatType, setChatType] = useState<'answer' | 'explain' | 'destination'>('answer');
  const [question, setQuestion] = useState('');
  const [routeDirectionId, setRouteDirectionId] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [alternativeRouteId, setAlternativeRouteId] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChat() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let response: any = null;
      if (chatType === 'answer') {
        if (!question.trim()) {
          setError('请输入问题');
          return;
        }
        response = await answerRouteQuestion({
          question,
          routeDirectionId: routeDirectionId || undefined,
          countryCode: countryCode || undefined,
        });
      } else if (chatType === 'explain') {
        if (!selectedRouteId || !alternativeRouteId) {
          setError('请填写路线 ID');
          return;
        }
        response = await explainWhyNotOtherRoute({
          selectedRouteId,
          alternativeRouteId,
          countryCode: countryCode || undefined,
        });
      } else {
        if (!placeId.trim()) {
          setError('请输入地点 ID');
          return;
        }
        response = await getDestinationInsights({
          placeId,
          countryCode: countryCode || undefined,
        });
      }
      if (response) {
        setResult(response);
      } else {
        setError('请求失败，请查看控制台错误信息');
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>增强对话</CardTitle>
          <CardDescription>使用 RAG 增强的对话功能，回答路线问题、解释路线选择、获取目的地信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>对话类型</Label>
            <Select value={chatType} onValueChange={(v: any) => setChatType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="answer">回答路线问题</SelectItem>
                <SelectItem value="explain">解释路线选择</SelectItem>
                <SelectItem value="destination">目的地深度信息</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {chatType === 'answer' && (
            <>
              <div>
                <Label htmlFor="chatQuestion">问题 *</Label>
                <Textarea
                  id="chatQuestion"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="例如：黄金圈适合冬天去吗？"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chatRouteDirectionId">路线方向 ID</Label>
                  <Input
                    id="chatRouteDirectionId"
                    value={routeDirectionId}
                    onChange={(e) => setRouteDirectionId(e.target.value)}
                    placeholder="route_001"
                  />
                </div>
                <div>
                  <Label htmlFor="chatCountryCode">国家代码</Label>
                  <Input
                    id="chatCountryCode"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="IS"
                  />
                </div>
              </div>
            </>
          )}

          {chatType === 'explain' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="selectedRouteId">已选路线 ID *</Label>
                  <Input
                    id="selectedRouteId"
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    placeholder="route_001"
                  />
                </div>
                <div>
                  <Label htmlFor="alternativeRouteId">备选路线 ID *</Label>
                  <Input
                    id="alternativeRouteId"
                    value={alternativeRouteId}
                    onChange={(e) => setAlternativeRouteId(e.target.value)}
                    placeholder="route_002"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="explainCountryCode">国家代码</Label>
                <Input
                  id="explainCountryCode"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  placeholder="IS"
                />
              </div>
            </>
          )}

          {chatType === 'destination' && (
            <>
              <div>
                <Label htmlFor="placeId">地点 ID *</Label>
                <Input
                  id="placeId"
                  value={placeId}
                  onChange={(e) => setPlaceId(e.target.value)}
                  placeholder="reykjavik"
                />
              </div>
              <div>
                <Label htmlFor="destCountryCode">国家代码</Label>
                <Input
                  id="destCountryCode"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  placeholder="IS"
                />
              </div>
            </>
          )}

          <Button onClick={handleChat} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                发送请求
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>响应结果</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm overflow-auto max-h-96 bg-muted p-4 rounded-lg">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Rail Pass 规则提取表单组件
function RailPassExtractForm() {
  const [passType, setPassType] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    if (!passType.trim()) {
      setError('请输入 Pass 类型');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await extractRailPassRules({
        passType,
        countryCode: countryCode || undefined,
      });
      if (response) {
        setResult(response);
      } else {
        setError('提取失败，请查看控制台错误信息');
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="railPassType">Pass 类型 *</Label>
          <Input
            id="railPassType"
            value={passType}
            onChange={(e) => setPassType(e.target.value)}
            placeholder="Eurail Global Pass"
          />
        </div>
        <div>
          <Label htmlFor="railPassCountryCode">国家代码</Label>
          <Input
            id="railPassCountryCode"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
            placeholder="IS"
            maxLength={2}
          />
        </div>
      </div>
      <Button onClick={handleExtract} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            提取中...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            提取规则
          </>
        )}
      </Button>
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>提取结果</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto max-h-96 bg-muted p-4 rounded-lg">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Trail Access 规则提取表单组件
function TrailAccessExtractForm() {
  const [trailId, setTrailId] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    if (!trailId.trim()) {
      setError('请输入路线 ID');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await extractTrailAccessRules({
        trailId,
        countryCode: countryCode || undefined,
      });
      if (response) {
        setResult(response);
      } else {
        setError('提取失败，请查看控制台错误信息');
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="trailId">路线 ID *</Label>
          <Input
            id="trailId"
            value={trailId}
            onChange={(e) => setTrailId(e.target.value)}
            placeholder="laugavegur"
          />
        </div>
        <div>
          <Label htmlFor="trailAccessCountryCode">国家代码</Label>
          <Input
            id="trailAccessCountryCode"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
            placeholder="IS"
            maxLength={2}
          />
        </div>
      </div>
      <Button onClick={handleExtract} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            提取中...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            提取规则
          </>
        )}
      </Button>
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>提取结果</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto max-h-96 bg-muted p-4 rounded-lg">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 路线叙事表单组件
function RouteNarrativeForm() {
  const [routeDirectionId, setRouteDirectionId] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [includeLocalInsights, setIncludeLocalInsights] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!routeDirectionId.trim()) {
      setError('请输入路线方向 ID');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await generateRouteNarrative(routeDirectionId, {
        countryCode: countryCode || undefined,
        includeLocalInsights,
      });
      if (response) {
        setResult(response);
      } else {
        setError('生成失败，请查看控制台错误信息');
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="routeDirectionId">路线方向 ID *</Label>
          <Input
            id="routeDirectionId"
            value={routeDirectionId}
            onChange={(e) => setRouteDirectionId(e.target.value)}
            placeholder="route_001"
          />
        </div>
        <div>
          <Label htmlFor="routeNarrativeCountryCode">国家代码</Label>
          <Input
            id="routeNarrativeCountryCode"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
            placeholder="IS"
            maxLength={2}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="includeLocalInsights"
          checked={includeLocalInsights}
          onChange={(e) => setIncludeLocalInsights(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="includeLocalInsights" className="cursor-pointer">
          包含当地洞察
        </Label>
      </div>
      <Button onClick={handleGenerate} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <BookOpen className="mr-2 h-4 w-4" />
            生成路线叙事
          </>
        )}
      </Button>
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>生成结果</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto max-h-96 bg-muted p-4 rounded-lg">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 评估测试集标签页组件
function EvaluationTestsetTab() {
  const [testset, setTestset] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  async function handleLoadTestset() {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvaluationTestset();
      if (data) {
        setTestset(data);
      } else {
        setError('获取测试集失败');
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTestset() {
    if (!testset) {
      setError('请先加载测试集');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const data = await saveEvaluationTestset(testset);
      if (data) {
        setError(null);
        alert('测试集保存成功');
      } else {
        setError('保存测试集失败');
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleRunTestset() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const data = await runEvaluationTestset({
        params: {
          useHybridSearch: true,
          useReranking: false,
          useQueryExpansion: false,
        },
        limit: 10,
      });
      if (data) {
        setResult(data);
      } else {
        setError('运行测试集评估失败');
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>评估测试集管理</CardTitle>
          <CardDescription>管理 RAG 评估测试集，运行评估并查看结果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleLoadTestset} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  加载中...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  加载测试集
                </>
              )}
            </Button>
            <Button onClick={handleSaveTestset} disabled={saving || !testset} variant="outline">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  保存测试集
                </>
              )}
            </Button>
            <Button onClick={handleRunTestset} disabled={running}>
              {running ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  运行中...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  运行评估
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {testset && (
            <Card>
              <CardHeader>
                <CardTitle>测试集内容</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm overflow-auto max-h-96 bg-muted p-4 rounded-lg">
                  {JSON.stringify(testset, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>评估结果</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm overflow-auto max-h-96 bg-muted p-4 rounded-lg">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <ChunkFinderTab />
    </div>
  );
}

// Chunk 查找器组件（用于测试集）
function ChunkFinderTab() {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [chunks, setChunks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleFindChunks() {
    if (!query.trim()) {
      setError('请输入查询文本');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await findChunksForTestset({ query, limit });
      if (data && data.chunks) {
        setChunks(data.chunks);
      } else {
        setError('查找失败');
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>查找相关 Chunks</CardTitle>
        <CardDescription>根据查询文本查找相关 chunks，用于填充测试集的 groundTruthChunkIds</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="chunkQuery">查询文本 *</Label>
            <Input
              id="chunkQuery"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：冰岛租车保险"
            />
          </div>
          <div>
            <Label htmlFor="chunkLimit">返回数量</Label>
            <Input
              id="chunkLimit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
              min={1}
              max={50}
            />
          </div>
        </div>
        <Button onClick={handleFindChunks} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              查找中...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              查找 Chunks
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {chunks.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">找到 {chunks.length} 个相关 chunks</div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {chunks.map((chunk, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">{chunk.chunkId || chunk.id}</div>
                      {chunk.content && (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {typeof chunk.content === 'string' ? chunk.content : JSON.stringify(chunk.content)}
                        </div>
                      )}
                      {chunk.similarity !== undefined && (
                        <Badge variant="outline">相似度: {(chunk.similarity * 100).toFixed(2)}%</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 监控指标标签页组件
function MonitoringTab() {
  const [metrics, setMetrics] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [quality, setQuality] = useState<any>(null);
  const [cost, setCost] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLoadMetrics() {
    setLoading(true);
    setError(null);
    try {
      const [metricsData, perfData, qualityData, costData] = await Promise.all([
        getRAGMonitoringMetrics(),
        getRAGPerformanceMetrics(),
        getRAGQualityMetrics(),
        getRAGCostMetrics(),
      ]);
      setMetrics(metricsData);
      setPerformance(perfData);
      setQuality(qualityData);
      setCost(costData);
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!confirm('确定要重置所有监控指标吗？')) {
      return;
    }
    setResetting(true);
    setError(null);
    try {
      await resetRAGMonitoringMetrics();
      alert('监控指标已重置');
      setMetrics(null);
      setPerformance(null);
      setQuality(null);
      setCost(null);
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setResetting(false);
    }
  }

  useEffect(() => {
    handleLoadMetrics();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>RAG 监控指标</CardTitle>
              <CardDescription>查看性能、质量、成本等监控指标</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleLoadMetrics} disabled={loading} variant="outline" size="sm">
                {loading ? (
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
              <Button onClick={handleReset} disabled={resetting} variant="destructive" size="sm">
                {resetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    重置中...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    重置
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performance && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    性能指标
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>总检索次数: {performance.totalRetrievals || 0}</div>
                    <div>平均延迟: {performance.averageLatency || 0}ms</div>
                    <div>P95 延迟: {performance.p95Latency || 0}ms</div>
                    <div>错误率: {((performance.errorRate || 0) * 100).toFixed(2)}%</div>
                    <div>吞吐量: {performance.throughput || 0} req/s</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {quality && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    质量指标
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {quality.averageRecallAtK && (
                      <div>
                        Recall@K: {JSON.stringify(quality.averageRecallAtK)}
                      </div>
                    )}
                    <div>平均 MRR: {(quality.averageMRR || 0).toFixed(3)}</div>
                    {quality.averageNDCGAtK && (
                      <div>
                        NDCG@K: {JSON.stringify(quality.averageNDCGAtK)}
                      </div>
                    )}
                    <div>评估总数: {quality.totalEvaluations || 0}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {cost && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    成本指标
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>Embedding 调用: {cost.totalEmbeddingCalls || 0}</div>
                    <div>LLM 调用: {cost.totalLLMCalls || 0}</div>
                    <div>Embedding 成本: ${(cost.embeddingCost || 0).toFixed(2)}</div>
                    <div>LLM 成本: ${(cost.llmCost || 0).toFixed(2)}</div>
                    <div className="font-medium">总成本: ${(cost.estimatedTotalCost || 0).toFixed(2)}</div>
                    <div>每次检索成本: ${(cost.costPerRetrieval || 0).toFixed(4)}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {metrics && metrics.cache && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <HardDrive className="mr-2 h-5 w-5" />
                    缓存指标
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>命中率: {((metrics.cache.hitRate || 0) * 100).toFixed(2)}%</div>
                    <div>总命中: {metrics.cache.totalHits || 0}</div>
                    <div>总未命中: {metrics.cache.totalMisses || 0}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {metrics && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>完整指标数据</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm overflow-auto max-h-96 bg-muted p-4 rounded-lg">
                  {JSON.stringify(metrics, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 缓存管理标签页组件
function CacheManagementTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleLoadStats() {
    setLoading(true);
    setError(null);
    try {
      const data = await getRAGCacheStats();
      if (data) {
        setStats(data);
      } else {
        setError('获取缓存统计失败');
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetStats() {
    setResetting(true);
    setError(null);
    setMessage(null);
    try {
      const data = await resetRAGCacheStats();
      if (data) {
        setMessage('缓存统计已重置');
        setStats(null);
      } else {
        setError('重置缓存统计失败');
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setResetting(false);
    }
  }

  async function handleClearCache() {
    if (!confirm('确定要清空所有 Embedding 缓存吗？注意：Redis 缓存需要手动清空。')) {
      return;
    }
    setClearing(true);
    setError(null);
    setMessage(null);
    try {
      const data = await clearRAGCache();
      if (data) {
        setMessage(data.message || '缓存已清空');
        setStats(null);
      } else {
        setError('清空缓存失败');
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setClearing(false);
    }
  }

  useEffect(() => {
    handleLoadStats();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>缓存管理</CardTitle>
          <CardDescription>管理 Embedding 缓存统计和清空缓存</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleLoadStats} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  加载中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新统计
                </>
              )}
            </Button>
            <Button onClick={handleResetStats} disabled={resetting} variant="outline">
              {resetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  重置中...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  重置统计
                </>
              )}
            </Button>
            <Button onClick={handleClearCache} disabled={clearing} variant="destructive">
              {clearing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  清空中...
                </>
              ) : (
                <>
                  <HardDrive className="mr-2 h-4 w-4" />
                  清空缓存
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm">
              {message}
            </div>
          )}

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>缓存统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{((stats.hitRate || 0) * 100).toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground">命中率</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalHits || 0}</div>
                    <div className="text-xs text-muted-foreground">总命中</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalMisses || 0}</div>
                    <div className="text-xs text-muted-foreground">总未命中</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalRequests || 0}</div>
                    <div className="text-xs text-muted-foreground">总请求数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.averageHitLatency || 0}ms</div>
                    <div className="text-xs text-muted-foreground">命中平均延迟</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.averageMissLatency || 0}ms</div>
                    <div className="text-xs text-muted-foreground">未命中平均延迟</div>
                  </div>
                </div>
                <div className="mt-4">
                  <pre className="text-sm overflow-auto max-h-48 bg-muted p-4 rounded-lg">
                    {JSON.stringify(stats, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== 重新设计的主标签页组件 ====================

// 概览标签页组件
function OverviewTab() {
  return (
    <div className="space-y-4">
      <StatsTabContent />
    </div>
  );
}

// 统计内容组件（从原来的 stats tab 提取）
function StatsTabContent() {
  const [stats, setStats] = useState<RAGStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsCollection, setStatsCollection] = useState('all');
  const [error, setError] = useState<string | null>(null);

  async function handleGetStats() {
    setStatsLoading(true);
    setError(null);
    try {
      const collection = statsCollection && statsCollection !== 'all' ? statsCollection : undefined;
      const result = await getRAGStats(collection);
      if (result) {
        setStats(result);
      } else {
        setError('获取统计失败');
      }
    } catch (error) {
      console.error('获取统计失败:', error);
      setError('获取统计失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setStatsLoading(false);
    }
  }

  useEffect(() => {
    handleGetStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* 查询控制 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>RAG 知识库统计</CardTitle>
              <CardDescription>查看知识库的整体统计信息和集合分布</CardDescription>
            </div>
            <Button onClick={handleGetStats} disabled={statsLoading} variant="outline" size="sm">
              {statsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  刷新中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="statsCollection">选择集合</Label>
              <Select
                value={statsCollection}
                onValueChange={(value) => {
                  setStatsCollection(value);
                  setTimeout(handleGetStats, 100);
                }}
              >
                <SelectTrigger id="statsCollection">
                  <SelectValue placeholder="全部集合" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部集合</SelectItem>
                  <SelectItem value="travel_guides">travel_guides</SelectItem>
                  <SelectItem value="compliance_rules">compliance_rules</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {statsLoading && !stats ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* 总体统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  总文档数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.totalDocuments}</div>
                <div className="text-xs text-muted-foreground mt-2">知识库文档总数</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Database className="mr-2 h-4 w-4" />
                  集合数量
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.collections?.length || 0}</div>
                <div className="text-xs text-muted-foreground mt-2">已创建的集合</div>
              </CardContent>
            </Card>
            {stats.byCollection ? (
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    当前集合文档数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{stats.byCollection.count}</div>
                  <div className="text-xs text-muted-foreground mt-2">{stats.byCollection.name}</div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    平均文档数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {stats.collections && stats.collections.length > 0
                      ? Math.round(stats.totalDocuments / stats.collections.length)
                      : 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">每个集合平均文档数</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 集合统计详情 */}
          {stats.collections && stats.collections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  集合统计详情
                </CardTitle>
                <CardDescription>各集合的文档分布和标签信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.collections.map((collection, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-base">{collection.name}</h3>
                          <Badge variant="default" className="text-sm">{collection.count} 文档</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {collection.countries && collection.countries.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              国家/地区
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {collection.countries.map((country, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {country}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {collection.tags && collection.tags.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground flex items-center">
                              <Tag className="mr-1 h-3 w-3" />
                              标签
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {collection.tags.slice(0, 5).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {collection.tags.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{collection.tags.length - 5}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 指定集合详情 */}
          {stats.byCollection && (
            <Card>
              <CardHeader>
                <CardTitle>指定集合详情</CardTitle>
                <CardDescription>当前查询集合的详细信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">{stats.byCollection.name}</h3>
                    <Badge variant="default" className="text-sm">{stats.byCollection.count} 文档</Badge>
                  </div>
                  {stats.byCollection.countries && stats.byCollection.countries.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">国家/地区</div>
                      <div className="flex flex-wrap gap-1">
                        {stats.byCollection.countries.map((country, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {stats.byCollection.tags && stats.byCollection.tags.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">标签</div>
                      <div className="flex flex-wrap gap-1">
                        {stats.byCollection.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}

// 知识库管理标签页组件（嵌套 Tabs）
function KnowledgeBaseManagementTab() {
  return (
    <Tabs defaultValue="index" className="space-y-4">
      <TabsList>
        <TabsTrigger value="index">
          <Upload className="mr-2 h-4 w-4" />
          文档索引
        </TabsTrigger>
        <TabsTrigger value="management">
          <Database className="mr-2 h-4 w-4" />
          索引管理
        </TabsTrigger>
      </TabsList>
      <TabsContent value="index">
        <DocumentIndexTab />
      </TabsContent>
      <TabsContent value="management">
        <KnowledgeBaseTab />
      </TabsContent>
    </Tabs>
  );
}

// 内容管理标签页组件（嵌套 Tabs）
function ContentManagementTab() {
  return (
    <Tabs defaultValue="documents" className="space-y-4">
      <TabsList>
        <TabsTrigger value="documents">
          <FileText className="mr-2 h-4 w-4" />
          文档管理
        </TabsTrigger>
        <TabsTrigger value="compliance">
          <Shield className="mr-2 h-4 w-4" />
          合规规则
        </TabsTrigger>
        <TabsTrigger value="narrative">
          <BookOpen className="mr-2 h-4 w-4" />
          叙事生成
        </TabsTrigger>
      </TabsList>
      <TabsContent value="documents">
        <DocumentsManagementTab />
      </TabsContent>
      <TabsContent value="compliance">
        <ComplianceRulesTab />
      </TabsContent>
      <TabsContent value="narrative">
        <NarrativeGenerationTab />
      </TabsContent>
    </Tabs>
  );
}

// 测试评估标签页组件（嵌套 Tabs）
function TestingEvaluationTab() {
  return (
    <Tabs defaultValue="retrieve" className="space-y-4">
      <TabsList>
        <TabsTrigger value="retrieve">
          <Search className="mr-2 h-4 w-4" />
          检索测试
        </TabsTrigger>
        <TabsTrigger value="evaluation">
          <CheckCircle className="mr-2 h-4 w-4" />
          质量评估
        </TabsTrigger>
        <TabsTrigger value="testset">
          <FileCheck className="mr-2 h-4 w-4" />
          测试集
        </TabsTrigger>
      </TabsList>
      <TabsContent value="retrieve">
        <RetrieveTestTab />
      </TabsContent>
      <TabsContent value="evaluation">
        <RAGEvaluationTab />
      </TabsContent>
      <TabsContent value="testset">
        <EvaluationTestsetTab />
      </TabsContent>
    </Tabs>
  );
}

// 监控优化标签页组件（嵌套 Tabs）
function MonitoringOptimizationTab() {
  return (
    <Tabs defaultValue="metrics" className="space-y-4">
      <TabsList>
        <TabsTrigger value="metrics">
          <Activity className="mr-2 h-4 w-4" />
          监控指标
        </TabsTrigger>
        <TabsTrigger value="prometheus">
          <Gauge className="mr-2 h-4 w-4" />
          Prometheus
        </TabsTrigger>
        <TabsTrigger value="cache">
          <HardDrive className="mr-2 h-4 w-4" />
          缓存管理
        </TabsTrigger>
      </TabsList>
      <TabsContent value="metrics">
        <MonitoringTab />
      </TabsContent>
      <TabsContent value="prometheus">
        <PrometheusMetricsTab />
      </TabsContent>
      <TabsContent value="cache">
        <CacheManagementTab />
      </TabsContent>
    </Tabs>
  );
}

// 高级功能标签页组件（嵌套 Tabs）
function AdvancedFeaturesTab() {
  return (
    <Tabs defaultValue="rag-retrieve" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="rag-retrieve">
          <Search className="mr-2 h-4 w-4" />
          RAG检索
        </TabsTrigger>
        <TabsTrigger value="rag-chat">
          <MessageSquare className="mr-2 h-4 w-4" />
          增强对话
        </TabsTrigger>
        <TabsTrigger value="gate-evaluate">
          <ShieldCheck className="mr-2 h-4 w-4" />
          Gate评估
        </TabsTrigger>
        <TabsTrigger value="tools">
          <Wrench className="mr-2 h-4 w-4" />
          工具调用
        </TabsTrigger>
        <TabsTrigger value="query-pairs">
          <FileCheck className="mr-2 h-4 w-4" />
          Query-Pairs
        </TabsTrigger>
      </TabsList>
      <TabsContent value="rag-retrieve">
        <RAGRetrieveTab />
      </TabsContent>
      <TabsContent value="rag-chat">
        <RAGChatTab />
      </TabsContent>
      <TabsContent value="gate-evaluate">
        <GateEvaluateTab />
      </TabsContent>
      <TabsContent value="tools">
        <RAGToolsTab />
      </TabsContent>
      <TabsContent value="query-pairs">
        <QueryPairsTab />
      </TabsContent>
    </Tabs>
  );
}

// RAG检索标签页（带降级策略）
function RAGRetrieveTab() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [options, setOptions] = useState({
    topK: 5,
    minScore: 0.7,
    enableReranking: true,
    enableQueryExpansion: false,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleRetrieve() {
    if (!query.trim()) {
      alert('请输入查询文本');
      return;
    }

    setLoading(true);
    try {
      const data = await ragRetrieveWithFallback({
        query,
        category: category || undefined,
        options,
      });
      setResult(data);
    } catch (error) {
      console.error('检索失败:', error);
      alert('检索失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>RAG查询检索（5层降级策略）</CardTitle>
          <CardDescription>执行RAG检索，支持自动降级策略</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="retrieve-query">查询文本 *</Label>
            <Textarea
              id="retrieve-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：冰岛蓝湖温泉现在开门吗"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retrieve-category">查询类别</Label>
              <Select value={category || 'all'} onValueChange={(value) => setCategory(value === 'all' ? '' : value)}>
                <SelectTrigger id="retrieve-category">
                  <SelectValue placeholder="选择类别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="WEATHER">WEATHER</SelectItem>
                  <SelectItem value="POI_HOURS">POI_HOURS</SelectItem>
                  <SelectItem value="RULES">RULES</SelectItem>
                  <SelectItem value="GENERAL">GENERAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="retrieve-topK">返回数量</Label>
              <Input
                id="retrieve-topK"
                type="number"
                value={options.topK}
                onChange={(e) => setOptions({ ...options, topK: parseInt(e.target.value) || 5 })}
                min={1}
                max={20}
              />
            </div>
            <div>
              <Label htmlFor="retrieve-minScore">最小相似度</Label>
              <Input
                id="retrieve-minScore"
                type="number"
                step="0.1"
                value={options.minScore}
                onChange={(e) => setOptions({ ...options, minScore: parseFloat(e.target.value) || 0.7 })}
                min={0}
                max={1}
              />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enable-reranking"
                  checked={options.enableReranking}
                  onChange={(e) => setOptions({ ...options, enableReranking: e.target.checked })}
                />
                <Label htmlFor="enable-reranking" className="cursor-pointer">启用重排序</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enable-expansion"
                  checked={options.enableQueryExpansion}
                  onChange={(e) => setOptions({ ...options, enableQueryExpansion: e.target.checked })}
                />
                <Label htmlFor="enable-expansion" className="cursor-pointer">启用查询扩展</Label>
              </div>
            </div>
          </div>
          <Button onClick={handleRetrieve} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                检索中...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                执行检索
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>检索结果</CardTitle>
            <CardDescription>
              降级层级: {result.fallbackLevel || 'N/A'} | 置信度: {result.confidence?.toFixed(3) || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.chunks && result.chunks.length > 0 ? (
                result.chunks.map((chunk: any, idx: number) => (
                  <Card key={idx} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{chunk.chunkId}</Badge>
                        <Badge>相似度: {(chunk.score || 0).toFixed(3)}</Badge>
                      </div>
                      <p className="text-sm mb-2">{chunk.content}</p>
                      {chunk.metadata && (
                        <div className="text-xs text-muted-foreground">
                          来源: {chunk.metadata.source} | 类别: {chunk.metadata.category}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {result.fallbackMessage || '未找到相关结果'}
                  {result.officialLinks && result.officialLinks.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">官方链接:</p>
                      {result.officialLinks.map((link: string, idx: number) => (
                        <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                          {link}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// RAG增强对话标签页
function RAGChatTab() {
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [category, setCategory] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleChat() {
    if (!message.trim()) {
      alert('请输入消息');
      return;
    }

    setLoading(true);
    try {
      const data = await ragChat({
        message,
        conversationId: conversationId || undefined,
        category: category || undefined,
      });
      setResult(data);
    } catch (error) {
      console.error('对话失败:', error);
      alert('对话失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>RAG增强对话</CardTitle>
          <CardDescription>基于RAG检索的增强对话，自动调用LLM生成回答</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="chat-message">用户消息 *</Label>
            <Textarea
              id="chat-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="例如：冰岛环岛路线推荐"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="chat-conversation-id">对话ID（可选）</Label>
              <Input
                id="chat-conversation-id"
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                placeholder="用于上下文"
              />
            </div>
            <div>
              <Label htmlFor="chat-category">查询类别</Label>
              <Select value={category || 'all'} onValueChange={(value) => setCategory(value === 'all' ? '' : value)}>
                <SelectTrigger id="chat-category">
                  <SelectValue placeholder="选择类别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="WEATHER">WEATHER</SelectItem>
                  <SelectItem value="POI_HOURS">POI_HOURS</SelectItem>
                  <SelectItem value="RULES">RULES</SelectItem>
                  <SelectItem value="GENERAL">GENERAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleChat} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                发送消息
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>回答</CardTitle>
            <CardDescription>
              降级层级: {result.fallbackLevel || 'N/A'} | 置信度: {result.confidence?.toFixed(3) || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{result.reply || '无回答'}</p>
              </div>
              {result.sources && result.sources.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">来源:</p>
                  {result.sources.map((source: any, idx: number) => (
                    <Card key={idx} className="mb-2">
                      <CardContent className="p-3">
                        <div className="font-medium text-sm">{source.title}</div>
                        <p className="text-xs text-muted-foreground mt-1">{source.snippet}</p>
                        {source.url && (
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">
                            {source.url}
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Gate决策评估标签页
function GateEvaluateTab() {
  const [request, setRequest] = useState({
    origin: '',
    destination: '',
    startDate: '',
    endDate: '',
    mode: 'drive',
    party: {
      adults: 2,
      children: 0,
      fitnessLevel: 'moderate',
    },
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleEvaluate() {
    if (!request.origin || !request.destination) {
      alert('请填写起点和终点');
      return;
    }

    setLoading(true);
    try {
      const data = await gateEvaluate({ request });
      setResult(data);
    } catch (error) {
      console.error('评估失败:', error);
      alert('评估失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gate决策评估</CardTitle>
          <CardDescription>评估路线/行程是否应该存在（Should-Exist Gate）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gate-origin">起点 *</Label>
              <Input
                id="gate-origin"
                value={request.origin}
                onChange={(e) => setRequest({ ...request, origin: e.target.value })}
                placeholder="例如：Reykjavik"
              />
            </div>
            <div>
              <Label htmlFor="gate-destination">终点 *</Label>
              <Input
                id="gate-destination"
                value={request.destination}
                onChange={(e) => setRequest({ ...request, destination: e.target.value })}
                placeholder="例如：Landmannalaugar"
              />
            </div>
            <div>
              <Label htmlFor="gate-start-date">开始日期</Label>
              <Input
                id="gate-start-date"
                type="date"
                value={request.startDate}
                onChange={(e) => setRequest({ ...request, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="gate-end-date">结束日期</Label>
              <Input
                id="gate-end-date"
                type="date"
                value={request.endDate}
                onChange={(e) => setRequest({ ...request, endDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="gate-mode">交通方式</Label>
              <Select value={request.mode} onValueChange={(value) => setRequest({ ...request, mode: value })}>
                <SelectTrigger id="gate-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drive">自驾</SelectItem>
                  <SelectItem value="walk">步行</SelectItem>
                  <SelectItem value="bike">骑行</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gate-fitness">体能等级</Label>
              <Select
                value={request.party.fitnessLevel}
                onValueChange={(value) => setRequest({ ...request, party: { ...request.party, fitnessLevel: value } })}
              >
                <SelectTrigger id="gate-fitness">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="moderate">中等</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gate-adults">成人数量</Label>
              <Input
                id="gate-adults"
                type="number"
                value={request.party.adults}
                onChange={(e) => setRequest({ ...request, party: { ...request.party, adults: parseInt(e.target.value) || 0 } })}
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="gate-children">儿童数量</Label>
              <Input
                id="gate-children"
                type="number"
                value={request.party.children}
                onChange={(e) => setRequest({ ...request, party: { ...request.party, children: parseInt(e.target.value) || 0 } })}
                min={0}
              />
            </div>
          </div>
          <Button onClick={handleEvaluate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                评估中...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                执行评估
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>评估结果</CardTitle>
            <CardDescription>
              结果: {result.gateResult || 'N/A'} | 置信度: {result.confidence?.toFixed(3) || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{result.decision || '无决策'}</p>
              </div>
              {result.violations && result.violations.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">违规项:</p>
                  {result.violations.map((violation: any, idx: number) => (
                    <Card key={idx} className="mb-2 border-l-4 border-l-red-500">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="destructive">{violation.type}</Badge>
                          <Badge>{violation.severity}</Badge>
                        </div>
                        <p className="text-sm">{violation.detail}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {result.requiredAdjustments && result.requiredAdjustments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">必需调整:</p>
                  {result.requiredAdjustments.map((adj: any, idx: number) => (
                    <Card key={idx} className="mb-2 border-l-4 border-l-yellow-500">
                      <CardContent className="p-3">
                        <div className="font-medium text-sm">{adj.action}</div>
                        <p className="text-xs text-muted-foreground mt-1">{adj.why}</p>
                        {adj.alternativeRoute && (
                          <p className="text-xs mt-1">替代路线: {adj.alternativeRoute}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 工具调用标签页
function RAGToolsTab() {
  const [activeTool, setActiveTool] = useState<'weather' | 'places' | 'browse'>('weather');
  const [weatherParams, setWeatherParams] = useState({ location: '', date: '' });
  const [placesParams, setPlacesParams] = useState({ query: '', fields: [] as string[] });
  const [browseParams, setBrowseParams] = useState({ url: '', query: '' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleWeather() {
    if (!weatherParams.location) {
      alert('请输入地点');
      return;
    }
    setLoading(true);
    try {
      const data = await ragToolWeather(weatherParams);
      setResult(data);
    } catch (error) {
      console.error('天气查询失败:', error);
      alert('查询失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  }

  async function handlePlaces() {
    if (!placesParams.query) {
      alert('请输入查询');
      return;
    }
    setLoading(true);
    try {
      const data = await ragToolPlaces(placesParams);
      setResult(data);
    } catch (error) {
      console.error('POI查询失败:', error);
      alert('查询失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  }

  async function handleBrowse() {
    if (!browseParams.url) {
      alert('请输入URL');
      return;
    }
    setLoading(true);
    try {
      const data = await ragToolBrowse(browseParams);
      setResult(data);
    } catch (error) {
      console.error('网页抓取失败:', error);
      alert('抓取失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>工具调用</CardTitle>
          <CardDescription>通过MCP Tools调用外部服务</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTool} onValueChange={(v) => setActiveTool(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weather">
                <Cloud className="mr-2 h-4 w-4" />
                天气查询
              </TabsTrigger>
              <TabsTrigger value="places">
                <MapPin className="mr-2 h-4 w-4" />
                POI查询
              </TabsTrigger>
              <TabsTrigger value="browse">
                <Globe className="mr-2 h-4 w-4" />
                网页浏览
              </TabsTrigger>
            </TabsList>
            <TabsContent value="weather" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="weather-location">地点 *</Label>
                <Input
                  id="weather-location"
                  value={weatherParams.location}
                  onChange={(e) => setWeatherParams({ ...weatherParams, location: e.target.value })}
                  placeholder="例如：Reykjavik, Iceland"
                />
              </div>
              <div>
                <Label htmlFor="weather-date">日期</Label>
                <Input
                  id="weather-date"
                  type="date"
                  value={weatherParams.date}
                  onChange={(e) => setWeatherParams({ ...weatherParams, date: e.target.value })}
                />
              </div>
              <Button onClick={handleWeather} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Cloud className="mr-2 h-4 w-4" />}
                查询天气
              </Button>
            </TabsContent>
            <TabsContent value="places" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="places-query">查询 *</Label>
                <Input
                  id="places-query"
                  value={placesParams.query}
                  onChange={(e) => setPlacesParams({ ...placesParams, query: e.target.value })}
                  placeholder="例如：Blue Lagoon Iceland"
                />
              </div>
              <div>
                <Label htmlFor="places-fields">字段（逗号分隔）</Label>
                <Input
                  id="places-fields"
                  value={placesParams.fields.join(',')}
                  onChange={(e) => setPlacesParams({ ...placesParams, fields: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="例如：name,address,opening_hours,rating"
                />
              </div>
              <Button onClick={handlePlaces} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                查询POI
              </Button>
            </TabsContent>
            <TabsContent value="browse" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="browse-url">URL *</Label>
                <Input
                  id="browse-url"
                  value={browseParams.url}
                  onChange={(e) => setBrowseParams({ ...browseParams, url: e.target.value })}
                  placeholder="例如：https://www.road.is/travel-info/road-conditions-and-weather/"
                />
              </div>
              <div>
                <Label htmlFor="browse-query">查询关键词</Label>
                <Input
                  id="browse-query"
                  value={browseParams.query}
                  onChange={(e) => setBrowseParams({ ...browseParams, query: e.target.value })}
                  placeholder="例如：F208 road status"
                />
              </div>
              <Button onClick={handleBrowse} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                抓取网页
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>查询结果</CardTitle>
            <CardDescription>
              {result.cached ? '（缓存）' : ''} {result.timestamp ? new Date(result.timestamp).toLocaleString() : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Prometheus 指标标签页
function PrometheusMetricsTab() {
  const [metrics, setMetrics] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  async function loadMetrics() {
    setLoading(true);
    try {
      const data = await getRAGPrometheusMetrics();
      setMetrics(data || '');
    } catch (error) {
      console.error('获取 Prometheus 指标失败:', error);
      alert('获取失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    setStatsLoading(true);
    try {
      const data = await getRAGMetricsStats();
      setStats(data);
    } catch (error) {
      console.error('获取统计信息失败:', error);
      alert('获取失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setStatsLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();
    loadStats();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prometheus 监控指标</CardTitle>
              <CardDescription>Prometheus 格式的所有监控指标</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadStats} disabled={statsLoading} variant="outline" size="sm">
                {statsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    刷新中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新统计
                  </>
                )}
              </Button>
              <Button onClick={loadMetrics} disabled={loading} variant="outline" size="sm">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    刷新中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新指标
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">缓存命中</div>
                  <div className="text-2xl font-bold">{stats.cache?.hits || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">缓存未命中</div>
                  <div className="text-2xl font-bold">{stats.cache?.misses || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">命中率</div>
                  <div className="text-2xl font-bold">{stats.cache?.hitRate || '0%'}</div>
                </div>
              </div>
              {stats.timestamp && (
                <div className="text-xs text-muted-foreground mt-2">
                  更新时间: {new Date(stats.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          )}
          <div>
            <Label>Prometheus 指标（text/plain 格式）</Label>
            <Textarea
              value={metrics}
              readOnly
              rows={20}
              className="font-mono text-xs mt-2"
              placeholder="点击刷新按钮加载指标..."
            />
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>提示：这些指标可以直接被 Prometheus 抓取，端点: <code className="bg-muted px-1 rounded">GET /api/rag/metrics</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
