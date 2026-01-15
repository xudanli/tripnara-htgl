/**
 * 地点数据完善脚本
 * 使用DeepSeek API自动完善地点数据，从冰岛的雷克雅未克开始
 * 
 * 使用方法：
 * 1. 确保已设置环境变量：NEXT_PUBLIC_API_BASE_URL 和 NEXT_PUBLIC_DEEPSEEK_API_KEY
 * 2. 运行：npx tsx scripts/enhance-places.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

interface Place {
  id: number;
  uuid: string;
  nameCN: string;
  nameEN?: string;
  category: string;
  address?: string;
  description?: string;
  rating?: number;
  location?: { lat: number; lng: number };
  metadata?: any;
  physicalMetadata?: any;
  city?: {
    id: number;
    name: string;
    nameCN?: string;
    nameEN?: string;
    countryCode: string;
  };
}

interface GetPlacesResponse {
  places: Place[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UpdatePlaceRequest {
  nameCN?: string;
  nameEN?: string;
  category?: string;
  address?: string;
  description?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  metadata?: any;
  physicalMetadata?: any;
}

// 从metadata中提取经纬度
function extractLocationFromMetadata(metadata: any): { lat?: number; lng?: number } | null {
  if (!metadata || typeof metadata !== 'object') return null;
  
  if (metadata.lat !== undefined && metadata.lng !== undefined) {
    const lat = typeof metadata.lat === 'number' ? metadata.lat : parseFloat(metadata.lat);
    const lng = typeof metadata.lng === 'number' ? metadata.lng : parseFloat(metadata.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  
  if (metadata.location && typeof metadata.location === 'object') {
    if (metadata.location.lat !== undefined && metadata.location.lng !== undefined) {
      const lat = typeof metadata.location.lat === 'number' ? metadata.location.lat : parseFloat(metadata.location.lat);
      const lng = typeof metadata.location.lng === 'number' ? metadata.location.lng : parseFloat(metadata.location.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  }
  
  if (Array.isArray(metadata.coordinates) && metadata.coordinates.length >= 2) {
    const [val1, val2] = metadata.coordinates;
    const num1 = typeof val1 === 'number' ? val1 : parseFloat(val1);
    const num2 = typeof val2 === 'number' ? val2 : parseFloat(val2);
    if (!isNaN(num1) && !isNaN(num2)) {
      if (Math.abs(num1) <= 90 && Math.abs(num2) <= 180) {
        return { lat: num1, lng: num2 };
      } else if (Math.abs(num2) <= 90 && Math.abs(num1) <= 180) {
        return { lat: num2, lng: num1 };
      }
    }
  }
  
  return null;
}

// 规范化地点数据
function normalizePlaceData(data: any, sourceMetadata?: any): UpdatePlaceRequest {
  const normalized: UpdatePlaceRequest = {};

  if (data.nameCN !== undefined) normalized.nameCN = data.nameCN;
  if (data.nameEN !== undefined) normalized.nameEN = data.nameEN;
  if (data.category !== undefined) normalized.category = data.category;
  if (data.address !== undefined) normalized.address = data.address;
  if (data.description !== undefined) normalized.description = data.description;
  if (data.rating !== undefined) normalized.rating = data.rating;

  // 处理 location
  if (data.location && data.location !== null) {
    if (data.location.lat !== undefined && data.location.lat !== null) {
      normalized.lat = data.location.lat;
    }
    if (data.location.lng !== undefined && data.location.lng !== null) {
      normalized.lng = data.location.lng;
    }
  } else if (data.lat !== undefined && data.lat !== null) {
    normalized.lat = data.lat;
    if (data.lng !== undefined && data.lng !== null) {
      normalized.lng = data.lng;
    }
  } else if (data.lng !== undefined && data.lng !== null) {
    normalized.lng = data.lng;
  }
  
  // 如果AI没有提供经纬度，尝试从metadata中获取
  if (normalized.lat === undefined && normalized.lng === undefined) {
    const metadata = sourceMetadata || data.metadata;
    const metadataLocation = metadata ? extractLocationFromMetadata(metadata) : null;
    if (metadataLocation && metadataLocation.lat !== undefined && metadataLocation.lng !== undefined) {
      normalized.lat = metadataLocation.lat;
      normalized.lng = metadataLocation.lng;
    }
  }

  if (data.metadata !== undefined) normalized.metadata = data.metadata;
  if (data.physicalMetadata !== undefined) normalized.physicalMetadata = data.physicalMetadata;

  return normalized;
}

// 从文本中提取JSON数据
function extractPlaceData(text: string, sourceMetadata?: any): UpdatePlaceRequest | null {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      return normalizePlaceData(parsed, sourceMetadata);
    }

    const jsonObjectMatch = text.match(/\{[\s\S]{20,}\}/);
    if (jsonObjectMatch) {
      const parsed = JSON.parse(jsonObjectMatch[0]);
      return normalizePlaceData(parsed, sourceMetadata);
    }

    return null;
  } catch {
    return null;
  }
}

// 调用DeepSeek API完善地点数据
async function enhancePlaceWithAI(place: Place): Promise<UpdatePlaceRequest | null> {
  if (!DEEPSEEK_API_KEY) {
    console.error('❌ 未配置 DEEPSEEK_API_KEY 环境变量');
    return null;
  }

  try {
    // 构建系统提示词
    const systemPrompt = `你是一个专业的数据整理助手，专门帮助完善地点数据。

当前地点数据：
${JSON.stringify(place, null, 2)}

请完善这个地点的数据，包括：
1. 确保中文名称（nameCN）和英文名称（nameEN）准确
2. 提供完整、准确的地址（address）
3. 提供详细的地点介绍（description）
4. 根据地点类型生成合适的物理元数据（physicalMetadata）
5. 确保类别（category）正确
6. 如果metadata中有经纬度，确保location字段包含这些坐标

**重要规则：**
- 所有数据以AI生成的为准进行替换
- 如果AI提供了某个字段，该字段会被完全替换为AI提供的值
- location字段必须保留（如果当前数据中有）
- 只输出JSON格式的数据，不要添加任何说明文字
- 使用代码块包裹JSON：\`\`\`json\n{...}\n\`\`\`

示例输出格式：
\`\`\`json
{
  "nameCN": "地点中文名称",
  "nameEN": "Place English Name",
  "category": "ATTRACTION",
  "address": "完整地址",
  "description": "详细的地点介绍",
  "rating": 4.5,
  "location": {
    "lat": 64.1265,
    "lng": -21.8174
  },
  "physicalMetadata": {
    "difficulty": "EASY",
    "duration": "2小时",
    "accessType": "WALKING"
  }
}
\`\`\``;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `请完善这个地点的数据：${place.nameCN || place.nameEN || '未知地点'}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`DeepSeek API错误: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // 提取JSON数据
    const extractedData = extractPlaceData(content, place.metadata);

    if (extractedData) {
      console.log(`✅ 成功提取数据: ${place.nameCN}`);
      return extractedData;
    } else {
      console.warn(`⚠️ 未能从AI回复中提取数据: ${place.nameCN}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ 处理地点 ${place.nameCN} (ID: ${place.id}) 时出错:`, error);
    return null;
  }
}

// 获取地点列表
async function getPlaces(params: {
  page?: number;
  limit?: number;
  countryCode?: string;
  cityId?: number;
  search?: string;
}): Promise<GetPlacesResponse | null> {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.countryCode) queryParams.append('countryCode', params.countryCode);
    if (params.cityId) queryParams.append('cityId', params.cityId.toString());
    if (params.search) queryParams.append('search', params.search);

    const url = `${API_BASE_URL}/places/admin${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.success) {
      return data.data;
    }

    throw new Error(data.error?.message || '获取地点列表失败');
  } catch (error) {
    console.error('获取地点列表失败:', error);
    return null;
  }
}

// 更新地点
async function updatePlace(id: number, data: UpdatePlaceRequest): Promise<Place | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/places/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    }

    throw new Error(result.error?.message || '更新地点失败');
  } catch (error) {
    console.error(`更新地点 ${id} 失败:`, error);
    return null;
  }
}

// 延迟函数（避免API请求过快）
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 主函数
async function main() {
  console.log('🚀 开始完善地点数据（从冰岛雷克雅未克开始）\n');

  if (!DEEPSEEK_API_KEY) {
    console.error('❌ 错误：未配置 NEXT_PUBLIC_DEEPSEEK_API_KEY 环境变量');
    console.log('请在 .env.local 文件中设置：NEXT_PUBLIC_DEEPSEEK_API_KEY=your_api_key');
    process.exit(1);
  }

  console.log(`📡 API地址: ${API_BASE_URL}`);
  console.log(`🤖 DeepSeek API Key: ${DEEPSEEK_API_KEY.substring(0, 10)}...\n`);

  // 获取冰岛的地点（国家代码：IS）
  let page = 1;
  const limit = 20;
  let totalProcessed = 0;
  let totalSuccess = 0;
  let totalFailed = 0;

  while (true) {
    console.log(`\n📄 获取第 ${page} 页地点数据...`);
    const response = await getPlaces({
      page,
      limit,
      countryCode: 'IS', // 冰岛
      // 可以添加搜索条件：search: 'Reykjavik' 或 cityId
    });

    if (!response || response.places.length === 0) {
      console.log('✅ 所有地点已处理完成');
      break;
    }

    console.log(`找到 ${response.places.length} 个地点（共 ${response.total} 个）\n`);

    // 处理每个地点
    for (const place of response.places) {
      totalProcessed++;
      console.log(`\n[${totalProcessed}/${response.total}] 处理地点: ${place.nameCN || place.nameEN || '未知'} (ID: ${place.id})`);

      // 调用AI完善数据
      const enhancedData = await enhancePlaceWithAI(place);

      if (enhancedData) {
        // 更新地点
        const updated = await updatePlace(place.id, enhancedData);
        if (updated) {
          totalSuccess++;
          console.log(`✅ 成功更新地点 ID ${place.id}`);
        } else {
          totalFailed++;
          console.log(`❌ 更新地点 ID ${place.id} 失败`);
        }
      } else {
        totalFailed++;
        console.log(`⚠️ 跳过地点 ID ${place.id}（AI未返回有效数据）`);
      }

      // 延迟，避免API请求过快
      await delay(1000); // 1秒延迟
    }

    // 检查是否还有更多页面
    if (page >= response.totalPages) {
      break;
    }

    page++;
  }

  // 输出统计信息
  console.log('\n' + '='.repeat(50));
  console.log('📊 处理完成统计：');
  console.log(`   总处理: ${totalProcessed} 个地点`);
  console.log(`   成功: ${totalSuccess} 个`);
  console.log(`   失败: ${totalFailed} 个`);
  console.log('='.repeat(50));
}

// 运行脚本
main().catch((error) => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
