import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const AuthDebugger: React.FC = () => {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('test123456');
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSupabaseConnection = async () => {
    setTesting(true);
    setLogs([]);
    addLog('🔍 Starting Supabase diagnostics...');

    try {
      // Test 1: Check Supabase initialization
      addLog('✅ Supabase SDK loaded');

      // Test 2: Check current session
      const { data: { session } } = await supabase.auth.getSession();
      addLog(`   Current session: ${session ? 'Active' : 'None'}`);
      if (session?.user) {
        addLog(`   User ID: ${session.user.id}`);
        addLog(`   Email: ${session.user.email}`);
      }

      // Test 3: Try to sign up
      addLog('📝 Attempting sign up...');
      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          addLog(`✅ Sign up successful! User ID: ${signUpData.user.id}`);

          // Test 4: Check if profile was auto-created
          addLog('📖 Checking for auto-created profile...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signUpData.user.id)
            .single();

          if (profileError) {
            addLog(`⚠️ Profile not auto-created: ${profileError.message}`);
          } else if (profile) {
            addLog('✅ Profile auto-created by trigger');
            addLog(`   Email: ${profile.email}`);
            addLog(`   Plan: ${profile.plan}`);
          }

          // Sign out after test
          await supabase.auth.signOut();
          addLog('✅ Signed out successfully');
        } else {
          addLog('ℹ️ User created but email confirmation required');
        }

      } catch (signUpError: any) {
        if (signUpError.message?.includes('already registered')) {
          addLog('ℹ️ Email already exists, trying sign in instead...');

          // Test sign in
          try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: testEmail,
              password: testPassword,
            });

            if (signInError) throw signInError;

            addLog(`✅ Sign in successful! User ID: ${signInData.user?.id}`);

            // Sign out after test
            await supabase.auth.signOut();
            addLog('✅ Signed out successfully');
          } catch (signInError: any) {
            addLog(`❌ Sign in failed: ${signInError.message}`);
          }
        } else {
          addLog(`❌ Sign up failed: ${signUpError.message}`);
        }
      }

      // Test 5: Check database connection
      addLog('📊 Testing database connection...');
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        addLog(`⚠️ Database query error: ${countError.message}`);
      } else {
        addLog(`✅ Database connected! Total profiles: ${count}`);
      }

      addLog('🎉 Diagnostics complete!');
    } catch (error: any) {
      addLog(`❌ Critical error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="glass-panel rounded-2xl p-4 border border-white/20 shadow-2xl">
        <h3 className="text-white font-bold mb-3 text-sm">Auth Debugger (Supabase)</h3>

        <div className="space-y-2 mb-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full px-3 py-2 glass-panel border border-white/20 rounded-lg text-white text-xs"
            placeholder="Test email"
          />
          <input
            type="password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            className="w-full px-3 py-2 glass-panel border border-white/20 rounded-lg text-white text-xs"
            placeholder="Test password"
          />
        </div>

        <button
          onClick={testSupabaseConnection}
          disabled={testing}
          className="w-full bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Run Diagnostics'}
        </button>

        {logs.length > 0 && (
          <div className="mt-3 max-h-60 overflow-y-auto space-y-1">
            {logs.map((log, idx) => (
              <div key={idx} className="text-xs font-mono text-white/70 break-words">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
