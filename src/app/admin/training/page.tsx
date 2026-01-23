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
  // 迭代部署工作流管理
  executeWorkflow,
  getWorkflowStatus,
  // 模型版本 A/B 测试管理
  createModelAbTest,
  analyzeModelAbTest,
  promoteModelVersion,
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
  // 迭代部署工作流管理
  ExecuteWorkflowRequest,
  ExecuteWorkflowResponse,
  GetWorkflowStatusResponse,
  // 模型版本 A/B 测试管理
  CreateModelAbTestRequest,
  CreateModelAbTestResponse,
  AnalyzeModelAbTestRequest,
  AnalyzeModelAbTestResponse,
  PromoteModelVersionRequest,
  PromoteModelVersionResponse,
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
  Workflow,
  TrendingUp,
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
  const [createJobForm, setCreateJobForm] = useState<{
    dataset_version: string;
    model_type: 'SFT' | 'RLHF' | 'RL' | 'DPO' | 'PPO';
    base_model: string;
    batch_size: number;
    learning_rate: number;
    num_epochs: number;
  }>({
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
          <TabsTrigger value="workflows">
            <Workflow className="mr-2 h-4 w-4" />
            工作流管理
          </TabsTrigger>
          <TabsTrigger value="model-abtest">
            <TrendingUp className="mr-2 h-4 w-4" />
            模型版本A/B测试
          </TabsTrigger>
        </TabsList>

        {/* 训练管理 */}
        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* 左侧：任务列表 (2/3) */}
            <div className="col-span-2 space-y-4">
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
                      className="h-9"
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
                      <SelectTrigger className="w-[200px] h-9">
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
                    <Button onClick={loadTrainingJobs} disabled={trainingJobsLoading} size="sm">
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
                    <div className="space-y-2">
                      {(trainingJobs || []).map((job) => (
                        <Card key={job.job_id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-semibold">{job.job_id}</span>
                                {getStatusBadge(job.status)}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>数据集: {job.dataset_version || '-'}</span>
                                <span>创建: {job.created_at ? new Date(job.created_at).toLocaleString('zh-CN') : '-'}</span>
                              </div>
                            </div>
                            {job.status === 'PENDING' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartJob(job.job_id)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {trainingJobsTotal > 0 && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      共 {trainingJobsTotal} 条记录
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 右侧：创建表单 (1/3) */}
            <div className="col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>创建训练任务</CardTitle>
                  <CardDescription>创建新的强化学习训练任务</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dataset_version">数据集版本 *</Label>
                      <Input
                        id="dataset_version"
                        placeholder="v1.0.0"
                        value={createJobForm.dataset_version}
                        onChange={(e) =>
                          setCreateJobForm({ ...createJobForm, dataset_version: e.target.value })
                        }
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="model_type">模型类型</Label>
                      <Select
                        value={createJobForm.model_type}
                        onValueChange={(value) =>
                          setCreateJobForm({ ...createJobForm, model_type: value as 'SFT' | 'RLHF' | 'RL' | 'DPO' | 'PPO' })
                        }
                      >
                        <SelectTrigger id="model_type" className="h-9">
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
                        <SelectTrigger id="base_model" className="h-9">
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
                    <div className="grid grid-cols-2 gap-3">
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
                          className="h-9"
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
                          className="h-9"
                        />
                      </div>
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
                        className="h-9"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateJob} disabled={createJobLoading} className="w-full" size="sm">
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
            </div>
          </div>
        </TabsContent>

        {/* 模型管理 */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* 左侧：模型列表 (2/3) */}
            <div className="col-span-2 space-y-4">
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
                    <div className="space-y-2">
                      {(models || []).map((model) => (
                        <Card key={model.version} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-semibold">{model.version}</span>
                                {model.tags && model.tags.length > 0 && (
                                  <div className="flex gap-1">
                                    {model.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {model.tags.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{model.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="font-mono truncate max-w-md">{model.path}</span>
                                <span>创建: {model.created_at ? new Date(model.created_at).toLocaleString('zh-CN') : '-'}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRollbackModel(model.version)}
                            >
                              回滚
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {modelsTotal > 0 && (
                    <div className="mt-4 text-sm text-muted-foreground">共 {modelsTotal} 条记录</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 右侧：注册表单 (1/3) */}
            <div className="col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>注册新模型</CardTitle>
                  <CardDescription>注册训练好的模型版本</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="model_version">版本号 *</Label>
                      <Input
                        id="model_version"
                        placeholder="v1.1.0"
                        value={registerModelForm.version}
                        onChange={(e) =>
                          setRegisterModelForm({ ...registerModelForm, version: e.target.value })
                        }
                        className="h-9"
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
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="model_tags">标签 (逗号分隔)</Label>
                      <Input
                        id="model_tags"
                        placeholder="production,stable"
                        value={registerModelForm.tags}
                        onChange={(e) =>
                          setRegisterModelForm({ ...registerModelForm, tags: e.target.value })
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                  <Button onClick={handleRegisterModel} disabled={registerModelLoading} className="w-full" size="sm">
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
            </div>
          </div>
        </TabsContent>

        {/* 数据集管理 */}
        <TabsContent value="datasets" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* 左侧：版本列表 (2/3) */}
            <div className="col-span-2 space-y-4">
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
                    <div className="space-y-2">
                      {(datasetVersions || []).map((version) => (
                        <Card key={version.version} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-semibold">{version.version}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {(version.trajectory_count ?? 0).toLocaleString()} 轨迹
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                创建: {version.created_at ? new Date(version.created_at).toLocaleString('zh-CN') : '-'}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {datasetVersionsTotal > 0 && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      共 {datasetVersionsTotal} 条记录
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 右侧：创建表单 (1/3) */}
            <div className="col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>创建数据集版本</CardTitle>
                  <CardDescription>基于筛选条件创建新的数据集版本</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
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
                        className="h-9"
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
                        className="h-9"
                      />
                    </div>
                    <div>
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
                        className="h-9"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateVersion} disabled={createVersionLoading} className="w-full" size="sm">
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
            </div>
          </div>
        </TabsContent>

        {/* 评测管理 */}
        <TabsContent value="evaluation" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* OPE报告 */}
            <Card>
              <CardHeader>
                <CardTitle>OPE报告</CardTitle>
                <CardDescription>获取离线策略评估报告</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="model_version">模型版本 *</Label>
                    <Input
                      id="model_version"
                      placeholder="v1.1.0"
                      value={opeReportForm.model_version}
                      onChange={(e) =>
                        setOpeReportForm({ ...opeReportForm, model_version: e.target.value })
                      }
                      className="h-9"
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
                      className="h-9"
                    />
                  </div>
                </div>
                <Button onClick={handleGetOpeReport} disabled={opeReportLoading} className="w-full" size="sm">
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
                  <div className="mt-4 space-y-3 pt-4 border-t">
                    <div className="text-sm font-medium">OPE报告结果</div>
                    <div className="grid grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="p-3">
                          <div className="text-xs text-muted-foreground mb-1">IS改进</div>
                          <div className="text-xl font-bold">
                            {opeReport.metrics?.is_improvement ? (opeReport.metrics.is_improvement * 100).toFixed(2) : '-'}%
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3">
                          <div className="text-xs text-muted-foreground mb-1">DR改进</div>
                          <div className="text-xl font-bold">
                            {opeReport.metrics?.dr_improvement ? (opeReport.metrics.dr_improvement * 100).toFixed(2) : '-'}%
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3">
                          <div className="text-xs text-muted-foreground mb-1">WDR改进</div>
                          <div className="text-xl font-bold">
                            {opeReport.metrics?.wdr_improvement ? (opeReport.metrics.wdr_improvement * 100).toFixed(2) : '-'}%
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <Badge
                        variant={
                          opeReport.recommendation === 'DEPLOY' ? 'default' : 'destructive'
                        }
                        className="text-xs"
                      >
                        建议: {opeReport.recommendation}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 回归门检查 */}
            <Card>
              <CardHeader>
                <CardTitle>回归门检查</CardTitle>
                <CardDescription>检查模型是否满足上线标准</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleCheckRegressionGate} disabled={regressionGateLoading} className="w-full" size="sm">
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
                  <div className="mt-4 space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">检查结果</div>
                      <Badge variant={regressionGate.passed ? 'default' : 'destructive'} className="text-xs">
                        {regressionGate.passed ? '通过' : '未通过'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(regressionGate.checks).map(([key, check]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                          <span className="text-xs">{key}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">
                              {check.value} / {check.threshold}
                            </span>
                            {check.passed ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <Badge
                        variant={
                          regressionGate.recommendation === 'APPROVE_FOR_PRODUCTION'
                            ? 'default'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        建议: {regressionGate.recommendation}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 监控指标 */}
        <TabsContent value="monitoring" className="space-y-4">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">服务状态</CardTitle>
              </CardHeader>
              <CardContent>
                {policyHealth ? (
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
                ) : (
                  <div className="text-xs text-muted-foreground">-</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">QPS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{policyMetrics?.qps ?? '-'}</div>
                <div className="text-xs text-muted-foreground mt-1">请求/秒</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">总轨迹数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(collectionStats?.total_trajectories ?? 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">累计收集</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">风险等级</CardTitle>
              </CardHeader>
              <CardContent>
                {collapseRisk ? (
                  getRiskBadge(collapseRisk.risk_level)
                ) : (
                  <div className="text-xs text-muted-foreground">-</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={loadMonitoringMetrics} size="sm">
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
          <div className="grid grid-cols-3 gap-4">
            {/* 左侧：创建A/B测试 (2/3) */}
            <div className="col-span-2 space-y-4">
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
                        className="h-9"
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
                        className="h-9"
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
                        className="h-9"
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
                        className="h-9"
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
                        className="h-9"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateAbTest} disabled={createAbTestLoading} className="w-full">
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
            </div>

            {/* 右侧：分析结果 (1/3) */}
            <div className="col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>分析A/B测试</CardTitle>
                  <CardDescription>分析已创建的A/B测试</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label>测试ID</Label>
                      <Input
                        placeholder="测试ID"
                        value={abTestId}
                        onChange={(e) => setAbTestId(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <Button onClick={handleAnalyzeAbTest} disabled={abTestAnalysisLoading} className="w-full" size="sm">
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
                    <div className="space-y-3 mt-4 pt-4 border-t">
                      <div className="text-sm font-medium">分析结果</div>
                      {Object.entries(abTestAnalysis.metrics).slice(0, 3).map(([metricName, metric]: [string, any]) => (
                        <div key={metricName} className="space-y-1 text-xs">
                          <div className="font-medium">{metricName}</div>
                          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                            <div>对照组: {metric.control != null ? metric.control.toFixed(3) : '-'}</div>
                            <div>实验组: {metric.treatment != null ? metric.treatment.toFixed(3) : '-'}</div>
                            <div>提升: {metric.lift != null ? (metric.lift * 100).toFixed(2) : '-'}%</div>
                            <div>P值: {metric.p_value != null ? metric.p_value.toFixed(4) : '-'}</div>
                          </div>
                          {metric.significant && (
                            <Badge variant="default" className="text-xs mt-1">显著</Badge>
                          )}
                        </div>
                      ))}
                      <div className="pt-2 border-t">
                        <Badge
                          variant={
                            abTestAnalysis.recommendation === 'DEPLOY_TREATMENT'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          建议: {abTestAnalysis.recommendation}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 安全审计 */}
        <TabsContent value="safety" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 审计报告 */}
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
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {(auditReport.records || []).map((record) => (
                      <Card key={record.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{record.action}</Badge>
                              <span className="text-sm font-medium">{record.resource}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-mono">{record.user_id || '-'}</span>
                              <span>{new Date(record.timestamp).toLocaleString('zh-CN')}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">暂无数据</div>
                )}
                {auditReport && auditReport.total > 0 && (
                  <div className="mt-4 text-sm text-muted-foreground text-center">
                    共 {auditReport.total} 条记录
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 红队测试用例 */}
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
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {(testCases.test_cases || []).map((testCase) => (
                      <Card key={testCase.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold">{testCase.id}</span>
                              {testCase.category && (
                                <Badge variant="outline" className="text-xs">{testCase.category}</Badge>
                              )}
                            </div>
                            <div className="text-sm font-medium">{testCase.name}</div>
                            {testCase.description && (
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {testCase.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">暂无数据</div>
                )}
              </CardContent>
            </Card>
          </div>
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

        {/* 工作流管理 */}
        <TabsContent value="workflows" className="space-y-4">
          <WorkflowManagementTab />
        </TabsContent>

        {/* 模型版本A/B测试 */}
        <TabsContent value="model-abtest" className="space-y-4">
          <ModelAbTestTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 工作流管理标签页组件
function WorkflowManagementTab() {
  const [workflowId, setWorkflowId] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState<GetWorkflowStatusResponse | null>(null);
  const [workflowStatusLoading, setWorkflowStatusLoading] = useState(false);
  const [executeLoading, setExecuteLoading] = useState(false);
  
  // 工作流执行参数
  const [minScore, setMinScore] = useState(0.8);
  const [minReward, setMinReward] = useState(0);
  const [batchSize, setBatchSize] = useState(1000);
  const [autoDeploy, setAutoDeploy] = useState(false);
  const [modelType, setModelType] = useState('claude-3-5-sonnet');
  const [provider, setProvider] = useState('anthropic');
  const [learningRate, setLearningRate] = useState(0.0001);
  const [numEpochs, setNumEpochs] = useState(3);
  const [trainingBatchSize, setTrainingBatchSize] = useState(32);

  // 执行工作流
  async function handleExecuteWorkflow() {
    setExecuteLoading(true);
    try {
      const request: ExecuteWorkflowRequest = {
        minScore,
        minReward,
        batchSize,
        modelConfig: {
          model_type: modelType,
          provider,
        },
        trainingConfig: {
          learning_rate: learningRate,
          num_epochs: numEpochs,
          batch_size: trainingBatchSize,
        },
        autoDeploy,
      };
      
      const result = await executeWorkflow(request);
      if (result) {
        setWorkflowId(result.workflowId);
        setWorkflowStatus({
          workflowId: result.workflowId,
          status: result.status,
          currentStep: result.steps[result.steps.length - 1]?.step,
          steps: result.steps.map(s => ({
            step: s.step,
            status: s.status,
          })),
        });
        alert(`工作流已启动: ${result.workflowId}`);
      }
    } catch (error) {
      console.error('执行工作流失败:', error);
      alert('执行工作流失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setExecuteLoading(false);
    }
  }

  // 获取工作流状态
  async function handleGetWorkflowStatus() {
    if (!workflowId) {
      alert('请输入工作流ID');
      return;
    }
    
    setWorkflowStatusLoading(true);
    try {
      const result = await getWorkflowStatus(workflowId);
      if (result) {
        setWorkflowStatus(result);
      }
    } catch (error) {
      console.error('获取工作流状态失败:', error);
      alert('获取工作流状态失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setWorkflowStatusLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* 左侧：执行工作流 (2/3) */}
      <div className="col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>执行迭代部署工作流</CardTitle>
            <CardDescription>执行完整的迭代部署工作流，包括数据准备、模型训练、评估、部署等步骤</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>最小验证分数</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={minScore}
                  onChange={(e) => setMinScore(parseFloat(e.target.value))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label>最小 Reward</Label>
                <Input
                  type="number"
                  value={minReward}
                  onChange={(e) => setMinReward(parseInt(e.target.value))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label>批次大小</Label>
                <Input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label>模型类型</Label>
                <Input
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label>提供商</Label>
                <Input
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label>学习率</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label>Epochs</Label>
                <Input
                  type="number"
                  value={numEpochs}
                  onChange={(e) => setNumEpochs(parseInt(e.target.value))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label>训练批次大小</Label>
                <Input
                  type="number"
                  value={trainingBatchSize}
                  onChange={(e) => setTrainingBatchSize(parseInt(e.target.value))}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoDeploy"
                checked={autoDeploy}
                onChange={(e) => setAutoDeploy(e.target.checked)}
              />
              <Label htmlFor="autoDeploy">自动部署（如果通过评估）</Label>
            </div>
            <Button onClick={handleExecuteWorkflow} disabled={executeLoading} className="w-full">
              {executeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  执行中...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  执行工作流
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 右侧：工作流状态 (1/3) */}
      <div className="col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>工作流状态</CardTitle>
            <CardDescription>查询工作流的执行状态和进度</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>工作流ID</Label>
                <Input
                  placeholder="工作流ID"
                  value={workflowId}
                  onChange={(e) => setWorkflowId(e.target.value)}
                  className="h-9"
                />
              </div>
              <Button onClick={handleGetWorkflowStatus} disabled={workflowStatusLoading} className="w-full" size="sm">
                {workflowStatusLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    查询中...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    查询状态
                  </>
                )}
              </Button>
            </div>
            
            {workflowStatus && (
              <div className="space-y-3 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">工作流ID:</span>
                    <span className="font-mono text-xs">{workflowStatus.workflowId}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">状态:</span>
                    <Badge variant={workflowStatus.status === 'SUCCESS' ? 'default' : workflowStatus.status === 'FAILED' ? 'destructive' : 'secondary'} className="text-xs">
                      {workflowStatus.status}
                    </Badge>
                  </div>
                  {workflowStatus.currentStep && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">当前步骤:</span>
                      <span className="text-xs">{workflowStatus.currentStep}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1 pt-2 border-t">
                  <div className="text-xs font-medium text-muted-foreground mb-2">步骤列表:</div>
                  {workflowStatus.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <Badge variant={step.status === 'SUCCESS' ? 'default' : step.status === 'FAILED' ? 'destructive' : 'secondary'} className="text-xs">
                        {step.status}
                      </Badge>
                      <span className="truncate">{step.step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 模型版本A/B测试标签页组件
function ModelAbTestTab() {
  const [createLoading, setCreateLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [promoteLoading, setPromoteLoading] = useState(false);
  
  // 创建A/B测试参数
  const [experimentName, setExperimentName] = useState('');
  const [experimentDescription, setExperimentDescription] = useState('');
  const [controlVersion, setControlVersion] = useState('');
  const [treatmentVersion, setTreatmentVersion] = useState('');
  const [controlTraffic, setControlTraffic] = useState(50);
  const [treatmentTraffic, setTreatmentTraffic] = useState(50);
  const [successMetrics, setSuccessMetrics] = useState('');
  const [minSampleSize, setMinSampleSize] = useState(1000);
  const [durationDays, setDurationDays] = useState(7);
  
  // A/B测试结果
  const [experimentId, setExperimentId] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeModelAbTestResponse | null>(null);

  // 创建A/B测试
  async function handleCreateAbTest() {
    if (!experimentName || !experimentDescription || !controlVersion || !treatmentVersion || !successMetrics) {
      alert('请填写所有必填字段');
      return;
    }
    
    setCreateLoading(true);
    try {
      const request: CreateModelAbTestRequest = {
        name: experimentName,
        description: experimentDescription,
        controlVersion,
        treatmentVersion,
        trafficSplit: {
          control: controlTraffic,
          treatment: treatmentTraffic,
        },
        successMetrics: successMetrics.split(',').map(s => s.trim()),
        minSampleSize,
        durationDays,
      };
      
      const result = await createModelAbTest(request);
      if (result) {
        setExperimentId(result.experimentId);
        alert(`A/B测试已创建: ${result.experimentId}`);
      }
    } catch (error) {
      console.error('创建A/B测试失败:', error);
      alert('创建A/B测试失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setCreateLoading(false);
    }
  }

  // 分析A/B测试
  async function handleAnalyzeAbTest() {
    if (!experimentId || !controlVersion || !treatmentVersion) {
      alert('请填写实验ID、对照组版本和实验组版本');
      return;
    }
    
    setAnalyzeLoading(true);
    try {
      const request: AnalyzeModelAbTestRequest = {
        experimentId,
        controlVersion,
        treatmentVersion,
      };
      
      const result = await analyzeModelAbTest(request);
      if (result) {
        setAnalysisResult(result);
      }
    } catch (error) {
      console.error('分析A/B测试失败:', error);
      alert('分析A/B测试失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setAnalyzeLoading(false);
    }
  }

  // 推广模型版本
  async function handlePromoteVersion() {
    if (!experimentId || !treatmentVersion) {
      alert('请填写实验ID和实验组版本');
      return;
    }
    
    setPromoteLoading(true);
    try {
      const request: PromoteModelVersionRequest = {
        experimentId,
        treatmentVersion,
      };
      
      const result = await promoteModelVersion(request);
      if (result) {
        alert(`模型版本已推广: ${result.productionVersion}`);
      }
    } catch (error) {
      console.error('推广模型版本失败:', error);
      alert('推广模型版本失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setPromoteLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>模型版本 A/B 测试</CardTitle>
          <CardDescription>创建、分析和推广模型版本的 A/B 测试实验</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">创建实验</TabsTrigger>
              <TabsTrigger value="analyze">分析结果</TabsTrigger>
              <TabsTrigger value="promote">推广版本</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>实验名称 *</Label>
                  <Input
                    value={experimentName}
                    onChange={(e) => setExperimentName(e.target.value)}
                    placeholder="v1.0 vs v1.1 性能对比"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label>对照组版本 *</Label>
                  <Input
                    value={controlVersion}
                    onChange={(e) => setControlVersion(e.target.value)}
                    placeholder="v1.0.0"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>实验描述 *</Label>
                  <Textarea
                    value={experimentDescription}
                    onChange={(e) => setExperimentDescription(e.target.value)}
                    placeholder="对比新版本 v1.1.0 与当前生产版本 v1.0.0 的性能差异"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>实验组版本 *</Label>
                  <Input
                    value={treatmentVersion}
                    onChange={(e) => setTreatmentVersion(e.target.value)}
                    placeholder="v1.1.0"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label>对照组流量 (%)</Label>
                  <Input
                    type="number"
                    value={controlTraffic}
                    onChange={(e) => setControlTraffic(parseInt(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label>实验组流量 (%)</Label>
                  <Input
                    type="number"
                    value={treatmentTraffic}
                    onChange={(e) => setTreatmentTraffic(parseInt(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>成功指标 * (逗号分隔)</Label>
                  <Input
                    value={successMetrics}
                    onChange={(e) => setSuccessMetrics(e.target.value)}
                    placeholder="accuracy, user_satisfaction, latency"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label>最小样本量</Label>
                  <Input
                    type="number"
                    value={minSampleSize}
                    onChange={(e) => setMinSampleSize(parseInt(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label>持续时间 (天)</Label>
                  <Input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value))}
                    className="h-9"
                  />
                </div>
              </div>
              <Button onClick={handleCreateAbTest} disabled={createLoading} className="w-full">
                {createLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    创建A/B测试
                  </>
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="analyze" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>实验ID</Label>
                  <Input
                    value={experimentId}
                    onChange={(e) => setExperimentId(e.target.value)}
                    placeholder="exp_abc123def456"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label>对照组版本</Label>
                  <Input
                    value={controlVersion}
                    onChange={(e) => setControlVersion(e.target.value)}
                    placeholder="v1.0.0"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label>实验组版本</Label>
                  <Input
                    value={treatmentVersion}
                    onChange={(e) => setTreatmentVersion(e.target.value)}
                    placeholder="v1.1.0"
                    className="h-9"
                  />
                </div>
              </div>
              <Button onClick={handleAnalyzeAbTest} disabled={analyzeLoading} className="w-full">
                {analyzeLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    分析结果
                  </>
                )}
              </Button>
              
              {analysisResult && (
                <div className="mt-4 space-y-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-sm">对照组指标:</h4>
                      <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-auto">
                        {JSON.stringify(analysisResult.controlMetrics, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-sm">实验组指标:</h4>
                      <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-auto">
                        {JSON.stringify(analysisResult.treatmentMetrics, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-sm">改进幅度:</h4>
                      <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-auto">
                        {JSON.stringify(analysisResult.improvement, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-sm">统计显著性:</h4>
                      <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-auto">
                        {JSON.stringify(analysisResult.statisticalSignificance, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <span className="font-medium text-sm">推荐:</span>
                    <Badge variant={analysisResult.recommendation === 'PROMOTE' ? 'default' : analysisResult.recommendation === 'REJECT' ? 'destructive' : 'secondary'}>
                      {analysisResult.recommendation}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="font-medium text-sm">原因:</span>
                    <p className="text-sm text-muted-foreground mt-1">{analysisResult.reasoning}</p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="promote" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>实验ID</Label>
                  <Input
                    value={experimentId}
                    onChange={(e) => setExperimentId(e.target.value)}
                    placeholder="exp_abc123def456"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label>实验组版本</Label>
                  <Input
                    value={treatmentVersion}
                    onChange={(e) => setTreatmentVersion(e.target.value)}
                    placeholder="v1.1.0"
                    className="h-9"
                  />
                </div>
              </div>
              <Button onClick={handlePromoteVersion} disabled={promoteLoading} className="w-full">
                {promoteLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    推广中...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    推广版本
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
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
