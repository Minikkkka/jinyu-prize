import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, LogOut, RefreshCw } from 'lucide-react';
import { GameTitle, GameCard, GameButton } from '../components/GameUI';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState({ total: 0, claimed: 0, unclaimed: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      navigate('/');
    } else {
      fetchStats();
    }
  }, [navigate]);

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.from('prize_list').select('status');
      if (error) throw error;

      const total = data.length;
      const claimed = data.filter((item) => item.status === '已领取').length;
      const unclaimed = total - claimed;

      setStats({ total, claimed, unclaimed });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFile(file);
    setShowConfirmModal(true);
    
    // Clear the input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    if (pendingFile) {
      processFile(pendingFile);
    }
    setShowConfirmModal(false);
    setPendingFile(null);
  };

  const cancelImport = () => {
    setShowConfirmModal(false);
    setPendingFile(null);
  };

  const processFile = (file: File) => {
    setLoading(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Validate and format data
        const formattedData = data.map((item: any) => {
          const name = item['姓名'] || item['名字'];
          if (!item['工号'] || !name || !item['奖品名称']) {
            throw new Error('Excel格式错误：缺少必要的列（工号、姓名/名字、奖品名称）');
          }
          return {
            employee_id: String(item['工号']).trim(),
            name: String(name).trim(),
            prize_name: String(item['奖品名称']).trim(),
            status: '未领取',
          };
        });

        // Delete all existing records (Full Import Strategy)
        const { error: deleteError, count: deletedCount } = await supabase
          .from('prize_list')
          .delete({ count: 'exact' })
          .neq('employee_id', '_placeholder_'); // Matches all records since no employee_id is '_placeholder_'

        if (deleteError) throw deleteError;
        
        console.log(`Deleted ${deletedCount} records`);

        // Insert new records if any
        if (formattedData.length > 0) {
          const { error: insertError, count: insertedCount } = await supabase
            .from('prize_list')
            .insert(formattedData)
            .select(); // Select to get count? No, insert returns data if select is used, or count if specified.
          
          if (insertError) throw insertError;
        }

        setMessage({ type: 'success', text: `成功导入 ${formattedData.length} 条数据（旧数据已清空）` });
        
        // Force a small delay to ensure propagation (though not strictly necessary for single connection)
        setTimeout(() => {
            fetchStats();
        }, 500);
      } catch (err: any) {
        console.error(err);
        setMessage({ type: 'error', text: err.message || '导入失败，请检查文件格式' });
      } finally {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase
        .from('prize_list')
        .select('*')
        .order('employee_id', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setMessage({ type: 'error', text: '没有数据可导出' });
        return;
      }

      const exportData = data.map((item) => ({
        工号: item.employee_id,
        姓名: item.name,
        奖品名称: item.prize_name,
        状态: item.status,
        领取时间: item.claimed_at ? new Date(item.claimed_at).toLocaleString() : '',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '中奖名单');
      
      const fileName = `中奖名单_导出_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setMessage({ type: 'success', text: '导出成功' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: '导出失败' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl text-white font-bangers tracking-wide">管理后台</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fetchStats()}
              className={`p-2 rounded-full text-white/80 hover:bg-white/10 hover:text-white focus:outline-none transition-colors duration-200 ${refreshing ? 'animate-spin' : ''}`}
              title="刷新数据"
            >
              <RefreshCw className="h-6 w-6" />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-white/20 rounded-xl shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none"
            >
              <LogOut className="h-5 w-5 mr-2" />
              退出
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <GameCard className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-400/20 to-blue-600/20">
            <dt className="text-sm font-medium text-white/80 truncate font-signika uppercase">总记录数</dt>
            <dd className="mt-2 text-4xl font-bold text-white font-paytone">{stats.total}</dd>
          </GameCard>
          <GameCard className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-400/20 to-green-600/20">
            <dt className="text-sm font-medium text-white/80 truncate font-signika uppercase">已领取</dt>
            <dd className="mt-2 text-4xl font-bold text-green-300 font-paytone">{stats.claimed}</dd>
          </GameCard>
          <GameCard className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20">
            <dt className="text-sm font-medium text-white/80 truncate font-signika uppercase">未领取</dt>
            <dd className="mt-2 text-4xl font-bold text-yellow-300 font-paytone">{stats.unclaimed}</dd>
          </GameCard>
        </div>

        <GameCard title="数据管理">
          {message && (
            <div className={`mb-6 p-4 rounded-xl border-l-4 ${message.type === 'success' ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'} animate-fade-in-up`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {message.type === 'success' ? (
                    <CheckCircle className={`h-6 w-6 text-green-500`} />
                  ) : (
                    <AlertCircle className={`h-6 w-6 text-red-500`} />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`font-bold ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {message.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Import Section */}
            <div className="border-2 border-dashed border-white/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
              <FileSpreadsheet className="h-16 w-16 text-white/50 mb-4" />
              <h4 className="text-xl font-bold text-white mb-2 font-signika">导入中奖名单</h4>
              <p className="text-sm text-white/60 mb-6">
                支持 .xlsx 格式<br/>需包含工号、姓名、奖品名称
              </p>
              <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <GameButton
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-auto px-8"
              >
                <div className="flex items-center justify-center">
                  <Upload className="h-5 w-5 mr-2" />
                  {loading ? '处理中...' : '选择文件导入'}
                </div>
              </GameButton>
            </div>

            {/* Export Section */}
            <div className="border-2 border-dashed border-white/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
              <FileSpreadsheet className="h-16 w-16 text-white/50 mb-4" />
              <h4 className="text-xl font-bold text-white mb-2 font-signika">导出最新名单</h4>
              <p className="text-sm text-white/60 mb-6">
                导出包含最新领取状态的<br/>完整名单数据
              </p>
              <GameButton
                onClick={handleExport}
                disabled={loading}
                variant="success"
                className="w-auto px-8"
              >
                <div className="flex items-center justify-center">
                  <Download className="h-5 w-5 mr-2" />
                  {loading ? '处理中...' : '导出数据'}
                </div>
              </GameButton>
            </div>
          </div>
        </GameCard>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-scale-in">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-signika">确认导入?</h3>
                <p className="text-gray-600 mb-6">
                  ⚠️ 警告：导入新名单将<span className="font-bold text-red-600">清空所有历史数据</span>（包括领取状态）。
                  <br/><br/>
                  此操作无法撤销，是否确认继续？
                </p>
                <div className="flex space-x-4">
                  <GameButton 
                    onClick={cancelImport}
                    variant="primary" // Using primary (pink) for cancel/safe action or just neutral? Let's use neutral-ish or danger for the action.
                    className="bg-gray-500 hover:bg-gray-600 shadow-gray-700"
                    style={{ background: '#9ca3af', boxShadow: '0 4px 0 #4b5563' }}
                  >
                    取消
                  </GameButton>
                  <GameButton 
                    onClick={confirmImport}
                    variant="danger"
                  >
                    确认导入
                  </GameButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
