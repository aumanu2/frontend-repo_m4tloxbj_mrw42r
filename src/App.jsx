import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || ''

function Stat({ label, value }){
  return (
    <div className="p-4 bg-white/70 rounded-xl shadow border border-gray-100">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-gray-800">{value}</div>
    </div>
  )
}

function Section({ title, children, actions }){
  return (
    <div className="bg-white/60 backdrop-blur p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex gap-2">{actions}</div>
      </div>
      {children}
    </div>
  )
}

export default function App(){
  const [health, setHealth] = useState(null)
  const [institutions, setInstitutions] = useState([])
  const [users, setUsers] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', subdomain: '' })

  useEffect(() => {
    fetch(`${API}/test`).then(r=>r.json()).then(setHealth).catch(()=>{})
    fetch(`${API}/institutions`).then(r=>r.json()).then(setInstitutions).catch(()=>{})
  }, [])

  const handleCreateInstitution = async () => {
    setLoading(true)
    try{
      const res = await fetch(`${API}/institutions`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: form.name, subdomain: form.subdomain, plan: 'free' })})
      const data = await res.json()
      if(data?.id){
        const list = await fetch(`${API}/institutions`).then(r=>r.json())
        setInstitutions(list)
      }
    } finally {
      setLoading(false)
    }
  }

  const demoSetup = async () => {
    if(!institutions.length){
      alert('Create an institution first')
      return
    }
    const inst = institutions[0]
    // create teacher, student, batch, attendance, invoice (demo)
    await fetch(`${API}/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ institution_id: inst._id || inst.id || inst._id, role:'teacher', name:'Demo Teacher', email: `teacher@${inst.subdomain||'demo'}.com` })})
    await fetch(`${API}/batches`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ institution_id: inst._id || inst.id, name:'Batch A', subject:'Math' })})
    const studsBefore = await fetch(`${API}/students?institution_id=${inst._id || inst.id}`).then(r=>r.json())
    setStudents(studsBefore)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800">EduVerse – Coaching Management OS</h1>
          <a href="#pricing" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Pricing</a>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Backend" value={health?.backend || '…'} />
          <Stat label="Database" value={health?.database || '…'} />
          <Stat label="Collections" value={health?.collections?.length || 0} />
          <Stat label="Institutions" value={institutions?.length || 0} />
        </div>

        <Section title="Quick Start" actions={
          <button onClick={demoSetup} className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Setup Demo Data</button>
        }>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={form.name} onChange={e=>setForm(v=>({...v, name:e.target.value}))} placeholder="Institute name" className="w-full px-3 py-2 rounded-lg border" />
                <input value={form.subdomain} onChange={e=>setForm(v=>({...v, subdomain:e.target.value}))} placeholder="Subdomain" className="w-full px-3 py-2 rounded-lg border" />
              </div>
              <button disabled={loading} onClick={handleCreateInstitution} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">Create Institution</button>
            </div>
            <div className="bg-white/70 rounded-xl p-4 border">
              <div className="text-sm text-gray-600">
                Create your coaching space. Then add teachers, students and start taking attendance or issuing invoices.
              </div>
            </div>
          </div>
        </Section>

        <Section title="Institutions">
          <div className="grid md:grid-cols-2 gap-4">
            {institutions?.map((ins)=> (
              <div key={ins._id} className="p-4 rounded-xl border bg-white/70">
                <div className="font-semibold text-gray-800">{ins.name}</div>
                <div className="text-sm text-gray-500">Plan: {ins.plan}</div>
                <div className="text-xs text-gray-400">ID: {ins._id}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Why EduVerse">
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Real-time attendance with QR, GPS and manual modes</li>
            <li>Automated invoices, UPI/wallet/card payments and reminders</li>
            <li>Online tests with auto-grading and analytics</li>
            <li>Parent alerts and receipts, teacher portal and audit logs</li>
          </ul>
        </Section>

        <Section title="Pricing" actions={null}>
          <div id="pricing" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[{name:'Free', price:'₹0', note:'Trial'}, {name:'Basic', price:'₹999'}, {name:'Premium', price:'₹2,499'}, {name:'Enterprise', price:'₹4,999'}].map(p => (
              <div key={p.name} className="p-5 rounded-2xl border bg-white/70 flex flex-col">
                <div className="text-lg font-semibold text-gray-800">{p.name}</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{p.price}<span className="text-base text-gray-500">/mo</span></div>
                <div className="mt-3 text-sm text-gray-600">Key features to run your institute smoothly.</div>
                <button className="mt-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Start free</button>
              </div>
            ))}
          </div>
        </Section>

        <footer className="text-center text-gray-500 text-sm py-6">© {new Date().getFullYear()} EduVerse</footer>
      </div>
    </div>
  )
}
