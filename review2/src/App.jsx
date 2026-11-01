import { useEffect, useState } from 'react'

const STORE = 'pel-review2-state'
const SESSION = 'pel-review2-session'
const emptyState = { users: [], customers: [], opportunities: [], tasks: [], activity: [], settings: { workspaceName: 'PEL CRM', adminNotifications: true, userPreferences: {} } }
const ADMIN = { id: 'pel-admin', name: 'S. Eswar Charan', email: 'admin@pel.local', password: 'PELAdmin@2026', role: 'admin', status: 'Active' }
const adminNav = ['Dashboard', 'Team Performance', 'Customers', 'Pipeline', 'Tasks', 'Users', 'Settings']
const userNav = ['Dashboard', 'Customers', 'Pipeline', 'Tasks', 'My Profile', 'Settings']
const stages = ['New lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']

const readState = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORE)) || {}
    return { ...emptyState, ...stored, settings: { ...emptyState.settings, ...(stored.settings || {}), userPreferences: { ...(stored.settings?.userPreferences || {}) } }, users: Array.isArray(stored.users) ? stored.users.map(user => ({ ...user, role: 'user' })) : [] }
  } catch { return emptyState }
}
const initials = name => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'U'
const currency = amount => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount || 0))
const id = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`

function Auth({ onAuthenticate, adminOnly = false }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const update = event => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = event => {
    event.preventDefault()
    const state = readState()
    const email = form.email.trim().toLowerCase()
    if (!email || !form.password) return setMessage('Enter your email and password.')
    if (adminOnly) {
      if (email !== ADMIN.email || form.password !== ADMIN.password) return setMessage('Incorrect administrator credentials.')
      onAuthenticate(ADMIN)
      return
    }
    if (mode === 'signup') {
      if (!form.name.trim()) return setMessage('Enter your full name.')
      if (state.users.some(user => user.email === email)) return setMessage('An account with this email already exists.')
      const user = { id: id(), name: form.name.trim(), email, password: form.password, role: 'user', createdAt: new Date().toISOString(), status: 'Active' }
      localStorage.setItem(STORE, JSON.stringify({ ...state, users: [...state.users, user] }))
      onAuthenticate(user)
      return
    }
    const user = state.users.find(item => item.email === email && item.password === form.password && item.role === 'user')
    if (!user) return setMessage('Account not found. Sign up first or check your password.')
    onAuthenticate(user)
  }
  return <main className="auth-shell">
    <section className="auth-story"><div className="rain"/><span className="brand">P</span><p className="eyebrow">PEL CRM PLATFORM</p><h1>Build better customer relationships.</h1><p>Project Review 2 · React + Vite · browser-local data</p></section>
    <section className="auth-card"><p className="eyebrow">{adminOnly ? 'RESTRICTED ACCESS' : mode === 'login' ? 'WELCOME BACK' : 'CREATE YOUR ACCOUNT'}</p><h2>{adminOnly ? 'Admin sign in' : mode === 'login' ? 'Sign in to PEL' : 'Join PEL CRM'}</h2><p className="muted">{adminOnly ? 'This page is only for the workspace administrator.' : mode === 'login' ? 'Sign in to your personal user portal.' : 'Your account is saved only in this browser.'}</p>
      {!adminOnly && <div className="switch"><button className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setMessage('') }}>Sign in</button><button className={mode === 'signup' ? 'selected' : ''} onClick={() => { setMode('signup'); setMessage('') }}>Sign up</button></div>}
      <form onSubmit={submit}>
        {!adminOnly && mode === 'signup' && <label>Full name<input name="name" value={form.name} onChange={update} placeholder="Your full name"/></label>}
        <label>Email<input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com"/></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={update} placeholder="Create a password"/></label>
        {message && <p className="form-error">{message}</p>}<button className="primary wide" type="submit">{adminOnly || mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <p className="auth-note">{adminOnly ? 'Admin page: /admin' : 'No server or database: user credentials and CRM records use Local Storage.'}</p>
    </section>
  </main>
}

function RecordForm({ kind, users, currentUser, onSave, onClose }) {
  const [form, setForm] = useState({ name: '', company: '', email: '', value: '', stage: 'New lead', priority: 'Medium', due: '', ownerId: currentUser.id })
  const update = event => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = event => { event.preventDefault(); onSave({ ...form, id: id(), createdAt: new Date().toISOString(), done: false, value: Number(form.value || 0) }); onClose() }
  return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true"><button className="close" onClick={onClose}>×</button><p className="eyebrow">NEW RECORD</p><h2>Add {kind}</h2><form onSubmit={submit}>
    <label>{kind === 'Task' ? 'Task title' : kind === 'Customer' ? 'Customer name' : 'Opportunity name'}<input name="name" required value={form.name} onChange={update}/></label>
    {kind !== 'Task' && <><label>Company<input name="company" value={form.company} onChange={update}/></label>{kind === 'Customer' && <label>Email<input name="email" type="email" value={form.email} onChange={update}/></label>}</>}
    {kind === 'Opportunity' && <><label>Value (₹)<input name="value" type="number" min="0" value={form.value} onChange={update}/></label><label>Stage<select name="stage" value={form.stage} onChange={update}>{stages.map(stage => <option key={stage}>{stage}</option>)}</select></label></>}
    {kind === 'Task' && <><label>Priority<select name="priority" value={form.priority} onChange={update}><option>High</option><option>Medium</option><option>Low</option></select></label><label>Due date<input name="due" type="date" value={form.due} onChange={update}/></label></>}
    {currentUser.role === 'admin' && <label>Assign to<select name="ownerId" value={form.ownerId} onChange={update}><option value="">Unassigned</option>{users.map(user => <option value={user.id} key={user.id}>{user.name}</option>)}</select></label>}
    <button className="primary wide">Save {kind}</button>
  </form></section></div>
}

function Profile({ user, onSave }) {
  const [form, setForm] = useState({ name:user.name, email:user.email, status:user.status || 'Active' })
  const update = event => setForm({ ...form, [event.target.name]:event.target.value })
  return <section><div className="page-heading"><div><p className="eyebrow">PERSONAL SETTINGS</p><h2>My profile</h2><p className="muted">Only you can change your personal details and status.</p></div></div><article className="panel profile-panel"><form onSubmit={event => { event.preventDefault(); onSave({ ...user, ...form, role:'user' }) }}><label>Full name<input name="name" required value={form.name} onChange={update}/></label><label>Email<input name="email" required type="email" value={form.email} onChange={update}/></label><label>My status<select name="status" value={form.status} onChange={update}><option>Active</option><option>Away</option><option>Inactive</option></select></label><button className="primary">Save my profile</button></form></article></section>
}

function Settings({ isAdmin, session, settings, onSave }) {
  const saved = settings.userPreferences?.[session.id] || {}
  const [form, setForm] = useState(isAdmin ? { workspaceName: settings.workspaceName || 'PEL CRM', adminNotifications: settings.adminNotifications !== false } : { reminders: saved.reminders !== false, layout: saved.layout || 'Comfortable', language: saved.language || 'English' })
  const update = event => setForm({ ...form, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value })
  const submit = event => { event.preventDefault(); onSave(form) }
  return <section><div className="page-heading"><div><p className="eyebrow">{isAdmin ? 'WORKSPACE CONTROL' : 'PERSONAL PREFERENCES'}</p><h2>Settings</h2><p className="muted">{isAdmin ? 'Manage this local workspace and administrator preferences.' : 'Choose how your personal portal behaves in this browser.'}</p></div></div><article className="panel settings-card"><div className="settings-identity"><span className="avatar">{initials(session.name)}</span><div><b>{session.name}</b><small>{session.email}</small><small>{isAdmin ? 'Workspace administrator' : 'User portal'}</small></div></div><form onSubmit={submit}>{isAdmin ? <><label>Workspace name<input name="workspaceName" required value={form.workspaceName} onChange={update}/></label><label className="check-label"><input type="checkbox" name="adminNotifications" checked={form.adminNotifications} onChange={update}/> Show activity notifications in the administrator portal</label></> : <><label className="check-label"><input type="checkbox" name="reminders" checked={form.reminders} onChange={update}/> Show task reminders in this portal</label><label>Dashboard layout<select name="layout" value={form.layout} onChange={update}><option>Comfortable</option><option>Compact</option></select></label><label>Display language<select name="language" value={form.language} onChange={update}><option>English</option><option>Hindi</option><option>Telugu</option></select></label></>}<button className="primary">Save settings</button></form></article></section>
}

function ToolbarPanel({ type, nav, onNavigate, records, activity }) {
  const [query, setQuery] = useState('')
  const matches = records.filter(record => `${record.label} ${record.detail}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
  if (type === 'quick') return <section className="toolbar-panel"><b>Quick navigation</b><div className="toolbar-list">{nav.map(item => <button key={item} onClick={() => onNavigate(item)}>{item}</button>)}</div></section>
  if (type === 'search') return <section className="toolbar-panel"><b>Search your visible records</b><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Customer, opportunity, or task"/><div className="toolbar-list">{query && matches.map(record => <span key={record.key}><b>{record.label}</b><small>{record.detail}</small></span>)}{query && !matches.length && <small>No matching records.</small>}</div></section>
  if (type === 'notifications') return <section className="toolbar-panel"><b>Notifications</b><p className="muted">Recent changes in this portal.</p><div className="toolbar-list">{activity.slice(0, 5).map(item => <span key={item.id}><b>{item.text}</b><small>{new Date(item.at).toLocaleString('en-IN')}</small></span>)}{!activity.length && <small>No notifications yet.</small>}</div></section>
  return <section className="toolbar-panel"><b>Workspace help</b><div className="toolbar-list help-list"><span><b>◐ Light / dark mode</b><small>Changes the local colour mode.</small></span><span><b>⌘ Quick navigation</b><small>Open any page quickly.</small></span><span><b>⌕ Search</b><small>Search records visible in your portal.</small></span><span><b>♧ Notifications</b><small>Shows recent activity and updates.</small></span></div></section>
}

function App() {
  const adminRoute = window.location.pathname.replace(/\/$/, '') === '/admin'
  const [data, setData] = useState(readState)
  const [session, setSession] = useState(() => { try { return JSON.parse(sessionStorage.getItem(SESSION) || 'null') } catch { return null } })
  const [page, setPage] = useState('Dashboard')
  const [modal, setModal] = useState(null)
  const [toolbar, setToolbar] = useState(null)
  useEffect(() => localStorage.setItem(STORE, JSON.stringify(data)), [data])
  useEffect(() => {
    if (session?.role !== 'admin' && session && !data.users.some(user => user.id === session.id)) {
      sessionStorage.removeItem(SESSION)
      setSession(null)
      setPage('Dashboard')
    }
  }, [data.users, session])
  const authenticate = user => { sessionStorage.setItem(SESSION, JSON.stringify(user)); setSession(user); setData(readState()) }
  const logout = () => { sessionStorage.removeItem(SESSION); setSession(null); setPage('Dashboard') }
  if (!session) return <Auth onAuthenticate={authenticate} adminOnly={adminRoute}/>
  const isAdmin = session.role === 'admin'
  if (adminRoute !== isAdmin) { sessionStorage.removeItem(SESSION); return <Auth onAuthenticate={authenticate} adminOnly={adminRoute}/> }
  const visible = records => isAdmin ? records : records.filter(record => record.ownerId === session.id)
  const customers = visible(data.customers); const opportunities = visible(data.opportunities); const tasks = visible(data.tasks)
  const recordLabel = type => ({ customers:'customer', opportunities:'pipeline opportunity', tasks:'task' }[type] || 'record')
  const saveRecord = (type, record) => setData(current => ({ ...current, [type]: [...current[type], record], activity: [{ id:id(), ownerId:record.ownerId, actor:isAdmin ? 'Admin' : session.name, text:`${isAdmin ? 'Admin added' : 'You added'} ${recordLabel(type)}: ${record.name}`, at:new Date().toISOString() }, ...(current.activity || [])].slice(0, 60) }))
  const removeRecord = (type, recordId) => setData(current => { const record = current[type].find(item => item.id === recordId); if (!record) return current; return { ...current, [type]: current[type].filter(record => record.id !== recordId), activity: [{ id:id(), ownerId:record.ownerId, actor:isAdmin ? 'Admin' : session.name, text:`${isAdmin ? 'Admin removed' : 'You removed'} ${recordLabel(type)}: ${record.name}`, at:new Date().toISOString() }, ...(current.activity || [])].slice(0, 60) } })
  const completeTask = taskId => setData(current => ({ ...current, tasks: current.tasks.map(task => task.id === taskId ? { ...task, done: !task.done } : task) }))
  const activeDeals = opportunities.filter(item => !['Won', 'Lost'].includes(item.stage)); const openTasks = tasks.filter(item => !item.done)
  const ownNav = isAdmin ? adminNav : userNav
  const updateOwnProfile = user => { setData(current => ({ ...current, users: current.users.map(item => item.id === user.id ? user : item), activity: [{ id:id(), ownerId:user.id, actor:user.name, text:'You updated your profile', at:new Date().toISOString() }, ...(current.activity || [])].slice(0, 60) })); sessionStorage.setItem(SESSION, JSON.stringify(user)); setSession(user) }
  const deleteUser = user => { if (user.id === session.id) return window.alert('You cannot remove the account currently signed in.'); if (!window.confirm(`Remove ${user.name}? Their records will remain but become unassigned.`)) return; setData(current => ({ ...current, users: current.users.filter(item => item.id !== user.id), customers: current.customers.map(item => item.ownerId === user.id ? { ...item, ownerId: '' } : item), opportunities: current.opportunities.map(item => item.ownerId === user.id ? { ...item, ownerId: '' } : item), tasks: current.tasks.map(item => item.ownerId === user.id ? { ...item, ownerId: '' } : item), activity: [{ id:id(), ownerId:'', actor:'Admin', text:`Admin removed user: ${user.name}`, at:new Date().toISOString() }, ...(current.activity || [])].slice(0, 60) })) }
  const saveSettings = form => setData(current => isAdmin ? { ...current, settings: { ...current.settings, workspaceName: form.workspaceName.trim(), adminNotifications: form.adminNotifications } } : { ...current, settings: { ...current.settings, userPreferences: { ...(current.settings?.userPreferences || {}), [session.id]: form } } })
  const searchRecords = [...customers.map(item => ({ key:item.id, label:item.name, detail:`Customer · ${item.company || 'No company'}` })), ...opportunities.map(item => ({ key:item.id, label:item.name, detail:`Opportunity · ${item.stage || 'New lead'}` })), ...tasks.map(item => ({ key:item.id, label:item.name, detail:`Task · ${item.priority || 'Medium'} priority` }))]
  return <div className="app-shell"><aside className="sidebar"><div className="logo"><span className="brand">P</span><div><strong>{data.settings?.workspaceName || 'PEL CRM'}</strong><small>CRM PLATFORM</small></div></div><p className="side-label">{isAdmin ? 'ADMIN PORTAL' : 'USER PORTAL'}</p><nav>{ownNav.map(item => <button className={page === item ? 'active' : ''} key={item} onClick={() => setPage(item)}>{item}</button>)}</nav><div className="user-box"><span>{initials(session.name)}</span><div><b>{session.name}</b><small>{isAdmin ? 'Administrator' : 'User'}</small></div><button onClick={logout} title="Log out">↗</button></div></aside>
    <main className="workspace"><header><div><p className="eyebrow">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p><h1>{page === 'Dashboard' ? `Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${session.name.split(' ')[0]}` : page}</h1></div><div className="top-tools"><button className="ghost" title="Switch light or dark mode" onClick={() => document.body.classList.toggle('dark')}>◐</button><button className="ghost" title="Quick navigation" onClick={() => setToolbar(toolbar === 'quick' ? null : 'quick')}>⌘</button><button className="ghost" title="Search records" onClick={() => setToolbar(toolbar === 'search' ? null : 'search')}>⌕</button><button className="ghost" title="Notifications" onClick={() => setToolbar(toolbar === 'notifications' ? null : 'notifications')}>♧</button><button className="ghost" title="Help" onClick={() => setToolbar(toolbar === 'help' ? null : 'help')}>?</button><button className="account-tool" title={isAdmin ? 'Administrator settings' : 'My profile'} onClick={() => { setPage(isAdmin ? 'Settings' : 'My Profile'); setToolbar(null) }}>{initials(session.name)}</button>{toolbar && <ToolbarPanel type={toolbar} nav={ownNav} records={searchRecords} activity={isAdmin ? data.activity : (data.activity || []).filter(item => item.ownerId === session.id)} onNavigate={item => { setPage(item); setToolbar(null) }}/>}</div></header>
      {page === 'Dashboard' && <Dashboard isAdmin={isAdmin} data={data} users={data.users} customers={customers} deals={activeDeals} tasks={openTasks} onAdd={setModal} activity={isAdmin ? data.activity : (data.activity || []).filter(item => item.ownerId === session.id)}/>} 
      {page === 'Team Performance' && isAdmin && <TeamPerformance users={data.users} data={data}/>} 
      {page === 'Customers' && <Records title="Customers" items={customers} columns={['name','company','email']} type="customers" onAdd={() => setModal('Customer')} onDelete={removeRecord}/>} 
      {page === 'Pipeline' && <Pipeline items={opportunities} onAdd={() => setModal('Opportunity')} onDelete={removeRecord}/>} 
      {page === 'Tasks' && <Tasks items={tasks} onAdd={() => setModal('Task')} onDelete={removeRecord} onComplete={completeTask}/>} 
      {page === 'Users' && isAdmin && <Users users={data.users} data={data} onDelete={deleteUser}/>} 
      {page === 'My Profile' && !isAdmin && <Profile user={session} onSave={updateOwnProfile}/>} 
      {page === 'Settings' && <Settings isAdmin={isAdmin} session={session} settings={data.settings || emptyState.settings} onSave={saveSettings}/>}
    </main>{modal && <RecordForm kind={modal} users={data.users} currentUser={session} onSave={record => saveRecord(modal === 'Customer' ? 'customers' : modal === 'Task' ? 'tasks' : 'opportunities', record)} onClose={() => setModal(null)}/>}</div>
}

function Dashboard({ isAdmin, data, users, customers, deals, tasks, onAdd, activity = [] }) {
  const pipelineValue = deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0)
  return <><section className={isAdmin ? 'hero admin-hero' : 'hero'}><div><p className="eyebrow">{isAdmin ? 'ADMIN COMMAND CENTER' : 'MY WORKSPACE'}</p><h2>{isAdmin ? 'Manage users, performance, and every CRM record.' : 'Your assigned work, in one place.'}</h2></div><div className="quick-actions"><button onClick={() => onAdd('Customer')}>+ Customer</button><button onClick={() => onAdd('Opportunity')}>+ Opportunity</button><button className="primary" onClick={() => onAdd('Task')}>+ Task</button></div></section><section className="metrics"><Metric label={isAdmin ? 'Registered users' : 'My customers'} value={isAdmin ? users.length : customers.length} note={isAdmin ? `${users.filter(user => user.status === 'Active').length} active now` : 'Saved records'}/><Metric label="Open pipeline" value={currency(pipelineValue)} note={`${deals.length} active opportunities`}/><Metric label="Open tasks" value={tasks.length} note="Needs attention"/><Metric label={isAdmin ? 'All customers' : 'My workspace'} value={customers.length} note={isAdmin ? 'Across all users' : 'Visible records'}/></section><section className="grid"><article className="panel"><h3>Revenue performance</h3><p className="muted">Opportunity value by pipeline stage</p><div className="chart">{stages.slice(0, 5).map(stage => { const total = deals.filter(deal => deal.stage === stage).reduce((sum, deal) => sum + Number(deal.value || 0), 0); const height = total ? Math.max(18, Math.min(170, total / 800)) : 8; return <div className="bar-wrap" key={stage}><span style={{ height }} className="bar" title={currency(total)}/><small>{stage}</small></div> })}</div></article><article className="panel"><h3>{isAdmin ? 'Team attention needed' : 'Priority follow-ups'}</h3><p className="muted">{isAdmin ? 'Open tasks across every registered user' : 'High-priority work appears first'}</p><div className="list">{tasks.filter(task => !task.done).sort((a,b) => (a.priority === 'High' ? -1 : 1)).slice(0, 5).map(task => <div key={task.id}><b>{task.name}</b><span className={`badge ${task.priority?.toLowerCase()}`}>{task.priority}</span></div>) || null}{!tasks.filter(task => !task.done).length && <Empty text="No follow-ups yet. Create a task to begin."/>}</div></article></section>{!isAdmin && <section className="panel activity-panel"><h3>Admin activity for you</h3><p className="muted">Updates made by the administrator to your assigned CRM records.</p><div className="list">{activity.slice(0,5).map(item => <div key={item.id}><b>{item.text}</b><small>{new Date(item.at).toLocaleString('en-IN')}</small></div>)}{!activity.length && <Empty text="No administrator updates yet."/>}</div></section>}{isAdmin && <section className="panel admin-summary"><h3>User performance snapshot</h3><p className="muted">Live counts from users and records stored in this browser.</p><TeamRows users={users} data={data} compact/></section>}</>
}
const Metric = ({label,value,note}) => <article className="metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>
const Empty = ({text}) => <p className="empty">{text}</p>
function Records({ title, items, columns, type, onAdd, onDelete }) { return <section><div className="page-heading"><div><p className="eyebrow">CRM RECORDS</p><h2>{title}</h2><p className="muted">Only records available in this portal are shown here.</p></div><button className="primary" onClick={onAdd}>+ Add customer</button></div><article className="panel table"><div className="table-row table-head">{columns.map(column => <b key={column}>{column}</b>)}<b>Action</b></div>{items.map(item => <div className="table-row" key={item.id}>{columns.map(column => <span key={column}>{item[column] || '—'}</span>)}<button className="danger" onClick={() => onDelete(type,item.id)}>Delete</button></div>)}{!items.length && <Empty text="No customer records yet."/>}</article></section> }
function Pipeline({items,onAdd,onDelete}) { return <section><div className="page-heading"><div><p className="eyebrow">SALES MANAGEMENT</p><h2>Pipeline</h2><p className="muted">Track current opportunities by stage.</p></div><button className="primary" onClick={onAdd}>+ New opportunity</button></div><div className="kanban">{stages.map(stage => <article className="kanban-col" key={stage}><h3>{stage}<span>{items.filter(item => item.stage === stage).length}</span></h3>{items.filter(item => item.stage === stage).map(item => <div className="deal" key={item.id}><b>{item.name}</b><small>{item.company || 'No company'}</small><strong>{currency(item.value)}</strong><button className="danger" onClick={() => onDelete('opportunities',item.id)}>Delete</button></div>)}{!items.filter(item => item.stage === stage).length && <p className="empty">No deals</p>}</article>)}</div></section> }
function Tasks({items,onAdd,onDelete,onComplete}) { return <section><div className="page-heading"><div><p className="eyebrow">FOLLOW-UPS</p><h2>Tasks</h2><p className="muted">Keep your important work moving.</p></div><button className="primary" onClick={onAdd}>+ Add task</button></div><article className="panel task-list">{items.map(task => <div className={task.done ? 'task done' : 'task'} key={task.id}><input type="checkbox" checked={task.done} onChange={() => onComplete(task.id)}/><div><b>{task.name}</b><small>{task.due || 'No due date'} · {task.priority} priority</small></div><button className="danger" onClick={() => onDelete('tasks',task.id)}>Delete</button></div>)}{!items.length && <Empty text="No tasks yet."/>}</article></section> }
function TeamRows({ users, data, compact = false }) { return <div className={compact ? 'performance compact' : 'performance'}>{users.map(user => { const customers = data.customers.filter(customer => customer.ownerId === user.id).length; const tasks = data.tasks.filter(task => task.ownerId === user.id && !task.done).length; const deals = data.opportunities.filter(deal => deal.ownerId === user.id && !['Won','Lost'].includes(deal.stage)); const value = deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0); return <div className="performance-row" key={user.id}><span className="avatar">{initials(user.name)}</span><b>{user.name}<small>{user.email}</small></b><span className={`status ${String(user.status || 'Active').toLowerCase()}`}>{user.status || 'Active'}</span><span><b>{customers}</b><small>customers</small></span><span><b>{tasks}</b><small>open tasks</small></span><span><b>{deals.length}</b><small>pipeline deals</small></span><span><b>{currency(value)}</b><small>pipeline value</small></span></div> })}{!users.length && <Empty text="No users have signed up yet."/>}</div> }
function TeamPerformance({users,data}) { return <section><div className="page-heading"><div><p className="eyebrow">ADMIN EXCLUSIVE</p><h2>Team performance</h2><p className="muted">See what every user is working on and their current workload.</p></div></div><article className="panel"><TeamRows users={users} data={data}/></article></section> }
function Users({users,data,onDelete}) { return <section><div className="page-heading"><div><p className="eyebrow">ADMINISTRATION</p><h2>Users</h2><p className="muted">All accounts are User portals. Personal details and status are controlled by each user.</p></div></div><div className="user-grid">{users.map(user => { const userCustomers = data.customers.filter(customer => customer.ownerId === user.id).length; const userTasks = data.tasks.filter(task => task.ownerId === user.id && !task.done).length; const userDeals = data.opportunities.filter(deal => deal.ownerId === user.id && !['Won','Lost'].includes(deal.stage)).length; return <article className="user-card" key={user.id}><span className="avatar">{initials(user.name)}</span><h3>{user.name}</h3><p>{user.email}</p><span className={`status ${String(user.status || 'Active').toLowerCase()}`}>{user.status || 'Active'}</span><span className="role">User portal</span><div><b>{userCustomers}</b><small>customers</small><b>{userTasks}</b><small>open tasks</small><b>{userDeals}</b><small>pipeline deals</small></div><footer><button className="danger" onClick={() => onDelete(user)}>Remove user</button></footer></article> })}{!users.length && <Empty text="No users have signed up yet."/>}</div></section> }

export default App
