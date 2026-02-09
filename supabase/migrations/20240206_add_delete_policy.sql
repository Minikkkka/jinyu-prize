-- 允许匿名删除 (管理员重新导入时清空数据)
CREATE POLICY "Enable delete access for all users" ON prize_list FOR DELETE USING (true);
