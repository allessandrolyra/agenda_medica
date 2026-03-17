import { useEffect, useState } from 'react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export default function Health() {
  const [status, setStatus] = useState<{ status?: string; error?: string }>({})

  useEffect(() => {
    if (!SUPABASE_URL) {
      setStatus({ error: 'Supabase não configurado' })
      return
    }
    const healthUrl = new URL(SUPABASE_URL).origin + '/functions/v1/health'
    fetch(healthUrl)
      .then((r) => r.json())
      .then(setStatus)
      .catch((e) => setStatus({ error: e.message }))
  }, [])

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 rounded-xl bg-white border border-slate-200">
      <h2 className="text-lg sm:text-xl font-bold mb-4">Health Check</h2>
      <pre className="text-sm bg-slate-50 p-4 rounded overflow-auto">
        {status.error ? (
          <span className="text-amber-600">{status.error}</span>
        ) : (
          JSON.stringify(status, null, 2)
        )}
      </pre>
    </div>
  )
}
