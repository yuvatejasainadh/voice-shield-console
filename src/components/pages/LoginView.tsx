import React, { useState } from 'react';
import { Shield, KeyRound, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext';

export const LoginView: React.FC = () => {
  const { login, apiError, clearApiError, isLoading } = useConsole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearApiError();
    try {
      await login(email, password);
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = async (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setLocalError(null);
    clearApiError();
    try {
      await login(userEmail, pass);
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed.');
    }
  };

  const displayError = localError || apiError;

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#F1F3F4] flex flex-col justify-center items-center p-4 relative">
      {/* Main Container */}
      <div className="w-full max-w-md bg-[#101216] border border-[#252930] rounded-[4px] shadow-2xl p-7 relative z-10">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-[2px] bg-[#15181D] border border-[#252930] flex items-center justify-center text-[#8AB4F8]">
            <Shield className="w-4 h-4 fill-[#8AB4F8]/20 stroke-[#8AB4F8]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-[#F1F3F4] uppercase font-mono">
              VoiceShield Console
            </h1>
            <p className="text-xs text-[#9AA0A6]">
              Internal Engineering & Operations Platform
            </p>
          </div>
        </div>

        {/* Security Alert Banner */}
        <div className="mb-5 p-2.5 rounded-[2px] bg-[#15181D] border border-[#252930] text-[11px] font-mono text-[#9AA0A6] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#81C995] shrink-0" />
          <span>Authorized internal users only. Telemetry & audit logged.</span>
        </div>

        {/* Real Backend Error Banner */}
        {displayError && (
          <div className="mb-4 p-2.5 rounded-[2px] bg-[#15181D] border-l-2 border-[#F28B82] text-xs text-[#F28B82] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{displayError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#9AA0A6] mb-1">
              Internal Identity / Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@voiceshield.internal"
              className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-mono uppercase text-[#9AA0A6]">
                Access Token / Password
              </label>
              <span className="text-[10px] font-mono text-[#6F757D]">
                Production RDS
              </span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8] transition-colors font-mono"
            />
          </div>

          {/* MFA UI for privileged accounts */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase text-[#FDD663] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Privileged MFA TOTP (Optional)
              </label>
              <span className="text-[10px] font-mono text-[#6F757D]">MFA Ready</span>
            </div>
            <input
              type="text"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="492 810 (optional for standard session)"
              className="w-full bg-[#0B0C0E] border border-[#252930] rounded-[4px] px-3 py-2 text-xs font-mono text-[#F1F3F4] placeholder:text-[#6F757D] focus:outline-hidden focus:border-[#8AB4F8] transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#9AA0A6]">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="rounded-[2px] border-[#252930] bg-[#0B0C0E] text-[#8AB4F8]"
              />
              <span>Remember hardware session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-[4px] bg-[#8AB4F8] hover:bg-[#A8C7FA] disabled:opacity-50 text-[#0B0C0E] font-medium text-xs font-mono tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Authenticate Control Plane</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#252930]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#9AA0A6] mb-2.5">
            Production access
          </div>
          <div className="text-[10px] text-[#6F757D] font-mono">
            Use your authorized VoiceShield credentials to sign in.
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-[11px] font-mono text-[#6F757D] space-y-1">
        <div>VoiceShield Core Control Plane · Production Backend Active</div>
        <div>Endpoint: https://vs-console-server.onrender.com/api/v1</div>
      </div>
    </div>
  );
};
