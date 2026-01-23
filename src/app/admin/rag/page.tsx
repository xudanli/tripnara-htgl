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
} from 'lucide-react';

export default function RAGPage() {
  // 统计
  const [stats, setStats] = useState<RAGStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsCollection, setStatsCollection] = useState('');

  // 获取统计
  async function handleGetStats() {
    setStatsLoading(true);
    try {
      const collection = statsCollection && statsCollection !== 'all' ? statsCollection : undefined;
      const result = await getRAGStats(collection);
      if (result) {
        setStats(result);
      }
    } catch (error) {
      console.error('获取统计失败:', error);
      alert('获取统计失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setStatsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">RAG 管理</h1>
        <p className="text-muted-foreground mt-2">管理 RAG 知识库和搜索</p>
      </div>

      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="stats">
            <BarChart3 className="mr-2 h-4 w-4" />
            统计
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            文档管理
          </TabsTrigger>
          <TabsTrigger value="index">
            <Upload className="mr-2 h-4 w-4" />
            索引
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Shield className="mr-2 h-4 w-4" />
            合规规则
          </TabsTrigger>
          <TabsTrigger value="narrative">
            <BookOpen className="mr-2 h-4 w-4" />
            叙事生成
          </TabsTrigger>
          <TabsTrigger value="evaluation">
            <CheckCircle className="mr-2 h-4 w-4" />
            评估
          </TabsTrigger>
          <TabsTrigger value="query-pairs">
            <FileCheck className="mr-2 h-4 w-4" />
            Query-Pairs
          </TabsTrigger>
        </TabsList>

        {/* 文档管理 */}
        <TabsContent value="documents" className="space-y-4">
          <DocumentsManagementTab />
        </TabsContent>

        {/* 统计 */}
        <TabsContent value="stats" className="space-y-4">
          {/* 查询控制 */}
          <Card>
            <CardHeader>
              <CardTitle>统计查询</CardTitle>
              <CardDescription>选择集合查看统计信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="statsCollection">集合（可选）</Label>
                  <Select
                    value={statsCollection}
                    onValueChange={setStatsCollection}
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
                <div className="flex items-end">
                  <Button onClick={handleGetStats} disabled={statsLoading}>
                    {statsLoading ? (
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
                </div>
              </div>
            </CardContent>
          </Card>

          {stats && (
            <div className="space-y-4">
              {/* 总体统计卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">总文档数</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalDocuments}</div>
                    <div className="text-xs text-muted-foreground mt-1">知识库文档总数</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">集合数量</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.collections?.length || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">已创建的集合</div>
                  </CardContent>
                </Card>
                {stats.byCollection && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">当前集合文档数</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.byCollection.count}</div>
                      <div className="text-xs text-muted-foreground mt-1">{stats.byCollection.name}</div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 集合统计详情 */}
              {stats.collections && stats.collections.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>集合统计详情</CardTitle>
                    <CardDescription>各集合的文档分布和标签信息</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stats.collections.map((collection, idx) => (
                        <div key={idx} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-lg">{collection.name}</h3>
                            <Badge variant="default" className="text-sm">{collection.count} 文档</Badge>
                          </div>
                          {collection.countries && collection.countries.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">国家/地区</div>
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
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">标签</div>
                              <div className="flex flex-wrap gap-1">
                                {collection.tags.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
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
          )}
        </TabsContent>

        {/* 文档索引 */}
        <TabsContent value="index" className="space-y-4">
          <DocumentIndexTab />
        </TabsContent>

        {/* 合规规则 */}
        <TabsContent value="compliance" className="space-y-4">
          <ComplianceRulesTab />
        </TabsContent>

        {/* 叙事生成 */}
        <TabsContent value="narrative" className="space-y-4">
          <NarrativeGenerationTab />
        </TabsContent>

        {/* RAG 评估 */}
        <TabsContent value="evaluation" className="space-y-4">
          <RAGEvaluationTab />
        </TabsContent>

        {/* Query-Pairs 收集 */}
        <TabsContent value="query-pairs" className="space-y-4">
          <QueryPairsTab />
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
    <div className="grid grid-cols-3 gap-4">
      {/* 左侧：文档列表 (2/3) */}
      <div className="col-span-2 space-y-4">
        {/* 筛选条件 */}
        <Card>
          <CardHeader>
            <CardTitle>文档列表</CardTitle>
            <CardDescription>查看和管理 RAG 知识库中的文档</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
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
            <Button onClick={loadDocuments} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  加载中...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  搜索
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 文档列表 */}
        {loading && documents.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              暂无文档
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card 
                key={doc.id} 
                className={`cursor-pointer transition-colors ${selectedDocument?.id === doc.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => loadDocumentDetail(doc.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
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
                        {doc.source && <span>来源: {doc.source}</span>}
                        {doc.tags && doc.tags.length > 0 && (
                          <span>标签: {doc.tags.slice(0, 3).join(', ')}{doc.tags.length > 3 ? '...' : ''}</span>
                        )}
                        <span>创建: {new Date(doc.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3 flex-shrink-0">
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
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
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
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* 右侧：编辑表单 (1/3) */}
      <div className="col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>编辑文档</CardTitle>
            <CardDescription>
              {selectedDocument ? `文档 ID: ${selectedDocument.id}` : '选择左侧文档进行编辑'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDocument ? (
              <>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editTitle">标题</Label>
                    <Input
                      id="editTitle"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCollection">集合</Label>
                    <Select
                      value={editForm.collection || ''}
                      onValueChange={(value) => setEditForm({ ...editForm, collection: value })}
                    >
                      <SelectTrigger id="editCollection" className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="travel_guides">travel_guides</SelectItem>
                        <SelectItem value="compliance_rules">compliance_rules</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="editCountryCode">国家代码</Label>
                      <Input
                        id="editCountryCode"
                        value={editForm.countryCode || ''}
                        onChange={(e) => setEditForm({ ...editForm, countryCode: e.target.value })}
                        placeholder="IS"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editSource">来源</Label>
                      <Input
                        id="editSource"
                        value={editForm.source || ''}
                        onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                        className="h-9"
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
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editContent">内容 *</Label>
                    <Textarea
                      id="editContent"
                      value={editForm.content || ''}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows={8}
                      placeholder="文档内容..."
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      字符数: {editForm.content?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={handleCloseDialog} className="flex-1" size="sm">
                    取消
                  </Button>
                  <Button onClick={handleUpdateDocument} disabled={editLoading} className="flex-1" size="sm">
                    {editLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      '保存'
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                请从左侧列表选择文档进行编辑
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
