import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Prize } from '../types';
import { Search, Gift, User, CheckCircle, AlertCircle } from 'lucide-react';
import { GameTitle, GameCard, GameButton, GameInput } from '../components/GameUI';

const Home: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [prize, setPrize] = useState<Prize | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = employeeId.trim();
    if (!id) return;

    // Check for admin login
    if (id === '88888') {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin/dashboard');
      return;
    }

    setLoading(true);
    setError('');
    setPrize(null);

    try {
      const { data, error } = await supabase
        .from('prize_list')
        .select('*')
        .eq('employee_id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('未找到该工号的中奖信息');
        } else {
          setError('查询出错，请稍后重试');
          console.error(error);
        }
      } else {
        setPrize(data);
      }
    } catch (err) {
      setError('查询发生异常');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimClick = () => {
    if (prize) {
      navigate('/confirm', { state: { prize } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <GameTitle />

        <GameCard title="查询奖品" className="animate-fade-in-up">
          <form onSubmit={handleSearch}>
            <GameInput
              icon={<User className="h-6 w-6" />}
              type="text"
              placeholder="请输入工号"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
            
            <GameButton 
              type="submit" 
              disabled={loading}
              className="mt-4"
            >
              {loading ? '查询中...' : '开始查询'}
            </GameButton>
          </form>

          {error && (
            <div className="mt-6 bg-red-100 border-l-4 border-red-500 p-4 rounded-r-xl animate-shake">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                <p className="text-red-700 font-bold">{error}</p>
              </div>
            </div>
          )}
        </GameCard>

        {prize && (
          <GameCard className="animate-scale-in">
            <div className="text-center mb-6">
              <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-4 ${
                prize.status === '已领取' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
              }`}>
                {prize.status}
              </div>
              <h3 className="text-3xl text-white font-bangers tracking-wide mb-2">
                恭喜中奖!
              </h3>
            </div>

            <div className="bg-white/20 rounded-xl p-4 mb-6 space-y-4">
              <div className="flex items-center text-white">
                <User className="h-6 w-6 mr-3 opacity-80" />
                <div>
                  <p className="text-sm opacity-80">姓名</p>
                  <p className="text-xl font-bold">{prize.name}</p>
                </div>
              </div>
              <div className="h-px bg-white/20" />
              <div className="flex items-center text-white">
                <Gift className="h-6 w-6 mr-3 opacity-80" />
                <div>
                  <p className="text-sm opacity-80">奖品</p>
                  <p className="text-xl font-bold text-yellow-300">{prize.prize_name}</p>
                </div>
              </div>
            </div>

            {prize.status === '未领取' ? (
              <GameButton 
                onClick={handleClaimClick}
                variant="success"
              >
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  立即领取
                </div>
              </GameButton>
            ) : (
              <div className="w-full py-4 px-6 bg-gray-200/50 rounded-2xl flex justify-center items-center text-white font-bold cursor-not-allowed">
                <CheckCircle className="h-6 w-6 mr-2" />
                已于 {new Date(prize.claimed_at!).toLocaleString()} 领取
              </div>
            )}
          </GameCard>
        )}
      </div>
    </div>
  );
};

export default Home;
