import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import App from '../App';

type Company = { id: string; name: string };

export default function AuthGate() {
  const [session, setSession] = useState<any>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadCompanies(userId: string) {
    if (!supabase) return;

    const { data, error: membershipError } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', userId);

    if (membershipError) {
      setError(membershipError.message);
      return;
    }

    const ids = (data ?? []).map((item) => item.company_id);

    if (!ids.length) {
      setCompanies([]);
      setSelectedCompany('');
      return;
    }

    const { data: rows, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .in('id', ids);

    if (companyError) {
      setError(companyError.message);
      return;
    }

    const available = (rows ?? []) as Company[];
    setCompanies(available);

    const saved = localStorage.getItem('ripple_company_id');
    const initial = available.find((company) => company.id === saved)
      ?? (available.length === 1 ? available[0] : undefined);

    setSelectedCompany(initial?.id ?? '');
    if (initial) localStorage.setItem('ripple_company_id', initial.id);
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) await loadCompanies(data.session.user.id);
      if (active) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        if (!nextSession) {
          setCompanies([]);
          setSelectedCompany('');
          localStorage.removeItem('ripple_company_id');
        } else {
          // Defer the query until the auth event has completed.
          window.setTimeout(() => {
            if (active) void loadCompanies(nextSession.user.id);
          }, 0);
        }
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function authenticate() {
    if (!supabase) return;
    setBusy(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;

        if (!data.session) {
          setMessage('Account created. Check your email to confirm your account, then sign in.');
        } else {
          setSession(data.session);
          await loadCompanies(data.user!.id);
        }
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
        setSession(data.session);
        await loadCompanies(data.user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  async function createCompany() {
    if (!supabase || !companyName.trim()) return;
    setBusy(true);
    setError('');

    try {
      const { data, error: createError } = await supabase.rpc('create_company', {
        p_name: companyName.trim(),
      });

      if (createError) throw createError;

      localStorage.setItem('ripple_company_id', data);
      setSelectedCompany(data);
      await loadCompanies(session.user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create company.');
    } finally {
      setBusy(false);
    }
  }

  function enterCompany() {
    if (!selectedCompany) return;
    localStorage.setItem('ripple_company_id', selectedCompany);
    setDemo(false);
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setDemo(false);
  }

  if (demo || !supabase) return <App />;

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Loading Ripple...</div>;
  }

  if (session && selectedCompany && companies.some((c) => c.id === selectedCompany)) {
    return (
      <>
        <App />
        <div className="fixed right-5 top-4 z-50 flex items-center gap-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow">
          <span className="max-w-40 truncate text-slate-600">
            {companies.find((c) => c.id === selectedCompany)?.name}
          </span>
          <button onClick={signOut} className="font-semibold text-rose-600">Sign out</button>
        </div>
      </>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">Ripple</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            {session ? 'Set up your workspace' : 'Supply chain resilience'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {session
              ? 'Choose a company or create a new workspace.'
              : 'Sign in to access your company supply chain and simulations.'}
          </p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

        {!session ? (
          <>
            <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
              <button onClick={() => setMode('signin')} className={`rounded-md py-2 text-sm font-semibold ${mode === 'signin' ? 'bg-white shadow' : 'text-slate-500'}`}>Sign in</button>
              <button onClick={() => setMode('signup')} className={`rounded-md py-2 text-sm font-semibold ${mode === 'signup' ? 'bg-white shadow' : 'text-slate-500'}`}>Create account</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); void authenticate(); }} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500" placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500" placeholder="At least 6 characters" />
              </div>
              <button disabled={busy} className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                {busy ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </>
        ) : companies.length > 0 ? (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Select company</label>
            <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-3">
              <option value="">Choose a company...</option>
              {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
            </select>
            <button disabled={!selectedCompany} onClick={enterCompany} className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white disabled:opacity-50">Continue to Ripple</button>
            <div className="border-t pt-4">
              <p className="mb-2 text-sm text-slate-500">Or create another company</p>
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" className="w-full rounded-lg border border-slate-300 px-3 py-3" />
              <button disabled={busy || !companyName.trim()} onClick={() => void createCompany()} className="mt-2 w-full rounded-lg border border-slate-300 py-3 font-semibold disabled:opacity-50">Create company</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Your account has no company workspace yet. Create one to begin.</p>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" className="w-full rounded-lg border border-slate-300 px-3 py-3" />
            <button disabled={busy || !companyName.trim()} onClick={() => void createCompany()} className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Creating...' : 'Create company'}</button>
          </div>
        )}

        {!session && (
          <button onClick={() => setDemo(true)} className="mt-5 w-full rounded-lg border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Continue with demo data
          </button>
        )}
      </section>
    </main>
  );
}
