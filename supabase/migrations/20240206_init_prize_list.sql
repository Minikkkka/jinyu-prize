-- 创建表
CREATE TABLE IF NOT EXISTS prize_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    prize_name VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT '未领取' CHECK (status IN ('未领取', '已领取')),
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_prize_list_employee_id ON prize_list(employee_id);
CREATE INDEX IF NOT EXISTS idx_prize_list_status ON prize_list(status);

-- 启用RLS
ALTER TABLE prize_list ENABLE ROW LEVEL SECURITY;

-- 允许匿名读取
DROP POLICY IF EXISTS "Enable read access for all users" ON prize_list;
CREATE POLICY "Enable read access for all users" ON prize_list FOR SELECT USING (true);

-- 允许匿名插入 (管理员导入)
DROP POLICY IF EXISTS "Enable insert access for all users" ON prize_list;
CREATE POLICY "Enable insert access for all users" ON prize_list FOR INSERT WITH CHECK (true);

-- 允许匿名更新 (领取奖品)
DROP POLICY IF EXISTS "Enable update access for all users" ON prize_list;
CREATE POLICY "Enable update access for all users" ON prize_list FOR UPDATE USING (true);
