import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Prize } from '../types';
import { CheckCircle, XCircle, Gift, User, AlertTriangle } from 'lucide-react';
import { GameTitle, GameCard, GameButton } from '../components/GameUI';

const Confirm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prize = location.state?.prize as Prize;
  const [loading, setLoading] = useState(false);

  if (!prize) {
    navigate('/');
    return null;
  }

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('prize_list')
        .update({
          status: '已领取',
          claimed_at: new Date().toISOString(),
        })
        .eq('employee_id', prize.employee_id);

      if (error) throw error;

      alert('领取成功！');
      navigate('/');
    } catch (error) {
      console.error('Error claiming prize:', error);
      alert('领取失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <GameTitle />
        
        <GameCard className="animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl text-white font-bangers tracking-wide mb-2">
              确认领取?
            </h2>
            <p className="text-white/80 font-signika">
              请确认以下信息无误
            </p>
          </div>

          <div className="bg-white/20 rounded-xl p-6 mb-8 space-y-4">
            <div className="flex items-center text-white">
              <User className="h-6 w-6 mr-4 opacity-80" />
              <div>
                <p className="text-sm opacity-80">领取人</p>
                <p className="text-2xl font-bold">{prize.name}</p>
                <p className="text-sm opacity-60">工号: {prize.employee_id}</p>
              </div>
            </div>
            <div className="h-px bg-white/20" />
            <div className="flex items-center text-white">
              <Gift className="h-6 w-6 mr-4 opacity-80" />
              <div>
                <p className="text-sm opacity-80">奖品内容</p>
                <p className="text-2xl font-bold text-yellow-300">{prize.prize_name}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <GameButton 
              onClick={handleConfirm} 
              disabled={loading}
              variant="success"
            >
              <div className="flex items-center justify-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                {loading ? '处理中...' : '确认领取'}
              </div>
            </GameButton>

            <GameButton 
              onClick={() => navigate('/')}
              variant="danger"
            >
              <div className="flex items-center justify-center">
                <XCircle className="h-6 w-6 mr-2" />
                取消
              </div>
            </GameButton>
          </div>
        </GameCard>
      </div>
    </div>
  );
};

export default Confirm;
