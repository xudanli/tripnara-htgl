-- 删除 nameCN 等于 'Unnamed place' 的地点数据
-- 使用方法：
--   1. 先执行查询语句查看要删除的数据
--   2. 确认无误后执行 DELETE 语句

-- 查看要删除的数据
SELECT 
    id,
    nameCN,
    nameEN,
    category,
    address,
    created_at
FROM places
WHERE nameCN = 'Unnamed place';

-- 查看要删除的数据总数
SELECT COUNT(*) as total_count
FROM places
WHERE nameCN = 'Unnamed place';

-- 执行删除（⚠️ 请确保已备份数据库）
DELETE FROM places
WHERE nameCN = 'Unnamed place';
