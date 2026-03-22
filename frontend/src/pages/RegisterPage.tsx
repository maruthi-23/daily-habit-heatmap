import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Zap, Loader2, Check } from 'lucide-react'
import { AxiosError } from 'axios'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const rules = [
    { label: '8+ characters', ok: form.password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(form.password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(form.password) },
    { label: 'A number', ok: /\d/.test(form.password) },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (!rules.every(r => r.ok)) { toast.error('Password requirements not met'); return }

    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch (err) {
      const e = err as AxiosError<any>
      toast.error(e?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c5cfc 0%, transparent 70%)' }} />
        <div className="absolute bottom-20 -left-20 h-80 w-80 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg"
              style={{ background: 'var(--accent)' }}>
              <Zap size={22} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>HabitMap</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Start your consistency journey.</p>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Create account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input type="text" className="input" placeholder="Alex Johnson"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required autoComplete="name" />
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required autoComplete="email" />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} className="input pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required autoComplete="new-password" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {rules.map(r => (
                    <div key={r.label} className="flex items-center gap-1.5 text-xs">
                      <div className={`flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors ${r.ok ? 'bg-green-500' : ''}`}
                        style={{ background: r.ok ? 'var(--green)' : 'var(--border)' }}>
                        {r.ok && <Check size={8} className="text-black" />}
                      </div>
                      <span style={{ color: r.ok ? 'var(--green)' : 'var(--text-muted)' }}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="label">Confirm password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                required />
              {form.confirm && form.confirm !== form.password && (
                <p className="mt-1 text-xs text-red-400">Passwords don't match</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full mt-2 py-2.5" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--accent-light)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
