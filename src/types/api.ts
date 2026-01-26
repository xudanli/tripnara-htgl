/**
 * API 类型定义
 */

// ==================== 基础响应类型 ====================

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string; // NOT_FOUND, VALIDATION_ERROR, INTERNAL_ERROR 等
    message: string;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== 用户管理 ====================

export interface User {
  id: string;
  googleSub: string | null;
  email: string | null;
  emailVerified: boolean | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface UserPreferences {
  preferredAttractionTypes?: string[];
  dietaryRestrictions?: string[];
  preferOffbeatAttractions?: boolean;
  travelPreferences?: {
    pace?: 'LEISURE' | 'MODERATE' | 'FAST';
    budget?: 'LOW' | 'MEDIUM' | 'HIGH';
    accommodation?: 'BUDGET' | 'COMFORTABLE' | 'LUXURY';
  };
  nationality?: string;
  residencyCountry?: string;
  tags?: string[];
  other?: Record<string, unknown>;
}

export interface UserProfile {
  preferences: UserPreferences | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends User {
  profile: UserProfile | null;
  tripCount: number;
  collectionCount: number;
  likeCount: number;
}

export interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  googleUsers: number;
  todayNewUsers: number;
  weekNewUsers: number;
  monthNewUsers: number;
  usersWithProfile: number;
  generatedAt: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  emailVerified?: boolean;
}

export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserRequest {
  displayName?: string;
  email?: string;
  emailVerified?: boolean;
  avatarUrl?: string;
}

export interface DeleteUserResponse {
  deleted: boolean;
  userId: string;
  deletedAt: string;
}

// ==================== 联系消息管理 ====================

export interface ContactMessageImage {
  id: string;
  filePath: string;
  fileName: string;
  fileSize: string; // 字节数（字符串格式）
  mimeType: string;
  fileUrl?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  userId?: string; // 可为空（匿名用户）
  message?: string;
  status: 'pending' | 'read' | 'replied' | 'resolved';
  createdAt: string;
  updatedAt: string;
  images: ContactMessageImage[];
}

export interface GetContactMessagesParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'read' | 'replied' | 'resolved';
  userId?: string;
  search?: string;
}

export interface GetContactMessagesResponse {
  messages: ContactMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateMessageStatusRequest {
  status: 'pending' | 'read' | 'replied' | 'resolved';
}

export interface ReplyMessageRequest {
  reply: string;
}

export interface ReplyMessageResponse extends ContactMessage {
  reply: string;
  repliedAt: string;
}

// ==================== 准备度Pack管理 ====================

// 多语言字符串类型
export type LocalizedString = string | {
  en: string;
  zh?: string;
};

// 季节类型
export type SeasonType =
  | 'polar_night'   // 极夜
  | 'polar_day'     // 极昼
  | 'shoulder'      // 过渡季
  | 'winter'        // 冬季
  | 'summer'        // 夏季
  | 'rainy'         // 雨季
  | 'dry'           // 旱季
  | 'hurricane'     // 飓风季
  | 'monsoon'       // 季风季
  | 'all';          // 全年

// 准备度分类（规则/清单分类）
export type ReadinessCategory =
  | 'entry_transit'       // 入境/过境
  | 'safety_hazards'      // 安全/危险
  | 'health_insurance'    // 健康/保险
  | 'gear_packing'        // 装备/打包
  | 'activities_bookings' // 活动/预订
  | 'logistics';          // 物流/交通

// 危险类型
export type HazardType =
  | 'AVALANCHE'           // 雪崩
  | 'WEATHER'             // 天气
  | 'TERRAIN'             // 地形
  | 'WILDLIFE'            // 野生动物
  | 'VOLCANIC'            // 火山
  | 'FLOOD'               // 洪水
  | 'EARTHQUAKE'          // 地震
  | 'TSUNAMI'             // 海啸
  | 'ROAD'                // 道路
  | 'ALTITUDE'            // 高海拔
  | 'COLD'                // 严寒
  | 'HEAT'                // 酷热
  | 'UV'                  // 紫外线
  | 'WATER'               // 水域
  | 'OTHER';              // 其他

// 危险等级/严重程度
export type HazardLevel =
  | 'CRITICAL'            // 极度危险
  | 'HIGH'                // 高风险
  | 'MEDIUM'              // 中等风险
  | 'LOW'                 // 低风险
  | 'INFO';               // 信息提示

// 清单分类
export type ChecklistCategory =
  | 'documents'           // 证件文件
  | 'clothing'            // 服装穿着
  | 'gear'                // 装备器材
  | 'electronics'         // 电子设备
  | 'toiletries'          // 洗漱用品
  | 'medicine'            // 药品医疗
  | 'food'                // 食品饮料
  | 'emergency'           // 应急物品
  | 'booking'             // 预订确认
  | 'other';              // 其他

// Pack 列表项（从列表接口返回）
export interface ReadinessPackListItem {
  id: string;                          // 数据库 ID (UUID)
  packId: string;                      // Pack 唯一标识符
  destinationId: string;               // 目的地标识
  displayName: string;                 // 显示名称（默认/英文）
  displayNameEN: string | null;        // 显示名称（英文）
  displayNameCN: string | null;        // 显示名称（中文）
  version: string;                     // 版本号
  lastReviewedAt: string;              // 最后审核时间
  countryCode: string;                 // 国家代码
  region: string | null;               // 区域（默认/英文）
  regionEN: string | null;             // 区域（英文）
  regionCN: string | null;             // 区域（中文）
  city: string | null;                 // 城市（默认/英文）
  cityEN: string | null;               // 城市（英文）
  cityCN: string | null;               // 城市（中文）
  isActive: boolean;                   // 是否激活
  createdAt: string;                   // 创建时间
  updatedAt: string;                   // 更新时间
}

export interface GetReadinessPacksParams {
  page?: number;
  limit?: number;
  countryCode?: string;
  destinationId?: string;
  isActive?: boolean;
  search?: string;
}

export interface GetReadinessPacksResponse {
  packs: ReadinessPackListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 地理信息（支持多语言）
export interface ReadinessPackGeo {
  countryCode: string;
  region?: string | LocalizedString;
  city?: string | LocalizedString;
  lat?: number;
  lng?: number;
}

// 信息来源
export interface ReadinessSource {
  name: string;
  url?: string;
  description?: string;
}

// 规则项
export interface ReadinessRule {
  id?: string;
  title?: LocalizedString;
  description?: LocalizedString;
  category?: ReadinessCategory;
  seasons?: SeasonType[];
  required?: boolean;
  [key: string]: unknown;
}

// 清单项
export interface ReadinessChecklist {
  id?: string;
  title?: LocalizedString;
  description?: LocalizedString;
  category?: ChecklistCategory;
  required?: boolean;
  priority?: number;
  [key: string]: unknown;
}

// 危险提示
export interface ReadinessHazard {
  zoneId?: string;
  type?: HazardType;
  level?: HazardLevel;
  seasons?: SeasonType[];
  metadata?: {
    description?: LocalizedString;
    schedule?: string;
    affectedAreas?: string[];
    precautions?: LocalizedString[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// 完整 Pack 数据（从详情接口返回）
export interface ReadinessPack {
  packId: string;
  destinationId: string;
  displayName: LocalizedString;
  version: string;
  lastReviewedAt: string;
  geo: ReadinessPackGeo;
  supportedSeasons: SeasonType[];
  sources?: ReadinessSource[];
  rules: ReadinessRule[];
  checklists: ReadinessChecklist[];
  hazards?: ReadinessHazard[];
  // 以下字段在详情接口中可能不存在，但编辑时需要
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReadinessPackRequest {
  pack: ReadinessPack;
}

export interface UpdateReadinessPackRequest {
  pack?: ReadinessPack;
  isActive?: boolean;
}

export interface DeleteReadinessPackResponse {
  deleted: boolean;
  packId: string;
}

// ==================== 地点/POI管理 ====================

export type PlaceCategory = 'ATTRACTION' | 'RESTAURANT' | 'SHOPPING' | 'HOTEL' | 'TRANSIT_HUB';

export interface PlaceLocation {
  lat: number;
  lng: number;
}

export interface PlaceCity {
  id: number;
  name: string;
  nameCN?: string;
  nameEN?: string;
  countryCode: string;
  timezone?: string;
}

export interface PlaceStatus {
  isOpen: boolean;
  text: string;
  hoursToday?: string;
}

export interface PlaceListItem {
  id: number;
  uuid: string;
  nameCN: string;
  nameEN?: string;
  category: PlaceCategory;
  address?: string;
  description?: string; // 地点介绍
  rating?: number;
  googlePlaceId?: string;
  location?: PlaceLocation;
  metadata?: any;
  physicalMetadata?: any;
  city?: PlaceCity;
  countryCode?: string; // 从城市信息中提取，方便筛选和显示
  createdAt: string;
  updatedAt: string;
}

export interface Place extends PlaceListItem {
  status?: PlaceStatus;
}

export interface GetPlacesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: PlaceCategory;
  cityId?: number;
  countryCode?: string; // 国家代码（ISO 3166-1 alpha-2）
  orderBy?: 'id' | 'rating' | 'createdAt' | 'updatedAt'; // 排序字段
  orderDirection?: 'asc' | 'desc'; // 排序方向
}

export interface GetPlacesResponse {
  places: PlaceListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrev?: boolean; // 是否有上一页
  hasNext?: boolean; // 是否有下一页
}

export interface UpdatePlaceRequest {
  nameCN?: string;
  nameEN?: string;
  category?: PlaceCategory;
  address?: string;
  description?: string; // 地点介绍
  lat?: number;
  lng?: number;
  cityId?: number;
  googlePlaceId?: string;
  rating?: number;
  metadata?: any;
  physicalMetadata?: any;
}

// ==================== 路线模块（Route Directions）====================

// 节奏偏好
export type PacePreference = 'RELAXED' | 'BALANCED' | 'INTENSE';

// 强度偏好
export type IntensityPreference = 'relaxed' | 'balanced' | 'intense';

// 风险承受度
export type RiskTolerance = 'low' | 'medium' | 'high';

// 路线方向（RouteDirection）
export interface RouteDirection {
  id: number;
  uuid: string;
  countryCode: string;
  name: string;
  nameCN?: string;
  nameEN?: string;
  description?: string;
  tags?: string[];
  regions?: string[];
  entryHubs?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 创建路线方向DTO
export interface CreateRouteDirectionDto {
  countryCode: string;
  name: string;
  nameCN?: string;
  nameEN?: string;
  description?: string;
  tags?: string[];
  regions?: string[];
  entryHubs?: string[];
  isActive?: boolean;
}

// 更新路线方向DTO
export interface UpdateRouteDirectionDto {
  countryCode?: string;
  name?: string;
  nameCN?: string;
  nameEN?: string;
  description?: string;
  tags?: string[];
  regions?: string[];
  entryHubs?: string[];
  isActive?: boolean;
}

// 查询路线方向参数
export interface QueryRouteDirectionDto {
  countryCode?: string;
  tag?: string;
  tags?: string[];
  isActive?: boolean;
  month?: number; // 1-12
}

// 路线模板（RouteTemplate）
export interface RouteTemplate {
  id: number;
  routeDirectionId: number;
  routeDirection?: RouteDirection;
  durationDays: number;
  name: string;
  nameCN?: string;
  nameEN?: string;
  dayPlans?: RouteDayPlan[];
  defaultPacePreference?: PacePreference;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 路线日计划
export interface RouteDayPlan {
  day: number;
  theme?: string;
  requiredNodes?: string[];
  [key: string]: unknown;
}

// 创建路线模板DTO
export interface CreateRouteTemplateDto {
  routeDirectionId: number;
  durationDays: number;
  name: string;
  nameCN?: string;
  nameEN?: string;
  dayPlans?: RouteDayPlan[];
  defaultPacePreference?: PacePreference;
  isActive?: boolean;
}

// 更新路线模板DTO
export interface UpdateRouteTemplateDto {
  routeDirectionId?: number;
  durationDays?: number;
  name?: string;
  nameCN?: string;
  nameEN?: string;
  dayPlans?: RouteDayPlan[];
  defaultPacePreference?: PacePreference;
  isActive?: boolean;
}

// 查询路线模板参数
export interface QueryRouteTemplateDto {
  routeDirectionId?: number;
  durationDays?: number;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// 从模板创建行程DTO
export interface CreateTripFromRouteTemplateDto {
  destination: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  totalBudget?: number;
  pacePreference?: PacePreference;
  intensity?: IntensityPreference;
  transport?: string;
}

// 导入国家Pack DTO
export interface ImportCountryPackDto {
  // 根据实际API定义调整
  [key: string]: unknown;
}

// 路线方向卡片
export interface RouteDirectionCard {
  id: number;
  uuid: string;
  countryCode: string;
  name: string;
  nameCN?: string;
  nameEN?: string;
  description?: string;
  tags?: string[];
  regions?: string[];
  entryHubs?: string[];
  // 可能包含其他卡片特定字段
  [key: string]: unknown;
}

// 路线方向交互项
export interface RouteDirectionInteraction {
  card: RouteDirectionCard;
  matchScore?: number;
  explanation?: string;
  whyNotOthers?: string;
}

// 路线方向说明卡
export interface RouteDirectionExplainer {
  id: number;
  uuid: string;
  countryCode: string;
  name: string;
  nameCN?: string;
  nameEN?: string;
  description?: string;
  // 可能包含其他说明卡特定字段
  [key: string]: unknown;
}

// Trace报告
export interface TraceReport {
  requestId: string;
  // 根据实际API定义调整
  [key: string]: unknown;
}

// Metrics
export interface RouteDirectionMetrics {
  // 根据实际API定义调整
  [key: string]: unknown;
}

// ==================== Context API ====================

// Block 类型
export type ContextBlockType =
  | 'WORLD_MODEL'           // 世界模型摘要
  | 'COUNTRY_VISA'          // 签证/证件要求
  | 'COUNTRY_ROAD_RULES'    // 道路规则
  | 'COUNTRY_SAFETY'        // 安全信息
  | 'COUNTRY_WEATHER'       // 天气窗口
  | 'ABU_RULES'             // Abu 的硬规则
  | 'DRDRE_RULES'           // Dr.Dre 的节奏规则
  | 'NEPTUNE_RULES'         // Neptune 的哲学规则
  | 'PLAN_SUMMARY'          // 计划摘要
  | 'PLAN_DAY'              // 某天的计划片段
  | 'DECISION_LOG'          // 决策日志摘要
  | 'USER_PROFILE'          // 用户画像
  | 'CONSTRAINTS';          // 约束条件

// Block 可见性
export type BlockVisibility = 'public' | 'private';

// Block 来源
export interface BlockProvenance {
  source: 'skill' | 'pack' | 'user' | 'system';
  identifier: string;
  timestamp: string;
}

// Context Block
export interface ContextBlock {
  key: string;
  type: ContextBlockType;
  text: string;
  priority: number; // 0-100
  visibility: BlockVisibility;
  provenance: BlockProvenance;
  estimatedTokens: number;
}

// Context Package
export interface ContextPackage {
  id: string;
  tripId?: string;
  phase: string;
  agent: string;
  userQuery: string;
  blocks: ContextBlock[];
  totalTokens: number;
  tokenBudget: number;
  compressed: boolean;
  createdAt: string;
  metadata?: {
    skillsCalled?: string[];
    cacheHit?: boolean;
    [key: string]: unknown;
  };
}

// 构建 Context Package 请求
export interface BuildContextRequest {
  tripId?: string;
  phase: string;
  agent: string;
  userQuery: string;
  tokenBudget?: number; // 100-100000, 默认 3600
  includePrivate?: boolean; // 默认 false
  requiredTopics?: string[]; // 如: ["VISA", "ROAD_RULES", "SAFETY"]
  excludeTopics?: string[];
  useCache?: boolean; // 默认 true
}

// 构建 Context Package 响应
export interface BuildContextResponse {
  contextPackage: ContextPackage;
}

// 压缩策略
export type CompressionStrategy = 'aggressive' | 'conservative' | 'balanced';

// 压缩 Context Package 请求
export interface CompressContextRequest {
  blocks: ContextBlock[];
  tokenBudget: number; // 100-100000
  strategy?: CompressionStrategy; // 默认 'balanced'
  preserveKeys?: string[]; // 需要保留的关键块 key
}

// 压缩统计
export interface CompressionStats {
  originalBlocks: number;
  compressedBlocks: number;
  originalTokens: number;
  compressedTokens: number;
  reductionRatio: number; // 压缩率 (0-1)
  removedKeys: string[];
}

// 压缩 Context Package 响应
export interface CompressContextResponse {
  compressedBlocks: ContextBlock[];
  stats: CompressionStats;
}

// 投影状态请求
export interface ProjectStateRequest {
  state: Record<string, unknown>; // TripState 或 LangGraphState
  includeFullState?: boolean; // 默认 false
  decisionLogLimit?: number; // 1-100, 默认 5
  rejectionLogLimit?: number; // 1-50, 默认 3
  tokenBudget?: number; // 用于自动裁剪
}

// 投影状态响应
export interface ProjectStateResponse {
  projection: {
    public: Record<string, unknown>;
    private: {
      fullState?: Record<string, unknown>;
      toolRawOutputs?: Record<string, string>;
      debugLogs?: string[];
      longLists?: Record<string, string>;
    };
    metadata: {
      projectedAt: string;
      tokenCount: number;
      truncated: boolean;
    };
  };
}

// 写入回写请求
export interface WriteBackRequest {
  tripRunId: string;
  attemptNumber: number; // >= 1
  scratchpad: {
    planOutline?: string;
    openQuestions?: string[];
    constraintsAssumed?: string[];
    nextActions?: string[];
    failureNotes?: string;
  };
  decisionLogDelta?: unknown[];
  artifactsRefs?: Record<string, string>;
}

// 写入回写响应
export interface WriteBackResponse {
  message: string;
}

// 获取指标参数（前端接口）
export interface GetContextMetricsParams {
  tripId?: string;
  phase?: string;
  agent?: string;
  startTime?: string; // ISO 8601
  endTime?: string; // ISO 8601
}

// 质量等级
export type QualityLevel = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

// 质量分布
export interface QualityDistribution {
  EXCELLENT: number;
  GOOD: number;
  FAIR: number;
  POOR: number;
}

// Block 类型统计
export interface BlockTypeStat {
  type: string;
  count: number;
}

// 指标摘要（前端接口）
export interface ContextMetricsSummary {
  timeRange?: {
    start: string;
    end: string;
  };
  totalRecords: number;
  avgTokens: number;
  avgCompressionRate: number;
  avgHitRate?: number;
  avgNoiseRate: number;
  cacheHitRate: number;
  avgBuildTimeMs: number;
  qualityDistribution: QualityDistribution;
  topBlockTypes: BlockTypeStat[];
}

// Agent 统计
export interface AgentStats {
  count: number;
  avgTokens: number;
  avgBuildTimeMs: number;
  cacheHitRate: number;
}

// Phase 统计
export interface PhaseStats {
  count: number;
  avgTokens: number;
  avgBuildTimeMs: number;
  cacheHitRate: number;
}

// 获取指标响应（前端接口）
export interface GetContextMetricsResponse {
  summary: ContextMetricsSummary;
  byAgent?: Record<string, AgentStats>;
  byPhase?: Record<string, PhaseStats>;
}

// Context Package 列表项（前端接口）
export interface ContextPackageListItem {
  id: string;
  tripId?: string;
  phase: string;
  agent: string;
  userQuery: string;
  blocksCount: number;
  totalTokens: number;
  tokenBudget: number;
  compressed: boolean;
  createdAt: string;
}

// 获取 Context Package 列表参数
export interface GetContextPackagesParams {
  page?: number;
  limit?: number;
  tripId?: string;
  phase?: string;
  agent?: string;
  startTime?: string;
  endTime?: string;
  search?: string;
}

// 旧的 GetContextPackagesResponse 已删除，使用新的匹配文档的定义

// Context Package 详情响应（前端接口）
export interface GetContextPackageDetailResponse {
  package: ContextPackage;
  metrics?: ContextMetricsDetail;
}

// Context Metrics Detail（用于详情页）
export interface ContextMetricsDetail {
  id: string;
  tripId?: string;
  phase?: string;
  agent?: string;
  timestamp: string;
  tokens: {
    total: number;
    budget: number;
    overBudget: boolean;
    overBudgetRate: number;
  };
  blocks: {
    total: number;
    public: number;
    private: number;
    compressed: boolean;
  };
  quality: {
    hitRate: number;
    noiseRate: number;
    relevanceScore: number;
    quality: QualityLevel;
  };
  performance: {
    buildTimeMs: number;
    cacheHit: boolean;
    skillsCalled?: string[];
  };
}

// 分析报告 - Token 使用趋势
export interface TokenUsageTrend {
  timestamp: string;
  avgTokens: number;
  maxTokens: number;
  minTokens: number;
  count: number;
}

// 分析报告 - 缓存命中率趋势
export interface CacheHitRateTrend {
  timestamp: string;
  cacheHitRate: number;
  count: number;
}

// 分析报告 - 压缩分析
export interface CompressionAnalysis {
  avgCompressionRate: number;
  compressionRateDistribution: Array<{
    range: string;
    count: number;
  }>;
}

// 分析报告 - 质量分析
export interface QualityAnalysis {
  distribution: Record<string, number>;
  trend: Array<{
    timestamp: string;
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  }>;
}

// 分析报告 - Top Block Types
export interface TopBlockType {
  type: string;
  count: number;
  avgTokens: number;
}

// 分析报告 - 性能瓶颈
export interface PerformanceBottleneck {
  agent: string;
  phase: string;
  avgBuildTimeMs: number;
  count: number;
}

// 获取分析报告参数
export interface GetContextAnalyticsParams {
  startTime?: string;
  endTime?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

// 获取分析报告响应
export interface GetContextAnalyticsResponse {
  tokenUsageTrend: TokenUsageTrend[];
  cacheHitRateTrend: CacheHitRateTrend[];
  compressionAnalysis: CompressionAnalysis;
  qualityAnalysis: QualityAnalysis;
  topBlockTypes: TopBlockType[];
  performanceBottlenecks: PerformanceBottleneck[];
}

// ==================== RL Training 管理后台 API ====================

// ==================== 一、训练管理 ====================

// 模型类型
export type ModelType = 'SFT' | 'RLHF' | 'RL' | 'DPO' | 'PPO';

// 基础模型
export type BaseModel =
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'claude-3-haiku'
  | 'gpt-4-turbo'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'llama-3-70b'
  | 'llama-3-8b'
  | 'mistral-large'
  | 'mistral-medium'
  | 'qwen-72b'
  | 'deepseek-v2'
  | 'custom';

// 训练任务状态
export type TrainingJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// 训练类型
export type TrainingType = 'PREFERENCE_COMPARISON' | 'SCORE_REGRESSION';

// 模型配置
export interface ModelConfig {
  model_type: ModelType;
  base_model: string;
  [key: string]: unknown;
}

// 训练配置
export interface TrainingConfig {
  batch_size: number;
  learning_rate: number;
  num_epochs: number;
  [key: string]: unknown;
}

// 创建训练任务请求
export interface CreateTrainingJobRequest {
  dataset_version: string;
  model_config: ModelConfig;
  training_config: TrainingConfig;
}

// 训练任务响应
export interface TrainingJob {
  job_id: string;
  status: TrainingJobStatus;
  dataset_version?: string;
  model_config?: ModelConfig;
  training_config?: TrainingConfig;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  [key: string]: unknown;
}

// 创建训练任务响应
export interface CreateTrainingJobResponse {
  job_id: string;
  status: TrainingJobStatus;
}

// 获取训练任务列表参数
export interface GetTrainingJobsParams {
  page?: number;
  limit?: number;
  status?: TrainingJobStatus;
  dataset_version?: string;
}

// 获取训练任务列表响应
export interface GetTrainingJobsResponse {
  jobs: TrainingJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== 二、模型管理 ====================

// 模型指标
export interface ModelMetrics {
  accuracy?: number;
  loss?: number;
  [key: string]: unknown;
}

// 注册模型请求
export interface RegisterModelRequest {
  version: string;
  path: string;
  metrics?: ModelMetrics;
  tags?: string[];
  [key: string]: unknown;
}

// 模型信息
export interface Model {
  version: string;
  path: string;
  metrics?: ModelMetrics;
  tags?: string[];
  created_at?: string;
  is_production?: boolean;
  [key: string]: unknown;
}

// 获取模型列表参数
export interface GetModelsParams {
  page?: number;
  limit?: number;
  tags?: string[];
  is_production?: boolean;
}

// 获取模型列表响应
export interface GetModelsResponse {
  models: Model[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 回滚模型请求
export interface RollbackModelRequest {
  reason: string;
  [key: string]: unknown;
}

// 回滚模型响应
export interface RollbackModelResponse {
  previous_version: string;
  current_version: string;
}

// ==================== 三、数据集管理 ====================

// 数据集版本过滤器
export interface DatasetVersionFilter {
  min_validation_score?: number;
  country_code?: string;
  [key: string]: unknown;
}

// 创建数据集版本请求
export interface CreateDatasetVersionRequest {
  filter?: DatasetVersionFilter;
  metadata?: {
    description?: string;
    [key: string]: unknown;
  };
}

// 数据集版本信息
export interface DatasetVersion {
  version: string;
  trajectory_count: number;
  filter?: DatasetVersionFilter;
  metadata?: Record<string, unknown>;
  created_at?: string;
  [key: string]: unknown;
}

// 创建数据集版本响应
export interface CreateDatasetVersionResponse {
  version: string;
  trajectory_count: number;
}

// 获取数据集版本列表参数
export interface GetDatasetVersionsParams {
  page?: number;
  limit?: number;
  country_code?: string;
}

// 获取数据集版本列表响应
export interface GetDatasetVersionsResponse {
  versions: DatasetVersion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 版本比较响应
export interface CompareVersionsResponse {
  v1: DatasetVersion;
  v2: DatasetVersion;
  differences: {
    trajectory_count_diff: number;
    filter_diff?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

// ==================== 四、评测管理 ====================

// 评测Router组件请求
export interface EvaluateRouterRequest {
  model_version?: string;
  [key: string]: unknown;
}

// 评测Gate组件请求
export interface EvaluateGateRequest {
  model_version?: string;
  [key: string]: unknown;
}

// 评测Itinerary组件请求
export interface EvaluateItineraryRequest {
  model_version?: string;
  [key: string]: unknown;
}

// 全流程评测请求
export interface EvaluateFullPipelineRequest {
  model_version?: string;
  [key: string]: unknown;
}

// 评测响应（通用）
export interface EvaluationResponse {
  success: boolean;
  metrics?: Record<string, unknown>;
  [key: string]: unknown;
}

// OPE报告请求
export interface OpeReportRequest {
  model_version: string;
  baseline_version: string;
  [key: string]: unknown;
}

// OPE报告响应
export interface OpeReportResponse {
  metrics: {
    is_improvement: number;
    dr_improvement: number;
    wdr_improvement: number;
    [key: string]: unknown;
  };
  recommendation: 'DEPLOY' | 'REJECT' | 'REVIEW';
}

// 回放对比请求
export interface ReplayCompareRequest {
  model_version: string;
  baseline_version: string;
  [key: string]: unknown;
}

// 回放对比响应
export interface ReplayCompareResponse {
  metrics: Record<string, unknown>;
  [key: string]: unknown;
}

// 回归门检查响应
export interface RegressionGateCheckResponse {
  passed: boolean;
  checks: {
    ope_improvement?: {
      value: number;
      threshold: number;
      passed: boolean;
    };
    regression_rate?: {
      value: number;
      threshold: number;
      passed: boolean;
    };
    [key: string]: unknown;
  };
  recommendation: 'APPROVE_FOR_PRODUCTION' | 'REJECT' | 'REVIEW';
}

// ==================== 五、监控指标 ====================

// 策略服务健康响应
export interface PolicyHealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  model_loaded: boolean;
  current_model_version: string;
  qps?: number;
  p95_latency_ms?: number;
  error_rate?: number;
  [key: string]: unknown;
}

// 策略服务指标响应
export interface PolicyMetricsResponse {
  qps: number;
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  error_rate: number;
  [key: string]: unknown;
}

// 轨迹收集统计响应
export interface CollectionStatsResponse {
  total_trajectories: number;
  today_count: number;
  week_count: number;
  month_count: number;
  by_country?: Record<string, number>;
  [key: string]: unknown;
}

// 训练质量指标响应
export interface TrainingQualityMetricsResponse {
  avg_validation_score: number;
  data_quality_score: number;
  coverage_metrics?: Record<string, unknown>;
  [key: string]: unknown;
}

// 模型坍塌风险响应
export interface CollapseRiskResponse {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  indicators: {
    output_diversity: number;
    confidence_distribution: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ==================== 六、A/B测试管理 ====================

// 创建A/B测试请求
export interface CreateAbTestRequest {
  name: string;
  control_model: string;
  treatment_model: string;
  traffic_percentage: number; // 0-100
  metrics: string[];
  [key: string]: unknown;
}

// A/B测试信息
export interface AbTest {
  id: string;
  name: string;
  control_model: string;
  treatment_model: string;
  traffic_percentage: number;
  metrics: string[];
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  created_at?: string;
  [key: string]: unknown;
}

// 创建A/B测试响应
export interface CreateAbTestResponse {
  test_id: string;
  name: string;
  status: string;
}

// 分配用户到测试组请求
export interface AssignUserToAbTestRequest {
  user_id: string;
  test_id: string;
  [key: string]: unknown;
}

// 分配用户到测试组响应
export interface AssignUserToAbTestResponse {
  user_id: string;
  test_id: string;
  group: 'control' | 'treatment';
}

// 分析A/B测试结果响应
export interface AnalyzeAbTestResponse {
  metrics: {
    [metricName: string]: {
      control: number;
      treatment: number;
      lift: number;
      p_value: number;
      significant: boolean;
    };
  };
  recommendation: 'DEPLOY_TREATMENT' | 'KEEP_CONTROL' | 'INCONCLUSIVE';
}

// ==================== 六-1、模型版本 A/B 测试管理 ====================

// 创建模型版本 A/B 测试请求
export interface CreateModelAbTestRequest {
  name: string;
  description: string;
  controlVersion: string;
  treatmentVersion: string;
  trafficSplit?: {
    control: number;
    treatment: number;
  };
  successMetrics: string[];
  minSampleSize?: number;
  durationDays?: number;
}

// 创建模型版本 A/B 测试响应
export interface CreateModelAbTestResponse {
  experimentId: string;
  status: string;
  controlVersion: string;
  treatmentVersion: string;
}

// 分析模型版本 A/B 测试请求
export interface AnalyzeModelAbTestRequest {
  experimentId: string;
  controlVersion: string;
  treatmentVersion: string;
}

// 指标改进信息
export interface MetricImprovement {
  absolute: number;
  percentage: number;
}

// 统计显著性
export interface StatisticalSignificance {
  pValue: number;
  significant: boolean;
}

// 分析模型版本 A/B 测试响应
export interface AnalyzeModelAbTestResponse {
  experimentId: string;
  controlMetrics: Record<string, number>;
  treatmentMetrics: Record<string, number>;
  improvement: Record<string, MetricImprovement>;
  statisticalSignificance: Record<string, StatisticalSignificance>;
  recommendation: 'PROMOTE' | 'REJECT' | 'CONTINUE';
  reasoning: string;
}

// 推广模型版本请求
export interface PromoteModelVersionRequest {
  experimentId: string;
  treatmentVersion: string;
}

// 推广模型版本响应
export interface PromoteModelVersionResponse {
  message: string;
  productionVersion: string;
}

// ==================== 七、安全审计 ====================

// 记录审计请求
export interface RecordAuditRequest {
  action: string;
  resource: string;
  user_id?: string;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}

// 记录审计响应
export interface RecordAuditResponse {
  audit_id: string;
  timestamp: string;
}

// 获取审计报告参数
export interface GetAuditReportParams {
  page?: number;
  limit?: number;
  action?: string;
  resource?: string;
  user_id?: string;
  start_time?: string;
  end_time?: string;
}

// 审计记录
export interface AuditRecord {
  id: string;
  action: string;
  resource: string;
  user_id?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  [key: string]: unknown;
}

// 获取审计报告响应
export interface GetAuditReportResponse {
  records: AuditRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 运行红队测试请求
export interface RunRedTeamTestRequest {
  test_case_ids?: string[];
  [key: string]: unknown;
}

// 运行红队测试响应
export interface RunRedTeamTestResponse {
  test_id: string;
  status: string;
  results?: Record<string, unknown>;
}

// 测试用例
export interface TestCase {
  id: string;
  name: string;
  description?: string;
  category?: string;
  [key: string]: unknown;
}

// 获取测试用例响应
export interface GetTestCasesResponse {
  test_cases: TestCase[];
}

// ==================== 八、ETL与数据导出 ====================

// 提取轨迹数据请求
export interface ExtractTrajectoryDataRequest {
  filters?: {
    country_code?: string;
    date_range?: {
      start: string;
      end: string;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// 提取轨迹数据响应
export interface ExtractTrajectoryDataResponse {
  extraction_id: string;
  trajectory_count: number;
  status: string;
}

// 导出轨迹数据请求
export interface ExportTrajectoryDataRequest {
  extraction_id?: string;
  format?: 'json' | 'jsonl' | 'csv';
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

// 导出轨迹数据响应
export interface ExportTrajectoryDataResponse {
  export_id: string;
  download_url?: string;
  file_size?: number;
  status: string;
}

// 准备训练批次请求
export interface PrepareTrainingBatchRequest {
  dataset_version: string;
  batch_size?: number;
  [key: string]: unknown;
}

// 训练批次信息
export interface TrainingBatch {
  id: string;
  dataset_version: string;
  batch_size: number;
  status: string;
  created_at?: string;
  [key: string]: unknown;
}

// 准备训练批次响应
export interface PrepareTrainingBatchResponse {
  batch_id: string;
  status: string;
}

// 导出批次数据响应（JSONL）
export interface ExportBatchJsonlResponse {
  download_url: string;
  file_size: number;
  line_count: number;
}

// 导出批次数据响应（JSON）
export interface ExportBatchJsonResponse {
  download_url: string;
  file_size: number;
  record_count: number;
}

// ==================== 枚举选项 ====================

// 枚举键类型
export type EnumKey =
  | 'modelType'
  | 'baseModel'
  | 'trainingStatus'
  | 'trainingType'
  | 'sevLevel'
  | 'riskCategory'
  | 'riskHandleAction'
  | 'constraintType'
  | 'constraintSeverity'
  | 'userActionType'
  | 'decisionType'
  | 'evidenceType'
  | 'language'
  | 'season'
  | 'timeRange'
  | 'dangerLevel'
  | 'executability';

// 枚举选项项
export interface EnumOption {
  value: string;
  label?: string;
  labelCN?: string;
  labelEN?: string;
  color?: string;
  icon?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

// 枚举选项响应
export interface EnumOptionsResponse {
  enumKey: EnumKey;
  options: EnumOption[];
}

// 获取所有枚举选项响应
export interface GetAllEnumOptionsResponse {
  [key: string]: EnumOption[];
}

// ==================== 枚举值类型定义 ====================

// SEV级别
export type SevLevel = 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4';

// 风险类别
export type RiskCategory = 'SAFETY' | 'LEGAL' | 'HEALTH' | 'FINANCIAL' | 'LOGISTICS' | 'WEATHER';

// 风险处理动作
export type RiskHandleAction = 'APPROVE' | 'REJECT' | 'MITIGATE';

// 约束类型
export type ConstraintType = 'GEOGRAPHIC' | 'TEMPORAL' | 'COMPLIANCE' | 'USER_PREFERENCE';

// 约束严重程度
export type ConstraintSeverity = 'HARD' | 'SOFT';

// 用户行为类型
export type UserActionType = 'ADOPT' | 'EDIT' | 'EXPORT' | 'ABANDON' | 'FEEDBACK';

// 决策类型
export type DecisionType =
  | 'PLAN_GENERATION'
  | 'ROUTE_SELECTION'
  | 'POI_RECOMMENDATION'
  | 'CONSTRAINT_CHECK'
  | 'RISK_ASSESSMENT'
  | 'USER_CLARIFICATION';

// 决策结果
export type DecisionResult = 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'PENDING_APPROVAL';

// 证据类型
export type EvidenceType =
  | 'GATE_RESULT'
  | 'COMPLIANCE_CHECK'
  | 'CONSTRAINT_CHECK'
  | 'USER_APPROVAL'
  | 'MODEL_DECISION'
  | 'RESEARCH_DATA'
  | 'USER_FEEDBACK';

// 可视化类型
export type VisualizationType = 'DECISION_TREE' | 'EVIDENCE_GRAPH' | 'TIMELINE';

// 语言
export type Language = 'en' | 'zh';

// 季节
export type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';

// 时间范围
export type TimeRange = 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'CUSTOM';

// 危险等级
export type DangerLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// 可执行性
export type Executability = 'EXECUTABLE' | 'PARTIALLY_EXECUTABLE' | 'NOT_EXECUTABLE';

// 风险事件状态
export type RiskEventStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MITIGATED';

// 约束动作
export type ConstraintAction = 'BLOCK' | 'WARN' | 'REQUIRE_APPROVAL';

// 风险类型
export type RiskType = 'WEATHER' | 'SAFETY' | 'ACCESSIBILITY';

// 事件类型
export type IncidentType =
  | 'ROUTE_BLOCKED'
  | 'WEATHER_HAZARD'
  | 'SAFETY_CONCERN'
  | 'LEGAL_ISSUE'
  | 'RESOURCE_UNAVAILABLE';

// 趋势类型
export type TrendType = 'INCREASING' | 'DECREASING' | 'STABLE';

// 排序方式
export type SortOrder = 'ASC' | 'DESC';

// ==================== 行程管理（Admin）====================

// 行程状态
export type TripStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// 行程列表项
export interface TripListItem {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  durationDays: number;
  budgetConfig: {
    totalBudget: number;
    currency: string;
    estimated_flight_visa?: number;
    remaining_for_ground?: number;
    daily_budget?: number;
  };
  pacingConfig: {
    level: string;
    maxDailyActivities: number;
    shortestStave?: string;
  };
  createdAt: string;
  updatedAt: string;
  owner: {
    userId: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
  };
  stats: {
    daysCount: number;
    itemsCount: number;
    collaboratorsCount: number;
    likesCount: number;
    collectionsCount: number;
    sharesCount: number;
  };
}

// 获取行程列表参数
export interface GetTripsAdminParams {
  page?: number;
  limit?: number;
  status?: TripStatus;
  destination?: string;
  startDateFrom?: string;
  startDateTo?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  userId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'startDate' | 'endDate';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// 获取行程列表响应
export interface GetTripsAdminResponse {
  items: TripListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 行程统计信息
export interface TripStats {
  summary: {
    totalTrips: number;
    activeTrips: number;
    completedTrips: number;
    cancelledTrips: number;
    planningTrips: number;
  };
  byStatus: Record<string, { count: number; percentage: number }>;
  byDestination: Record<string, { count: number; percentage: number }>;
  byTimeRange: {
    last7Days: { count: number; newTrips: number };
    last30Days: { count: number; newTrips: number };
    last90Days: { count: number; newTrips: number };
    lastYear: { count: number; newTrips: number };
  };
  engagement: {
    avgDaysPerTrip: number;
    avgItemsPerTrip: number;
    avgCollaboratorsPerTrip: number;
    totalLikes: number;
    totalCollections: number;
    totalShares: number;
  };
  budget: {
    avgBudget: number;
    medianBudget: number;
    totalBudget: number;
    budgetDistribution: Record<string, number>;
  };
  trends: {
    newTripsByMonth: Array<{ month: string; count: number }>;
    completionRateByMonth: Array<{ month: string; rate: number }>;
  };
}

// 获取行程统计参数
export interface GetTripStatsParams {
  startDate?: string;
  endDate?: string;
  destination?: string;
}

// 行程详情
export interface TripDetail {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  durationDays: number;
  budgetConfig: {
    totalBudget: number;
    currency: string;
  };
  pacingConfig: {
    level: string;
    maxDailyActivities: number;
  };
  metadata?: {
    generationProgress?: {
      status: string;
      itemsCount: number;
    };
  };
  createdAt: string;
  updatedAt: string;
  owner: {
    userId: string;
    email: string;
    displayName: string;
  };
  collaborators?: Array<{
    userId: string;
    email: string;
    displayName: string;
    role: string;
    createdAt: string;
  }>;
  days?: Array<{
    id: string;
    date: string;
    itemsCount: number;
    items?: Array<{
      id: string;
      startTime: string;
      endTime: string;
      type: string;
      place?: {
        id: number;
        nameCN: string;
        nameEN: string;
        category: string;
      };
    }>;
  }>;
  stats: {
    daysCount: number;
    itemsCount: number;
    collaboratorsCount: number;
    likesCount: number;
    collectionsCount: number;
    sharesCount: number;
  };
  social?: {
    likes?: Array<{
      userId: string;
      email: string;
      createdAt: string;
    }>;
    collections?: Array<{
      userId: string;
      email: string;
      createdAt: string;
    }>;
    shares?: Array<{
      id: string;
      shareToken: string;
      permission: string;
      expiresAt: string;
      createdAt: string;
    }>;
  };
  decisionLogs?: {
    total: number;
    recent?: Array<{
      id: string;
      timestamp: string;
      source: string;
      decisionType: string;
      summary: string;
    }>;
  };
}

// 批量操作请求
export interface BatchOperationRequest {
  action: 'DELETE' | 'UPDATE_STATUS';
  tripIds: string[];
  params?: {
    status?: TripStatus;
  };
}

// 批量操作响应
export interface BatchOperationResponse {
  action: string;
  total: number;
  success: number;
  failed: number;
  errors?: Array<{
    tripId: string;
    error: string;
  }>;
}

// ==================== 决策日志管理（Admin）====================

// Persona 类型
export type Persona = 'ABU' | 'DR_DRE' | 'NEPTUNE';

// 决策动作
export type DecisionAction = 'ALLOW' | 'REJECT' | 'ADJUST' | 'REPLACE';

// 决策来源
export type DecisionSource = 'PHYSICAL' | 'HUMAN' | 'PHILOSOPHY' | 'HEURISTIC';

// 决策日志项
export interface DecisionLogItem {
  id: string;
  tripId?: string;
  userId?: string;
  persona: Persona;
  action: DecisionAction;
  explanation: string;
  reasonCodes: string[];
  decisionSource: DecisionSource;
  decisionStage: string;
  timestamp: string;
  countryCode?: string;
  routeDirectionId?: string;
  metadata?: {
    decisionTimeMs?: number;
    impactsFinalPlan?: boolean;
  };
}

// 获取决策日志列表参数
export interface GetDecisionLogsParams {
  page?: number;
  limit?: number;
  tripId?: string;
  userId?: string;
  persona?: Persona;
  decisionSource?: DecisionSource;
  action?: DecisionAction;
  startDate?: string;
  endDate?: string;
  sortBy?: 'timestamp';
  sortOrder?: 'asc' | 'desc';
}

// 获取决策日志列表响应
export interface GetDecisionLogsResponse {
  items: DecisionLogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 决策日志详情
export interface DecisionLogDetail extends DecisionLogItem {
  evidenceRefs?: string[];
  metadata?: {
    decisionTimeMs?: number;
    impactsFinalPlan?: boolean;
    availableOptions?: unknown[];
    userChoice?: Record<string, unknown>;
    systemRecommendation?: Record<string, unknown>;
  };
  trip?: {
    id: string;
    destination: string;
    startDate: string;
  };
  user?: {
    id: string;
    email: string;
    displayName: string;
  };
}

// 决策统计信息（匹配新接口文档）
export interface DecisionStats {
  distribution: {
    totalDecisions: number;
    bySource: Record<string, number>;
    bySourcePercentage: Record<string, number>;
    realityDrivenRatio: number;
    details: unknown[];
  };
  personaStats: Array<{
    persona: string;
    triggerCount: number;
    bySource: Record<string, number>;
    primarySource: string;
  }>;
  realityDrivenRatio: number;
}

// 获取决策统计参数
export interface GetDecisionStatsParams {
  startDate?: string;
  endDate?: string;
  countryCode?: string;
  routeDirectionId?: string;
}

// 决策分析报告（匹配新接口文档）
export interface DecisionAnalytics {
  qualityReport: {
    overallScore: number;
    realityDrivenRatio: number;
    explanationQuality: number;
    decisionConsistency: number;
  };
  heuristicHotspots: Array<{
    countryCode: string;
    routeDirectionId: string;
    heuristicRatio: number;
    recommendation: string;
  }>;
  rejectionReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  replacementReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  personaStats?: unknown[];
  distribution?: Record<string, unknown>;
}

// 导出决策日志请求
export interface ExportDecisionLogsRequest {
  format: 'json' | 'csv';
  filters?: {
    tripId?: string;
    persona?: Persona;
    startDate?: string;
    endDate?: string;
    [key: string]: unknown;
  };
}

// 导出决策日志响应（JSON）
export interface ExportDecisionLogsJsonResponse {
  format: 'json';
  data: DecisionLogItem[];
  count: number;
}

// 导出决策日志响应（CSV）
export interface ExportDecisionLogsCsvResponse {
  format: 'csv';
  content: string;
  filename: string;
}

export type ExportDecisionLogsResponse = ExportDecisionLogsJsonResponse | ExportDecisionLogsCsvResponse;

// ==================== 系统监控（Admin）====================

// 系统指标
export interface SystemMetrics {
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: number;
  };
  api: {
    totalRequests: number;
    requestsPerSecond: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    successRate: number;
  };
  database: {
    connectionPoolSize: number;
    activeConnections: number;
    idleConnections: number;
    queryCount: number;
    avgQueryTime: number;
    slowQueries: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    totalKeys: number;
    memoryUsage: number;
  };
  timestamp: string;
}

// 性能指标参数
export interface GetPerformanceParams {
  startTime?: string;
  endTime?: string;
  granularity?: 'hour' | 'day';
}

// 性能指标响应
export interface PerformanceMetrics {
  timeSeries: Array<{
    timestamp: string;
    requestsPerSecond: number;
    avgResponseTime: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
  }>;
  summary: {
    peakRequestsPerSecond: number;
    peakResponseTime: number;
    peakErrorRate: number;
  };
}

// 错误日志统计参数
export interface GetErrorLogsParams {
  startTime?: string;
  endTime?: string;
  level?: 'error' | 'warn';
}

// 错误日志统计响应
export interface ErrorLogsStats {
  summary: {
    totalErrors: number;
    errorRate: number;
    uniqueErrors: number;
  };
  byType: Record<string, { count: number; percentage: number }>;
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurred: string;
  }>;
  trends: {
    errorsByHour: Array<{ hour: string; count: number }>;
  };
}

// 获取请求统计参数
export interface GetRequestStatsParams {
  startTime?: string;
  endTime?: string;
  granularity?: 'hour' | 'day';
}

// 请求统计响应
export interface RequestStatsResponse {
  summary: {
    totalRequests: number;
    requestsPerSecond: number;
    uniqueUsers: number;
    uniqueIPs: number;
  };
  byEndpoint: Array<{
    endpoint: string;
    count: number;
    [key: string]: unknown;
  }>;
  byMethod: Record<string, number>;
  byStatus: Record<string, number>;
  timeSeries: Array<{
    timestamp: string;
    [key: string]: unknown;
  }>;
}

// 数据库状态响应
export interface DatabaseStatusResponse {
  connectionPool: {
    size: number;
    active: number;
    idle: number;
    waiting: number;
  };
  queries: {
    total: number;
    avgTime: number;
    slowQueries: number;
    slowQueryThreshold: number;
  };
  tables: {
    total: number;
    largest: Array<{
      name: string;
      size: number;
      [key: string]: unknown;
    }>;
  };
  health: {
    status: string;
    lastCheck: string;
  };
}

// 缓存状态响应
export interface CacheStatusResponse {
  status: string;
  hitRate: number;
  missRate: number;
  totalKeys: number;
  memoryUsage: {
    used: number;
    max: number;
    percentage: number;
  };
  operations: {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
  };
  topKeys: Array<{
    key: string;
    hits: number;
    [key: string]: unknown;
  }>;
  evictions: number;
}

// ==================== Context 管理（Admin）====================

// Context 指标统计（匹配文档）
export interface ContextMetrics {
  buildRequests: {
    total: number;
    avgDuration: number;
    cacheHitRate: number;
  };
  tokenUsage: {
    totalTokens: number;
    avgTokensPerBuild: number;
    compressionRatio: number;
  };
  cacheStats: {
    hits: number;
    misses: number;
    evictions: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
  };
}

// 获取 Context 指标参数
export interface GetContextMetricsParams {
  startDate?: string;
  endDate?: string;
  granularity?: 'hour' | 'day' | 'week';
}

// Context Package 项（匹配文档）
export interface ContextPackageItem {
  id: string;
  tripId: string;
  phase: string;
  agent: string;
  tokenCount: number;
  blockCount: number;
  createdAt: string;
  cached: boolean;
}

// 获取 Context Package 列表参数
export interface GetContextPackagesParams {
  page?: number;
  limit?: number;
  tripId?: string;
  phase?: string;
  agent?: string;
  startTime?: string;
  endTime?: string;
  search?: string;
}

// 获取 Context Package 列表响应（匹配文档）
export interface GetContextPackagesResponse {
  items: ContextPackageItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Context Package 详情（匹配文档）
export interface ContextPackageDetail extends ContextPackageItem {
  userQuery?: string;
  tokenBudget: number;
  actualTokens: number;
  blocks: Array<{
    topic: string;
    tokens: number;
    priority: string;
    source: string;
  }>;
  metadata?: {
    buildDuration?: number;
    cacheHit?: boolean;
    compressionApplied?: boolean;
    [key: string]: unknown;
  };
}

// Context 分析（匹配文档）
export interface ContextAnalytics {
  byPhase: Record<string, {
    count: number;
    avgTokens: number;
    avgDuration: number;
  }>;
  byAgent: Record<string, {
    count: number;
    avgTokens: number;
  }>;
  topTopics: Array<{
    topic: string;
    usageCount: number;
    avgTokens: number;
  }>;
  trends: {
    dailyBuilds: Array<{
      date: string;
      count: number;
    }>;
  };
}

// 获取 Context 分析参数
export interface GetContextAnalyticsParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'phase' | 'agent' | 'topic';
}

// ==================== Agent 运行管理（Admin）====================

// TripRun 状态
export type TripRunStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

// TripRun 项（匹配文档）
export interface TripRunItem {
  id: string;
  tripId: string;
  userId: string;
  status: TripRunStatus;
  planningPhase: string;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  attemptCount?: number;
}

// 获取 Agent 运行列表参数
export interface GetAgentRunsParams {
  page?: number;
  limit?: number;
  tripId?: string;
  userId?: string;
  status?: TripRunStatus;
  planningPhase?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 获取 Agent 运行列表响应
export interface GetAgentRunsResponse {
  items: TripRunItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// TripAttempt 项（匹配文档）
export interface TripAttemptItem {
  id: string;
  tripRunId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  skillsInvoked?: string[];
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// TripRun 详情（匹配文档）
export interface TripRunDetail extends TripRunItem {
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
  attempts: Array<{
    id: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    skillsInvoked: string[];
    result?: {
      success: boolean;
      [key: string]: unknown;
    };
  }>;
  metadata?: {
    userQuery?: string;
    modelVersion?: string;
    [key: string]: unknown;
  };
}

// Agent 运行统计（匹配文档）
export interface AgentRunsStats {
  totalRuns: number;
  byStatus: {
    COMPLETED: number;
    IN_PROGRESS: number;
    FAILED: number;
  };
  byPhase: {
    INITIAL_PLANNING: number;
    REFINEMENT: number;
    FINALIZATION: number;
  };
  averageDuration: number;
  successRate: number;
}

// 获取 Attempt 列表参数
export interface GetAgentAttemptsParams {
  page?: number;
  limit?: number;
  tripRunId?: string;
  tripId?: string;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 获取 Attempt 列表响应
export interface GetAgentAttemptsResponse {
  items: TripAttemptItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// TripAttempt 详情（匹配文档）
export interface TripAttemptDetail extends Omit<TripAttemptItem, 'skillsInvoked' | 'tokenUsage'> {
  skillsInvoked: Array<{
    name: string;
    duration: number;
    result: string;
  }>;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    breakdown?: Record<string, {
      input: number;
      output: number;
    }>;
  };
  logs?: Array<{
    timestamp: string;
    level: string;
    message: string;
  }>;
}

// Agent 性能分析（匹配文档）
export interface AgentPerformance {
  latency: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  };
  throughput: {
    requestsPerMinute: number;
    peakRequestsPerMinute: number;
  };
  tokenUsage: {
    avgInputTokens: number;
    avgOutputTokens: number;
    totalCost: number;
  };
  errorRate: number;
  timeRange: {
    start: string;
    end: string;
  };
}

// ==================== 规划工作台管理（Admin）====================

// 规划会话状态
export type PlanningSessionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

// 规划会话项
export interface PlanningSessionItem {
  id: string;
  tripId: string;
  userId: string;
  status: PlanningSessionStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// 获取规划会话列表参数
export interface GetPlanningSessionsParams {
  page?: number;
  limit?: number;
  tripId?: string;
  userId?: string;
  status?: PlanningSessionStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 获取规划会话列表响应
export interface GetPlanningSessionsResponse {
  items: PlanningSessionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 规划交互历史项
export interface PlanningInteractionItem {
  id: string;
  type: string;
  content: string;
  timestamp: string;
}

// 规划会话详情
export interface PlanningSessionDetail extends PlanningSessionItem {
  interactions: PlanningInteractionItem[];
  currentPlanId?: string;
}

// 规划会话统计
export interface PlanningSessionsStats {
  summary: {
    totalSessions: number;
    completedSessions: number;
    activeSessions: number;
    cancelledSessions: number;
    successRate: number;
    avgDuration: number;
  };
  byStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

// 规划方案项
export interface PlanningPlanItem {
  id: string;
  sessionId: string;
  tripId: string;
  userId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// 获取规划方案列表参数
export interface GetPlanningPlansParams {
  page?: number;
  limit?: number;
  sessionId?: string;
  tripId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 获取规划方案列表响应
export interface GetPlanningPlansResponse {
  items: PlanningPlanItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 规划方案详情
export interface PlanningPlanDetail extends PlanningPlanItem {
  planData: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// ==================== RAG 管理 API ====================

// RAG 搜索请求
export interface RAGSearchRequest {
  query: string;
  collection: string;
  countryCode?: string;
  tags?: string[];
  limit?: number;
  minScore?: number;
}

// RAG 搜索结果项
export interface RAGSearchResult {
  id: string;
  content: string;
  title: string;
  source: string;
  score: number;
  metadata?: {
    author?: string;
    updatedAt?: string;
    [key: string]: unknown;
  };
}

// RAG 搜索响应
export interface RAGSearchResponse {
  items: RAGSearchResult[];
}

// RAG 集合统计
export interface RAGCollectionStats {
  name: string;
  count: number;
  countries: string[];
  tags: string[];
}

// RAG 统计响应
export interface RAGStatsResponse {
  totalDocuments: number;
  collections: RAGCollectionStats[];
  byCollection?: RAGCollectionStats;
}

// RAG 检索请求参数
export interface RAGRetrieveParams {
  query: string;
  collection: string;
  countryCode?: string;
  limit?: number;
}

// RAG 索引文档请求
export interface RAGIndexDocumentRequest {
  id?: string;
  content: string;
  title?: string;
  collection: string;
  countryCode?: string;
  tags?: string[];
  source?: string;
  metadata?: Record<string, unknown>;
}

// RAG 索引文档响应
export interface RAGIndexDocumentResponse {
  id: string;
  success: boolean;
}

// RAG 批量索引文档请求
export interface RAGBatchIndexRequest {
  content: string;
  title?: string;
  collection: string;
  countryCode?: string;
  tags?: string[];
  source?: string;
  metadata?: Record<string, unknown>;
}

// RAG 批量索引文档响应
export interface RAGBatchIndexResponse {
  ids: string[];
  success: boolean;
  count: number;
}

// Rail Pass 规则请求
export interface RAGRailPassRequest {
  passType: string;
  countryCode: string;
}

// Rail Pass 规则项
export interface RAGRailPassRule {
  passType: string;
  countryCode: string;
  requiresReservation: boolean;
  reservationFee?: string;
  validTrainTypes?: string[];
  restrictions?: string;
  source?: string;
}

// Trail Access 规则请求
export interface RAGTrailAccessRequest {
  trailId: string;
  countryCode: string;
}

// Trail Access 规则响应
export interface RAGTrailAccessResponse {
  trailId: string;
  countryCode: string;
  permitRequired: boolean;
  seasonalRestrictions?: string;
  bookingRequired: boolean;
  maxGroupSize?: number;
  source?: string;
}

// 合规规则刷新响应
export interface RAGComplianceRefreshResponse {
  success: boolean;
  message: string;
}

// 路线叙事请求参数
export interface RAGRouteNarrativeParams {
  countryCode?: string;
  includeLocalInsights?: boolean;
}

// 路线叙事响应
export interface RAGRouteNarrativeResponse {
  routeDirectionId: string;
  narrative: {
    title: string;
    description: string;
    highlights: string[];
    tips: string[];
  };
  localInsights?: Array<{
    content: string;
    tags: string[];
  }>;
}

// 路线段叙事请求
export interface RAGSegmentNarrativeRequest {
  segmentId: string;
  dayIndex: number;
  name: string;
  description: string;
  countryCode: string;
}

// 路线段叙事响应
export interface RAGSegmentNarrativeResponse {
  segmentId: string;
  narrative: {
    title: string;
    content: string;
    duration?: string;
    scenery?: string[];
  };
}

// 当地洞察请求参数
export interface RAGLocalInsightParams {
  countryCode: string;
  tags: string | string[];
  region?: string;
}

// 当地洞察项
export interface RAGLocalInsightItem {
  content: string;
  tags: string[];
  confidence?: number;
}

// 当地洞察响应
export interface RAGLocalInsightResponse {
  countryCode: string;
  region?: string;
  insights: RAGLocalInsightItem[];
}

// 当地洞察刷新请求
export interface RAGLocalInsightRefreshRequest {
  countryCode: string;
  tags: string[];
  region?: string;
}

export interface RAGLocalInsightRefreshResponse {
  success: boolean;
  refreshedAt: string; // ISO 8601 格式
  countryCode: string;
  tags: string[];
  region?: string;
}

// ==================== RAG 文档管理 API ====================

// 获取文档列表请求参数
export interface GetRAGDocumentsParams {
  collection?: string;
  countryCode?: string;
  tags?: string; // 逗号分隔
  page?: number;
  pageSize?: number;
  search?: string;
}

// RAG 文档
export interface RAGDocument {
  id: string;
  collection: string;
  title: string;
  content: string;
  contentPreview?: string;
  source?: string;
  countryCode?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// 文档列表响应
export interface RAGDocumentsResponse {
  documents: RAGDocument[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 更新文档请求
export interface UpdateRAGDocumentRequest {
  title?: string;
  content?: string;
  collection?: string;
  countryCode?: string;
  tags?: string[];
  source?: string;
  metadata?: Record<string, any>;
}

// 更新文档响应
export interface UpdateRAGDocumentResponse {
  id: string;
  message: string;
}

// 删除文档响应
export interface DeleteRAGDocumentResponse {
  id: string;
  message: string;
}

// 目的地深度信息请求参数
export interface RAGDestinationInsightsParams {
  placeId: string;
  tripId?: string;
  countryCode?: string;
}

// 目的地深度信息响应
export interface RAGDestinationInsightsResponse {
  placeId: string;
  insights: {
    tips: Array<{
      content: string;
      source: string;
      score: number;
    }>;
    localInsights: Array<{
      content: string;
      tags: string[];
    }>;
    routeInsights?: {
      answer: string;
      source: string;
    };
  };
  credibility: {
    ragSources: number;
    localInsightsCount: number;
    hasRouteContext: boolean;
  };
}

// 提取行程合规规则请求
export interface RAGExtractComplianceRulesRequest {
  tripId: string;
  countryCodes: string[];
  ruleTypes?: string[];
}

// 合规规则项
export interface ComplianceRuleItem {
  description: string;
  required: boolean;
  deadline?: string;
  source: string;
}

// 合规清单项
export interface ComplianceChecklistItem {
  category: string;
  items: ComplianceRuleItem[];
}

// 提取行程合规规则响应
export interface RAGExtractComplianceRulesResponse {
  tripId: string;
  countryCodes: string[];
  rules: unknown[];
  checklist: ComplianceChecklistItem[];
  summary: {
    totalRules: number;
    totalChecklistItems: number;
    categories: string[];
  };
}

// 回答路线问题请求
export interface RAGAnswerRouteQuestionRequest {
  question: string;
  routeDirectionId?: string;
  countryCode?: string;
  segmentId?: string;
  dayIndex?: number;
  tripId?: string;
}

// 回答路线问题响应
export interface RAGAnswerRouteQuestionResponse {
  answer: string;
  sources: Array<{
    content: string;
    source: string;
    score: number;
  }>;
  confidence: number;
}

// 解释路线选择请求
export interface RAGExplainRouteSelectionRequest {
  selectedRouteId: string;
  alternativeRouteId: string;
  countryCode: string;
}

// 路线比较项
export interface RouteComparison {
  name: string;
  pros: string[];
  cons: string[];
}

// 解释路线选择响应
export interface RAGExplainRouteSelectionResponse {
  explanation: string;
  comparison: {
    selectedRoute: RouteComparison;
    alternativeRoute: RouteComparison;
  };
}

// ==================== LLM 管理 API ====================

// LLM 模型信息
export interface LLMModel {
  name: string;
  label: string;
  available: boolean;
}

// LLM 提供商模型组
export interface LLMProviderModels {
  provider: string;
  models: LLMModel[];
}

// LLM 模型列表响应
export interface LLMModelsResponse {
  models: LLMProviderModels[];
  defaultProvider: string;
  totalModels: number;
  availableModels: number;
}

// LLM Token 使用统计参数
export interface GetLLMUsageParams {
  subAgent?: string;
  provider?: string;
  startTime?: string;
  endTime?: string;
}

// LLM Token 使用统计（总体）
export interface LLMUsageStats {
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  avgTokensPerCall: number;
  timeRange?: {
    start: string;
    end: string;
  };
}

// LLM Token 使用统计（按 Sub-Agent）
export interface LLMUsageStatsBySubAgent {
  subAgent: {
    sub_agent: string;
    tokens: {
      total_prompt_tokens: number;
      total_completion_tokens: number;
      total_tokens: number;
      avg_prompt_tokens: number;
      avg_completion_tokens: number;
      avg_total_tokens: number;
      max_tokens: number;
      min_tokens: number;
    };
    calls: {
      total_calls: number;
      successful_calls: number;
      failed_calls: number;
      success_rate: number;
    };
    latency: {
      avg_latency_ms: number;
      p50_latency_ms: number;
      p90_latency_ms: number;
      p99_latency_ms: number;
      max_latency_ms: number;
    };
    time_range: {
      start_time: string;
      end_time: string;
      duration_hours: number;
    };
  };
}

// LLM 成本统计参数
export interface GetLLMCostParams {
  subAgent?: string;
  provider?: string;
  startTime?: string;
  endTime?: string;
}

// LLM 成本分解项
export interface LLMCostBreakdown {
  provider: string;
  model: string;
  calls: number;
  tokens: number;
  cost: number;
}

// LLM 成本统计响应
export interface LLMCostResponse {
  totalCost: number;
  currency: string;
  byProvider: Record<string, number>;
  bySubAgent: Record<string, number>;
  timeRange?: {
    start: string;
    end: string;
  };
  breakdown: LLMCostBreakdown[];
}

// ==================== ROLL/训练管理接口（Admin）====================

// ROLL 监控指标
export interface RollMetrics {
  totalRequests: number;
  avgLatency: number;
  errorRate: number;
  throughput: number;
  [key: string]: unknown;
}

// ROLL Workers 状态
export interface RollWorkersStatus {
  totalWorkers: number;
  activeWorkers: number;
  idleWorkers: number;
  workers: Array<{
    id: string;
    status: string;
    lastHeartbeat: string;
    [key: string]: unknown;
  }>;
}

// ROLL 健康检查
export interface RollHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  [key: string]: unknown;
}

// 创建 A/B 测试请求
export interface CreateRollAbTestRequest {
  name: string;
  description?: string;
  variants: Array<{
    name: string;
    weight: number;
    config: Record<string, unknown>;
  }>;
  [key: string]: unknown;
}

// 创建 A/B 测试响应
export interface CreateRollAbTestResponse {
  testId: string;
  status: string;
  [key: string]: unknown;
}

// 分析 A/B 测试请求
export interface AnalyzeRollAbTestRequest {
  testId: string;
  [key: string]: unknown;
}

// 分析 A/B 测试响应
export interface AnalyzeRollAbTestResponse {
  testId: string;
  results: Record<string, unknown>;
  [key: string]: unknown;
}

// 检查是否使用 ROLL 响应
export interface ShouldUseRollResponse {
  shouldUse: boolean;
  reason?: string;
  [key: string]: unknown;
}

// ==================== Decision 统计接口（Admin）====================

// Decision 统计概览
export interface DecisionStatsOverview {
  totalDecisions: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  recentTrends: Array<{
    date: string;
    count: number;
  }>;
  [key: string]: unknown;
}

// Decision 按类型统计
export interface DecisionStatsByType {
  byType: Record<string, {
    count: number;
    percentage: number;
    avgConfidence?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

// Decision 趋势数据
export interface DecisionStatsTrends {
  trends: Array<{
    date: string;
    count: number;
    byType?: Record<string, number>;
    [key: string]: unknown;
  }>;
  period: {
    start: string;
    end: string;
  };
  [key: string]: unknown;
}

// ==================== 迭代部署工作流管理 ====================

// 执行迭代部署工作流请求
export interface ExecuteWorkflowRequest {
  minScore?: number;
  minReward?: number;
  batchSize?: number;
  modelConfig?: {
    model_type?: string;
    provider?: string;
    [key: string]: unknown;
  };
  trainingConfig?: {
    learning_rate?: number;
    num_epochs?: number;
    batch_size?: number;
    [key: string]: unknown;
  };
  autoDeploy?: boolean;
  [key: string]: unknown;
}

// 工作流步骤结果
export interface WorkflowStepResult {
  step: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'RUNNING';
  result?: Record<string, unknown>;
  error?: string;
}

// 执行迭代部署工作流响应
export interface ExecuteWorkflowResponse {
  workflowId: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'BLOCKED';
  steps: WorkflowStepResult[];
  modelVersion?: string;
}

// 获取工作流状态响应
export interface GetWorkflowStatusResponse {
  workflowId: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'BLOCKED';
  currentStep?: string;
  steps: Array<{
    step: string;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'RUNNING';
  }>;
}

// ==================== RAG 检索质量评估管理 ====================

// 评估单次检索质量请求
export interface EvaluateRAGRequest {
  query: string;
  params: {
    query: string;
    collection?: string;
    countryCode?: string;
    tags?: string[];
    limit?: number;
    minScore?: number;
    [key: string]: unknown;
  };
  groundTruthDocumentIds: string[];
}

// 评估单次检索质量响应
export interface EvaluateRAGResponse {
  recallAtK: {
    [k: string]: number;
  };
  mrr: number;
  ndcg: {
    [k: string]: number;
  };
  retrievedIds: string[];
  scores: number[];
}

// 批量评估检索质量请求
export interface EvaluateRAGBatchRequest {
  testCases: Array<{
    query: string;
    params: {
      query: string;
      collection?: string;
      countryCode?: string;
      limit?: number;
      [key: string]: unknown;
    };
    groundTruthDocumentIds: string[];
  }>;
}

// 批量评估检索质量响应
export interface EvaluateRAGBatchResponse {
  averageRecallAtK: {
    [k: string]: number;
  };
  averageMRR: number;
  averageNDCGAtK: {
    [k: string]: number;
  };
  perQueryResults: Array<{
    query: string;
    recallAtK: {
      [k: string]: number;
    };
    mrr: number;
    ndcg: {
      [k: string]: number;
    };
  }>;
}

// ==================== query-document 对收集管理 ====================

// 收集 query-document 对请求
export interface CollectQueryPairRequest {
  query: string;
  correctDocumentIds: string[];
  metadata?: {
    source?: 'USER_QUERY' | 'MANUAL_ANNOTATION' | 'AUTO_ANNOTATION';
    userId?: string;
    sessionId?: string;
    collection?: string;
    countryCode?: string;
    tags?: string[];
    [key: string]: unknown;
  };
}

// 收集 query-document 对响应
export interface CollectQueryPairResponse {
  pairId: string;
  message: string;
}

// 从用户查询自动收集请求
export interface CollectQueryPairFromQueryRequest {
  query: string;
  retrievedResults: Array<{
    id: string;
    score: number;
  }>;
  userFeedback?: {
    clickedDocumentIds?: string[];
    relevantDocumentIds?: string[];
    irrelevantDocumentIds?: string[];
  };
}

// 从用户查询自动收集响应
export interface CollectQueryPairFromQueryResponse {
  pairId: string;
  correctDocumentIds: string[];
  message: string;
}

// 批量收集 query-document 对请求
export interface CollectQueryPairBatchRequest {
  pairs: Array<{
    query: string;
    correctDocumentIds: string[];
    metadata?: {
      source?: 'USER_QUERY' | 'MANUAL_ANNOTATION' | 'AUTO_ANNOTATION';
      collection?: string;
      [key: string]: unknown;
    };
  }>;
}

// 批量收集 query-document 对响应
export interface CollectQueryPairBatchResponse {
  pairIds: string[];
  successCount: number;
  totalCount: number;
}

// Query-Document 对
export interface QueryPair {
  id: string;
  query: string;
  correctDocumentIds: string[];
  metadata?: {
    source?: 'USER_QUERY' | 'MANUAL_ANNOTATION' | 'AUTO_ANNOTATION';
    collection?: string;
    countryCode?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
}

// 获取 query-document 对参数
export interface GetQueryPairsParams {
  source?: 'USER_QUERY' | 'MANUAL_ANNOTATION' | 'AUTO_ANNOTATION';
  collection?: string;
  countryCode?: string;
  limit?: number;
}

// 获取 query-document 对响应
export interface GetQueryPairsResponse {
  pairs: QueryPair[];
  total: number;
}

// 导出为评估数据集格式请求
export interface ExportQueryPairsForEvaluationRequest {
  pairs: Array<{
    query: string;
    correctDocumentIds: string[];
  }>;
}

// 导出为评估数据集格式响应
export interface ExportQueryPairsForEvaluationResponse {
  evaluationDataset: Array<{
    query: string;
    ground_truth_document_ids: string[];
  }>;
}

// ==================== 打包清单模板管理 ====================

// 打包清单模板元数据
export interface PackingChecklistTemplateMetadata {
  version: string;
  last_updated: string;
  data_sources?: string[];
  [key: string]: unknown;
}

// 打包清单模板数据（完整结构，根据实际 JSON 结构定义）
export interface PackingChecklistTemplate {
  metadata: PackingChecklistTemplateMetadata;
  quick_checklist_summer?: Record<string, unknown>;
  quick_checklist_transition?: Record<string, unknown>;
  quick_checklist_winter?: Record<string, unknown>;
  template_by_user_type?: Record<string, unknown>;
  seasonal_quantity_guide?: Record<string, unknown>;
  packing_order_steps?: Record<string, unknown>;
  pre_departure_final_checklist?: Record<string, unknown>;
  [key: string]: unknown;
}

// 打包清单模板列表项
export interface PackingChecklistTemplateListItem {
  id: string;
  version: string;
  lastUpdated: string;
  templateData: PackingChecklistTemplate; // 列表接口也返回完整数据
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: PackingChecklistTemplateMetadata;
}

// 打包清单模板详情
export interface PackingChecklistTemplateDetail extends PackingChecklistTemplateListItem {
  templateData: PackingChecklistTemplate;
}

// 获取模板列表参数
export interface GetPackingTemplatesParams {
  page?: number;
  limit?: number;
  version?: string;
  isActive?: boolean;
  search?: string;
}

// 获取模板列表响应
export interface GetPackingTemplatesResponse {
  templates: PackingChecklistTemplateListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 创建模板请求
export interface CreatePackingTemplateRequest {
  version: string;
  lastUpdated: string;
  templateData: PackingChecklistTemplate;
  isActive?: boolean;
}

// 更新模板请求
export interface UpdatePackingTemplateRequest {
  version?: string;
  lastUpdated?: string;
  templateData?: PackingChecklistTemplate;
  isActive?: boolean;
}

// 激活/停用模板请求
export interface ActivatePackingTemplateRequest {
  isActive: boolean;
}

// 批量导入模板请求
export interface BatchImportPackingTemplatesRequest {
  templates: Array<{
    version: string;
    lastUpdated: string;
    templateData: PackingChecklistTemplate;
    isActive?: boolean;
  }>;
  overwrite?: boolean;
}

// 批量导入模板响应
export interface BatchImportPackingTemplatesResponse {
  successCount: number;
  totalCount: number;
  importedIds: string[];
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

// 模板统计信息
export interface PackingTemplatesStats {
  total: number;
  active: number;
  inactive: number;
  byVersion: Record<string, number>;
  latestVersion: string | null;
}

// 删除模板响应
export interface DeletePackingTemplateResponse {
  id: string;
  deleted: boolean;
  message: string;
}

// ==================== 打包指南管理 ====================

// 打包指南元数据
export interface PackingGuideMetadata {
  version: string;
  last_updated: string;
  language?: string;
  [key: string]: unknown;
}

// 打包指南数据（完整结构，根据实际 JSON 结构定义）
export interface PackingGuide {
  metadata: PackingGuideMetadata;
  layering_system?: Record<string, unknown>;
  footwear?: Record<string, unknown>;
  accessories?: Record<string, unknown>;
  pants?: Record<string, unknown>;
  bags?: Record<string, unknown>;
  electronics_protection?: Record<string, unknown>;
  other_essentials?: Record<string, unknown>;
  photography_gear?: Record<string, unknown>;
  swimming_gear?: Record<string, unknown>;
  seasonal_packing_lists?: Record<string, unknown>;
  packing_tips?: Record<string, unknown>;
  what_not_to_bring?: Record<string, unknown>;
  budget_options?: Record<string, unknown>;
  pro_tips?: Record<string, unknown>;
  red_flags?: Record<string, unknown>;
  [key: string]: unknown;
}

// 打包指南列表项
export interface PackingGuideListItem {
  id: string;
  version: string;
  lastUpdated: string;
  guideData: PackingGuide; // 列表接口也返回完整数据
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: PackingGuideMetadata;
}

// 打包指南详情
export interface PackingGuideDetail extends PackingGuideListItem {
  guideData: PackingGuide;
}

// 获取指南列表参数
export interface GetPackingGuidesParams {
  page?: number;
  limit?: number;
  version?: string;
  isActive?: boolean;
  search?: string;
}

// 获取指南列表响应
export interface GetPackingGuidesResponse {
  guides: PackingGuideListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 创建指南请求
export interface CreatePackingGuideRequest {
  version: string;
  lastUpdated: string;
  guideData: PackingGuide;
  isActive?: boolean;
}

// 更新指南请求
export interface UpdatePackingGuideRequest {
  version?: string;
  lastUpdated?: string;
  guideData?: PackingGuide;
  isActive?: boolean;
}

// 激活/停用指南请求
export interface ActivatePackingGuideRequest {
  isActive: boolean;
}

// 批量导入指南请求
export interface BatchImportPackingGuidesRequest {
  guides: Array<{
    version: string;
    lastUpdated: string;
    guideData: PackingGuide;
    isActive?: boolean;
  }>;
  overwrite?: boolean;
}

// 批量导入指南响应
export interface BatchImportPackingGuidesResponse {
  successCount: number;
  totalCount: number;
  importedIds: string[];
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

// 指南统计信息
export interface PackingGuidesStats {
  total: number;
  active: number;
  inactive: number;
  latestVersion: string | null;
  latestUpdated: string | null; // ISO 8601 日期字符串
}

// 删除指南响应
export interface DeletePackingGuideResponse {
  id: string;
  deleted: boolean;
  message: string;
}
