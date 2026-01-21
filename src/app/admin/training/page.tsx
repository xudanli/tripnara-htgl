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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  // 训练管理
  createTrainingJob,
  startTrainingJob,
  getTrainingJob,
  getTrainingJobs,
  // 模型管理
  registerModel,
  getModel,
  getModels,
  rollbackModel,
  // 数据集管理
  createDatasetVersion,
  getDatasetVersion,
  getDatasetVersions,
  compareVersions,
  // 评测管理
  evaluateRouter,
  evaluateGate,
  evaluateItinerary,
  evaluateFullPipeline,
  getOpeReport,
  replayCompare,
  checkRegressionGate,
  // 监控指标
  getPolicyHealth,
  // ROLL 管理
  getRollMetrics,
  getRollWorkersStatus,
  getRollHealth,
  createRollAbTest,
  analyzeRollAbTest,
  shouldUseRoll,
  getPolicyMetrics,
  getCollectionStats,
  getTrainingQualityMetrics,
  getCollapseRisk,
  // A/B测试管理
  createAbTest,
  assignUserToAbTest,
  analyzeAbTest,
  // 安全审计
  recordAudit,
  getAuditReport,
  runRedTeamTest,
  getTestCases,
  // ETL与数据导出
  extractTrajectoryData,
  exportTrajectoryData,
  prepareTrainingBatch,
  exportBatchJsonl,
  exportBatchJson,
  // 枚举选项
  getAllEnumOptions,
  getEnumOptions,
} from '@/services/training';
import type {
  TrainingJob,
  GetTrainingJobsResponse,
  Model,
  GetModelsResponse,
  DatasetVersion,
  GetDatasetVersionsResponse,
  OpeReportResponse,
  RegressionGateCheckResponse,
  PolicyHealthResponse,
  PolicyMetricsResponse,
  CollectionStatsResponse,
  TrainingQualityMetricsResponse,
  CollapseRiskResponse,
  AnalyzeAbTestResponse,
  GetAuditReportResponse,
  GetTestCasesResponse,
  EnumOption,
  GetAllEnumOptionsResponse,
  RollMetrics,
  RollWorkersStatus,
  RollHealth,
  CreateRollAbTestRequest,
  CreateRollAbTestResponse,
  AnalyzeRollAbTestRequest,
  AnalyzeRollAbTestResponse,
  ShouldUseRollResponse,
} from '@/types/api';
import {
  Loader2,
  Play,
  Database,
  BarChart3,
  Shield,
  TestTube,
  Download,
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

export default function TrainingPage() {
  // ==================== 训练管理 ====================
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [trainingJobsLoading, setTrainingJobsLoading] = useState(false);
  const [trainingJobsParams, setTrainingJobsParams] = useState({
    page: 1,
    limit: 20,
    status: '' as string,
    dataset_version: '',
  });
  const [trainingJobsTotal, setTrainingJobsTotal] = useState(0);
  const [createJobForm, setCreateJobForm] = useState({
    dataset_version: '',
    model_type: 'SFT',
    base_model: 'baseline',
    batch_size: 32,
    learning_rate: 0.0001,
    num_epochs: 3,
  });
  const [createJobLoading, setCreateJobLoading] = useState(false);

  // ==================== 模型管理 ====================
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsParams, setModelsParams] = useState({
    page: 1,
    limit: 20,
  });
  const [modelsTotal, setModelsTotal] = useState(0);
  const [registerModelForm, setRegisterModelForm] = useState({
    version: '',
    path: '',
    tags: '',
  });
  const [registerModelLoading, setRegisterModelLoading] = useState(false);

  // ==================== 数据集管理 ====================
  const [datasetVersions, setDatasetVersions] = useState<DatasetVersion[]>([]);
  const [datasetVersionsLoading, setDatasetVersionsLoading] = useState(false);
  const [datasetVersionsParams, setDatasetVersionsParams] = useState({
    page: 1,
    limit: 20,
  });
  const [datasetVersionsTotal, setDatasetVersionsTotal] = useState(0);
  const [createVersionForm, setCreateVersionForm] = useState({
    min_validation_score: '',
    country_code: '',
    description: '',
  });
  const [createVersionLoading, setCreateVersionLoading] = useState(false);

  // ==================== 监控指标 ====================
  const [policyHealth, setPolicyHealth] = useState<PolicyHealthResponse | null>(null);
  const [policyHealthLoading, setPolicyHealthLoading] = useState(false);
  const [policyMetrics, setPolicyMetrics] = useState<PolicyMetricsResponse | null>(null);
  const [policyMetricsLoading, setPolicyMetricsLoading] = useState(false);
  const [collectionStats, setCollectionStats] = useState<CollectionStatsResponse | null>(null);
  const [collectionStatsLoading, setCollectionStatsLoading] = useState(false);
  const [trainingQuality, setTrainingQuality] = useState<TrainingQualityMetricsResponse | null>(null);
  const [trainingQualityLoading, setTrainingQualityLoading] = useState(false);
  const [collapseRisk, setCollapseRisk] = useState<CollapseRiskResponse | null>(null);
  const [collapseRiskLoading, setCollapseRiskLoading] = useState(false);

  // ==================== 枚举选项 ====================
  const [enumOptions, setEnumOptions] = useState<GetAllEnumOptionsResponse | null>(null);
  const [enumOptionsLoading, setEnumOptionsLoading] = useState(false);
  const [modelTypeOptions, setModelTypeOptions] = useState<EnumOption[]>([]);
  const [baseModelOptions, setBaseModelOptions] = useState<EnumOption[]>([]);
  const [trainingStatusOptions, setTrainingStatusOptions] = useState<EnumOption[]>([]);

  // ==================== A/B测试管理 ====================
  const [abTestForm, setAbTestForm] = useState({
    name: '',
    control_model: '',
    treatment_model: '',
    traffic_percentage: 50,
    metrics: '',
  });
  const [createAbTestLoading, setCreateAbTestLoading] = useState(false);
  const [abTestAnalysis, setAbTestAnalysis] = useState<AnalyzeAbTestResponse | null>(null);
  const [abTestAnalysisLoading, setAbTestAnalysisLoading] = useState(false);
  const [abTestId, setAbTestId] = useState('');

  // ==================== 安全审计 ====================
  const [auditReport, setAuditReport] = useState<GetAuditReportResponse | null>(null);
  const [auditReportLoading, setAuditReportLoading] = useState(false);
  const [testCases, setTestCases] = useState<GetTestCasesResponse | null>(null);
  const [testCasesLoading, setTestCasesLoading] = useState(false);

  // ==================== 评测管理 ====================
  const [opeReport, setOpeReport] = useState<OpeReportResponse | null>(null);
  const [opeReportLoading, setOpeReportLoading] = useState(false);
  const [opeReportForm, setOpeReportForm] = useState({
    model_version: '',
    baseline_version: '',
  });
  const [regressionGate, setRegressionGate] = useState<RegressionGateCheckResponse | null>(null);
  const [regressionGateLoading, setRegressionGateLoading] = useState(false);

  // 加载训练任务列表
  async function loadTrainingJobs() {
    setTrainingJobsLoading(true);
    try {
      const params: any = {
        page: trainingJobsParams.page,
        limit: trainingJobsParams.limit,
      };
      if (trainingJobsParams.status) params.status = trainingJobsParams.status;
      if (trainingJobsParams.dataset_version) params.dataset_version = trainingJobsParams.dataset_version;

      console.log('加载训练任务列表，参数:', params);
      const result = await getTrainingJobs(params);
      console.log('训练任务列表响应:', result);
      console.log('响应类型:', typeof result, Array.isArray(result));
      
      if (result) {
        // 处理两种可能的响应格式：
        // 1. 直接返回数组: TrainingJob[]
        // 2. 返回对象: {jobs: TrainingJob[], total: number, ...}
        let jobs: TrainingJob[] = [];
        let total = 0;
        
        if (Array.isArray(result)) {
          // 如果直接返回数组
          jobs = result;
          total = result.length;
          console.log(`✅ 响应是数组格式，共 ${jobs.length} 个任务`);
        } else if (result.jobs && Array.isArray(result.jobs)) {
          // 如果是对象格式
          jobs = result.jobs;
          total = result.total || result.jobs.length;
          console.log(`✅ 响应是对象格式，共 ${jobs.length} 个任务，总计 ${total} 个`);
        } else {
          console.warn('⚠️ 响应格式未知:', result);
        }
        
        console.log(`📋 设置任务列表: ${jobs.length} 个任务`);
        setTrainingJobs(jobs);
        setTrainingJobsTotal(total);
      } else {
        console.warn('获取训练任务列表返回 null，可能是 API 调用失败');
        setTrainingJobs([]);
        setTrainingJobsTotal(0);
      }
    } catch (error) {
      console.error('加载训练任务失败:', error);
      // 不显示 alert，避免干扰用户体验，只在控制台记录错误
      setTrainingJobs([]);
      setTrainingJobsTotal(0);
    } finally {
      setTrainingJobsLoading(false);
    }
  }

  // 创建训练任务
  async function handleCreateJob() {
    if (!createJobForm.dataset_version) {
      alert('请输入数据集版本');
      return;
    }
    setCreateJobLoading(true);
    try {
      const result = await createTrainingJob({
        dataset_version: createJobForm.dataset_version,
        model_config: {
          model_type: createJobForm.model_type,
          base_model: createJobForm.base_model,
        },
        training_config: {
          batch_size: createJobForm.batch_size,
          learning_rate: createJobForm.learning_rate,
          num_epochs: createJobForm.num_epochs,
        },
      });
      if (result) {
        const jobId = result.job_id;
        console.log('✅ 创建任务成功，任务ID:', jobId);
        alert('创建成功: ' + jobId);
        setCreateJobForm({
          dataset_version: '',
          model_type: 'SFT',
          base_model: 'baseline',
          batch_size: 32,
          learning_rate: 0.0001,
          num_epochs: 3,
        });
        // 重置筛选条件并立即刷新列表，确保新创建的任务能显示
        setTrainingJobsParams({
          page: 1,
          limit: 20,
          status: '',
          dataset_version: '',
        });
        // 立即刷新列表，添加延迟确保后端数据已同步
        // 使用多次刷新确保能获取到新创建的任务
        setTimeout(() => {
          console.log('🔄 第1次刷新训练任务列表...');
          loadTrainingJobs();
        }, 500);
        setTimeout(() => {
          console.log('🔄 第2次刷新训练任务列表...');
          loadTrainingJobs();
        }, 1500);
        setTimeout(() => {
          console.log('🔄 第3次刷新训练任务列表...');
          loadTrainingJobs();
        }, 3000);
      }
    } catch (error) {
      console.error('创建训练任务失败:', error);
      alert('创建训练任务失败');
    } finally {
      setCreateJobLoading(false);
    }
  }

  // 启动训练任务
  async function handleStartJob(jobId: string) {
    if (!confirm('确定要启动这个训练任务吗？')) return;
    try {
      const result = await startTrainingJob(jobId);
      if (result) {
        alert('启动成功');
        loadTrainingJobs();
      }
    } catch (error) {
      console.error('启动训练任务失败:', error);
      alert('启动训练任务失败');
    }
  }

  // 加载模型列表
  async function loadModels() {
    setModelsLoading(true);
    try {
      const result = await getModels({
        page: modelsParams.page,
        limit: modelsParams.limit,
      });
      if (result) {
        setModels(result.models || []);
        setModelsTotal(result.total || 0);
      } else {
        setModels([]);
        setModelsTotal(0);
      }
    } catch (error) {
      console.error('加载模型列表失败:', error);
      alert('加载模型列表失败');
      setModels([]);
      setModelsTotal(0);
    } finally {
      setModelsLoading(false);
    }
  }

  // 注册模型
  async function handleRegisterModel() {
    if (!registerModelForm.version || !registerModelForm.path) {
      alert('请输入版本号和路径');
      return;
    }
    setRegisterModelLoading(true);
    try {
      const tags = registerModelForm.tags
        ? registerModelForm.tags.split(',').map((t) => t.trim())
        : [];
      const result = await registerModel({
        version: registerModelForm.version,
        path: registerModelForm.path,
        tags,
      });
      if (result) {
        alert('注册成功');
        setRegisterModelForm({ version: '', path: '', tags: '' });
        loadModels();
      }
    } catch (error) {
      console.error('注册模型失败:', error);
      alert('注册模型失败');
    } finally {
      setRegisterModelLoading(false);
    }
  }

  // 回滚模型
  async function handleRollbackModel(version: string) {
    const reason = prompt('请输入回滚原因:');
    if (!reason) return;
    try {
      const result = await rollbackModel(version, { reason });
      if (result) {
        alert(`回滚成功: ${result.previous_version} -> ${result.current_version}`);
        loadModels();
      }
    } catch (error) {
      console.error('回滚模型失败:', error);
      alert('回滚模型失败');
    }
  }

  // 加载数据集版本列表
  async function loadDatasetVersions() {
    setDatasetVersionsLoading(true);
    try {
      const result = await getDatasetVersions({
        page: datasetVersionsParams.page,
        limit: datasetVersionsParams.limit,
      });
      if (result) {
        setDatasetVersions(result.versions || []);
        setDatasetVersionsTotal(result.total || 0);
      } else {
        setDatasetVersions([]);
        setDatasetVersionsTotal(0);
      }
    } catch (error) {
      console.error('加载数据集版本失败:', error);
      alert('加载数据集版本失败');
      setDatasetVersions([]);
      setDatasetVersionsTotal(0);
    } finally {
      setDatasetVersionsLoading(false);
    }
  }

  // 创建数据集版本
  async function handleCreateVersion() {
    setCreateVersionLoading(true);
    try {
      const filter: any = {};
      if (createVersionForm.min_validation_score) {
        filter.min_validation_score = parseFloat(createVersionForm.min_validation_score);
      }
      if (createVersionForm.country_code) {
        filter.country_code = createVersionForm.country_code;
      }

      const result = await createDatasetVersion({
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        metadata: createVersionForm.description
          ? { description: createVersionForm.description }
          : undefined,
      });
      if (result) {
        alert(`创建成功: ${result.version} (${result.trajectory_count} 条轨迹)`);
        setCreateVersionForm({
          min_validation_score: '',
          country_code: '',
          description: '',
        });
        loadDatasetVersions();
      }
    } catch (error) {
      console.error('创建数据集版本失败:', error);
      alert('创建数据集版本失败');
    } finally {
      setCreateVersionLoading(false);
    }
  }

  // 加载监控指标
  async function loadMonitoringMetrics() {
    setPolicyHealthLoading(true);
    setPolicyMetricsLoading(true);
    setCollectionStatsLoading(true);
    setTrainingQualityLoading(true);
    setCollapseRiskLoading(true);

    try {
      const [health, metrics, stats, quality, risk] = await Promise.all([
        getPolicyHealth(),
        getPolicyMetrics(),
        getCollectionStats(),
        getTrainingQualityMetrics(),
        getCollapseRisk(),
      ]);

      if (health) setPolicyHealth(health);
      if (metrics) setPolicyMetrics(metrics);
      if (stats) setCollectionStats(stats);
      if (quality) setTrainingQuality(quality);
      if (risk) setCollapseRisk(risk);
    } catch (error) {
      console.error('加载监控指标失败:', error);
    } finally {
      setPolicyHealthLoading(false);
      setPolicyMetricsLoading(false);
      setCollectionStatsLoading(false);
      setTrainingQualityLoading(false);
      setCollapseRiskLoading(false);
    }
  }

  // 获取OPE报告
  async function handleGetOpeReport() {
    if (!opeReportForm.model_version || !opeReportForm.baseline_version) {
      alert('请输入模型版本和基线版本');
      return;
    }
    setOpeReportLoading(true);
    try {
      const result = await getOpeReport({
        model_version: opeReportForm.model_version,
        baseline_version: opeReportForm.baseline_version,
      });
      if (result) {
        setOpeReport(result);
      }
    } catch (error) {
      console.error('获取OPE报告失败:', error);
      alert('获取OPE报告失败');
    } finally {
      setOpeReportLoading(false);
    }
  }

  // 回归门检查
  async function handleCheckRegressionGate() {
    setRegressionGateLoading(true);
    try {
      const result = await checkRegressionGate();
      if (result) {
        setRegressionGate(result);
      }
    } catch (error) {
      console.error('回归门检查失败:', error);
      alert('回归门检查失败');
    } finally {
      setRegressionGateLoading(false);
    }
  }

  // 创建A/B测试
  async function handleCreateAbTest() {
    if (!abTestForm.name || !abTestForm.control_model || !abTestForm.treatment_model) {
      alert('请填写所有必填字段');
      return;
    }
    setCreateAbTestLoading(true);
    try {
      const metrics = abTestForm.metrics
        ? abTestForm.metrics.split(',').map((m) => m.trim())
        : [];
      const result = await createAbTest({
        name: abTestForm.name,
        control_model: abTestForm.control_model,
        treatment_model: abTestForm.treatment_model,
        traffic_percentage: abTestForm.traffic_percentage,
        metrics,
      });
      if (result) {
        alert('创建成功: ' + result.test_id);
        setAbTestId(result.test_id);
        setAbTestForm({
          name: '',
          control_model: '',
          treatment_model: '',
          traffic_percentage: 50,
          metrics: '',
        });
      }
    } catch (error) {
      console.error('创建A/B测试失败:', error);
      alert('创建A/B测试失败');
    } finally {
      setCreateAbTestLoading(false);
    }
  }

  // 分析A/B测试
  async function handleAnalyzeAbTest() {
    if (!abTestId) {
      alert('请输入测试ID');
      return;
    }
    setAbTestAnalysisLoading(true);
    try {
      const result = await analyzeAbTest(abTestId);
      if (result) {
        setAbTestAnalysis(result);
      }
    } catch (error) {
      console.error('分析A/B测试失败:', error);
      alert('分析A/B测试失败');
    } finally {
      setAbTestAnalysisLoading(false);
    }
  }

  // 加载审计报告
  async function loadAuditReport() {
    setAuditReportLoading(true);
    try {
      const result = await getAuditReport({
        page: 1,
        limit: 50,
      });
      if (result) {
        setAuditReport({
          ...result,
          records: result.records || [],
        });
      } else {
        setAuditReport({
          records: [],
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
        });
      }
    } catch (error) {
      console.error('加载审计报告失败:', error);
      // 不显示 alert，避免干扰用户体验
      setAuditReport({
        records: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      });
    } finally {
      setAuditReportLoading(false);
    }
  }

  // 加载测试用例
  async function loadTestCases() {
    setTestCasesLoading(true);
    try {
      const result = await getTestCases();
      if (result) {
        setTestCases({
          ...result,
          test_cases: result.test_cases || [],
        });
      } else {
        setTestCases({
          test_cases: [],
        });
      }
    } catch (error) {
      console.error('加载测试用例失败:', error);
      // 不显示 alert，避免干扰用户体验
      setTestCases({
        test_cases: [],
      });
    } finally {
      setTestCasesLoading(false);
    }
  }

  // 获取状态徽章
  function getStatusBadge(status: string) {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      PENDING: { variant: 'outline', icon: Clock },
      RUNNING: { variant: 'default', icon: RefreshCw },
      COMPLETED: { variant: 'default', icon: CheckCircle },
      FAILED: { variant: 'destructive', icon: XCircle },
      CANCELLED: { variant: 'secondary', icon: XCircle },
    };
    const config = statusMap[status] || { variant: 'outline' as const, icon: null };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant}>
        {Icon && <Icon className="mr-1 h-3 w-3" />}
        {status}
      </Badge>
    );
  }

  // 获取风险等级徽章
  function getRiskBadge(riskLevel: string) {
    const riskMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      LOW: { variant: 'default' },
      MEDIUM: { variant: 'outline' },
      HIGH: { variant: 'secondary' },
      CRITICAL: { variant: 'destructive' },
    };
    const config = riskMap[riskLevel] || { variant: 'outline' };
    return <Badge variant={config.variant}>{riskLevel}</Badge>;
  }

  useEffect(() => {
    loadTrainingJobs();
  }, [trainingJobsParams]);

  useEffect(() => {
    loadModels();
  }, [modelsParams]);

  useEffect(() => {
    loadDatasetVersions();
  }, [datasetVersionsParams]);

  useEffect(() => {
    loadMonitoringMetrics();
  }, []);

  useEffect(() => {
    loadAuditReport();
    loadTestCases();
  }, []);

  // 加载枚举选项
  async function loadEnumOptions() {
    setEnumOptionsLoading(true);
    try {
      const result = await getAllEnumOptions();
      if (result) {
        setEnumOptions(result);
        // 设置各个枚举选项
        setModelTypeOptions(result.modelType || []);
        setBaseModelOptions(result.baseModel || []);
        setTrainingStatusOptions(result.trainingStatus || []);
      }
    } catch (error) {
      console.error('加载枚举选项失败:', error);
    } finally {
      setEnumOptionsLoading(false);
    }
  }

  useEffect(() => {
    loadEnumOptions();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">RL Training 管理后台</h1>
        <p className="text-muted-foreground mt-2">管理强化学习训练任务、模型、数据集和评测</p>
      </div>

      <Tabs defaultValue="training" className="space-y-4">
        <TabsList>
          <TabsTrigger value="training">
            <Play className="mr-2 h-4 w-4" />
            训练管理
          </TabsTrigger>
          <TabsTrigger value="models">
            <Database className="mr-2 h-4 w-4" />
            模型管理
          </TabsTrigger>
          <TabsTrigger value="datasets">
            <Database className="mr-2 h-4 w-4" />
            数据集管理
          </TabsTrigger>
          <TabsTrigger value="evaluation">
            <BarChart3 className="mr-2 h-4 w-4" />
            评测管理
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <BarChart3 className="mr-2 h-4 w-4" />
            监控指标
          </TabsTrigger>
          <TabsTrigger value="abtest">
            <TestTube className="mr-2 h-4 w-4" />
            A/B测试
          </TabsTrigger>
          <TabsTrigger value="safety">
            <Shield className="mr-2 h-4 w-4" />
            安全审计
          </TabsTrigger>
          <TabsTrigger value="etl">
            <Download className="mr-2 h-4 w-4" />
            ETL与导出
          </TabsTrigger>
          <TabsTrigger value="roll">
            <RefreshCw className="mr-2 h-4 w-4" />
            ROLL管理
          </TabsTrigger>
        </TabsList>

        {/* 训练管理 */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>创建训练任务</CardTitle>
              <CardDescription>创建新的强化学习训练任务</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataset_version">数据集版本 *</Label>
                  <Input
                    id="dataset_version"
                    placeholder="v1.0.0"
                    value={createJobForm.dataset_version}
                    onChange={(e) =>
                      setCreateJobForm({ ...createJobForm, dataset_version: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="model_type">模型类型</Label>
                  <Select
                    value={createJobForm.model_type}
                    onValueChange={(value) =>
                      setCreateJobForm({ ...createJobForm, model_type: value })
                    }
                  >
                    <SelectTrigger id="model_type">
                      <SelectValue placeholder="选择模型类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelTypeOptions.length > 0 ? (
                        modelTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.labelCN || option.labelEN || option.label || option.value}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="SFT">SFT - 监督微调</SelectItem>
                          <SelectItem value="RLHF">RLHF - 人类反馈强化学习</SelectItem>
                          <SelectItem value="RL">RL - 纯强化学习</SelectItem>
                          <SelectItem value="DPO">DPO - 直接偏好优化</SelectItem>
                          <SelectItem value="PPO">PPO - 近端策略优化</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="base_model">基础模型</Label>
                  <Select
                    value={createJobForm.base_model}
                    onValueChange={(value) =>
                      setCreateJobForm({ ...createJobForm, base_model: value })
                    }
                  >
                    <SelectTrigger id="base_model">
                      <SelectValue placeholder="选择基础模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {baseModelOptions.length > 0 ? (
                        baseModelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.labelCN || option.labelEN || option.label || option.value}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                          <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="llama-3-70b">Llama 3 70B</SelectItem>
                          <SelectItem value="baseline">baseline</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="batch_size">批次大小</Label>
                  <Input
                    id="batch_size"
                    type="number"
                    value={createJobForm.batch_size}
                    onChange={(e) =>
                      setCreateJobForm({
                        ...createJobForm,
                        batch_size: parseInt(e.target.value) || 32,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="learning_rate">学习率</Label>
                  <Input
                    id="learning_rate"
                    type="number"
                    step="0.0001"
                    value={createJobForm.learning_rate}
                    onChange={(e) =>
                      setCreateJobForm({
                        ...createJobForm,
                        learning_rate: parseFloat(e.target.value) || 0.0001,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="num_epochs">训练轮数</Label>
                  <Input
                    id="num_epochs"
                    type="number"
                    value={createJobForm.num_epochs}
                    onChange={(e) =>
                      setCreateJobForm({
                        ...createJobForm,
                        num_epochs: parseInt(e.target.value) || 3,
                      })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleCreateJob} disabled={createJobLoading}>
                {createJobLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    创建任务
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>训练任务列表</CardTitle>
                  <CardDescription>查看和管理所有训练任务</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadTrainingJobs}
                  disabled={trainingJobsLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${trainingJobsLoading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-4">
                <Input
                  placeholder="数据集版本"
                  value={trainingJobsParams.dataset_version}
                  onChange={(e) =>
                    setTrainingJobsParams({
                      ...trainingJobsParams,
                      page: 1,
                      dataset_version: e.target.value,
                    })
                  }
                />
                <Select
                  value={trainingJobsParams.status || '__ALL__'}
                  onValueChange={(value) =>
                    setTrainingJobsParams({
                      ...trainingJobsParams,
                      page: 1,
                      status: value === '__ALL__' ? '' : value,
                    })
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__ALL__">全部状态</SelectItem>
                    {trainingStatusOptions.length > 0 ? (
                      trainingStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.labelCN || option.labelEN || option.label || option.value}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="PENDING">PENDING - 待处理</SelectItem>
                        <SelectItem value="RUNNING">RUNNING - 运行中</SelectItem>
                        <SelectItem value="COMPLETED">COMPLETED - 已完成</SelectItem>
                        <SelectItem value="FAILED">FAILED - 失败</SelectItem>
                        <SelectItem value="CANCELLED">CANCELLED - 已取消</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <Button onClick={loadTrainingJobs} disabled={trainingJobsLoading}>
                  <Search className="mr-2 h-4 w-4" />
                  搜索
                </Button>
              </div>

              {trainingJobsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !trainingJobs || trainingJobs.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">暂无数据</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>任务ID</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>数据集版本</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(trainingJobs || []).map((job) => (
                      <TableRow key={job.job_id}>
                        <TableCell className="font-mono">{job.job_id}</TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>{job.dataset_version || '-'}</TableCell>
                        <TableCell>
                          {job.created_at
                            ? new Date(job.created_at).toLocaleString('zh-CN')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {job.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartJob(job.job_id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {trainingJobsTotal > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  共 {trainingJobsTotal} 条记录
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 模型管理 */}
        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>注册新模型</CardTitle>
              <CardDescription>注册训练好的模型版本</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model_version">版本号 *</Label>
                  <Input
                    id="model_version"
                    placeholder="v1.1.0"
                    value={registerModelForm.version}
                    onChange={(e) =>
                      setRegisterModelForm({ ...registerModelForm, version: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="model_path">模型路径 *</Label>
                  <Input
                    id="model_path"
                    placeholder="/models/tripnara/v1.1.0"
                    value={registerModelForm.path}
                    onChange={(e) =>
                      setRegisterModelForm({ ...registerModelForm, path: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="model_tags">标签 (逗号分隔)</Label>
                  <Input
                    id="model_tags"
                    placeholder="production,stable"
                    value={registerModelForm.tags}
                    onChange={(e) =>
                      setRegisterModelForm({ ...registerModelForm, tags: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleRegisterModel} disabled={registerModelLoading}>
                {registerModelLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    注册中...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    注册模型
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>模型列表</CardTitle>
              <CardDescription>查看所有已注册的模型</CardDescription>
            </CardHeader>
            <CardContent>
              {modelsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !models || models.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">暂无数据</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>版本</TableHead>
                      <TableHead>路径</TableHead>
                      <TableHead>标签</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(models || []).map((model) => (
                      <TableRow key={model.version}>
                        <TableCell className="font-mono">{model.version}</TableCell>
                        <TableCell className="font-mono text-sm">{model.path}</TableCell>
                        <TableCell>
                          {model.tags && model.tags.length > 0
                            ? model.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="mr-1">
                                  {tag}
                                </Badge>
                              ))
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {model.created_at
                            ? new Date(model.created_at).toLocaleString('zh-CN')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRollbackModel(model.version)}
                          >
                            回滚
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {modelsTotal > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">共 {modelsTotal} 条记录</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 数据集管理 */}
        <TabsContent value="datasets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>创建数据集版本</CardTitle>
              <CardDescription>基于筛选条件创建新的数据集版本</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_score">最小验证分数</Label>
                  <Input
                    id="min_score"
                    type="number"
                    step="0.1"
                    placeholder="0.8"
                    value={createVersionForm.min_validation_score}
                    onChange={(e) =>
                      setCreateVersionForm({
                        ...createVersionForm,
                        min_validation_score: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="country_code">国家代码</Label>
                  <Input
                    id="country_code"
                    placeholder="IS"
                    value={createVersionForm.country_code}
                    onChange={(e) =>
                      setCreateVersionForm({
                        ...createVersionForm,
                        country_code: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">描述</Label>
                  <Input
                    id="description"
                    placeholder="Iceland high-quality data"
                    value={createVersionForm.description}
                    onChange={(e) =>
                      setCreateVersionForm({
                        ...createVersionForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleCreateVersion} disabled={createVersionLoading}>
                {createVersionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    创建版本
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>数据集版本列表</CardTitle>
              <CardDescription>查看所有数据集版本</CardDescription>
            </CardHeader>
            <CardContent>
              {datasetVersionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !datasetVersions || datasetVersions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">暂无数据</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>版本</TableHead>
                      <TableHead>轨迹数量</TableHead>
                      <TableHead>创建时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(datasetVersions || []).map((version) => (
                      <TableRow key={version.version}>
                        <TableCell className="font-mono">{version.version}</TableCell>
                        <TableCell>{(version.trajectory_count ?? 0).toLocaleString()}</TableCell>
                        <TableCell>
                          {version.created_at
                            ? new Date(version.created_at).toLocaleString('zh-CN')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {datasetVersionsTotal > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  共 {datasetVersionsTotal} 条记录
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 评测管理 */}
        <TabsContent value="evaluation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OPE报告</CardTitle>
              <CardDescription>获取离线策略评估报告</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model_version">模型版本 *</Label>
                  <Input
                    id="model_version"
                    placeholder="v1.1.0"
                    value={opeReportForm.model_version}
                    onChange={(e) =>
                      setOpeReportForm({ ...opeReportForm, model_version: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="baseline_version">基线版本 *</Label>
                  <Input
                    id="baseline_version"
                    placeholder="v1.0.0"
                    value={opeReportForm.baseline_version}
                    onChange={(e) =>
                      setOpeReportForm({ ...opeReportForm, baseline_version: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleGetOpeReport} disabled={opeReportLoading}>
                {opeReportLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    生成报告
                  </>
                )}
              </Button>

              {opeReport && (
                <div className="mt-4 space-y-2 rounded-lg border p-4">
                  <h4 className="font-semibold">OPE报告结果</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">IS改进</div>
                      <div className="text-lg font-bold">
                        {opeReport.metrics?.is_improvement ? (opeReport.metrics.is_improvement * 100).toFixed(2) : '-'}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">DR改进</div>
                      <div className="text-lg font-bold">
                        {opeReport.metrics?.dr_improvement ? (opeReport.metrics.dr_improvement * 100).toFixed(2) : '-'}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">WDR改进</div>
                      <div className="text-lg font-bold">
                        {opeReport.metrics?.wdr_improvement ? (opeReport.metrics.wdr_improvement * 100).toFixed(2) : '-'}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant={
                        opeReport.recommendation === 'DEPLOY' ? 'default' : 'destructive'
                      }
                    >
                      建议: {opeReport.recommendation}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>回归门检查</CardTitle>
              <CardDescription>检查模型是否满足上线标准</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCheckRegressionGate} disabled={regressionGateLoading}>
                {regressionGateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    检查中...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    执行检查
                  </>
                )}
              </Button>

              {regressionGate && (
                <div className="mt-4 space-y-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">检查结果</h4>
                    <Badge variant={regressionGate.passed ? 'default' : 'destructive'}>
                      {regressionGate.passed ? '通过' : '未通过'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(regressionGate.checks).map(([key, check]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm">{key}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {check.value} / {check.threshold}
                          </span>
                          {check.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant={
                        regressionGate.recommendation === 'APPROVE_FOR_PRODUCTION'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      建议: {regressionGate.recommendation}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 监控指标 */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={loadMonitoringMetrics}>
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>策略服务健康</CardTitle>
              </CardHeader>
              <CardContent>
                {policyHealthLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : policyHealth ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>状态</span>
                      <Badge
                        variant={
                          policyHealth.status === 'healthy'
                            ? 'default'
                            : policyHealth.status === 'degraded'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {policyHealth.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>模型已加载</span>
                      {policyHealth.model_loaded ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>当前模型版本</span>
                      <span className="font-mono text-sm">
                        {policyHealth.current_model_version}
                      </span>
                    </div>
                    {policyHealth.qps !== undefined && (
                      <div className="flex items-center justify-between">
                        <span>QPS</span>
                        <span>{policyHealth.qps}</span>
                      </div>
                    )}
                    {policyHealth.p95_latency_ms !== undefined && (
                      <div className="flex items-center justify-between">
                        <span>P95延迟</span>
                        <span>{policyHealth.p95_latency_ms}ms</span>
                      </div>
                    )}
                    {policyHealth.error_rate !== undefined && (
                      <div className="flex items-center justify-between">
                        <span>错误率</span>
                        <span>{(policyHealth.error_rate * 100).toFixed(3)}%</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground">暂无数据</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>策略服务指标</CardTitle>
              </CardHeader>
              <CardContent>
                {policyMetricsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : policyMetrics ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>QPS</span>
                      <span>{policyMetrics.qps ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>P50延迟</span>
                      <span>{policyMetrics.latency?.p50 ?? '-'}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>P95延迟</span>
                      <span>{policyMetrics.latency?.p95 ?? '-'}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>P99延迟</span>
                      <span>{policyMetrics.latency?.p99 ?? '-'}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>错误率</span>
                      <span>{policyMetrics.error_rate ? (policyMetrics.error_rate * 100).toFixed(3) : '-'}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">暂无数据</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>轨迹收集统计</CardTitle>
              </CardHeader>
              <CardContent>
                {collectionStatsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : collectionStats ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>总轨迹数</span>
                      <span>{(collectionStats.total_trajectories ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>今日</span>
                      <span>{(collectionStats.today_count ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>本周</span>
                      <span>{(collectionStats.week_count ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>本月</span>
                      <span>{(collectionStats.month_count ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">暂无数据</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>训练质量指标</CardTitle>
              </CardHeader>
              <CardContent>
                {trainingQualityLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : trainingQuality ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>平均验证分数</span>
                      <span>{trainingQuality.avg_validation_score ? trainingQuality.avg_validation_score.toFixed(3) : '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>数据质量分数</span>
                      <span>{trainingQuality.data_quality_score ? trainingQuality.data_quality_score.toFixed(3) : '-'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">暂无数据</div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>模型坍塌风险</CardTitle>
              </CardHeader>
              <CardContent>
                {collapseRiskLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : collapseRisk ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>风险等级</span>
                      {getRiskBadge(collapseRisk.risk_level)}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">输出多样性</div>
                        <div className="text-lg font-bold">
                          {collapseRisk.indicators?.output_diversity ? collapseRisk.indicators.output_diversity.toFixed(2) : '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">置信度分布</div>
                        <div className="text-lg font-bold">
                          {collapseRisk.indicators?.confidence_distribution ? collapseRisk.indicators.confidence_distribution.toFixed(2) : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">暂无数据</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* A/B测试管理 */}
        <TabsContent value="abtest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>创建A/B测试</CardTitle>
              <CardDescription>创建新的A/B测试实验</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ab_test_name">测试名称 *</Label>
                  <Input
                    id="ab_test_name"
                    placeholder="v1.1.0 vs v1.0.0"
                    value={abTestForm.name}
                    onChange={(e) =>
                      setAbTestForm({ ...abTestForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="traffic_percentage">流量百分比</Label>
                  <Input
                    id="traffic_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={abTestForm.traffic_percentage}
                    onChange={(e) =>
                      setAbTestForm({
                        ...abTestForm,
                        traffic_percentage: parseInt(e.target.value) || 50,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="control_model">对照组模型 *</Label>
                  <Input
                    id="control_model"
                    placeholder="v1.0.0"
                    value={abTestForm.control_model}
                    onChange={(e) =>
                      setAbTestForm({ ...abTestForm, control_model: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="treatment_model">实验组模型 *</Label>
                  <Input
                    id="treatment_model"
                    placeholder="v1.1.0"
                    value={abTestForm.treatment_model}
                    onChange={(e) =>
                      setAbTestForm({ ...abTestForm, treatment_model: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="ab_test_metrics">指标 (逗号分隔) *</Label>
                  <Input
                    id="ab_test_metrics"
                    placeholder="success_rate,user_satisfaction"
                    value={abTestForm.metrics}
                    onChange={(e) =>
                      setAbTestForm({ ...abTestForm, metrics: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleCreateAbTest} disabled={createAbTestLoading}>
                {createAbTestLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    创建测试
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>分析A/B测试结果</CardTitle>
              <CardDescription>分析已创建的A/B测试</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="测试ID"
                  value={abTestId}
                  onChange={(e) => setAbTestId(e.target.value)}
                />
                <Button onClick={handleAnalyzeAbTest} disabled={abTestAnalysisLoading}>
                  {abTestAnalysisLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      分析
                    </>
                  )}
                </Button>
              </div>

              {abTestAnalysis && (
                <div className="space-y-4 rounded-lg border p-4">
                  <h4 className="font-semibold">分析结果</h4>
                  {Object.entries(abTestAnalysis.metrics).map(([metricName, metric]: [string, any]) => (
                    <div key={metricName} className="space-y-2">
                      <div className="font-medium">{metricName}</div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">对照组</div>
                          <div className="font-bold">{metric.control != null ? metric.control.toFixed(3) : '-'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">实验组</div>
                          <div className="font-bold">{metric.treatment != null ? metric.treatment.toFixed(3) : '-'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">提升</div>
                          <div className="font-bold">{metric.lift != null ? (metric.lift * 100).toFixed(2) : '-'}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">P值</div>
                          <div className="font-bold">{metric.p_value != null ? metric.p_value.toFixed(4) : '-'}</div>
                          {metric.significant && (
                            <Badge variant="default" className="mt-1">
                              显著
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4">
                    <Badge
                      variant={
                        abTestAnalysis.recommendation === 'DEPLOY_TREATMENT'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      建议: {abTestAnalysis.recommendation}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全审计 */}
        <TabsContent value="safety" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>审计报告</CardTitle>
              <CardDescription>查看系统审计记录</CardDescription>
            </CardHeader>
            <CardContent>
              {auditReportLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : auditReport && auditReport.records && auditReport.records.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>操作</TableHead>
                      <TableHead>资源</TableHead>
                      <TableHead>用户ID</TableHead>
                      <TableHead>时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(auditReport.records || []).map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.action}</TableCell>
                        <TableCell>{record.resource}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {record.user_id || '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(record.timestamp).toLocaleString('zh-CN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">暂无数据</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>红队测试用例</CardTitle>
              <CardDescription>查看和管理安全测试用例</CardDescription>
            </CardHeader>
            <CardContent>
              {testCasesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : testCases && testCases.test_cases && testCases.test_cases.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>分类</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(testCases.test_cases || []).map((testCase) => (
                      <TableRow key={testCase.id}>
                        <TableCell className="font-mono">{testCase.id}</TableCell>
                        <TableCell>{testCase.name}</TableCell>
                        <TableCell>{testCase.description || '-'}</TableCell>
                        <TableCell>
                          {testCase.category ? (
                            <Badge variant="outline">{testCase.category}</Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">暂无数据</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ETL与数据导出 */}
        <TabsContent value="etl" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ETL与数据导出</CardTitle>
              <CardDescription>提取和导出轨迹数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-muted-foreground">
                ETL和数据导出功能需要调用相应的API接口。请根据实际需求使用以下服务函数：
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>extractTrajectoryData - 提取轨迹数据</li>
                <li>exportTrajectoryData - 导出轨迹数据</li>
                <li>prepareTrainingBatch - 准备训练批次</li>
                <li>exportBatchJsonl - 导出JSONL格式</li>
                <li>exportBatchJson - 导出JSON格式</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROLL 管理 */}
        <TabsContent value="roll" className="space-y-4">
          <RollManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ROLL 管理标签页组件
function RollManagementTab() {
  const [rollMetrics, setRollMetrics] = useState<RollMetrics | null>(null);
  const [rollMetricsLoading, setRollMetricsLoading] = useState(false);
  const [rollWorkersStatus, setRollWorkersStatus] = useState<RollWorkersStatus | null>(null);
  const [rollWorkersLoading, setRollWorkersLoading] = useState(false);
  const [rollHealth, setRollHealth] = useState<RollHealth | null>(null);
  const [rollHealthLoading, setRollHealthLoading] = useState(false);
  const [shouldUseRollResult, setShouldUseRollResult] = useState<ShouldUseRollResponse | null>(null);
  const [shouldUseRollLoading, setShouldUseRollLoading] = useState(false);

  // 获取 ROLL 监控指标
  async function handleGetRollMetrics() {
    setRollMetricsLoading(true);
    try {
      const result = await getRollMetrics();
      if (result) {
        setRollMetrics(result);
      }
    } catch (error) {
      console.error('获取 ROLL 监控指标失败:', error);
      alert('获取 ROLL 监控指标失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setRollMetricsLoading(false);
    }
  }

  // 获取 Workers 状态
  async function handleGetRollWorkersStatus() {
    setRollWorkersLoading(true);
    try {
      const result = await getRollWorkersStatus();
      if (result) {
        setRollWorkersStatus(result);
      }
    } catch (error) {
      console.error('获取 Workers 状态失败:', error);
      alert('获取 Workers 状态失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setRollWorkersLoading(false);
    }
  }

  // 获取健康状态
  async function handleGetRollHealth() {
    setRollHealthLoading(true);
    try {
      const result = await getRollHealth();
      if (result) {
        setRollHealth(result);
      }
    } catch (error) {
      console.error('获取 ROLL 健康状态失败:', error);
      alert('获取 ROLL 健康状态失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setRollHealthLoading(false);
    }
  }

  // 检查是否使用 ROLL
  async function handleShouldUseRoll() {
    setShouldUseRollLoading(true);
    try {
      // 使用导入的函数
      const checkRollFunction = shouldUseRoll;
      const result = await checkRollFunction();
      if (result) {
        setShouldUseRollResult(result);
      }
    } catch (error) {
      console.error('检查是否使用 ROLL 失败:', error);
      alert('检查是否使用 ROLL 失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setShouldUseRollLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* ROLL 监控指标 */}
      <Card>
        <CardHeader>
          <CardTitle>ROLL 监控指标</CardTitle>
          <CardDescription>查看 ROLL 架构的监控指标</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGetRollMetrics} disabled={rollMetricsLoading}>
            {rollMetricsLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                加载中...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                获取指标
              </>
            )}
          </Button>
          {rollMetrics && (
            <div className="space-y-2">
              <div className="text-sm">
                <div>总请求数: {rollMetrics.totalRequests}</div>
                <div>平均延迟: {rollMetrics.avgLatency}ms</div>
                <div>错误率: {(rollMetrics.errorRate * 100).toFixed(2)}%</div>
                <div>吞吐量: {rollMetrics.throughput}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workers 状态 */}
      <Card>
        <CardHeader>
          <CardTitle>Workers 状态</CardTitle>
          <CardDescription>查看 ROLL Workers 的运行状态</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGetRollWorkersStatus} disabled={rollWorkersLoading}>
            {rollWorkersLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                加载中...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                获取状态
              </>
            )}
          </Button>
          {rollWorkersStatus && (
            <div className="space-y-2">
              <div className="text-sm">
                <div>总 Workers: {rollWorkersStatus.totalWorkers}</div>
                <div>活跃 Workers: {rollWorkersStatus.activeWorkers}</div>
                <div>空闲 Workers: {rollWorkersStatus.idleWorkers}</div>
              </div>
              {rollWorkersStatus.workers && rollWorkersStatus.workers.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Workers 列表:</div>
                  <div className="space-y-1">
                    {rollWorkersStatus.workers.map((worker, idx) => (
                      <div key={idx} className="text-sm p-2 border rounded">
                        <div>ID: {worker.id}</div>
                        <div>状态: {worker.status}</div>
                        <div>最后心跳: {new Date(worker.lastHeartbeat).toLocaleString('zh-CN')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 健康检查 */}
      <Card>
        <CardHeader>
          <CardTitle>ROLL 健康检查</CardTitle>
          <CardDescription>检查 ROLL 服务的健康状态</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGetRollHealth} disabled={rollHealthLoading}>
            {rollHealthLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                检查中...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                健康检查
              </>
            )}
          </Button>
          {rollHealth && (
            <div className="space-y-2">
              <div className="text-sm">
                <div>
                  状态:{' '}
                  <Badge
                    variant={
                      rollHealth.status === 'healthy'
                        ? 'default'
                        : rollHealth.status === 'degraded'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {rollHealth.status}
                  </Badge>
                </div>
                <div>版本: {rollHealth.version}</div>
                <div>运行时间: {rollHealth.uptime}秒</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 是否使用 ROLL */}
      <Card>
        <CardHeader>
          <CardTitle>是否使用 ROLL</CardTitle>
          <CardDescription>检查是否应该使用 ROLL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleShouldUseRoll} disabled={shouldUseRollLoading}>
            {shouldUseRollLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                检查中...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                检查
              </>
            )}
          </Button>
          {shouldUseRollResult && (
            <div className="space-y-2">
              <div className="text-sm">
                <div>
                  是否使用:{' '}
                  <Badge variant={shouldUseRollResult.shouldUse ? 'default' : 'secondary'}>
                    {shouldUseRollResult.shouldUse ? '是' : '否'}
                  </Badge>
                </div>
                {shouldUseRollResult.reason && <div>原因: {shouldUseRollResult.reason}</div>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
