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
} from '@/services/rag-llm';
import type {
  RAGStatsResponse,
  RAGIndexDocumentRequest,
  RAGSegmentNarrativeResponse,
  RAGLocalInsightRefreshResponse,
  RAGDocumentsResponse,
  RAGDocument,
  UpdateRAGDocumentRequest,
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
        <TabsList className="grid w-full grid-cols-5">
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
        </TabsList>

        {/* 文档管理 */}
        <TabsContent value="documents" className="space-y-4">
          <DocumentsManagementTab />
        </TabsContent>

        {/* 统计 */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RAG 统计</CardTitle>
              <CardDescription>查看 RAG 知识库的统计信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Card>
                <CardHeader>
                  <CardTitle>总体统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                  <div className="text-sm text-muted-foreground">总文档数</div>
                </CardContent>
              </Card>

              {stats.collections && stats.collections.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>集合统计</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats.collections.map((collection, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{collection.name}</h3>
                          <Badge>{collection.count} 文档</Badge>
                        </div>
                        {collection.countries && collection.countries.length > 0 && (
                          <div className="text-sm mb-2">
                            <span className="font-medium">国家: </span>
                            {collection.countries.map((country, i) => (
                              <Badge key={i} variant="outline" className="mr-1">
                                {country}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {collection.tags && collection.tags.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">标签: </span>
                            {collection.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="mr-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {stats.byCollection && (
                <Card>
                  <CardHeader>
                    <CardTitle>指定集合详情</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{stats.byCollection.name}</h3>
                        <Badge>{stats.byCollection.count} 文档</Badge>
                      </div>
                      {stats.byCollection.countries && stats.byCollection.countries.length > 0 && (
                        <div className="text-sm mb-2">
                          <span className="font-medium">国家: </span>
                          {stats.byCollection.countries.map((country, i) => (
                            <Badge key={i} variant="outline" className="mr-1">
                              {country}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {stats.byCollection.tags && stats.byCollection.tags.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">标签: </span>
                          {stats.byCollection.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="mr-1">
                              {tag}
                            </Badge>
                          ))}
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
        loadDocuments();
      }
    } catch (error) {
      console.error('更新文档失败:', error);
      alert('更新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setEditLoading(false);
    }
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
    <div className="space-y-4">
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
          <Button onClick={loadDocuments} disabled={loading}>
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
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{doc.title || '无标题'}</h3>
                      <Badge variant="outline">{doc.collection}</Badge>
                      {doc.countryCode && (
                        <Badge variant="secondary">{doc.countryCode}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {doc.contentPreview || doc.content.substring(0, 200)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {doc.source && <span>来源: {doc.source}</span>}
                      {doc.tags && doc.tags.length > 0 && (
                        <span>标签: {doc.tags.join(', ')}</span>
                      )}
                      <span>创建: {new Date(doc.createdAt).toLocaleDateString('zh-CN')}</span>
                      <span>更新: {new Date(doc.updatedAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => loadDocumentDetail(doc.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteDocument(doc.id)}
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

      {/* 编辑文档对话框 */}
      {selectedDocument && (
        <Card>
          <CardHeader>
            <CardTitle>编辑文档</CardTitle>
            <CardDescription>文档 ID: {selectedDocument.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="col-span-2">
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
              <div className="col-span-2">
                <Label htmlFor="editContent">内容 *</Label>
                <Textarea
                  id="editContent"
                  value={editForm.content || ''}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={10}
                  placeholder="文档内容..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  更新内容后会自动重新生成 embedding
                </p>
              </div>
            </div>
            <div className="flex gap-2">
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
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDocument(null);
                  setEditForm({});
                }}
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
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
      <Card>
        <CardHeader>
          <CardTitle>索引单个文档</CardTitle>
          <CardDescription>将文档添加到 RAG 知识库索引</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="indexContent">文档内容 *</Label>
              <Textarea
                id="indexContent"
                value={indexForm.content}
                onChange={(e) => setIndexForm({ ...indexForm, content: e.target.value })}
                placeholder="输入文档内容..."
                rows={5}
              />
            </div>
            <div>
              <Label htmlFor="indexTitle">标题</Label>
              <Input
                id="indexTitle"
                value={indexForm.title}
                onChange={(e) => setIndexForm({ ...indexForm, title: e.target.value })}
                placeholder="文档标题"
              />
            </div>
            <div>
              <Label htmlFor="indexCollection">集合 *</Label>
              <Select
                value={indexForm.collection}
                onValueChange={(value) => setIndexForm({ ...indexForm, collection: value })}
              >
                <SelectTrigger id="indexCollection">
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
              />
            </div>
            <div>
              <Label htmlFor="indexSource">来源</Label>
              <Input
                id="indexSource"
                value={indexForm.source}
                onChange={(e) => setIndexForm({ ...indexForm, source: e.target.value })}
                placeholder="文档来源"
              />
            </div>
          </div>
          <Button onClick={handleIndexDocument} disabled={indexLoading}>
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
              <div className="text-sm text-green-800">文档已成功索引，ID: {indexResult}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>批量索引文档</CardTitle>
          <CardDescription>批量将文档添加到 RAG 知识库索引</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="batchDocuments">文档列表（JSON 数组格式）</Label>
            <Textarea
              id="batchDocuments"
              value={batchDocuments}
              onChange={(e) => setBatchDocuments(e.target.value)}
              placeholder='[{"content": "文档1内容...", "title": "文档1", "collection": "travel_guides"}, ...]'
              rows={10}
            />
          </div>
          <Button onClick={handleBatchIndex} disabled={batchLoading}>
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
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-sm text-green-800">
                成功索引 {batchResult.count} 个文档，ID: {batchResult.ids.join(', ')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 合规规则标签页组件
function ComplianceRulesTab() {
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [refreshResult, setRefreshResult] = useState<string | null>(null);

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
      }
    } catch (error) {
      console.error('刷新当地洞察失败:', error);
      alert('刷新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLocalInsightRefreshLoading(false);
    }
  }

  return (
    <div className="space-y-4">
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
      }
    } catch (error) {
      console.error('生成路线段叙事失败:', error);
      alert('生成失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setSegmentLoading(false);
    }
  }

  return (
    <div className="space-y-4">
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
              />
            </div>
            <div>
              <Label htmlFor="segmentName">名称 *</Label>
              <Input
                id="segmentName"
                value={segmentForm.name}
                onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
                placeholder="从雷克雅未克到辛格维利尔"
              />
            </div>
            <div>
              <Label htmlFor="segmentCountryCode">国家代码 *</Label>
              <Input
                id="segmentCountryCode"
                value={segmentForm.countryCode}
                onChange={(e) => setSegmentForm({ ...segmentForm, countryCode: e.target.value })}
                placeholder="IS"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="segmentDescription">描述 *</Label>
              <Textarea
                id="segmentDescription"
                value={segmentForm.description}
                onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })}
                placeholder="早上出发..."
                rows={3}
              />
            </div>
          </div>
          <Button onClick={handleGenerateSegmentNarrative} disabled={segmentLoading}>
            {segmentLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              '生成叙事'
            )}
          </Button>
          {segmentNarrative && (
            <div className="p-4 border rounded-lg space-y-2">
              <h3 className="font-semibold">{segmentNarrative.narrative.title}</h3>
              <p className="text-sm">{segmentNarrative.narrative.content}</p>
              {segmentNarrative.narrative.duration && (
                <div className="text-sm text-muted-foreground">时长: {segmentNarrative.narrative.duration}</div>
              )}
              {segmentNarrative.narrative.scenery && segmentNarrative.narrative.scenery.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium">风景: </span>
                  {segmentNarrative.narrative.scenery.join(', ')}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
