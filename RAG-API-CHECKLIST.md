# RAG 后台管理接口对接检查清单

## ✅ 16 个后台管理接口对接状态（已完成）

## ✅ 24 个新增接口对接状态

### 📚 知识库管理（重要）

| 接口 | 方法 | 路径 | 状态 | 文件位置 |
|------|------|------|------|----------|
| 1. 重建索引 | POST | `/api/rag/knowledge-base/rebuild-index` | ✅ 已对接 | `src/app/api/rag/knowledge-base/rebuild-index/route.ts` |
| 2. 清空索引 | POST | `/api/rag/knowledge-base/clear-index` | ✅ 已对接 | `src/app/api/rag/knowledge-base/clear-index/route.ts` |

### 📄 文档管理（CRUD）

| 接口 | 方法 | 路径 | 状态 | 文件位置 |
|------|------|------|------|----------|
| 3. 文档列表 | GET | `/api/rag/documents` | ✅ 已对接 | `src/app/api/rag/documents/route.ts` |
| 4. 文档详情 | GET | `/api/rag/documents/:id` | ✅ 已对接 | `src/app/api/rag/documents/[id]/route.ts` |
| 5. 添加单个文档 | POST | `/api/rag/index` | ✅ 已对接 | `src/app/api/rag/index/route.ts` |
| 6. 批量添加文档 | POST | `/api/rag/index/batch` | ✅ 已对接 | `src/app/api/rag/index/batch/route.ts` |
| 7. 更新文档 | PUT | `/api/rag/documents/:id` | ✅ 已对接 | `src/app/api/rag/documents/[id]/route.ts` |
| 8. 删除文档 | DELETE | `/api/rag/documents/:id` | ✅ 已对接 | `src/app/api/rag/documents/[id]/route.ts` |

### 🔄 缓存管理

| 接口 | 方法 | 路径 | 状态 | 文件位置 |
|------|------|------|------|----------|
| 9. 刷新合规规则缓存 | POST | `/api/rag/compliance/refresh` | ✅ 已对接 | `src/app/api/rag/compliance/refresh/route.ts` |
| 10. 刷新当地洞察缓存 | POST | `/api/rag/local-insight/refresh` | ✅ 已对接 | `src/app/api/rag/local-insight/refresh/route.ts` |

### 📊 评估和优化

| 接口 | 方法 | 路径 | 状态 | 文件位置 |
|------|------|------|------|----------|
| 11. 评估检索质量 | POST | `/api/rag/evaluation/evaluate` | ✅ 已对接 | `src/app/api/rag/evaluation/evaluate/route.ts` |
| 12. 批量评估 | POST | `/api/rag/evaluation/evaluate-batch` | ✅ 已对接 | `src/app/api/rag/evaluation/evaluate-batch/route.ts` |
| 13. 收集训练数据 | POST | `/api/rag/query-pairs/collect` | ✅ 已对接 | `src/app/api/rag/query-pairs/collect/route.ts` |
| 14. 自动收集 | POST | `/api/rag/query-pairs/collect-from-query` | ✅ 已对接 | `src/app/api/rag/query-pairs/collect-from-query/route.ts` |
| 15. 查看收集的数据 | GET | `/api/rag/query-pairs` | ✅ 已对接 | `src/app/api/rag/query-pairs/route.ts` |
| 16. 导出数据集 | POST | `/api/rag/query-pairs/export-for-evaluation` | ✅ 已对接 | `src/app/api/rag/query-pairs/export-for-evaluation/route.ts` |

---

### 📊 评估与测试集（新知识库系统）

| 接口 | 方法 | 路径 | 状态 | 文件位置 |
|------|------|------|------|----------|
| 17. 评估 Chunk 检索质量 | POST | `/api/rag/evaluation/chunks/evaluate` | ✅ 已对接 | `src/app/api/rag/evaluation/chunks/evaluate/route.ts` |
| 18. 批量评估 Chunk 检索质量 | POST | `/api/rag/evaluation/chunks/evaluate-batch` | ✅ 已对接 | `src/app/api/rag/evaluation/chunks/evaluate-batch/route.ts` |
| 19. 获取测试集 | GET | `/api/rag/evaluation/testset` | ✅ 已对接 | `src/app/api/rag/evaluation/testset/route.ts` |
| 20. 保存测试集 | PUT | `/api/rag/evaluation/testset` | ✅ 已对接 | `src/app/api/rag/evaluation/testset/route.ts` |
| 21. 运行测试集评估 | POST | `/api/rag/evaluation/testset/run` | ✅ 已对接 | `src/app/api/rag/evaluation/testset/run/route.ts` |
| 22. 查找相关 chunks | GET | `/api/rag/evaluation/testset/find-chunks` | ✅ 已对接 | `src/app/api/rag/evaluation/testset/find-chunks/route.ts` |
| 23. 列出所有 chunks | GET | `/api/rag/evaluation/testset/list-chunks` | ✅ 已对接 | `src/app/api/rag/evaluation/testset/list-chunks/route.ts` |

### 📈 监控指标

| 接口 | 方法 | 路径 | 状态 | 文件位置 |
|------|------|------|------|----------|
| 24. 获取所有监控指标 | GET | `/api/rag/monitoring/metrics` | ✅ 已对接 | `src/app/api/rag/monitoring/metrics/route.ts` |
| 25. 获取性能指标 | GET | `/api/rag/monitoring/performance` | ✅ 已对接 | `src/app/api/rag/monitoring/performance/route.ts` |
| 26. 获取质量指标 | GET | `/api/rag/monitoring/quality` | ✅ 已对接 | `src/app/api/rag/monitoring/quality/route.ts` |
| 27. 获取成本指标 | GET | `/api/rag/monitoring/cost` | ✅ 已对接 | `src/app/api/rag/monitoring/cost/route.ts` |
| 28. 重置监控指标 | POST | `/api/rag/monitoring/reset` | ✅ 已对接 | `src/app/api/rag/monitoring/reset/route.ts` |

### 💾 缓存管理

| 接口 | 方法 | 路径 | 状态 | 文件位置 |
|------|------|------|------|----------|
| 29. 获取缓存统计 | GET | `/api/rag/cache/stats` | ✅ 已对接 | `src/app/api/rag/cache/stats/route.ts` |
| 30. 重置缓存统计 | POST | `/api/rag/cache/reset-stats` | ✅ 已对接 | `src/app/api/rag/cache/reset-stats/route.ts` |
| 31. 清空缓存 | POST | `/api/rag/cache/clear` | ✅ 已对接 | `src/app/api/rag/cache/clear/route.ts` |

---

## ✅ 总结

**所有 16 个后台管理接口 + 15 个新增接口 = 31 个接口已全部对接完成！**

### 接口实现方式

所有接口都通过 Next.js API 路由实现，使用 `backend-client.ts` 中的代理函数将请求转发到后端服务 `http://localhost:3000/api`。

### 代理函数使用

- `proxyGetToBackend()` - GET 请求
- `proxyPostToBackend()` - POST 请求
- `proxyPutToBackend()` - PUT 请求
- `proxyDeleteToBackend()` - DELETE 请求

### 统一错误处理

所有接口都包含：
- 统一的错误响应格式
- 控制台日志记录
- 错误信息返回

---

## 🧪 测试建议

建议使用以下方式测试每个接口：

1. **使用浏览器开发者工具**：
   - 打开 Network 标签
   - 在 RAG 管理页面操作
   - 查看 API 请求和响应

2. **使用 curl 命令**：
   ```bash
   # 测试文档列表
   curl http://localhost:8989/api/rag/documents?page=1&pageSize=20
   
   # 测试重建索引
   curl -X POST http://localhost:8989/api/rag/knowledge-base/rebuild-index
   ```

3. **使用 Postman/Insomnia**：
   - 导入接口集合
   - 测试各个接口

---

## 📝 注意事项

1. **后端服务**: 确保后端服务 `http://localhost:3000/api` 正在运行
2. **环境变量**: 确保 `BACKEND_API_BASE_URL` 配置正确（默认: `http://localhost:3000/api`）
3. **CORS**: 如果遇到 CORS 问题，检查后端服务的 CORS 配置
4. **日志**: 查看服务器控制台日志，了解请求和响应详情

---

**最后更新**: 2026-01-23
