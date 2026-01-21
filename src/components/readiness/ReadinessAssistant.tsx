'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Check, Languages, Sparkles, FileText, AlertTriangle, ListChecks, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReadinessPack } from '@/types/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  extractedData?: Partial<ReadinessPack> | null;
}

interface ReadinessAssistantProps {
  pack: Partial<ReadinessPack>;
  onUpdate: (data: Partial<ReadinessPack>) => void;
}

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export function ReadinessAssistant({ pack, onUpdate }: ReadinessAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 获取目的地描述
  function getDestinationDescription(): string {
    const displayName = typeof pack.displayName === 'string' 
      ? pack.displayName 
      : pack.displayName?.zh || pack.displayName?.en || '';
    const geo = pack.geo;
    const region = typeof geo?.region === 'string' ? geo.region : geo?.region?.zh || geo?.region?.en || '';
    const city = typeof geo?.city === 'string' ? geo.city : geo?.city?.zh || geo?.city?.en || '';
    const countryCode = geo?.countryCode || '';
    
    return `${displayName} (${countryCode} - ${region} ${city})`.trim();
  }

  // 构建系统提示词
  function buildSystemPrompt(): string {
    return `你是一个专业的旅行准备度数据助手。你的任务是帮助用户生成和完善准备度Pack中的内容。

当前Pack数据：
\`\`\`json
${JSON.stringify(pack, null, 2)}
\`\`\`

目的地：${getDestinationDescription()}

## 重要要求：
1. **所有文本内容必须使用中文**
2. 根据目的地的实际情况（气候、地理、文化、签证要求等）生成准确、实用的内容
3. 严格按照下面的数据结构生成

## 规则 (rules) 数据结构示例：
\`\`\`json
{
  "rules": [
    {
      "id": "rule.is.entry.visa",
      "category": "entry_transit",
      "severity": "high",
      "message": "中国公民前往冰岛需要申请申根签证",
      "seasons": ["all"],
      "then": {
        "level": "must",
        "message": "请提前至少15个工作日申请签证"
      }
    },
    {
      "id": "rule.is.gear.layered",
      "category": "gear_packing",
      "severity": "medium",
      "message": "冰岛天气多变，需要准备分层穿衣",
      "seasons": ["all"],
      "then": {
        "level": "should",
        "message": "准备防水外套、抓绒衣、保暖内衣"
      }
    }
  ]
}
\`\`\`

**category 可选值**: entry_transit, safety_hazards, health_insurance, gear_packing, activities_bookings, logistics
**severity 可选值**: critical, high, medium, low, info
**seasons 可选值**: all, winter, summer, shoulder, polar_night, polar_day, rainy, dry
**then.level 可选值**: must, should, could, info

## 清单 (checklists) 数据结构示例：
\`\`\`json
{
  "checklists": [
    {
      "title": "护照",
      "description": "有效期至少6个月以上",
      "category": "documents",
      "required": true,
      "priority": 1
    },
    {
      "title": "防水冲锋衣",
      "description": "Gore-Tex材质推荐，应对冰岛多变天气",
      "category": "clothing",
      "required": true,
      "priority": 2
    },
    {
      "title": "登山鞋",
      "description": "防水防滑，适合冰川徒步",
      "category": "gear",
      "required": true,
      "priority": 3
    }
  ]
}
\`\`\`

**category 可选值**: documents, clothing, gear, electronics, toiletries, medicine, food, emergency, booking, other

## 风险 (hazards) 数据结构示例：
\`\`\`json
{
  "hazards": [
    {
      "zoneId": "zone-highland",
      "type": "WEATHER",
      "level": "HIGH",
      "seasons": ["winter"],
      "metadata": {
        "description": "冬季暴风雪频繁，能见度极低",
        "schedule": "11月至次年3月高发",
        "affectedAreas": ["内陆高地", "冰川区域"]
      }
    },
    {
      "zoneId": "zone-glacier",
      "type": "TERRAIN",
      "level": "MEDIUM",
      "seasons": ["all"],
      "metadata": {
        "description": "冰川裂缝危险，必须跟随专业向导",
        "schedule": "全年",
        "affectedAreas": ["瓦特纳冰川", "朗格冰川"]
      }
    }
  ]
}
\`\`\`

**type 可选值**: AVALANCHE, WEATHER, TERRAIN, WILDLIFE, VOLCANIC, FLOOD, EARTHQUAKE, TSUNAMI, ROAD, ALTITUDE, COLD, HEAT, UV, WATER, OTHER
**level 可选值**: CRITICAL, HIGH, MEDIUM, LOW, INFO

## 输出要求：
1. 只返回JSON格式数据，用 \`\`\`json 代码块包裹
2. 只返回需要更新的字段
3. 所有文本内容使用中文
4. 根据目的地实际情况生成，内容要准确实用`;
  }

  // 调用 DeepSeek API
  async function callDeepSeekAPI(userMessage: string): Promise<string> {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API Key 未配置');
    }

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API 请求失败: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '无响应';
  }

  // 从AI响应中提取JSON数据
  function extractData(content: string): Partial<ReadinessPack> | null {
    try {
      // 尝试匹配 JSON 代码块
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim());
      }

      // 尝试直接解析整个内容
      const trimmed = content.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return JSON.parse(trimmed);
      }

      return null;
    } catch (e) {
      console.error('解析数据失败:', e);
      return null;
    }
  }

  // 发送消息
  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await callDeepSeekAPI(userMessage);
      const extractedData = extractData(response);
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response,
          extractedData,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // 快捷命令
  async function handleQuickCommand(command: string) {
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: command }]);
    setLoading(true);

    try {
      const response = await callDeepSeekAPI(command);
      const extractedData = extractData(response);
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response,
          extractedData,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // 应用数据
  async function handleApplyData(data: Partial<ReadinessPack>) {
    setUpdating(true);
    try {
      onUpdate(data);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '✅ 数据已应用到表单！请点击保存按钮提交更改。',
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ 应用数据失败: ${error instanceof Error ? error.message : '未知错误'}`,
        },
      ]);
    } finally {
      setUpdating(false);
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
        title="准备度助手"
      >
        <Wand2 className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-background border rounded-lg shadow-2xl flex flex-col z-50">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          <span className="font-semibold">准备度助手</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 快捷命令 - 分组 */}
      <div className="border-b bg-muted/50 p-2 space-y-2">
        {/* 生成功能 */}
        <div>
          <div className="text-xs text-muted-foreground mb-1.5 px-1">生成数据（中文）</div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleQuickCommand(`请根据目的地 "${getDestinationDescription()}" 的实际情况，生成完整的中文准备度数据：
1. rules: 5-8条旅行规则（入境签证、安全须知、装备建议、交通物流等）
2. checklists: 15-20项打包清单（按证件、服装、装备、电子、药品等分类）
3. hazards: 3-5个风险提示（天气、地形、当地特有风险等）

严格按照系统提示中的JSON数据结构生成，所有文本内容使用中文。`)}
              disabled={loading}
              className="text-xs h-7"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              一键完善
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickCommand(`请根据目的地 "${getDestinationDescription()}" 生成5-8条中文旅行规则(rules)，涵盖：
- 入境签证要求 (category: entry_transit)
- 安全注意事项 (category: safety_hazards)
- 健康保险建议 (category: health_insurance)
- 装备打包建议 (category: gear_packing)
- 交通物流信息 (category: logistics)

严格按照系统提示中的rules数据结构，所有文本用中文。`)}
              disabled={loading}
              className="text-xs h-7"
            >
              <FileText className="mr-1 h-3 w-3" />
              生成规则
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickCommand(`请根据目的地 "${getDestinationDescription()}" 生成15-20项中文打包清单(checklists)，按分类组织：
- documents: 护照、签证、保险单等证件
- clothing: 根据当地气候的服装
- gear: 必要装备（如登山鞋、防水包等）
- electronics: 电子设备、充电器、转换插头
- medicine: 常用药品、急救用品
- other: 其他必需品

严格按照系统提示中的checklists数据结构，所有文本用中文。`)}
              disabled={loading}
              className="text-xs h-7"
            >
              <ListChecks className="mr-1 h-3 w-3" />
              生成清单
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickCommand(`请根据目的地 "${getDestinationDescription()}" 生成3-5个中文风险提示(hazards)，包括：
- 天气风险 (type: WEATHER)
- 地形风险 (type: TERRAIN)
- 当地特有风险（如野生动物、火山、道路等）

每个风险要说明：影响区域、季节、具体描述、注意事项。
严格按照系统提示中的hazards数据结构，所有文本用中文。`)}
              disabled={loading}
              className="text-xs h-7"
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              生成风险
            </Button>
          </div>
        </div>

        {/* 翻译功能 */}
        <div>
          <div className="text-xs text-muted-foreground mb-1.5 px-1">翻译</div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickCommand('请将所有英文内容翻译成中文，包括 displayName、rules、checklists、hazards 中的所有文本')}
              disabled={loading}
              className="text-xs h-7"
            >
              <Languages className="mr-1 h-3 w-3" />
              英→中
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickCommand('请将所有中文内容翻译成英文，包括 displayName、rules、checklists、hazards 中的所有文本')}
              disabled={loading}
              className="text-xs h-7"
            >
              <Languages className="mr-1 h-3 w-3" />
              中→英
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickCommand('请完善所有文本的双语版本，确保每个文本字段都同时有 en 和 zh 版本')}
              disabled={loading}
              className="text-xs h-7"
            >
              完善双语
            </Button>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">准备度数据助手</p>
            <p className="text-xs mt-2">我可以帮你：</p>
            <ul className="text-xs mt-2 space-y-1 text-left max-w-[200px] mx-auto">
              <li>• 根据目的地生成规则、清单、风险</li>
              <li>• 翻译现有内容为中英文</li>
              <li>• 完善和优化准备度数据</li>
            </ul>
            <p className="text-xs mt-4 text-muted-foreground/70">
              点击上方按钮或输入你的需求
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index}>
            <div
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="whitespace-pre-wrap break-words text-xs">
                  {message.content.length > 1500 
                    ? message.content.slice(0, 1500) + '...\n\n[内容已截断，完整数据已解析]'
                    : message.content
                  }
                </div>
              </div>
            </div>

            {/* 应用数据按钮 */}
            {message.role === 'assistant' && message.extractedData && (
              <div className="flex justify-start mt-2 gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApplyData(message.extractedData!)}
                  disabled={updating}
                  className="text-xs"
                >
                  {updating ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  应用数据
                </Button>
                <span className="text-xs text-muted-foreground self-center">
                  {message.extractedData.rules?.length ? `${message.extractedData.rules.length}条规则 ` : ''}
                  {message.extractedData.checklists?.length ? `${message.extractedData.checklists.length}项清单 ` : ''}
                  {message.extractedData.hazards?.length ? `${message.extractedData.hazards.length}个风险` : ''}
                </span>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs text-muted-foreground">正在生成...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="输入需求，如：添加更多冬季装备..."
            className="flex-1 px-3 py-2 border rounded-md text-sm"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            size="icon"
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
  );
}
