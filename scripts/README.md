# 地点数据完善脚本

## 功能说明

这个脚本使用 DeepSeek API 自动完善地点数据，从冰岛的雷克雅未克开始。

## 使用方法

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

确保 `.env.local` 文件中包含以下配置：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3. 运行脚本

#### 基本用法（处理所有冰岛地点）

```bash
npm run enhance-places
```

或者直接运行：

```bash
node scripts/enhance-places.js
```

#### 使用筛选参数

```bash
# 只处理雷克雅未克的地点
node scripts/enhance-places.js --countryCode=IS --search=Reykjavik

# 只处理特定城市的地点
node scripts/enhance-places.js --cityId=1

# 只处理景点类别
node scripts/enhance-places.js --countryCode=IS --category=ATTRACTION

# 组合筛选：雷克雅未克的景点
node scripts/enhance-places.js --countryCode=IS --search=Reykjavik --category=ATTRACTION

# 限制处理数量（只处理前3页）
node scripts/enhance-places.js --countryCode=IS --max-pages=3

# 干运行模式（预览将要更新的数据，不实际更新）
node scripts/enhance-places.js --countryCode=IS --dry-run
```

### 4. 筛选参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `--countryCode` | 国家代码（ISO 3166-1 alpha-2） | `--countryCode=IS` |
| `--cityId` | 城市ID | `--cityId=1` |
| `--search` | 搜索关键词（匹配名称、地址） | `--search=Reykjavik` |
| `--category` | 地点类别 | `--category=ATTRACTION` |
| `--limit` | 每页数量（默认：20） | `--limit=50` |
| `--max-pages` | 最大处理页数（默认：全部） | `--max-pages=5` |
| `--dry-run` | 干运行模式（不实际更新数据） | `--dry-run` |

**地点类别可选值：**
- `ATTRACTION` - 景点
- `RESTAURANT` - 餐厅
- `SHOPPING` - 购物
- `HOTEL` - 酒店
- `TRANSIT_HUB` - 交通枢纽

## 脚本功能

1. **获取地点列表**：从API获取冰岛（IS）的所有地点
2. **AI完善数据**：对每个地点调用DeepSeek API，完善以下信息：
   - 中文名称和英文名称
   - 完整地址
   - 地点介绍
   - 物理元数据（难度、停留时间、访问方式等）
   - 类别验证和修正
   - 经纬度坐标（从metadata中提取）

3. **批量更新**：将AI完善的数据更新到数据库

## 注意事项

- 脚本会在每个API请求之间延迟1秒，避免请求过快
- 如果AI未返回有效数据，会跳过该地点
- 所有AI提供的数据会完全替换现有数据
- 经纬度会优先从metadata中提取

## 自定义

可以修改脚本中的以下参数：

- `countryCode: 'IS'` - 修改为国家代码
- `search: 'Reykjavik'` - 添加搜索条件
- `cityId: 123` - 指定城市ID
- `limit: 20` - 每页数量
- `delay(1000)` - API请求延迟时间（毫秒）
