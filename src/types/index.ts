export interface Prize {
  id: string;
  employee_id: string;
  name: string;
  prize_name: string;
  status: '未领取' | '已领取';
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExcelData {
  工号: string;
  姓名: string;
  奖品名称: string;
}
