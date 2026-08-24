import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const needsPassword = searchParams.get('needsPassword') === 'true';

    if (code) {
      api.post('/api/auth/google/exchange', { code })
        .then(res => {
          const { token, user } = res.data;
          login(token, user);
          if (needsPassword) {
            navigate(`/set-password`, { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        })
        .catch(() => {
          navigate('/login?error=oauth_failed', { replace: true });
        });
    } else {
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-z-border border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="font-mono font-bold text-z-ink uppercase tracking-[0.4em] text-[10px]">SIGNING YOU IN...</p>
      </div>
    </div>
  );
}
