'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Check, Copy, Upload, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updatePlace } from '@/services/places';
import type { PlaceListItem, Place, UpdatePlaceRequest } from '@/types/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  extractedData?: UpdatePlaceRequest | null; // 从消息中提取的数据
}

interface DeepSeekAssistantProps {
  places?: PlaceListItem[];
  place?: Place;
  formData?: UpdatePlaceRequest; // 表单数据（用于详情页，包含实时编辑的数据）
  onUpdate?: (placeId: number, data: UpdatePlaceRequest) => Promise<void>; // 更新回调
  onRefresh?: () => void; // 刷新回调
}

// 计算两点之间的距离（公里）
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 地球半径（公里）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 根据经纬度匹配最近的地点
function findNearestPlace(
  lat: number,
  lng: number,
  places: (PlaceListItem | Place)[]
): { place: PlaceListItem | Place; distance: number } | null {
  if (!places || places.length === 0) return null;

  let nearest: { place: PlaceListItem | Place; distance: number } | null = null;
  let minDistance = Infinity;

  for (const place of places) {
    if (place.location?.lat && place.location?.lng) {
      const distance = calculateDistance(lat, lng, place.location.lat, place.location.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { place, distance };
      }
    }
  }

  return nearest;
}

// 从文本中提取经纬度
function extractCoordinates(text: string): { lat: number; lng: number } | null {
  try {
    // 匹配 "lat: 35.6586, lng: 139.7454" 格式
    const coordMatch = text.match(/(?:lat|latitude|纬度)[\s:：]*([+-]?\d+\.?\d*)[\s,，]*(?:lng|lng|longitude|经度)[\s:：]*([+-]?\d+\.?\d*)/i);
    if (coordMatch) {
      return {
        lat: parseFloat(coordMatch[1]),
        lng: parseFloat(coordMatch[2]),
      };
    }

    // 匹配 JSON 格式的 location
    const locationMatch = text.match(/"location"\s*:\s*\{[^}]*"lat"\s*:\s*([+-]?\d+\.?\d*)[^}]*"lng"\s*:\s*([+-]?\d+\.?\d*)/i);
    if (locationMatch) {
      return {
        lat: parseFloat(locationMatch[1]),
        lng: parseFloat(locationMatch[2]),
      };
    }

    // 匹配数组格式 [lng, lat] 或 [lat, lng]
    const arrayMatch = text.match(/\[([+-]?\d+\.?\d*)[\s,，]+([+-]?\d+\.?\d*)\]/);
    if (arrayMatch) {
      const val1 = parseFloat(arrayMatch[1]);
      const val2 = parseFloat(arrayMatch[2]);
      // 通常第一个是纬度，第二个是经度，但需要根据范围判断
      if (Math.abs(val1) <= 90 && Math.abs(val2) <= 180) {
        return { lat: val1, lng: val2 };
      } else if (Math.abs(val2) <= 90 && Math.abs(val1) <= 180) {
        return { lat: val2, lng: val1 };
      }
    }

    return null;
  } catch {
    return null;
  }
}

// 从文本中提取 JSON 数据
function extractPlaceData(text: string, sourceMetadata?: any): UpdatePlaceRequest | null {
  try {
    // 尝试提取代码块中的 JSON
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      return normalizePlaceData(parsed, sourceMetadata);
    }

    // 尝试提取纯 JSON 对象
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

// 从metadata中提取经纬度
function extractLocationFromMetadata(metadata: any): { lat?: number; lng?: number } | null {
  if (!metadata || typeof metadata !== 'object') return null;
  
  // 尝试多种可能的字段名
  if (metadata.lat !== undefined && metadata.lng !== undefined) {
    const lat = typeof metadata.lat === 'number' ? metadata.lat : parseFloat(metadata.lat);
    const lng = typeof metadata.lng === 'number' ? metadata.lng : parseFloat(metadata.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  
  // 检查location对象
  if (metadata.location && typeof metadata.location === 'object') {
    if (metadata.location.lat !== undefined && metadata.location.lng !== undefined) {
      const lat = typeof metadata.location.lat === 'number' ? metadata.location.lat : parseFloat(metadata.location.lat);
      const lng = typeof metadata.location.lng === 'number' ? metadata.location.lng : parseFloat(metadata.location.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  }
  
  // 检查coordinates数组 [lng, lat] 或 [lat, lng]
  if (Array.isArray(metadata.coordinates) && metadata.coordinates.length >= 2) {
    const [val1, val2] = metadata.coordinates;
    const num1 = typeof val1 === 'number' ? val1 : parseFloat(val1);
    const num2 = typeof val2 === 'number' ? val2 : parseFloat(val2);
    if (!isNaN(num1) && !isNaN(num2)) {
      // 判断是 [lat, lng] 还是 [lng, lat]
      if (Math.abs(num1) <= 90 && Math.abs(num2) <= 180) {
        return { lat: num1, lng: num2 };
      } else if (Math.abs(num2) <= 90 && Math.abs(num1) <= 180) {
        return { lat: num2, lng: num1 };
      }
    }
  }
  
  return null;
}

// 规范化地点数据，转换为 UpdatePlaceRequest 格式
// 优先使用metadata中的数据作为依据
function normalizePlaceData(data: any, sourceMetadata?: any): UpdatePlaceRequest {
  const normalized: UpdatePlaceRequest = {};

  // **重要：所有数据以AI生成的为准进行替换**
  // 如果AI提供了某个字段，该字段会被完全替换为AI提供的值
  // 如果AI没有提供某个字段，该字段会保持原值不变（通过undefined判断）

  if (data.nameCN !== undefined) normalized.nameCN = data.nameCN;
  if (data.nameEN !== undefined) normalized.nameEN = data.nameEN;
  if (data.category !== undefined) normalized.category = data.category;
  
  // **重要：地址信息以AI提供的为准，完全替换**
  if (data.address !== undefined) {
    normalized.address = data.address;
    console.log('使用AI提供的地址（将替换现有值）:', data.address);
  }
  
  if (data.description !== undefined) normalized.description = data.description;
  if (data.rating !== undefined) normalized.rating = data.rating;
  if (data.googlePlaceId !== undefined) normalized.googlePlaceId = data.googlePlaceId;
  if (data.cityId !== undefined) normalized.cityId = data.cityId;

  // 处理 location 对象
  // **优先级：AI提供的经纬度 > metadata中的经纬度 > location对象 > lat/lng字段**
  // 如果AI提供了经纬度，优先使用AI的（完全替换）
  if (data.location && data.location !== null) {
    if (data.location.lat !== undefined && data.location.lat !== null) {
      normalized.lat = data.location.lat;
      if (data.location.lng !== undefined && data.location.lng !== null) {
        normalized.lng = data.location.lng;
      }
      console.log('使用AI提供的location（将替换现有值）:', data.location);
    }
  } else if (data.lat !== undefined && data.lat !== null) {
    normalized.lat = data.lat;
    if (data.lng !== undefined && data.lng !== null) {
      normalized.lng = data.lng;
    }
    console.log('使用AI提供的经纬度（将替换现有值）:', { lat: normalized.lat, lng: normalized.lng });
  } else if (data.lng !== undefined && data.lng !== null) {
    normalized.lng = data.lng;
  }
  
  // 如果AI没有提供经纬度，尝试从metadata中获取（作为后备，但不会覆盖AI的）
  // 注意：这里只在AI没有提供时才使用metadata，因为AI的数据优先级最高
  if (normalized.lat === undefined && normalized.lng === undefined) {
    const metadata = sourceMetadata || data.metadata;
    const metadataLocation = metadata ? extractLocationFromMetadata(metadata) : null;
    if (metadataLocation && metadataLocation.lat !== undefined && metadataLocation.lng !== undefined) {
      normalized.lat = metadataLocation.lat;
      normalized.lng = metadataLocation.lng;
      console.log('AI未提供经纬度，从metadata中提取:', metadataLocation);
    }
  }

  // 处理 metadata（如果AI提供了metadata，完全替换）
  if (data.metadata !== undefined) {
    normalized.metadata = data.metadata;
    console.log('使用AI提供的metadata（将替换现有值）');
  }

  // 处理 physicalMetadata（如果AI提供了physicalMetadata，完全替换）
  if (data.physicalMetadata !== undefined) {
    normalized.physicalMetadata = data.physicalMetadata;
    console.log('使用AI提供的physicalMetadata（将替换现有值）');
  }

  return normalized;
}

export default function DeepSeekAssistant({
  places,
  place,
  formData,
  onUpdate,
  onRefresh,
}: DeepSeekAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // 确定显示的数据（详情页需要合并表单数据）
  let displayPlace: Place | undefined;
  if (place) {
    // 合并表单数据到地点对象，确保包含最新的经纬度等信息
    displayPlace = {
      ...place,
      nameCN: formData?.nameCN ?? place.nameCN,
      nameEN: formData?.nameEN ?? place.nameEN,
      category: formData?.category ?? place.category,
      address: formData?.address ?? place.address,
      rating: formData?.rating ?? place.rating,
      googlePlaceId: formData?.googlePlaceId ?? place.googlePlaceId,
      // cityId 不是 Place 类型的字段，但可以在更新时使用
      location:
        formData?.lat !== undefined && formData?.lng !== undefined
          ? {
              lat: formData.lat,
              lng: formData.lng,
            }
          : formData?.lat !== undefined && place.location?.lng !== undefined
            ? {
                lat: formData.lat,
                lng: place.location.lng,
              }
            : formData?.lng !== undefined && place.location?.lat !== undefined
              ? {
                  lat: place.location.lat,
                  lng: formData.lng,
                }
              : place.location,
      metadata: formData?.metadata ?? place.metadata,
      physicalMetadata: formData?.physicalMetadata ?? place.physicalMetadata,
    };
  }
  
  const displayPlaces = displayPlace ? [displayPlace] : places || [];
  const isDetailPage = !!place;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: isDetailPage
        ? `你好！我是 DeepSeek 数据整理助手。我可以帮助你整理和修复当前地点数据。

当前地点信息：
- ID: ${place?.id || 'N/A'}
- 名称: ${place?.nameCN || 'N/A'}${place?.nameEN ? ` (${place.nameEN})` : ''}
- 类别: ${place?.category || 'N/A'}
- 城市: ${place?.city?.nameCN || place?.city?.name || 'N/A'}
- 国家代码: ${place?.countryCode || place?.city?.countryCode || 'N/A'}

你可以：
1. 描述数据问题，我会帮你分析
2. 提供需要整理的数据，我会按照当前格式输出
3. 询问如何修复数据问题
4. 让我检查当前地点的数据完整性

请告诉我你需要什么帮助？`
        : `你好！我是 DeepSeek 数据整理助手。我可以帮助你整理和修复地点数据。

当前页面显示了 ${displayPlaces.length} 个地点，数据格式如下：
- ID: 地点唯一标识符
- 名称: 中文名称 (nameCN) 和英文名称 (nameEN)
- 类别: ATTRACTION(景点)、RESTAURANT(餐厅)、SHOPPING(购物)、HOTEL(酒店)、TRANSIT_HUB(交通枢纽)
- 城市: 城市名称和国家代码
- 评分: 0-5 的评分
- 地址: 地点地址

你可以：
1. 描述数据问题，我会帮你分析
2. 提供需要整理的数据，我会按照当前格式输出
3. 询问如何修复数据问题

请告诉我你需要什么帮助？`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null); // 正在更新的地点ID
  const [showImport, setShowImport] = useState(false); // 显示导入界面
  const [importJson, setImportJson] = useState(''); // 导入的JSON数据
  const [importing, setImporting] = useState(false); // 正在导入
  const [geocoding, setGeocoding] = useState(false); // 正在地理编码
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 获取 API Key（Next.js 客户端环境变量，支持两种命名方式）
      const apiKey =
        process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ||
        (typeof window !== 'undefined' && (window as any).__ENV__?.NEXT_PUBLIC_DEEPSEEK_API_KEY);

      if (!apiKey || apiKey === 'your_deepseek_api_key_here' || apiKey.trim() === '') {
        throw new Error(
          '未配置 DeepSeek API Key。请确保：\n1. 在 .env.local 文件中设置了 NEXT_PUBLIC_DEEPSEEK_API_KEY（注意：必须以 NEXT_PUBLIC_ 开头）\n2. 重启了开发服务器（npm run dev）\n3. API Key 格式正确（以 sk- 开头）'
        );
      }

      // 构建系统提示词，包含当前地点数据格式
      // 特别强调location字段，确保AI知道要保留
      const currentPlaceData = displayPlaces.slice(0, isDetailPage ? 1 : 3);
      const hasLocation = currentPlaceData.some((p) => p.location?.lat && p.location?.lng);
      const locationNote = hasLocation
        ? `\n\n⚠️ **重要提示**：当前数据中已有经纬度坐标（location字段），在输出JSON时必须保留这些坐标，格式为：location: {lat: 当前lat值, lng: 当前lng值}。绝对不要输出 location: null 或省略 location 字段！`
        : '';

      const systemPrompt = `你是一个专业的数据整理助手，专门帮助整理地点数据。你的核心任务是确保数据的准确性和完整性。

当前地点数据格式（JSON）：
${JSON.stringify(currentPlaceData, null, 2)}${locationNote}

地点数据字段说明：
- id: 地点ID（数字，只读，不要输出）
- uuid: 地点UUID（字符串，只读，不要输出）
- nameCN: 中文名称（必填，必须准确）
- nameEN: 英文名称（可选，必须准确）
- category: 类别，可选值：
  * ATTRACTION(景点) - 旅游景点、博物馆、公园、历史建筑等
  * RESTAURANT(餐厅) - 餐厅、咖啡厅、酒吧、小吃店等
  * SHOPPING(购物) - 商店、商场、市场、购物中心等
  * HOTEL(酒店) - 酒店、旅馆、民宿等住宿场所
  * TRANSIT_HUB(交通枢纽) - 机场、火车站、汽车站、地铁站、港口等
  **重要：必须根据地点的实际用途选择类别，不要随意分类。例如：**
  - 加油站、充电站 → TRANSIT_HUB（交通相关）
  - 便利店、超市 → SHOPPING
  - 餐厅、咖啡厅 → RESTAURANT
  - 景点、公园 → ATTRACTION
  - 酒店、民宿 → HOTEL
- address: 地址（可选，必须准确完整）
  * **重要：地址信息以AI提供的为准**
  * 如果AI提供了地址，系统会优先使用AI的地址，不会用反向地理编码或其他来源的地址覆盖
  * AI应该提供准确、完整、详细的地址信息
- description: 地点介绍（可选，详细介绍地点的特色、历史背景、推荐理由等）
- rating: 评分，0-5之间的数字（可选）
- googlePlaceId: Google Place ID（可选）
- location: 位置坐标 {lat: number, lng: number}（可选）
- cityId: 城市ID（可选，数字）
- metadata: 元数据对象（可选）
- physicalMetadata: 物理元数据对象（可选，**AI可以生成和整理**）
  * 物理元数据包含地点的物理特征信息，如：
    - difficulty: 难度等级（如 "EASY", "MEDIUM", "HARD"）
    - duration: 预计停留时间（如 "2小时", "30分钟", "1-2小时"）
    - accessType: 访问方式（如 "WALKING", "DRIVING", "PUBLIC_TRANSPORT"）
    - elevation: 海拔高度（数字，单位：米）
    - distance: 距离信息（如 "5公里", "步行10分钟"）
    - capacity: 容量信息（如停车场容量、餐厅座位数等）
    - facilities: 设施列表（数组，如 ["停车场", "WiFi", "无障碍设施"]）
    - openingHours: 营业时间（对象或字符串）
    - 其他物理特征相关的信息
  * **AI可以根据地点的类型和特征，智能生成合适的物理元数据**
  * 例如：对于景点，可以生成难度、预计停留时间、访问方式、海拔等
  * 例如：对于停车场，可以生成容量、设施等信息
  * 例如：对于餐厅，可以生成座位数、营业时间、设施等
  * 如果不确定某些信息，可以省略该字段，不要猜测

**数据准确性要求（非常重要）：**
1. **中文名称 (nameCN)**：
   - 必须使用官方或通用的中文名称
   - 不要使用音译或直译
   - 确保名称准确、完整、规范
   - 如果是景点，使用官方景点名称
   - 如果是餐厅，使用实际注册或常用名称

2. **英文名称 (nameEN)**：
   - 必须使用官方或标准的英文名称
   - 优先使用官方英文名称，如果没有则使用通用英文名称
   - 不要自行翻译，要查找真实的英文名称
   - 确保拼写正确，大小写规范
   - 如果是知名地点，使用国际通用的英文名称

3. **地址 (address)**：
   - 必须准确、完整、详细
   - 包含完整的地址层级：国家/省/市/区/街道/门牌号
   - 使用标准地址格式
   - 不要省略重要信息（如街道、门牌号等）
   - 确保地址与经纬度坐标一致
   - 如果是中国地址，使用标准格式：省+市+区/县+街道+详细地址
   - **重要：如果AI提供了地址，该地址会完全替换现有地址**

4. **经纬度坐标 (location)**：
   - 必须准确，精确到小数点后至少4位
   - 确保坐标与地址一致
   - **重要：如果提供了经纬度但没有地址，系统会自动通过反向地理编码API获取准确地址，你不需要猜测或推断地址**
   - 如果提供地址但没有坐标，可以根据地址推断（但要标注为推断值）

重要输出规则：
1. 当用户要求整理数据时，**只输出JSON格式的数据，不要添加任何说明文字**
2. 使用代码块包裹JSON：\`\`\`json\n{...}\n\`\`\`
3. 保持字段类型和结构一致
4. 确保必填字段（nameCN）存在且准确
5. **类别选择规则（非常重要）**：
   - 必须根据地点的实际用途和功能选择类别
   - 使用英文大写：ATTRACTION、RESTAURANT、SHOPPING、HOTEL、TRANSIT_HUB
   - **分类指南**：
     * ATTRACTION：旅游景点、博物馆、公园、历史建筑、观景台、自然景观等
     * RESTAURANT：餐厅、咖啡厅、酒吧、小吃店、快餐店等餐饮场所
     * SHOPPING：商店、商场、市场、购物中心、便利店、超市等购物场所
     * HOTEL：酒店、旅馆、民宿、青旅等住宿场所
     * TRANSIT_HUB：机场、火车站、汽车站、地铁站、港口、**加油站、充电站**等交通相关设施
   - **常见错误**：不要将加油站、充电站、服务区等交通设施分类为ATTRACTION（景点）
   - 如果不确定类别，可以询问用户，不要随意猜测
6. 评分范围在 0-5 之间
7. **经纬度坐标处理（极其重要）**：
   - 如果当前数据中已有 location 字段且包含 lat 和 lng，**必须保留这些坐标**
   - 格式：location: {lat: number, lng: number}
   - **绝对禁止输出 location: null**
   - **绝对禁止省略 location 字段**（如果当前数据中有）
   - 如果当前数据中有 location，即使你没有修改，也要在输出中包含：location: {lat: 当前lat值, lng: 当前lng值}
   - 示例：如果当前数据是 {"location": {"lat": 35.6586, "lng": 139.7454}}，输出时必须包含 location: {lat: 35.6586, lng: 139.7454}
8. 不要输出 id、uuid、createdAt、updatedAt 等只读字段
9. **重要：所有数据以AI生成的为准进行替换**
   - 如果AI提供了某个字段，该字段会被完全替换为AI提供的值
   - 如果AI没有提供某个字段，该字段会保持原值不变
   - **location字段必须保留**（如果当前数据中有，必须包含在输出中）
   - 对于其他字段，如果AI提供了新值，就使用AI的值；如果没有提供，可以省略
10. **优先保证数据准确性，如果信息不确定，不要猜测，保持原值或省略该字段（location必须保留，不要用null）**

数据验证检查清单：
- [ ] 中文名称是否准确、完整？
- [ ] 英文名称是否使用官方或标准名称？
- [ ] 地址是否完整、详细、准确？
- [ ] 地址与经纬度是否一致？
- [ ] 所有文本数据是否准确无误？

示例输出格式：
\`\`\`json
{
  "nameCN": "东京塔",
  "nameEN": "Tokyo Tower",
  "category": "ATTRACTION",
  "address": "日本东京都港区芝公园4-2-8",
  "description": "东京的标志性建筑，高333米，是日本第二高的建筑。提供观景台，可以俯瞰东京全景。",
  "rating": 4.5,
  "location": {
    "lat": 35.6586,
    "lng": 139.7454
  },
  "physicalMetadata": {
    "difficulty": "EASY",
    "duration": "2小时",
    "accessType": "WALKING",
    "elevation": 333
  }
}
\`\`\`

如果用户只是询问问题（不是要求整理数据），可以用中文正常回复。但如果用户要求整理、修复、更新数据，必须只返回JSON格式，不要任何多余的话。`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: 'user', content: userMessage.content },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error?.message || errorMsg;
          
          // 特殊处理常见错误
          if (response.status === 401) {
            errorMsg = 'API Key 无效或已过期，请检查配置';
          } else if (response.status === 429) {
            errorMsg = '请求过于频繁，请稍后再试';
          } else if (response.status === 400) {
            errorMsg = `请求参数错误: ${errorMsg}`;
          }
        } catch {
          // 如果无法解析错误响应，使用默认错误信息
        }
        throw new Error(`API请求失败: ${errorMsg}`);
      }

      const data = await response.json();
      let content = data.choices[0]?.message?.content || '抱歉，我没有收到回复。';
      
      // 尝试从回复中提取地点数据
      let extractedData = extractPlaceData(content);
      
      // 如果表单中有经纬度但AI返回的数据中没有，从表单中补充
      // 这样可以确保在更新时包含最新的经纬度数据
      if (formData?.lat !== undefined && formData?.lng !== undefined) {
        if (!extractedData) {
          extractedData = {};
        }
        // 只有当AI没有提供经纬度时，才使用表单中的
        // 但如果AI提供了新的经纬度，优先使用AI提供的（可能是更准确的）
        if (extractedData.lat === undefined && extractedData.lng === undefined) {
          extractedData.lat = formData.lat;
          extractedData.lng = formData.lng;
        }
        // 如果AI提供了经纬度，确保它们被包含在extractedData中（用于更新）
        else if (extractedData.lat !== undefined && extractedData.lng !== undefined) {
          // AI已经提供了经纬度，使用AI提供的（可能更准确）
          // 确保经纬度被正确设置
        }
      }
      
      // 如果提取到经纬度，尝试通过反向地理编码获取准确地址
      if (extractedData?.lat && extractedData?.lng) {
        // 如果没有地址，尝试根据坐标获取
        if (!extractedData.address) {
          try {
            const geocodedAddress = await reverseGeocode(extractedData.lat, extractedData.lng);
            if (geocodedAddress) {
              extractedData.address = geocodedAddress;
              content += `\n\n📍 **根据坐标自动获取地址**：\n${geocodedAddress}`;
            }
          } catch (error) {
            console.error('反向地理编码失败:', error);
          }
        } else {
          // 如果有地址，验证地址与坐标的一致性
          // 通过反向地理编码获取坐标对应的地址，然后比较
          try {
            const geocodedAddress = await reverseGeocode(extractedData.lat, extractedData.lng);
            if (geocodedAddress && geocodedAddress !== extractedData.address) {
              // 地址不一致，提示用户
              content += `\n\n⚠️ **地址验证警告**：
- 提供的地址：${extractedData.address}
- 坐标对应的地址：${geocodedAddress}
- 地址可能不匹配，建议使用坐标对应的地址`;
            }
          } catch (error) {
            console.error('地址验证失败:', error);
          }
        }
      } else if (formData?.lat !== undefined && formData?.lng !== undefined) {
        // 如果表单中有经纬度但AI没有返回，尝试根据表单中的坐标获取地址
        if (!extractedData?.address) {
          try {
            const geocodedAddress = await reverseGeocode(formData.lat, formData.lng);
            if (geocodedAddress) {
              if (!extractedData) {
                extractedData = {};
              }
              extractedData.address = geocodedAddress;
              extractedData.lat = formData.lat;
              extractedData.lng = formData.lng;
              content += `\n\n📍 **根据表单中的坐标自动获取地址**：\n${geocodedAddress}`;
            }
          } catch (error) {
            console.error('反向地理编码失败:', error);
          }
        }
      }
      
      // 如果提取到经纬度，尝试匹配最近的地点并添加分析信息
      if (extractedData?.lat && extractedData?.lng) {
        const nearest = findNearestPlace(
          extractedData.lat,
          extractedData.lng,
          displayPlaces
        );
        
        if (nearest) {
          const distanceText = nearest.distance < 1 
            ? `${(nearest.distance * 1000).toFixed(0)}米`
            : `${nearest.distance.toFixed(2)}公里`;
          
          content += `\n\n📍 **位置分析**：
- 提供的坐标：(${extractedData.lat}, ${extractedData.lng})
- 最近的地点：${nearest.place.nameCN} (ID: ${nearest.place.id})
- 距离：${distanceText}
${nearest.distance < 0.5 ? '✅ 距离很近，可能是同一地点' : nearest.distance < 5 ? '⚠️ 距离较近，请确认是否为同一地点' : '❌ 距离较远，可能不是同一地点'}`;
        } else {
          content += `\n\n📍 **位置信息**：
- 提供的坐标：(${extractedData.lat}, ${extractedData.lng})
- 当前页面没有其他地点可比较`;
        }
      } else {
        // 尝试从文本中提取经纬度（即使没有完整的JSON）
        const coords = extractCoordinates(content);
        if (coords) {
          const nearest = findNearestPlace(coords.lat, coords.lng, displayPlaces);
          
          if (nearest) {
            const distanceText = nearest.distance < 1 
              ? `${(nearest.distance * 1000).toFixed(0)}米`
              : `${nearest.distance.toFixed(2)}公里`;
            
            content += `\n\n📍 **位置分析**：
- 检测到坐标：(${coords.lat}, ${coords.lng})
- 最近的地点：${nearest.place.nameCN} (ID: ${nearest.place.id})
- 距离：${distanceText}
${nearest.distance < 0.5 ? '✅ 距离很近，可能是同一地点' : nearest.distance < 5 ? '⚠️ 距离较近，请确认是否为同一地点' : '❌ 距离较远，可能不是同一地点'}`;
          }
        }
      }
      
      // 确保extractedData中包含完整的经纬度数据（如果存在）
      // 这样在"一键更新"时能够正确更新经纬度到地点
      if (extractedData) {
        // 如果只有lat或只有lng，尝试从表单中补充另一个
        if (extractedData.lat !== undefined && extractedData.lng === undefined && formData?.lng !== undefined) {
          extractedData.lng = formData.lng;
        }
        if (extractedData.lng !== undefined && extractedData.lat === undefined && formData?.lat !== undefined) {
          extractedData.lat = formData.lat;
        }
        
        // **重要**：如果AI返回了location: null，导致extractedData中没有经纬度
        // 此时应该从表单中补充经纬度，避免丢失现有的经纬度数据
        if (extractedData.lat === undefined && extractedData.lng === undefined && formData) {
          if (formData.lat !== undefined && formData.lng !== undefined) {
            extractedData.lat = formData.lat;
            extractedData.lng = formData.lng;
            console.log('AI返回location:null，从表单中补充经纬度:', { lat: formData.lat, lng: formData.lng });
          }
        }
        
        // 确保经纬度数据会被包含在更新请求中
        // 即使AI没有明确返回location字段，如果extractedData中有lat和lng，它们会被正确更新
        if (extractedData.lat !== undefined && extractedData.lng !== undefined) {
          // 经纬度数据已完整，确保它们会被包含在更新中
          console.log('提取到的经纬度数据:', { lat: extractedData.lat, lng: extractedData.lng });
        }
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content,
        extractedData,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('DeepSeek API 错误:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `抱歉，发生了错误：${error instanceof Error ? error.message : '未知错误'}。请检查：
1. 是否已配置 DEEPSEEK_API_KEY 环境变量
2. API密钥是否有效
3. 网络连接是否正常`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(placeId: number, data: UpdatePlaceRequest) {
    if (!confirm(`确定要更新地点 ID ${placeId} 的数据吗？\n\n注意：所有AI提供的数据将完全替换现有数据。`)) {
      return;
    }

    setUpdating(placeId);
    try {
      // **重要：所有数据以AI生成的为准进行替换**
      // AI提供的字段会完全替换现有值，未提供的字段保持原值
      const updateData: UpdatePlaceRequest = { ...data };
      
      // 特殊处理：location字段必须保留（如果当前数据中有）
      // 但如果AI明确提供了location或lat/lng，使用AI的（完全替换）
      if (updateData.lat === undefined && updateData.lng === undefined) {
        // AI没有提供经纬度，尝试从表单中保留（避免丢失）
        if (formData?.lat !== undefined && formData?.lng !== undefined) {
          updateData.lat = formData.lat;
          updateData.lng = formData.lng;
          console.log('AI未提供经纬度，保留表单中的经纬度:', { lat: formData.lat, lng: formData.lng });
        }
      } else {
        // AI提供了经纬度，使用AI的（完全替换）
        console.log('使用AI提供的经纬度（将替换现有值）:', { lat: updateData.lat, lng: updateData.lng });
      }
      
      console.log('准备更新的数据（AI生成的数据将替换现有值）:', updateData);
      
      if (onUpdate) {
        await onUpdate(placeId, updateData);
      } else {
        const result = await updatePlace(placeId, updateData);
        if (!result) {
          throw new Error('更新失败');
        }
      }

      // 添加成功消息
      const successMessage: Message = {
        role: 'assistant',
        content: `✅ 地点 ID ${placeId} 已成功更新！`,
      };
      setMessages((prev) => [...prev, successMessage]);

      // 刷新数据
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ 更新失败：${error instanceof Error ? error.message : '未知错误'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setUpdating(null);
    }
  }

  // 处理JSON文件上传
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const jsonData = JSON.parse(content);
        setImportJson(JSON.stringify(jsonData, null, 2));
        setShowImport(true);
      } catch (error) {
        alert('文件解析失败，请确保是有效的JSON文件');
      }
    };
    reader.readAsText(file);
  }

  // 反向地理编码：根据经纬度获取地址
  async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    setGeocoding(true);
    try {
      // 验证经纬度范围
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('经纬度范围无效');
      }

      // 使用 Nominatim (OpenStreetMap) 免费API
      // 注意：Nominatim有使用限制，建议添加延迟以避免请求过快
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=zh-CN,en&zoom=18`,
        {
          headers: {
            'User-Agent': 'TripNara-Admin/1.0', // Nominatim要求设置User-Agent
            'Referer': typeof window !== 'undefined' ? window.location.origin : '',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`地理编码API请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // 验证返回的数据
      if (!data || !data.address) {
        console.warn('反向地理编码返回数据为空', { lat, lng, data });
        return null;
      }

      // 构建完整地址
      const address = data.address;
      let fullAddress = '';
      
      // 中国地址格式
      if (address.country_code === 'cn') {
        const parts = [];
        if (address.province) parts.push(address.province);
        if (address.city) parts.push(address.city);
        if (address.district || address.county) parts.push(address.district || address.county);
        if (address.town || address.village) parts.push(address.town || address.village);
        if (address.road) parts.push(address.road);
        if (address.house_number) parts.push(address.house_number);
        fullAddress = parts.filter(Boolean).join('');
      } else {
        // 国际地址格式
        const parts = [];
        if (address.house_number) parts.push(address.house_number);
        if (address.road) parts.push(address.road);
        if (address.neighbourhood || address.suburb) parts.push(address.neighbourhood || address.suburb);
        if (address.city || address.town || address.village) parts.push(address.city || address.town || address.village);
        if (address.state || address.province) parts.push(address.state || address.province);
        if (address.country) parts.push(address.country);
        fullAddress = parts.filter(Boolean).join(', ');
      }

      // 如果构建的地址为空，使用display_name作为后备
      const result = fullAddress || data.display_name || null;
      
      if (!result) {
        console.warn('无法从反向地理编码构建地址', { lat, lng, address, data });
      }
      
      return result;
    } catch (error) {
      console.error('反向地理编码失败:', error, { lat, lng });
      // 返回错误信息，而不是null，让用户知道发生了什么
      throw error;
    } finally {
      setGeocoding(false);
    }
  }

  // 处理JSON导入
  async function handleImport() {
    if (!importJson.trim()) {
      alert('请输入或上传JSON数据');
      return;
    }

    setImporting(true);
    try {
      let data: any;
      try {
        data = JSON.parse(importJson);
      } catch {
        throw new Error('JSON格式无效，请检查数据格式');
      }

      // 支持单个对象或数组
      const items = Array.isArray(data) ? data : [data];
      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      // 获取当前地点的metadata作为数据依据
      const currentMetadata = place?.metadata || formData?.metadata;

      for (const item of items) {
        try {
          // 提取地点ID（如果有）
          const placeId = item.id || item.placeId;
          if (!placeId) {
            // 如果没有ID，尝试根据名称匹配
            if (place && item.nameCN && item.nameCN === place.nameCN) {
              // 在详情页，使用当前地点ID
              const normalizedData = normalizePlaceData(item, currentMetadata);
              if (onUpdate) {
                await onUpdate(place.id, normalizedData);
              } else {
                await updatePlace(place.id, normalizedData);
              }
              successCount++;
            } else if (places && places.length > 0 && item.nameCN) {
              // 在列表页，尝试匹配名称
              const matchedPlace = places.find((p) => p.nameCN === item.nameCN);
              if (matchedPlace) {
                const normalizedData = normalizePlaceData(item, matchedPlace.metadata);
                if (onUpdate) {
                  await onUpdate(matchedPlace.id, normalizedData);
                } else {
                  await updatePlace(matchedPlace.id, normalizedData);
                }
                successCount++;
              } else {
                failCount++;
                errors.push(`未找到匹配的地点: ${item.nameCN}`);
              }
            } else {
              failCount++;
              errors.push('缺少地点ID或无法匹配地点');
            }
          } else {
            // 有ID，直接更新（尝试从places中找到对应的metadata）
            const matchedPlace = places?.find((p) => p.id === placeId) || place;
            const itemMetadata = matchedPlace?.metadata || currentMetadata;
            const normalizedData = normalizePlaceData(item, itemMetadata);
            if (onUpdate) {
              await onUpdate(placeId, normalizedData);
            } else {
              const result = await updatePlace(placeId, normalizedData);
              if (!result) {
                throw new Error('更新失败');
              }
            }
            successCount++;
          }
        } catch (error) {
          failCount++;
          errors.push(
            `更新失败 (${item.nameCN || item.id || '未知'}): ${error instanceof Error ? error.message : '未知错误'}`
          );
        }
      }

      // 显示结果
      const resultMessage: Message = {
        role: 'assistant',
        content: `✅ JSON导入完成！
- 成功: ${successCount} 条
- 失败: ${failCount} 条
${errors.length > 0 ? '\n失败详情:\n' + errors.join('\n') : ''}`,
      };
      setMessages((prev) => [...prev, resultMessage]);

      // 清空导入数据
      setImportJson('');
      setShowImport(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // 刷新数据
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ 导入失败：${error instanceof Error ? error.message : '未知错误'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setImporting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* 浮动按钮 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          aria-label="打开助手"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col rounded-lg border bg-card shadow-2xl">
          {/* 头部 */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">DeepSeek 数据整理助手</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowImport(!showImport)}
                className="h-8 w-8"
                title="导入JSON数据"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* JSON导入界面 */}
          {showImport && (
            <div className="border-b p-4 bg-muted/50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON数据导入
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowImport(false);
                      setImportJson('');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="json-file-input"
                  />
                  <label htmlFor="json-file-input">
                    <Button variant="outline" size="sm" asChild>
                      <span className="cursor-pointer">
                        <Upload className="mr-1 h-3 w-3" />
                        上传文件
                      </span>
                    </Button>
                  </label>
                </div>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder="粘贴JSON数据或上传JSON文件...&#10;&#10;支持格式：&#10;1. 单个对象：{&quot;id&quot;: 1, &quot;nameCN&quot;: &quot;地点名称&quot;, ...}&#10;2. 数组格式：[{&quot;id&quot;: 1, ...}, {&quot;id&quot;: 2, ...}]"
                  className="w-full min-h-[120px] rounded-md border px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={importing}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleImport}
                    disabled={importing || !importJson.trim()}
                    className="flex-1"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        导入中...
                      </>
                    ) : (
                      <>
                        <Check className="mr-1 h-3 w-3" />
                        导入更新
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  提示：JSON数据必须包含 id 字段，或 nameCN 字段用于自动匹配地点
                </p>
              </div>
            </div>
          )}

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="space-y-2">
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>
                </div>
                {/* 一键更新按钮 */}
                {message.role === 'assistant' &&
                  message.extractedData !== null &&
                  message.extractedData !== undefined &&
                  (place || (places && places.length > 0)) && (
                    <div className="flex justify-start gap-2 px-2">
                      {place ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            message.extractedData && handleUpdate(place.id, message.extractedData)
                          }
                          disabled={updating === place.id || !message.extractedData}
                          className="text-xs"
                        >
                          {updating === place.id ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              更新中...
                            </>
                          ) : (
                            <>
                              <Check className="mr-1 h-3 w-3" />
                              一键更新当前地点
                            </>
                          )}
                        </Button>
                      ) : (
                        places?.map((p) => (
                          <Button
                            key={p.id}
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              message.extractedData && handleUpdate(p.id, message.extractedData)
                            }
                            disabled={updating === p.id || !message.extractedData}
                            className="text-xs"
                          >
                            {updating === p.id ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                更新中...
                              </>
                            ) : (
                              <>
                                <Check className="mr-1 h-3 w-3" />
                                更新 ID {p.id}
                              </>
                            )}
                          </Button>
                        ))
                      )}
                    </div>
                  )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-muted px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息... (Shift+Enter换行)"
                className="flex-1 resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="icon"
                className="h-10 w-10"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
