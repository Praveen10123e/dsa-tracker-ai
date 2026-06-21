import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMockGoogle = !import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID.startsWith('mock_');

  const handleGoogleResponse = async (response) => {
    setIsSubmitting(true);
    setError('');
    const result = await loginWithGoogle(response.credential);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const handleMockGoogleLogin = async () => {
    setIsSubmitting(true);
    setError('');
    const result = await loginWithGoogle('mock_jwt_token_payload');
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const initializeGoogleSignIn = () => {
    if (window.google) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock_client_id';
      
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });

      const btnContainer = document.getElementById('google-signup-btn');
      if (btnContainer) {
        window.google.accounts.id.renderButton(
          btnContainer,
          {
            theme: 'outline',
            size: 'large',
            text: 'signup_with',
            shape: 'pill',
            width: '280', // Matches card width nicely
          }
        );
      }
    }
  };

  useEffect(() => {
    if (!isMockGoogle) {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        document.body.appendChild(script);
      } else {
        initializeGoogleSignIn();
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      return setError('Please enter all fields.');
    }
    
    setError('');
    setIsSubmitting(true);

    const result = await register(username, email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background bg-grid-pattern px-4 py-12 relative overflow-hidden">
      
      {/* Visual background glows */}
      <div className="glow-blob top-1/4 left-1/4 w-80 h-80 bg-primary/15 animate-pulse-slow"></div>
      <div className="glow-blob bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 animate-pulse-slow"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-gradient-to-tr from-primary to-accent p-3.5 rounded-2xl text-white shadow-glow-primary mb-4 animate-bounce-slow">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-400 to-accent bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Join the gamified DSA learning platform with AI mentoring.
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-panel rounded-3xl border border-border/40 shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="algorithm_master"
                  className="w-full !pl-10 !pr-4 glass-input font-medium"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full !pl-10 !pr-4 glass-input font-medium"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full !pl-10 !pr-4 glass-input font-medium"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-glow-primary"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0b0f19] px-2.5 text-muted-foreground text-[10px] font-bold tracking-wider rounded">
                Or Continue With
              </span>
            </div>
          </div>

          {/* Google Button */}
          <div className="flex justify-center w-full">
            {isMockGoogle ? (
              <button
                type="button"
                onClick={handleMockGoogleLogin}
                className="w-full py-2.5 px-4 bg-white dark:bg-[#1a1f2e] border border-border/40 hover:bg-neutral-50 dark:hover:bg-[#252b3d] text-foreground font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.66-.66-1.18-1.37-1.66-2.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Developer Google Sign-In</span>
              </button>
            ) : (
              <div id="google-signup-btn" className="w-full flex justify-center"></div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground mt-6 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-bold transition-all">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
