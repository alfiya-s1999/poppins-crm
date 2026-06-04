import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const BRAND = {
  cream: '#F5E6C8', warmWhite: '#FBF6EE', black: '#1A1612',
  brown: '#6B4C2A', brownLight: '#C4924A', brownPale: '#EDD9B0',
  border: '#E8D8B4', muted: '#8C7A5E',
  green: '#3B6D11', greenBg: '#EAF3DE',
  red: '#993C1D', redBg: '#FCEBEB',
  amber: '#854F0B', amberBg: '#FAEEDA',
}

const QUOTES = [
  { text: "Life is short, eat the biscoff.", sub: "— Poppins bakery wisdom" },
  { text: "Another day, another layer. Let's rise.", sub: "— for the ones who bake before dawn" },
  { text: "You can't buy happiness, but you can bake it.", sub: "— and apparently sell it too" },
  { text: "The croissants aren't going to bake themselves.", sub: "— rise and shine" },
  { text: "Every great cake started as a crazy idea.", sub: "— keep going, Poppins" },
  { text: "Butter makes everything better. So does tracking your margins.", sub: "— Poppins CRM" },
  { text: "A brownie a day keeps the bad vibes away.", sub: "— medically unverified, emotionally true" },
  { text: "Small batches, big dreams.", sub: "— Poppins, year one" },
  { text: "Not all heroes wear capes. Some wear aprons.", sub: "— and deliver before 9am" },
  { text: "Bake it till you make it.", sub: "— the Poppins motto" },
  { text: "The secret ingredient is always love. And cream cheese.", sub: "— Poppins kitchen notes" },
  { text: "Success is just sourdough starter — feed it every day.", sub: "— for the consistent ones" },
  { text: "Cheesecake doesn't ask questions. Cheesecake understands.", sub: "— deep bakery philosophy" },
]

const CAT_COLORS = { Ingredients:'#533ab5', Transport:'#D85A30', Packaging:'#1D9E75', Overhead:'#BA7517', Equipment:'#378ADD', Labour:'#D4537E', Other:'#888780' }
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS_LIST = ['January','February','March','April','May','June','July','August','September','October','November','December']
const CORRECT_PASSWORD = 'poppins2026'

// Dynamic month options - always current month + 11 past months + 3 future
function getMonthOptions() {
  const options = []
  const now = new Date()
  for (let i = -11; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    options.push(`${MONTHS_LIST[d.getMonth()]} ${d.getFullYear()}`)
  }
  return options.reverse()
}

function getCurrentMonth() {
  const now = new Date()
  return `${MONTHS_LIST[now.getMonth()]} ${now.getFullYear()}`
}

function getRateForItem(itemName, clientType, productsList) {
  if (!productsList || !productsList.length || !itemName) return 0
  const product = productsList.find(p => p.name.toLowerCase() === itemName.toLowerCase())
  if (!product) return 0
  return clientType === 'B2C' ? (Number(product.b2c_rate) || 0) : (Number(product.b2b_rate) || 0)
}

function parseOrderItems(itemsText, clientType, productsList) {
  if (!itemsText) return []
  return itemsText.split('\n').map(line => {
    const match = line.match(/^(.+?)\s*x(\d+)/i)
    if (!match) return null
    const name = match[1].trim()
    const qty = parseInt(match[2])
    const rate = getRateForItem(name, clientType, productsList || [])
    const amount = rate ? qty * rate : null
    return { name, qty, rate, amount }
  }).filter(Boolean)
}

function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const tryLogin = () => {
    if (pw === CORRECT_PASSWORD) { localStorage.setItem('poppins_auth','true'); onLogin() }
    else { setError(true); setTimeout(() => setError(false), 2000) }
  }
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:BRAND.cream, fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <div style={{ background:'#fff', border:`1px solid ${BRAND.border}`, borderRadius:20, padding:'40px 36px', width:360, textAlign:'center', boxShadow:'0 8px 40px rgba(107,76,42,0.12)' }}>
        <div style={{ fontSize:13, fontWeight:700, letterSpacing:'0.25em', color:BRAND.brown, textTransform:'uppercase', marginBottom:6 }}>POPPINS</div>
        <div style={{ fontSize:11, color:BRAND.muted, letterSpacing:'0.1em', marginBottom:32 }}>BUSINESS CRM</div>
        <input type="password" placeholder="Enter password" value={pw} onChange={e=>{setPw(e.target.value);setError(false)}} onKeyDown={e=>e.key==='Enter'&&tryLogin()}
          style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:`1.5px solid ${error?BRAND.red:BRAND.border}`, fontSize:14, marginBottom:10, fontFamily:'inherit', outline:'none', textAlign:'center', background:BRAND.warmWhite, color:BRAND.black, letterSpacing:4 }} autoFocus />
        {error && <div style={{ color:BRAND.red, fontSize:12, marginBottom:8 }}>Incorrect password</div>}
        <button onClick={tryLogin} style={{ width:'100%', padding:12, background:BRAND.black, color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Enter</button>
      </div>
    </div>
  )
}

const s = {
  app: { display:'flex', height:'100vh', background:BRAND.warmWhite, fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', fontSize:14, color:BRAND.black },
  sidebar: { width:188, flexShrink:0, borderRight:`1px solid ${BRAND.border}`, background:'#fff', display:'flex', flexDirection:'column', padding:'20px 0' },
  logo: { padding:'0 20px 18px', borderBottom:`1px solid ${BRAND.border}`, marginBottom:10 },
  logoText: { fontSize:13, fontWeight:700, letterSpacing:'0.22em', color:BRAND.brown, textTransform:'uppercase' },
  logoSub: { fontSize:10, color:BRAND.muted, letterSpacing:'0.1em', marginTop:2, textTransform:'uppercase' },
  navItem: (a) => ({ padding:'9px 20px', cursor:'pointer', fontSize:13, color:a?BRAND.black:BRAND.muted, background:a?BRAND.cream:'transparent', borderLeft:a?`2px solid ${BRAND.brownLight}`:'2px solid transparent', fontWeight:a?500:400, display:'flex', alignItems:'center', gap:10 }),
  main: { flex:1, overflowY:'auto', padding:28 },
  card: { background:'#fff', border:`1px solid ${BRAND.border}`, borderRadius:14, padding:'16px 18px', marginBottom:14 },
  cardTitle: { fontSize:10, fontWeight:600, color:BRAND.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 },
  metricCard: { background:BRAND.warmWhite, border:`1px solid ${BRAND.border}`, borderRadius:12, padding:'14px 16px' },
  metricLabel: { fontSize:10, color:BRAND.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 },
  metricValue: { fontSize:22, fontWeight:600, color:BRAND.black },
  metricSub: { fontSize:11, color:BRAND.muted, marginTop:2 },
  table: { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th: { textAlign:'left', padding:'7px 10px', fontWeight:500, fontSize:10, color:BRAND.muted, borderBottom:`1px solid ${BRAND.border}`, textTransform:'uppercase', letterSpacing:'0.05em' },
  td: { padding:'9px 10px', borderBottom:`1px solid ${BRAND.border}`, verticalAlign:'middle' },
  btn: (p) => ({ padding:p?'9px 18px':'7px 14px', borderRadius:8, border:p?'none':`1px solid ${BRAND.border}`, background:p?BRAND.black:'#fff', color:p?'#fff':BRAND.black, cursor:'pointer', fontSize:13, fontWeight:p?500:400, fontFamily:'inherit' }),
  btnDanger: { padding:'3px 8px', borderRadius:6, border:`1px solid ${BRAND.redBg}`, background:BRAND.redBg, color:BRAND.red, cursor:'pointer', fontSize:11, fontFamily:'inherit' },
  input: { width:'100%', padding:'8px 10px', borderRadius:8, border:`1px solid ${BRAND.border}`, fontSize:13, fontFamily:'inherit', background:BRAND.warmWhite, color:BRAND.black, outline:'none' },
  select: { padding:'7px 10px', borderRadius:8, border:`1px solid ${BRAND.border}`, fontSize:12, fontFamily:'inherit', background:'#fff', color:BRAND.black, outline:'none', cursor:'pointer' },
  label: { fontSize:11, color:BRAND.muted, display:'block', marginBottom:3 },
  twoCol: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 },
  modal: { position:'fixed', inset:0, background:'rgba(26,22,18,0.4)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' },
  modalBox: { background:'#fff', borderRadius:16, padding:26, width:520, maxHeight:'88vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(26,22,18,0.15)' },
  formRow: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 },
  formRow3: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 },
  badge: (c,b) => ({ display:'inline-block', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:500, color:c, background:b }),
  filterBar: { display:'flex', gap:8, alignItems:'center', marginBottom:14, flexWrap:'wrap' },
}

function Badge({ type }) {
  const map = { B2B:[BRAND.amber,BRAND.amberBg], B2C:[BRAND.green,BRAND.greenBg], Paid:[BRAND.green,BRAND.greenBg], Pending:[BRAND.amber,BRAND.amberBg] }
  const [c,b] = map[type]||[BRAND.muted,BRAND.cream]
  return <span style={s.badge(c,b)}>{type}</span>
}

function BarChart({ data, color=BRAND.brownLight }) {
  const max = Math.max(...data.map(d=>d.value),1)
  return <div>{data.map((d,i)=>(
    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
      <div style={{ fontSize:12, width:160, flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={d.label}>{d.label}</div>
      <div style={{ flex:1, height:6, background:BRAND.cream, borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${Math.round(d.value/max*100)}%`, background:color, borderRadius:3 }} />
      </div>
      <div style={{ fontSize:11, color:BRAND.muted, minWidth:55, textAlign:'right' }}>{d.display}</div>
    </div>
  ))}</div>
}

function Modal({ open, onClose, title, children, preventClose, width }) {
  if (!open) return null
  return <div style={s.modal} onClick={e=>{ if(e.target===e.currentTarget && !preventClose) onClose() }}>
    <div style={{ ...s.modalBox, width:width||520 }}><div style={{ fontSize:16, fontWeight:600, marginBottom:18 }}>{title}</div>{children}</div>
  </div>
}

function FInput({ label, ...props }) {
  return <div>
    {label && <label style={s.label}>{label}</label>}
    {props.type==='select'
      ? <select style={s.input} value={props.value} onChange={props.onChange}>{(props.options||[]).map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}</select>
      : props.type==='textarea'
        ? <textarea style={{ ...s.input, resize:'vertical' }} rows={props.rows||4} {...props} />
        : <input style={s.input} {...props} />}
  </div>
}

function Toast({ msg }) {
  if (!msg) return null
  return <div style={{ position:'fixed', bottom:24, right:24, background:BRAND.black, color:'#fff', padding:'10px 18px', borderRadius:10, fontSize:13, fontWeight:500, zIndex:200 }}>{msg}</div>
}

const printStyles = `@media print { .no-print { display: none !important; } @page { margin: 8mm; size: A4; } }`

function InvoiceModal({ order, onClose, products }) {
  const items = parseOrderItems(order?.items, order?.client_type, products)
  const calculatedTotal = items.reduce((s,i)=>s+(i.amount||0),0)
  return (
    <div style={s.modal} onClick={e=>e.stopPropagation()}>
      <style>{printStyles}</style>
      <div style={{ background:'#fff', borderRadius:16, padding:32, width:580, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(26,22,18,0.15)' }}>
        <div style={{ textAlign:'center', marginBottom:24, borderBottom:`2px solid ${BRAND.brownLight}`, paddingBottom:16 }}>
          <div style={{ fontSize:22, fontWeight:700, letterSpacing:'0.2em', color:BRAND.brown }}>POPPINS</div>
          <div style={{ fontSize:11, color:BRAND.muted, letterSpacing:'0.08em' }}>Fresh baked. Delivered with love.</div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:11, color:BRAND.muted, marginBottom:4 }}>FROM</div>
            <div style={{ fontWeight:600 }}>Poppins</div>
            <div style={{ fontSize:12, color:BRAND.muted }}>PAN: JEZPS2147G</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:11, color:BRAND.muted, marginBottom:4 }}>INVOICE</div>
            <div style={{ fontWeight:600 }}>{order?.invoice_no}</div>
            <div style={{ fontSize:12, color:BRAND.muted }}>{order?.date}</div>
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, color:BRAND.muted, marginBottom:4 }}>BILL TO</div>
          <div style={{ fontWeight:600 }}>{order?.client}</div>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:20, fontSize:13 }}>
          <thead>
            <tr style={{ background:BRAND.cream }}>
              <th style={{ textAlign:'left', padding:'8px 10px', fontSize:11, color:BRAND.muted, textTransform:'uppercase' }}>Item</th>
              <th style={{ textAlign:'center', padding:'8px 10px', fontSize:11, color:BRAND.muted, textTransform:'uppercase' }}>Qty</th>
              <th style={{ textAlign:'right', padding:'8px 10px', fontSize:11, color:BRAND.muted, textTransform:'uppercase' }}>Rate</th>
              <th style={{ textAlign:'right', padding:'8px 10px', fontSize:11, color:BRAND.muted, textTransform:'uppercase' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? items.map((item,i)=>(
              <tr key={i} style={{ borderBottom:`1px solid ${BRAND.border}` }}>
                <td style={{ padding:'9px 10px' }}>{item.name}</td>
                <td style={{ padding:'9px 10px', textAlign:'center' }}>{item.qty}</td>
                <td style={{ padding:'9px 10px', textAlign:'right' }}>{item.rate ? `₹${item.rate}` : '—'}</td>
                <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:500 }}>{item.amount ? `₹${item.amount.toLocaleString()}` : '—'}</td>
              </tr>
            )) : <tr><td colSpan={4} style={{ padding:'12px 10px', color:BRAND.muted }}>{order?.items||'No items'}</td></tr>}
          </tbody>
          <tfoot>
            <tr style={{ borderTop:`2px solid ${BRAND.brownLight}` }}>
              <td colSpan={3} style={{ padding:'10px', fontWeight:600, textAlign:'right' }}>Total</td>
              <td style={{ padding:'10px', fontWeight:700, textAlign:'right', fontSize:15 }}>₹{(calculatedTotal||Number(order?.amount)||0).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        <div style={{ background:BRAND.cream, borderRadius:10, padding:'12px 14px', marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:600, color:BRAND.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Bank Details</div>
          <div style={{ fontSize:12, lineHeight:1.7 }}>
            <div>Bank: State Bank of India</div>
            <div>Branch: Nahan</div>
            <div>A/C: 37258711949</div>
            <div>IFSC: SBIN0000686</div>
          </div>
        </div>
        <div style={{ textAlign:'center', fontSize:12, color:BRAND.muted }}>Thank you for your business. Baked with love in Nahan.</div>
        <div className="no-print" style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20, paddingTop:16, borderTop:`1px solid ${BRAND.border}` }}>
          <button style={s.btn(false)} onClick={onClose}>Close</button>
          <button style={s.btn(true)} onClick={()=>window.print()}>Print / Save PDF</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('home')
  const [authed, setAuthed] = useState(localStorage.getItem('poppins_auth')==='true')
  const [orders, setOrders] = useState([])
  const [expenses, setExpenses] = useState([])
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [inventory, setInventory] = useState([])
  const [modal, setModal] = useState(null)
  const [invoiceOrder, setInvoiceOrder] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [bulkSelect, setBulkSelect] = useState([])
  const [bulkMode, setBulkMode] = useState(false)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({})
  const [quote] = useState(QUOTES[Math.floor(Math.random()*QUOTES.length)])
  const [analyticsMonth, setAnalyticsMonth] = useState('all')
  const [orderFilterType, setOrderFilterType] = useState('all')
  const [orderFilterStatus, setOrderFilterStatus] = useState('all')
  const [orderFilterMonth, setOrderFilterMonth] = useState('all')
  const [expFilterCat, setExpFilterCat] = useState('all')
  const [expFilterVendor, setExpFilterVendor] = useState('all')
  const [expFilterMonth, setExpFilterMonth] = useState('all')
  const [orderItems, setOrderItems] = useState([{ product:'', qty:1, rate:0, amount:0, custom:false, description:'' }])

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''),2500) }
  const MONTH_OPTIONS = getMonthOptions()

  const load = useCallback(async () => {
    setLoading(true)
    const [o,e,p,c,inv] = await Promise.all([
      supabase.from('orders').select('*').order('date',{ascending:false}),
      supabase.from('expenses').select('*').order('date',{ascending:false}),
      supabase.from('products').select('*').order('name'),
      supabase.from('clients').select('*').order('name'),
      supabase.from('inventory').select('*').order('name'),
    ])
    setOrders(o.data||[]); setExpenses(e.data||[]); setProducts(p.data||[]); setClients(c.data||[]); setInventory(inv.data||[])
    setLoading(false)
  },[])

  useEffect(()=>{load()},[load])

  const getNextInvoiceNo = (clientType) => {
    if (clientType === 'B2C') {
      const b2cOrders = orders.filter(o=>o.invoice_no&&o.invoice_no.startsWith('B2C'))
      const nums = b2cOrders.map(o=>parseInt(o.invoice_no.split('-').pop())).filter(n=>!isNaN(n))
      const next = nums.length>0 ? Math.max(...nums)+1 : 1
      const month = new Date().toLocaleString('en',{month:'short'}).toUpperCase()
      return `B2C-${month}-${String(next).padStart(3,'0')}`
    } else {
      const b2bOrders = orders.filter(o=>o.invoice_no&&o.invoice_no.startsWith('POP'))
      const nums = b2bOrders.map(o=>parseInt(o.invoice_no.replace('POP-',''))).filter(n=>!isNaN(n))
      const next = nums.length>0 ? Math.max(...nums)+1 : 1
      return `POP-${String(next).padStart(3,'0')}`
    }
  }

  const openModal = (type, data={}) => {
    const now = new Date().toISOString().split('T')[0]
    const curMonth = getCurrentMonth()
    const defaults = {
      order:{ invoice_no:getNextInvoiceNo('B2B'), date:now, client:'Townhouse Cafe', client_type:'B2B', items:'', qty:'', amount:'', status:'Paid', month:curMonth, notes:'' },
      expense:{ date:now, description:'', category:'Ingredients', vendor:'', amount:'', month:curMonth },
      product:{ name:'', b2b_rate:'', b2c_rate:'', ingredient_cost:0, packaging_cost:0, labour_cost:0, overhead_cost:0 },
      client:{ name:'', client_type:'B2C', phone:'', email:'', notes:'' },
      inventory:{ name:'', unit:'', current_stock:0, min_stock:0, notes:'' },
    }
    setForm({...defaults[type],...data})
    if(type==='order') setOrderItems([{ product:'', qty:1, rate:0, amount:0, custom:false, description:'' }])
    setModal(type)
  }
  const closeModal = () => { setModal(null); setForm({}) }

  const updateOrderItem = (idx, field, value) => {
    setOrderItems(prev => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      if(field==='product' && !updated[idx].custom) {
        const rate = getRateForItem(value, form.client_type, products) || 0
        updated[idx].rate = rate
        updated[idx].amount = rate * (updated[idx].qty||1)
      }
      if(field==='qty') updated[idx].amount = updated[idx].rate * (parseInt(value)||0)
      if(field==='rate') updated[idx].amount = (parseInt(value)||0) * (parseInt(updated[idx].qty)||0)
      return updated
    })
  }
  const addOrderItem = () => setOrderItems(prev=>[...prev,{ product:'', qty:1, rate:0, amount:0, custom:false, description:'' }])
  const addCustomItem = () => setOrderItems(prev=>[...prev,{ product:'Custom', qty:1, rate:0, amount:0, custom:true, description:'' }])
  const removeOrderItem = (idx) => setOrderItems(prev=>prev.filter((_,i)=>i!==idx))

  const saveOrder = async () => {
    if (!form.client) return showToast('Fill in client name')
    const validItems = orderItems.filter(i=>(i.product||i.description)&&i.qty)
    const itemsText = validItems.map(i=>i.custom?`${i.description} x${i.qty}`:`${i.product} x${i.qty}`).join('\n')
    const totalQty = validItems.reduce((s,i)=>s+(parseInt(i.qty)||0),0)
    const totalAmt = validItems.reduce((s,i)=>s+(i.amount||0),0)
    const finalData = { ...form, items:itemsText, qty:totalQty, amount:totalAmt }
    const {error} = form.id ? await supabase.from('orders').update(finalData).eq('id',form.id) : await supabase.from('orders').insert([finalData])
    if (error) return showToast('Error: '+error.message)
    showToast('Order saved!'); closeModal(); load()
  }

  const saveExpense = async () => {
    if (!form.description||!form.amount) return showToast('Fill description and amount')
    const {error} = form.id ? await supabase.from('expenses').update(form).eq('id',form.id) : await supabase.from('expenses').insert([form])
    if (error) return showToast('Error: '+error.message)
    showToast('Expense saved!'); closeModal(); load()
  }

  const saveProduct = async () => {
    if (!form.name) return showToast('Enter product name')
    const {error} = form.id ? await supabase.from('products').update(form).eq('id',form.id) : await supabase.from('products').insert([form])
    if (error) return showToast('Error: '+error.message)
    showToast('Product saved!'); closeModal(); load()
  }

  const saveClient = async () => {
    if (!form.name) return showToast('Enter client name')
    const {error} = form.id ? await supabase.from('clients').update(form).eq('id',form.id) : await supabase.from('clients').insert([form])
    if (error) return showToast('Error: '+error.message)
    showToast('Client saved!'); closeModal(); load()
  }

  const saveInventory = async () => {
    if (!form.name) return showToast('Enter ingredient name')
    const {error} = form.id ? await supabase.from('inventory').update(form).eq('id',form.id) : await supabase.from('inventory').insert([form])
    if (error) return showToast('Error: '+error.message)
    showToast('Inventory saved!'); closeModal(); load()
  }

  const deleteRecord = async (table, id) => {
    if (!window.confirm('Delete this? Cannot be undone.')) return
    const {error} = await supabase.from(table).delete().eq('id',id)
    if (error) return showToast('Error: '+error.message)
    showToast('Deleted!'); load()
  }

  const now = new Date()
  const totalRevenue = orders.reduce((s,o)=>s+(Number(o.amount)||0),0)
  const totalExpenses = expenses.reduce((s,e)=>s+(Number(e.amount)||0),0)
  const netPL = totalRevenue-totalExpenses
  const pendingOrders = orders.filter(o=>o.status==='Pending')
  const pendingAmt = pendingOrders.reduce((s,o)=>s+(Number(o.amount)||0),0)
  const thisMonth = getCurrentMonth()
  const thisMonthRev = orders.filter(o=>o.month===thisMonth).reduce((s,o)=>s+Number(o.amount),0)
  const thisMonthExp = expenses.filter(e=>e.month===thisMonth).reduce((s,e)=>s+Number(e.amount),0)
  const expByCat = {}
  expenses.forEach(e=>{ expByCat[e.category]=(expByCat[e.category]||0)+Number(e.amount) })
  const allMonths = [...new Set([...orders.map(o=>o.month),...expenses.map(e=>e.month)])].filter(Boolean).sort().reverse()
  const allVendors = [...new Set(expenses.map(e=>e.vendor).filter(Boolean))].sort()

  const filteredOrders = orders.filter(o=>{
    if(orderFilterType!=='all' && o.client_type!==orderFilterType) return false
    if(orderFilterStatus!=='all' && o.status!==orderFilterStatus) return false
    if(orderFilterMonth!=='all' && o.month!==orderFilterMonth) return false
    return true
  })
  const filteredExp = expenses.filter(e=>{
    if(expFilterCat!=='all' && e.category!==expFilterCat) return false
    if(expFilterVendor!=='all' && e.vendor!==expFilterVendor) return false
    if(expFilterMonth!=='all' && e.month!==expFilterMonth) return false
    return true
  })

  // Analytics calculations
  const analyticsOrders = analyticsMonth==='all' ? orders : orders.filter(o=>o.month===analyticsMonth)
  const productDemand = {}
  analyticsOrders.forEach(o=>{
    if(!o.items) return
    o.items.split('\n').forEach(line=>{
      const match = line.match(/^(.+?)\s*x(\d+)/i)
      if(match) {
        const name = match[1].trim()
        const qty = parseInt(match[2])||0
        productDemand[name] = (productDemand[name]||0) + qty
      }
    })
  })
  const topProducts = Object.entries(productDemand).sort((a,b)=>b[1]-a[1]).slice(0,10)

  // Best day analysis
  const dayRevenue = { 0:0,1:0,2:0,3:0,4:0,5:0,6:0 }
  const dayCount = { 0:0,1:0,2:0,3:0,4:0,5:0,6:0 }
  analyticsOrders.forEach(o=>{
    if(!o.date) return
    const d = new Date(o.date).getDay()
    dayRevenue[d] = (dayRevenue[d]||0) + Number(o.amount)
    dayCount[d] = (dayCount[d]||0) + 1
  })
  const maxDayRev = Math.max(...Object.values(dayRevenue),1)
  const bestDay = Object.entries(dayRevenue).sort((a,b)=>b[1]-a[1])[0]

  // Week comparison (last 7 days vs previous 7 days)
  const today = new Date()
  const last7 = orders.filter(o=>{ const d=new Date(o.date); return d>= new Date(today-7*86400000) }).reduce((s,o)=>s+Number(o.amount),0)
  const prev7 = orders.filter(o=>{ const d=new Date(o.date); return d>=new Date(today-14*86400000) && d<new Date(today-7*86400000) }).reduce((s,o)=>s+Number(o.amount),0)
  const weekChange = prev7>0 ? Math.round((last7-prev7)/prev7*100) : 0

  const printBulkInvoices = () => {
    const selectedOrders = orders.filter(o => bulkSelect.includes(o.id))
    if (selectedOrders.length === 0) return
    const win = window.open('', '_blank')
    const invoiceHTML = selectedOrders.map(order => {
      const items = parseOrderItems(order.items, order.client_type, products)
      const total = items.reduce((s,i)=>s+(i.amount||0),0) || Number(order.amount) || 0
      const itemRows = items.length > 0 ? items.map(item =>
        `<tr><td style="padding:8px;border-bottom:1px solid #E8D8B4">${item.name}</td><td style="padding:8px;text-align:center;border-bottom:1px solid #E8D8B4">${item.qty}</td><td style="padding:8px;text-align:right;border-bottom:1px solid #E8D8B4">${item.rate?'₹'+item.rate:'—'}</td><td style="padding:8px;text-align:right;border-bottom:1px solid #E8D8B4">${item.amount?'₹'+item.amount.toLocaleString():'—'}</td></tr>`
      ).join('') : `<tr><td colspan="4" style="padding:10px;color:#8C7A5E">${order.items||''}</td></tr>`
      return `<div style="page-break-after:always;padding:32px;font-family:-apple-system,sans-serif"><div style="text-align:center;margin-bottom:24px;border-bottom:2px solid #C4924A;padding-bottom:16px"><div style="font-size:22px;font-weight:700;color:#6B4C2A;letter-spacing:0.2em">POPPINS</div><div style="font-size:11px;color:#8C7A5E">Fresh baked. Delivered with love.</div></div><div style="display:flex;justify-content:space-between;margin-bottom:20px"><div><div style="font-size:11px;color:#8C7A5E">FROM</div><div style="font-weight:600">Poppins</div><div style="font-size:12px;color:#8C7A5E">PAN: JEZPS2147G</div></div><div style="text-align:right"><div style="font-size:11px;color:#8C7A5E">INVOICE</div><div style="font-weight:600">${order.invoice_no}</div><div style="font-size:12px;color:#8C7A5E">${order.date}</div></div></div><div style="margin-bottom:20px"><div style="font-size:11px;color:#8C7A5E">BILL TO</div><div style="font-weight:600">${order.client}</div></div><table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px"><thead><tr style="background:#F5E6C8"><th style="text-align:left;padding:8px;font-size:11px;color:#8C7A5E">Item</th><th style="text-align:center;padding:8px;font-size:11px;color:#8C7A5E">Qty</th><th style="text-align:right;padding:8px;font-size:11px;color:#8C7A5E">Rate</th><th style="text-align:right;padding:8px;font-size:11px;color:#8C7A5E">Amount</th></tr></thead><tbody>${itemRows}</tbody><tfoot><tr style="border-top:2px solid #C4924A"><td colspan="3" style="padding:10px;font-weight:600;text-align:right">Total</td><td style="padding:10px;font-weight:700;text-align:right;font-size:15px">₹${total.toLocaleString()}</td></tr></tfoot></table><div style="background:#F5E6C8;border-radius:10px;padding:12px;margin-bottom:20px"><div style="font-size:11px;font-weight:600;color:#8C7A5E;margin-bottom:8px">BANK DETAILS</div><div style="font-size:12px;line-height:1.7">Bank: State Bank of India<br>Branch: Nahan<br>A/C: 37258711949<br>IFSC: SBIN0000686</div></div><div style="text-align:center;font-size:12px;color:#8C7A5E">Thank you for your business. Baked with love in Nahan.</div></div>`
    }).join('')
    win.document.write(`<!DOCTYPE html><html><head><title>Poppins Invoices</title><style>@media print{@page{margin:8mm}body{margin:0}}</style></head><body>${invoiceHTML}</body></html>`)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  const productNames = products.map(p=>p.name)
  const navItems = [
    {id:'home',label:'Home',icon:'⌂'},
    {id:'dashboard',label:'Dashboard',icon:'◈'},
    {id:'pnl',label:'P & L',icon:'₹'},
    {id:'orders',label:'Orders',icon:'≡'},
    {id:'expenses',label:'Expenses',icon:'↓'},
    {id:'analytics',label:'Analytics',icon:'↗'},
    {id:'inventory',label:'Inventory',icon:'□'},
    {id:'products',label:'Products',icon:'◇'},
    {id:'clients',label:'Clients',icon:'○'},
  ]

  if (!authed) return <LoginScreen onLogin={()=>setAuthed(true)} />
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:14, background:BRAND.cream, fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <div style={{ fontSize:13, fontWeight:700, letterSpacing:'0.22em', color:BRAND.brown, textTransform:'uppercase' }}>POPPINS</div>
      <div style={{ fontSize:12, color:BRAND.muted }}>Loading your bakery...</div>
    </div>
  )

  return (
    <div style={s.app}>
      <div style={s.sidebar}>
        <div style={s.logo}><div style={s.logoText}>Poppins</div><div style={s.logoSub}>Business CRM</div></div>
        {navItems.map(n=>(
          <div key={n.id} style={s.navItem(page===n.id)} onClick={()=>setPage(n.id)}>
            <span style={{ fontSize:12, width:14, textAlign:'center' }}>{n.icon}</span>{n.label}
          </div>
        ))}
        <div style={{ flex:1 }} />
        <div style={{ padding:'14px 20px', borderTop:`1px solid ${BRAND.border}` }}>
          <div style={{ fontSize:11, color:BRAND.muted, marginBottom:6 }}>Logged in as Alf</div>
          <div onClick={()=>{localStorage.removeItem('poppins_auth');setAuthed(false)}} style={{ fontSize:12, color:BRAND.red, cursor:'pointer' }}>Log out</div>
        </div>
      </div>

      <div style={s.main}>

        {/* HOME */}
        {page==='home' && (
          <div style={{ maxWidth:720 }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, color:BRAND.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{DAYS[now.getDay()]}, {now.getDate()} {MONTHS_LIST[now.getMonth()]} {now.getFullYear()}</div>
              <div style={{ fontSize:26, fontWeight:600 }}>Good morning, Alf</div>
            </div>
            <div style={{ background:BRAND.cream, border:`1px solid ${BRAND.border}`, borderRadius:14, padding:'18px 22px', marginBottom:24, borderLeft:`3px solid ${BRAND.brownLight}` }}>
              <div style={{ fontSize:15, fontWeight:500, lineHeight:1.5, marginBottom:4 }}>"{quote.text}"</div>
              <div style={{ fontSize:12, color:BRAND.muted }}>{quote.sub}</div>
            </div>
            <div style={{ fontSize:10, fontWeight:600, color:BRAND.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Quick actions</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {[
                {title:'New order',sub:'Log a B2B or B2C sale',icon:'+',dark:true,action:()=>openModal('order')},
                {title:'Log expense',sub:'Ingredients, transport, more',icon:'₹',dark:false,action:()=>openModal('expense')},
                {title:'View orders',sub:`All ${orders.length} invoices`,icon:'≡',dark:false,action:()=>setPage('orders')},
                {title:'P & L',sub:'Revenue vs expenses',icon:'◈',dark:false,action:()=>setPage('pnl')},
              ].map((btn,i)=>(
                <div key={i} onClick={btn.action} style={{ background:btn.dark?BRAND.black:'#fff', border:btn.dark?'none':`1px solid ${BRAND.border}`, borderRadius:14, padding:'20px 22px', cursor:'pointer' }}>
                  <div style={{ fontSize:22, marginBottom:8, color:BRAND.brownLight }}>{btn.icon}</div>
                  <div style={{ fontSize:15, fontWeight:600, color:btn.dark?'#fff':BRAND.black, marginBottom:3 }}>{btn.title}</div>
                  <div style={{ fontSize:12, color:btn.dark?'rgba(255,255,255,0.5)':BRAND.muted }}>{btn.sub}</div>
                </div>
              ))}
            </div>
            {pendingOrders.length>0 && (
              <div style={{ ...s.card, borderLeft:`3px solid ${BRAND.brownLight}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div style={s.cardTitle}>Pending payments</div>
                  <div style={{ fontSize:13, fontWeight:600, color:BRAND.amber }}>₹{pendingAmt.toLocaleString()} due</div>
                </div>
                {pendingOrders.slice(0,5).map(o=>(
                  <div key={o.id} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${BRAND.border}`, fontSize:13 }}>
                    <span>{o.invoice_no} — {o.client}</span>
                    <span style={{ fontWeight:600, color:BRAND.amber }}>₹{Number(o.amount).toLocaleString()}</span>
                  </div>
                ))}
                {pendingOrders.length>5 && <div style={{ fontSize:12, color:BRAND.muted, marginTop:8 }}>+{pendingOrders.length-5} more</div>}
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              <div style={s.metricCard}><div style={s.metricLabel}>{thisMonth} revenue</div><div style={{ ...s.metricValue, color:BRAND.green }}>₹{thisMonthRev.toLocaleString()}</div></div>
              <div style={s.metricCard}><div style={s.metricLabel}>{thisMonth} expenses</div><div style={{ ...s.metricValue, color:BRAND.red }}>₹{thisMonthExp.toLocaleString()}</div></div>
              <div style={s.metricCard}><div style={s.metricLabel}>{thisMonth} P&L</div><div style={{ ...s.metricValue, color:thisMonthRev-thisMonthExp>=0?BRAND.green:BRAND.red }}>{thisMonthRev-thisMonthExp>=0?'+':''}₹{(thisMonthRev-thisMonthExp).toLocaleString()}</div></div>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {page==='dashboard' && (
          <div>
            <div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>Dashboard</div>
            <div style={{ fontSize:13, color:BRAND.muted, marginBottom:22 }}>Overall business health</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
              <div style={s.metricCard}><div style={s.metricLabel}>Total revenue</div><div style={{ ...s.metricValue, color:BRAND.green }}>₹{totalRevenue.toLocaleString()}</div><div style={s.metricSub}>{orders.length} orders</div></div>
              <div style={s.metricCard}><div style={s.metricLabel}>Total expenses</div><div style={{ ...s.metricValue, color:BRAND.red }}>₹{totalExpenses.toLocaleString()}</div></div>
              <div style={s.metricCard}><div style={s.metricLabel}>Net P&L</div><div style={{ ...s.metricValue, color:netPL>=0?BRAND.green:BRAND.red }}>{netPL>=0?'+':''}₹{netPL.toLocaleString()}</div></div>
              <div style={s.metricCard}><div style={s.metricLabel}>Pending</div><div style={{ ...s.metricValue, color:BRAND.amber }}>₹{pendingAmt.toLocaleString()}</div><div style={s.metricSub}>{pendingOrders.length} invoices</div></div>
            </div>
            <div style={s.twoCol}>
              <div style={s.card}>
                <div style={s.cardTitle}>Expenses by category</div>
                <BarChart data={Object.entries(expByCat).sort((a,b)=>b[1]-a[1]).map(([label,value])=>({label,value,display:'₹'+Math.round(value/1000)+'k'}))} color={BRAND.brownLight} />
              </div>
              <div style={s.card}>
                <div style={s.cardTitle}>Recent orders</div>
                <table style={s.table}>
                  <thead><tr><th style={s.th}>Invoice</th><th style={s.th}>Client</th><th style={s.th}>Amount</th><th style={s.th}>Status</th></tr></thead>
                  <tbody>{orders.slice(0,7).map(o=>(
                    <tr key={o.id}>
                      <td style={{ ...s.td, fontWeight:500, cursor:'pointer', color:BRAND.brownLight }} onClick={()=>setInvoiceOrder(o)}>{o.invoice_no}</td>
                      <td style={s.td}>{o.client}</td>
                      <td style={{ ...s.td, fontWeight:500 }}>₹{Number(o.amount).toLocaleString()}</td>
                      <td style={s.td}><Badge type={o.status} /></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* P&L */}
        {page==='pnl' && (
          <div>
            <div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>Profit & Loss</div>
            <div style={{ fontSize:13, color:BRAND.muted, marginBottom:16 }}>Full financial picture</div>
            <div style={s.filterBar}>
              <span style={{ fontSize:12, color:BRAND.muted }}>Filter by month:</span>
              <select style={s.select} value={orderFilterMonth} onChange={e=>{setOrderFilterMonth(e.target.value);setExpFilterMonth(e.target.value)}}>
                <option value="all">All time</option>
                {allMonths.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
              {(()=>{
                const r = orderFilterMonth==='all'?totalRevenue:orders.filter(o=>o.month===orderFilterMonth).reduce((s,o)=>s+Number(o.amount),0)
                const e = expFilterMonth==='all'?totalExpenses:expenses.filter(e=>e.month===expFilterMonth).reduce((s,e)=>s+Number(e.amount),0)
                const pl = r-e
                return <>
                  <div style={s.metricCard}><div style={s.metricLabel}>Revenue</div><div style={{ ...s.metricValue, color:BRAND.green }}>₹{r.toLocaleString()}</div></div>
                  <div style={s.metricCard}><div style={s.metricLabel}>Expenses</div><div style={{ ...s.metricValue, color:BRAND.red }}>₹{e.toLocaleString()}</div></div>
                  <div style={s.metricCard}><div style={s.metricLabel}>Net P&L</div><div style={{ ...s.metricValue, color:pl>=0?BRAND.green:BRAND.red }}>{pl>=0?'+':''}₹{pl.toLocaleString()}</div></div>
                </>
              })()}
            </div>
            <div style={s.twoCol}>
              <div style={s.card}>
                <div style={s.cardTitle}>Revenue by type</div>
                {['B2B','B2C'].map(type=>{
                  const src = orderFilterMonth==='all'?orders:orders.filter(o=>o.month===orderFilterMonth)
                  const amt = src.filter(o=>o.client_type===type).reduce((s,o)=>s+Number(o.amount),0)
                  return <div key={type} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:`1px solid ${BRAND.border}`, fontSize:13 }}>
                    <span style={{ color:BRAND.muted }}>{type}</span><span style={{ fontWeight:600 }}>₹{amt.toLocaleString()}</span>
                  </div>
                })}
              </div>
              <div style={s.card}>
                <div style={s.cardTitle}>Expenses by category</div>
                {Object.entries(expByCat).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>{
                  const filtAmt = expFilterMonth==='all'?amt:expenses.filter(e=>e.category===cat&&e.month===expFilterMonth).reduce((s,e)=>s+Number(e.amount),0)
                  if(!filtAmt) return null
                  return <div key={cat} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:`1px solid ${BRAND.border}`, fontSize:13 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:7, height:7, borderRadius:'50%', background:CAT_COLORS[cat]||BRAND.muted, display:'inline-block' }} />{cat}</span>
                    <span style={{ fontWeight:500 }}>₹{filtAmt.toLocaleString()}</span>
                  </div>
                })}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {page==='orders' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div><div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>Orders</div><div style={{ fontSize:13, color:BRAND.muted }}>B2B invoices & B2C sales</div></div>
              <div style={{ display:'flex', gap:8 }}>
                {bulkMode && bulkSelect.length>0 && <button style={{ ...s.btn(false), borderColor:BRAND.brownLight, color:BRAND.brown }} onClick={printBulkInvoices}>🖨 Print {bulkSelect.length} invoice{bulkSelect.length>1?'s':''}</button>}
                <button style={{ ...s.btn(false) }} onClick={()=>{ setBulkMode(!bulkMode); setBulkSelect([]) }}>{bulkMode?'Cancel select':'Select invoices'}</button>
                <button style={s.btn(true)} onClick={()=>openModal('order')}>+ New order</button>
              </div>
            </div>
            <div style={s.filterBar}>
              <select style={s.select} value={orderFilterType} onChange={e=>setOrderFilterType(e.target.value)}>
                <option value="all">All types</option><option value="B2B">B2B</option><option value="B2C">B2C</option>
              </select>
              <select style={s.select} value={orderFilterStatus} onChange={e=>setOrderFilterStatus(e.target.value)}>
                <option value="all">All status</option><option value="Paid">Paid</option><option value="Pending">Pending</option>
              </select>
              <select style={s.select} value={orderFilterMonth} onChange={e=>setOrderFilterMonth(e.target.value)}>
                <option value="all">All months</option>
                {allMonths.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
              <span style={{ fontSize:12, color:BRAND.muted, marginLeft:'auto' }}>{filteredOrders.length} orders · ₹{filteredOrders.reduce((s,o)=>s+Number(o.amount),0).toLocaleString()}</span>
            </div>
            <div style={s.card}>
              <table style={s.table}>
                <thead><tr>{bulkMode&&<th style={s.th}></th>}<th style={s.th}>Invoice</th><th style={s.th}>Date</th><th style={s.th}>Client</th><th style={s.th}>Items</th><th style={s.th}>Amount</th><th style={s.th}>Type</th><th style={s.th}>Status</th><th style={s.th}></th></tr></thead>
                <tbody>
                  {filteredOrders.map(o=>(
                    <tr key={o.id}>
                      {bulkMode&&<td style={s.td}><input type="checkbox" checked={bulkSelect.includes(o.id)} onChange={e=>setBulkSelect(prev=>e.target.checked?[...prev,o.id]:prev.filter(id=>id!==o.id))} style={{cursor:'pointer'}}/></td>}
                      <td style={{ ...s.td, fontWeight:600, cursor:'pointer', color:BRAND.brownLight }} onClick={()=>setInvoiceOrder(o)}>{o.invoice_no}</td>
                      <td style={s.td}>{o.date}</td>
                      <td style={s.td}>{o.client}</td>
                      <td style={{ ...s.td, color:BRAND.muted, fontSize:11, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.items}</td>
                      <td style={{ ...s.td, fontWeight:600 }}>₹{Number(o.amount).toLocaleString()}</td>
                      <td style={s.td}><Badge type={o.client_type} /></td>
                      <td style={s.td}><Badge type={o.status} /></td>
                      <td style={s.td}>
                        <div style={{ display:'flex', gap:4 }}>
                          <button style={{ ...s.btn(false), fontSize:11, padding:'3px 8px' }} onClick={()=>{openModal('order',o);setOrderItems(parseOrderItems(o.items,o.client_type,products).map(i=>({product:i.name,qty:i.qty,rate:i.rate||0,amount:i.amount||0,custom:false,description:''})))}}>Edit</button>
                          <button style={s.btnDanger} onClick={()=>deleteRecord('orders',o.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length===0 && <tr><td colSpan={8} style={{ ...s.td, textAlign:'center', color:BRAND.muted, padding:28 }}>No orders found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EXPENSES */}
        {page==='expenses' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div><div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>Expenses</div><div style={{ fontSize:13, color:BRAND.muted }}>Every rupee out</div></div>
              <button style={s.btn(true)} onClick={()=>openModal('expense')}>+ Log expense</button>
            </div>
            <div style={s.filterBar}>
              <select style={s.select} value={expFilterCat} onChange={e=>setExpFilterCat(e.target.value)}>
                <option value="all">All categories</option>
                {['Ingredients','Transport','Packaging','Overhead','Equipment','Labour','Other'].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <select style={s.select} value={expFilterVendor} onChange={e=>setExpFilterVendor(e.target.value)}>
                <option value="all">All vendors</option>
                {allVendors.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
              <select style={s.select} value={expFilterMonth} onChange={e=>setExpFilterMonth(e.target.value)}>
                <option value="all">All months</option>
                {allMonths.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
              <span style={{ fontSize:12, color:BRAND.muted, marginLeft:'auto' }}>{filteredExp.length} entries · ₹{filteredExp.reduce((s,e)=>s+Number(e.amount),0).toLocaleString()}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:14 }}>
              {['Ingredients','Transport','Packaging','Overhead','Equipment'].map(cat=>{
                const amt = filteredExp.filter(e=>e.category===cat).reduce((s,e)=>s+Number(e.amount),0)
                return <div key={cat} style={s.metricCard}><div style={{ ...s.metricLabel, color:CAT_COLORS[cat] }}>{cat}</div><div style={{ ...s.metricValue, fontSize:17 }}>₹{amt.toLocaleString()}</div></div>
              })}
            </div>
            <div style={s.card}>
              <table style={s.table}>
                <thead><tr><th style={s.th}>Date</th><th style={s.th}>Description</th><th style={s.th}>Category</th><th style={s.th}>Vendor</th><th style={s.th}>Amount</th><th style={s.th}>Month</th><th style={s.th}></th></tr></thead>
                <tbody>
                  {filteredExp.map(e=>(
                    <tr key={e.id}>
                      <td style={s.td}>{e.date}</td>
                      <td style={s.td}>{e.description}</td>
                      <td style={s.td}><span style={{ display:'inline-flex', alignItems:'center', gap:5 }}><span style={{ width:7, height:7, borderRadius:'50%', background:CAT_COLORS[e.category]||BRAND.muted }} />{e.category}</span></td>
                      <td style={{ ...s.td, color:BRAND.muted }}>{e.vendor}</td>
                      <td style={{ ...s.td, fontWeight:600 }}>₹{Number(e.amount).toLocaleString()}</td>
                      <td style={s.td}>{e.month}</td>
                      <td style={s.td}><div style={{ display:'flex', gap:4 }}>
                        <button style={{ ...s.btn(false), fontSize:11, padding:'3px 8px' }} onClick={()=>openModal('expense',e)}>Edit</button>
                        <button style={s.btnDanger} onClick={()=>deleteRecord('expenses',e.id)}>Del</button>
                      </div></td>
                    </tr>
                  ))}
                  {filteredExp.length===0 && <tr><td colSpan={7} style={{ ...s.td, textAlign:'center', color:BRAND.muted, padding:28 }}>No expenses found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {page==='analytics' && (
          <div>
            <div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>Analytics</div>
            <div style={{ fontSize:13, color:BRAND.muted, marginBottom:16 }}>Product demand & best days</div>
            <div style={s.filterBar}>
              <span style={{ fontSize:12, color:BRAND.muted }}>Period:</span>
              <select style={s.select} value={analyticsMonth} onChange={e=>setAnalyticsMonth(e.target.value)}>
                <option value="all">All time</option>
                {allMonths.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
              <div style={s.metricCard}>
                <div style={s.metricLabel}>Best day overall</div>
                <div style={{ ...s.metricValue, fontSize:16 }}>{bestDay ? DAYS[bestDay[0]] : '—'}</div>
                <div style={s.metricSub}>{bestDay ? '₹'+Number(bestDay[1]).toLocaleString() : ''}</div>
              </div>
              <div style={s.metricCard}>
                <div style={s.metricLabel}>Last 7 days</div>
                <div style={{ ...s.metricValue, color:BRAND.green }}>₹{last7.toLocaleString()}</div>
                <div style={s.metricSub}>{weekChange>=0?'+':''}{weekChange}% vs prev week</div>
              </div>
              <div style={s.metricCard}>
                <div style={s.metricLabel}>Top product</div>
                <div style={{ ...s.metricValue, fontSize:14 }}>{topProducts[0]?.[0]||'—'}</div>
                <div style={s.metricSub}>{topProducts[0]?.[1]||0} units</div>
              </div>
            </div>

            <div style={s.twoCol}>
              <div style={s.card}>
                <div style={s.cardTitle}>Product demand — units sold</div>
                {topProducts.length===0 && <div style={{ color:BRAND.muted, fontSize:13 }}>No data yet</div>}
                <BarChart data={topProducts.map(([label,value])=>({label,value,display:String(value)+' units'}))} color={BRAND.brown} />
              </div>
              <div style={s.card}>
                <div style={s.cardTitle}>Revenue by day of week</div>
                {DAYS.map((day,i)=>{
                  const rev = dayRevenue[i]||0
                  const isBest = bestDay && parseInt(bestDay[0])===i
                  return <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <div style={{ fontSize:12, width:90, flexShrink:0, fontWeight:isBest?600:400, color:isBest?BRAND.brown:BRAND.black }}>{day.slice(0,3)}{isBest?' ⭐':''}</div>
                    <div style={{ flex:1, height:6, background:BRAND.cream, borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.round(rev/maxDayRev*100)}%`, background:isBest?BRAND.brownLight:BRAND.border, borderRadius:3 }} />
                    </div>
                    <div style={{ fontSize:11, color:BRAND.muted, minWidth:70, textAlign:'right' }}>₹{rev.toLocaleString()}</div>
                    <div style={{ fontSize:10, color:BRAND.muted, minWidth:40 }}>{dayCount[i]} orders</div>
                  </div>
                })}
              </div>
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Week comparison — last 7 vs previous 7 days</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                <div>
                  <div style={{ fontSize:11, color:BRAND.muted, marginBottom:4 }}>Last 7 days</div>
                  <div style={{ fontSize:22, fontWeight:600, color:BRAND.green }}>₹{last7.toLocaleString()}</div>
                  <div style={{ height:6, background:BRAND.greenBg, borderRadius:3, marginTop:8, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${last7>prev7?100:Math.round(last7/Math.max(prev7,1)*100)}%`, background:BRAND.green, borderRadius:3 }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:11, color:BRAND.muted, marginBottom:4 }}>Previous 7 days</div>
                  <div style={{ fontSize:22, fontWeight:600, color:BRAND.muted }}>₹{prev7.toLocaleString()}</div>
                  <div style={{ height:6, background:BRAND.cream, borderRadius:3, marginTop:8, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${prev7>last7?100:Math.round(prev7/Math.max(last7,1)*100)}%`, background:BRAND.muted, borderRadius:3 }} />
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                  <div style={{ fontSize:28, fontWeight:700, color:weekChange>=0?BRAND.green:BRAND.red }}>{weekChange>=0?'+':''}{weekChange}%</div>
                  <div style={{ fontSize:12, color:BRAND.muted }}>week on week</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY */}
        {page==='inventory' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
              <div><div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>Inventory</div><div style={{ fontSize:13, color:BRAND.muted }}>Raw ingredient stock levels</div></div>
              <button style={s.btn(true)} onClick={()=>openModal('inventory')}>+ Add ingredient</button>
            </div>
            {inventory.length===0 && (
              <div style={{ ...s.card, textAlign:'center', padding:40 }}>
                <div style={{ fontSize:32, marginBottom:12 }}>□</div>
                <div style={{ fontSize:15, fontWeight:500, marginBottom:8 }}>No ingredients tracked yet</div>
                <div style={{ fontSize:13, color:BRAND.muted, marginBottom:16 }}>Add your raw ingredients — flour, butter, cream cheese, eggs etc. — and track when to reorder.</div>
                <button style={s.btn(true)} onClick={()=>openModal('inventory')}>+ Add first ingredient</button>
              </div>
            )}
            {inventory.length>0 && (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
                  <div style={s.metricCard}><div style={s.metricLabel}>Total ingredients</div><div style={s.metricValue}>{inventory.length}</div></div>
                  <div style={{ ...s.metricCard, borderColor:inventory.filter(i=>Number(i.current_stock)<=Number(i.min_stock)).length>0?BRAND.red:BRAND.border }}>
                    <div style={{ ...s.metricLabel, color:BRAND.red }}>Low stock alerts</div>
                    <div style={{ ...s.metricValue, color:BRAND.red }}>{inventory.filter(i=>Number(i.current_stock)<=Number(i.min_stock)).length}</div>
                  </div>
                  <div style={s.metricCard}><div style={s.metricLabel}>Stocked ok</div><div style={{ ...s.metricValue, color:BRAND.green }}>{inventory.filter(i=>Number(i.current_stock)>Number(i.min_stock)).length}</div></div>
                </div>
                <div style={s.card}>
                  <table style={s.table}>
                    <thead><tr><th style={s.th}>Ingredient</th><th style={s.th}>Current stock</th><th style={s.th}>Min level</th><th style={s.th}>Unit</th><th style={s.th}>Status</th><th style={s.th}>Notes</th><th style={s.th}></th></tr></thead>
                    <tbody>
                      {inventory.map(item=>{
                        const low = Number(item.current_stock)<=Number(item.min_stock)
                        return <tr key={item.id} style={{ background:low?'#fff8f6':'transparent' }}>
                          <td style={{ ...s.td, fontWeight:500 }}>{item.name}</td>
                          <td style={{ ...s.td, fontWeight:600, color:low?BRAND.red:BRAND.green }}>{item.current_stock}</td>
                          <td style={{ ...s.td, color:BRAND.muted }}>{item.min_stock}</td>
                          <td style={s.td}>{item.unit||'—'}</td>
                          <td style={s.td}>{low ? <span style={s.badge(BRAND.red,BRAND.redBg)}>Low stock</span> : <span style={s.badge(BRAND.green,BRAND.greenBg)}>OK</span>}</td>
                          <td style={{ ...s.td, color:BRAND.muted, fontSize:11 }}>{item.notes||'—'}</td>
                          <td style={s.td}><div style={{ display:'flex', gap:4 }}>
                            <button style={{ ...s.btn(false), fontSize:11, padding:'3px 8px' }} onClick={()=>openModal('inventory',item)}>Edit</button>
                            <button style={s.btnDanger} onClick={()=>deleteRecord('inventory',item.id)}>Del</button>
                          </div></td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {page==='analytics' && (
          <div>
            <div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>Analytics</div>
            <div style={{ fontSize:13, color:BRAND.muted, marginBottom:16 }}>Product demand & best days</div>
            <div style={s.filterBar}>
              <span style={{ fontSize:12, color:BRAND.muted }}>Period:</span>
              <select style={s.select} value={analyticsMonth} onChange={e=>setAnalyticsMonth(e.target.value)}>
                <option value="all">All time</option>
                {allMonths.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
              <div style={s.metricCard}><div style={s.metricLabel}>Best day overall</div><div style={{ ...s.metricValue, fontSize:16 }}>{bestDay?DAYS[bestDay[0]]:'—'}</div><div style={s.metricSub}>{bestDay?'₹'+Number(bestDay[1]).toLocaleString():''}</div></div>
              <div style={s.metricCard}><div style={s.metricLabel}>Last 7 days</div><div style={{ ...s.metricValue, color:BRAND.green }}>₹{last7.toLocaleString()}</div><div style={s.metricSub}>{weekChange>=0?'+':''}{weekChange}% vs prev week</div></div>
              <div style={s.metricCard}><div style={s.metricLabel}>Top product</div><div style={{ ...s.metricValue, fontSize:14 }}>{topProducts[0]?.[0]||'—'}</div><div style={s.metricSub}>{topProducts[0]?.[1]||0} units</div></div>
            </div>
            <div style={s.twoCol}>
              <div style={s.card}>
                <div style={s.cardTitle}>Product demand — units sold</div>
                {topProducts.length===0 && <div style={{ color:BRAND.muted, fontSize:13 }}>No data yet — add orders with product line items</div>}
                <BarChart data={topProducts.map(([label,value])=>({label,value,display:value+' units'}))} color={BRAND.brown} />
              </div>
              <div style={s.card}>
                <div style={s.cardTitle}>Revenue by day of week</div>
                {DAYS.map((day,i)=>{
                  const rev=dayRevenue[i]||0
                  const isBest=bestDay&&parseInt(bestDay[0])===i
                  return <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <div style={{ fontSize:12, width:90, flexShrink:0, fontWeight:isBest?600:400, color:isBest?BRAND.brown:BRAND.black }}>{day.slice(0,3)}{isBest?' ⭐':''}</div>
                    <div style={{ flex:1, height:6, background:BRAND.cream, borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.round(rev/maxDayRev*100)}%`, background:isBest?BRAND.brownLight:BRAND.border, borderRadius:3 }} />
                    </div>
                    <div style={{ fontSize:11, color:BRAND.muted, minWidth:70, textAlign:'right' }}>₹{rev.toLocaleString()}</div>
                    <div style={{ fontSize:10, color:BRAND.muted, minWidth:40 }}>{dayCount[i]} orders</div>
                  </div>
                })}
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Week comparison — last 7 vs previous 7 days</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                <div>
                  <div style={{ fontSize:11, color:BRAND.muted, marginBottom:4 }}>Last 7 days</div>
                  <div style={{ fontSize:22, fontWeight:600, color:BRAND.green }}>₹{last7.toLocaleString()}</div>
                  <div style={{ height:6, background:BRAND.greenBg, borderRadius:3, marginTop:8, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${last7>prev7?100:Math.round(last7/Math.max(prev7,1)*100)}%`, background:BRAND.green, borderRadius:3 }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:11, color:BRAND.muted, marginBottom:4 }}>Previous 7 days</div>
                  <div style={{ fontSize:22, fontWeight:600, color:BRAND.muted }}>₹{prev7.toLocaleString()}</div>
                  <div style={{ height:6, background:BRAND.cream, borderRadius:3, marginTop:8, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${prev7>last7?100:Math.round(prev7/Math.max(last7,1)*100)}%`, background:BRAND.muted, borderRadius:3 }} />
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                  <div style={{ fontSize:28, fontWeight:700, color:weekChange>=0?BRAND.green:BRAND.red }}>{weekChange>=0?'+':''}{weekChange}%</div>
                  <div style={{ fontSize:12, color:BRAND.muted }}>week on week</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY */}
        {page==='inventory' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
              <div><div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>Inventory</div><div style={{ fontSize:13, color:BRAND.muted }}>Raw ingredient stock levels</div></div>
              <button style={s.btn(true)} onClick={()=>setModal('inventory')}>+ Add ingredient</button>
            </div>
            <div style={{ ...s.card, textAlign:'center', padding:40 }}>
              <div style={{ fontSize:15, fontWeight:500, marginBottom:8 }}>Inventory coming soon</div>
              <div style={{ fontSize:13, color:BRAND.muted, marginBottom:16 }}>Run this SQL in Supabase first to enable inventory tracking, then refresh.</div>
              <div style={{ background:BRAND.cream, borderRadius:8, padding:12, fontSize:12, textAlign:'left', fontFamily:'monospace' }}>
                create table if not exists inventory (id uuid default gen_random_uuid() primary key, name text not null, unit text, current_stock numeric default 0, min_stock numeric default 0, notes text, created_at timestamp default now());<br/>
                alter table inventory enable row level security;<br/>
                create policy "allow all" on inventory for all using (true);
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {page==='products' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
              <div><div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>Products & costing</div><div style={{ fontSize:13, color:BRAND.muted }}>Add cost prices to unlock margin tracking</div></div>
              <button style={s.btn(true)} onClick={()=>openModal('product')}>+ Add product</button>
            </div>
            <div style={s.card}>
              <table style={s.table}>
                <thead><tr><th style={s.th}>Product</th><th style={s.th}>B2B rate</th><th style={s.th}>B2C rate</th><th style={s.th}>Cost price</th><th style={s.th}>Margin</th><th style={s.th}></th></tr></thead>
                <tbody>
                  {products.map(p=>{
                    const cost=(Number(p.ingredient_cost)||0)+(Number(p.packaging_cost)||0)+(Number(p.labour_cost)||0)+(Number(p.overhead_cost)||0)
                    const margin=cost&&p.b2b_rate?Math.round((p.b2b_rate-cost)/p.b2b_rate*100):null
                    return <tr key={p.id}>
                      <td style={{ ...s.td, fontWeight:500 }}>{p.name}</td>
                      <td style={s.td}>₹{p.b2b_rate||'—'}</td>
                      <td style={s.td}>₹{p.b2c_rate||'—'}</td>
                      <td style={s.td}>{cost?'₹'+cost:<span style={{ color:BRAND.muted, fontSize:11 }}>Not set</span>}</td>
                      <td style={s.td}>{margin!==null?<span style={s.badge(margin>40?BRAND.green:margin>20?BRAND.amber:BRAND.red,margin>40?BRAND.greenBg:margin>20?BRAND.amberBg:BRAND.redBg)}>{margin}%</span>:<span style={{ color:BRAND.muted, fontSize:11 }}>Add cost</span>}</td>
                      <td style={s.td}><div style={{ display:'flex', gap:4 }}>
                        <button style={{ ...s.btn(false), fontSize:11, padding:'3px 8px' }} onClick={()=>openModal('product',p)}>Edit</button>
                        <button style={s.btnDanger} onClick={()=>deleteRecord('products',p.id)}>Del</button>
                      </div></td>
                    </tr>
                  })}
                  {products.length===0 && <tr><td colSpan={6} style={{ ...s.td, textAlign:'center', color:BRAND.muted, padding:28 }}>No products yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLIENTS */}
        {page==='clients' && (()=>{
          const b2cOrderMap = {}
          orders.filter(o=>o.client_type==='B2C'&&o.client&&o.client!=='B2C Client').forEach(o=>{
            if(!b2cOrderMap[o.client]) b2cOrderMap[o.client]={ name:o.client, orders:[], total:0, lastDate:'' }
            b2cOrderMap[o.client].orders.push(o)
            b2cOrderMap[o.client].total += Number(o.amount)||0
            if(!b2cOrderMap[o.client].lastDate||o.date>b2cOrderMap[o.client].lastDate) b2cOrderMap[o.client].lastDate=o.date
          })
          const b2cClients = Object.values(b2cOrderMap).sort((a,b)=>b.total-a.total)
          return <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
              <div><div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>Clients</div><div style={{ fontSize:13, color:BRAND.muted }}>B2B accounts & B2C customers</div></div>
              <button style={s.btn(true)} onClick={()=>openModal('client')}>+ Add B2B client</button>
            </div>
            <div style={s.twoCol}>
              <div style={s.card}>
                <div style={s.cardTitle}>B2B clients</div>
                {clients.filter(c=>c.client_type==='B2B').map(c=>{
                  const clientOrders = orders.filter(o=>o.client===c.name)
                  const clientTotal = clientOrders.reduce((s,o)=>s+Number(o.amount),0)
                  return <div key={c.id} onClick={()=>setSelectedClient({...c,orders:clientOrders,total:clientTotal})} style={{ border:`1px solid ${BRAND.border}`, borderRadius:10, padding:12, marginBottom:8, cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.borderColor=BRAND.brownLight} onMouseLeave={e=>e.currentTarget.style.borderColor=BRAND.border}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <div style={{ fontWeight:600 }}>{c.name}</div>
                      <div style={{ display:'flex', gap:6, alignItems:'center' }}><Badge type="B2B" /><button style={s.btnDanger} onClick={e=>{e.stopPropagation();deleteRecord('clients',c.id)}}>Del</button></div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, fontSize:12 }}>
                      <div><div style={{ color:BRAND.muted, fontSize:10 }}>REVENUE</div><div style={{ fontWeight:600, color:BRAND.green }}>₹{clientTotal.toLocaleString()}</div></div>
                      <div><div style={{ color:BRAND.muted, fontSize:10 }}>INVOICES</div><div style={{ fontWeight:600 }}>{clientOrders.length}</div></div>
                      <div><div style={{ color:BRAND.muted, fontSize:10 }}>LAST ORDER</div><div style={{ fontWeight:500 }}>{clientOrders[0]?.date||'—'}</div></div>
                    </div>
                    <div style={{ fontSize:11, color:BRAND.brownLight, marginTop:6 }}>Click to view full history →</div>
                  </div>
                })}
              </div>
              <div style={s.card}>
                <div style={s.cardTitle}>B2C customers — {b2cClients.length} unique</div>
                {b2cClients.length===0 && <div style={{ color:BRAND.muted, fontSize:13, textAlign:'center', padding:20 }}>No B2C orders yet</div>}
                {b2cClients.map((c,i)=>(
                  <div key={i} onClick={()=>setSelectedClient({name:c.name,client_type:'B2C',orders:c.orders,total:c.total})} style={{ border:`1px solid ${c.orders.length>1?BRAND.brownLight:BRAND.border}`, borderRadius:10, padding:10, marginBottom:6, background:c.orders.length>1?BRAND.cream:'#fff', cursor:'pointer' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                      <div style={{ fontWeight:500, fontSize:13 }}>{c.name}</div>
                      {c.orders.length>1 && <span style={{ fontSize:10, fontWeight:600, color:BRAND.brown, background:BRAND.brownPale, padding:'2px 7px', borderRadius:10 }}>⭐ {c.orders.length}x</span>}
                    </div>
                    <div style={{ display:'flex', gap:16, fontSize:11, color:BRAND.muted }}>
                      <span>₹{c.total.toLocaleString()}</span>
                      <span>{c.orders.length} order{c.orders.length>1?'s':''}</span>
                      <span>Last: {c.lastDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        })()}

      </div>

      {/* CLIENT HISTORY MODAL */}
      {selectedClient && (
        <div style={s.modal} onClick={()=>setSelectedClient(null)}>
          <div style={{ ...s.modalBox, width:620 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <div>
                <div style={{ fontSize:18, fontWeight:600 }}>{selectedClient.name}</div>
                <div style={{ fontSize:12, color:BRAND.muted, marginTop:2 }}>{selectedClient.client_type} · {selectedClient.orders?.length||0} orders</div>
              </div>
              <button style={s.btn(false)} onClick={()=>setSelectedClient(null)}>Close</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
              <div style={s.metricCard}><div style={s.metricLabel}>Total spent</div><div style={{ ...s.metricValue, color:BRAND.green, fontSize:18 }}>₹{(selectedClient.total||0).toLocaleString()}</div></div>
              <div style={s.metricCard}><div style={s.metricLabel}>Orders</div><div style={{ ...s.metricValue, fontSize:18 }}>{selectedClient.orders?.length||0}</div></div>
              <div style={s.metricCard}><div style={s.metricLabel}>Last order</div><div style={{ ...s.metricValue, fontSize:14 }}>{selectedClient.orders?.sort((a,b)=>b.date?.localeCompare(a.date))[0]?.date||'—'}</div></div>
            </div>
            <div style={{ maxHeight:340, overflowY:'auto' }}>
              <table style={s.table}>
                <thead><tr><th style={s.th}>Invoice</th><th style={s.th}>Date</th><th style={s.th}>Items</th><th style={s.th}>Amount</th><th style={s.th}>Status</th></tr></thead>
                <tbody>
                  {(selectedClient.orders||[]).sort((a,b)=>b.date?.localeCompare(a.date)).map(o=>(
                    <tr key={o.id}>
                      <td style={{ ...s.td, fontWeight:500 }}>{o.invoice_no}</td>
                      <td style={s.td}>{o.date}</td>
                      <td style={{ ...s.td, color:BRAND.muted, fontSize:11, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.items}</td>
                      <td style={{ ...s.td, fontWeight:600 }}>₹{Number(o.amount).toLocaleString()}</td>
                      <td style={s.td}><Badge type={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={()=>setInvoiceOrder(null)} products={products} />}

      {/* ORDER MODAL */}
      <Modal open={modal==='order'} onClose={closeModal} preventClose title={form.id?'Edit order':'New order'}>
        <div style={s.formRow}>
          <FInput label="Client type" type="select" options={['B2B','B2C']} value={form.client_type||'B2B'} onChange={e=>setForm(f=>({...f,client_type:e.target.value,invoice_no:getNextInvoiceNo(e.target.value)}))} />
          <FInput label="Client name" value={form.client||''} onChange={e=>setForm(f=>({...f,client:e.target.value}))} placeholder="Townhouse Cafe" />
        </div>
        <div style={s.formRow}>
          <FInput label="Invoice no" value={form.invoice_no||''} onChange={e=>setForm(f=>({...f,invoice_no:e.target.value}))} placeholder="POP-044" />
          <FInput label="Date" type="date" value={form.date||''} onChange={e=>setForm(f=>({...f,date:e.target.value}))} />
        </div>
        <div style={s.formRow}>
          <FInput label="Status" type="select" options={['Paid','Pending','Delivered']} value={form.status||'Paid'} onChange={e=>setForm(f=>({...f,status:e.target.value}))} />
          <FInput label="Month" type="select" options={MONTH_OPTIONS} value={form.month||getCurrentMonth()} onChange={e=>setForm(f=>({...f,month:e.target.value}))} />
        </div>
        <div style={{ fontSize:11, fontWeight:600, color:BRAND.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, marginTop:4 }}>Items</div>
        {orderItems.map((item,idx)=>(
          <div key={idx} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr auto', gap:6, marginBottom:6, alignItems:'center' }}>
            {item.custom
              ? <input style={s.input} placeholder="e.g. Vanilla cake 2kg - engagement" value={item.description||''} onChange={e=>updateOrderItem(idx,'description',e.target.value)} />
              : <select style={s.input} value={item.product} onChange={e=>updateOrderItem(idx,'product',e.target.value)}>
                  <option value="">Select product</option>
                  {productNames.map(p=><option key={p} value={p}>{p}</option>)}
                  <option value="Complimentary">Complimentary</option>
                </select>
            }
            <input style={s.input} type="number" placeholder="Qty" value={item.qty} onChange={e=>updateOrderItem(idx,'qty',e.target.value)} min="1" />
            <input style={{ ...s.input, color:item.custom?BRAND.black:BRAND.muted }} type="number" value={item.rate||''} onChange={e=>item.custom&&updateOrderItem(idx,'rate',e.target.value)} readOnly={!item.custom} placeholder="Rate" />
            <input style={{ ...s.input, color:BRAND.muted }} value={item.amount||''} readOnly placeholder="Amount" />
            <button onClick={()=>removeOrderItem(idx)} style={{ background:'none', border:'none', cursor:'pointer', color:BRAND.red, fontSize:18, padding:'0 4px' }}>×</button>
          </div>
        ))}
        <div style={{ display:'flex', gap:6, marginBottom:10 }}>
          <button onClick={addOrderItem} style={{ ...s.btn(false), fontSize:12 }}>+ Add product</button>
          <button onClick={addCustomItem} style={{ ...s.btn(false), fontSize:12, borderColor:BRAND.brownLight, color:BRAND.brown }}>+ Custom item / cake</button>
        </div>
        <div style={{ background:BRAND.cream, padding:'10px 12px', borderRadius:8, fontSize:13, marginBottom:10 }}>
          Total: <strong>₹{orderItems.reduce((s,i)=>s+(i.amount||0),0).toLocaleString()}</strong> · {orderItems.reduce((s,i)=>s+(parseInt(i.qty)||0),0)} units
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:12, paddingTop:12, borderTop:`1px solid ${BRAND.border}` }}>
          <button style={s.btn(false)} onClick={closeModal}>Cancel</button>
          <button style={s.btn(true)} onClick={saveOrder}>Save order</button>
        </div>
      </Modal>

      <Modal open={modal==='expense'} onClose={closeModal} title={form.id?'Edit expense':'Log expense'}>
        <div style={s.formRow}>
          <FInput label="Date" type="date" value={form.date||''} onChange={e=>setForm(f=>({...f,date:e.target.value}))} />
          <FInput label="Category" type="select" options={['Ingredients','Transport','Packaging','Overhead','Equipment','Labour','Other']} value={form.category||'Ingredients'} onChange={e=>setForm(f=>({...f,category:e.target.value}))} />
        </div>
        <div style={s.formRow}>
          <FInput label="Amount (₹)" type="number" value={form.amount||''} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0" />
          <FInput label="Vendor" value={form.vendor||''} onChange={e=>setForm(f=>({...f,vendor:e.target.value}))} placeholder="Jagat Singh..." />
        </div>
        <div style={s.formRow}>
          <FInput label="Description" value={form.description||''} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Butter 2kg" />
          <FInput label="Month" type="select" options={MONTH_OPTIONS} value={form.month||getCurrentMonth()} onChange={e=>setForm(f=>({...f,month:e.target.value}))} />
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16, paddingTop:16, borderTop:`1px solid ${BRAND.border}` }}>
          <button style={s.btn(false)} onClick={closeModal}>Cancel</button>
          <button style={s.btn(true)} onClick={saveExpense}>Save</button>
        </div>
      </Modal>

      <Modal open={modal==='product'} onClose={closeModal} title={form.id?'Edit product':'Add product'}>
        <div style={s.formRow}>
          <FInput label="Product name" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Brownie" />
          <FInput label="B2B rate (₹)" type="number" value={form.b2b_rate||''} onChange={e=>setForm(f=>({...f,b2b_rate:e.target.value}))} />
        </div>
        <div style={{ marginBottom:10 }}><FInput label="B2C rate (₹)" type="number" value={form.b2c_rate||''} onChange={e=>setForm(f=>({...f,b2c_rate:e.target.value}))} /></div>
        <div style={{ fontSize:11, color:BRAND.muted, marginBottom:8 }}>Cost breakdown (optional)</div>
        <div style={s.formRow3}>
          <FInput label="Ingredient cost" type="number" value={form.ingredient_cost||''} onChange={e=>setForm(f=>({...f,ingredient_cost:e.target.value}))} placeholder="0" />
          <FInput label="Packaging" type="number" value={form.packaging_cost||''} onChange={e=>setForm(f=>({...f,packaging_cost:e.target.value}))} placeholder="0" />
          <FInput label="Labour" type="number" value={form.labour_cost||''} onChange={e=>setForm(f=>({...f,labour_cost:e.target.value}))} placeholder="0" />
        </div>
        <div style={{ marginBottom:10 }}><FInput label="Overhead" type="number" value={form.overhead_cost||''} onChange={e=>setForm(f=>({...f,overhead_cost:e.target.value}))} placeholder="0" /></div>
        {(()=>{
          const cost=(Number(form.ingredient_cost)||0)+(Number(form.packaging_cost)||0)+(Number(form.labour_cost)||0)+(Number(form.overhead_cost)||0)
          const rate=Number(form.b2b_rate)||0
          if(cost&&rate){const m=Math.round((rate-cost)/rate*100);return<div style={{ background:BRAND.cream, padding:10, borderRadius:8, fontSize:13, marginBottom:10 }}>Margin: <strong>{m}%</strong> · Cost: ₹{cost} · Profit/unit: ₹{rate-cost}</div>}
          return null
        })()}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16, paddingTop:16, borderTop:`1px solid ${BRAND.border}` }}>
          <button style={s.btn(false)} onClick={closeModal}>Cancel</button>
          <button style={s.btn(true)} onClick={saveProduct}>Save</button>
        </div>
      </Modal>

      <Modal open={modal==='inventory'} onClose={closeModal} title={form.id?'Edit ingredient':'Add ingredient'}>
        <div style={s.formRow}>
          <FInput label="Ingredient name" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Butter, Flour, Cream cheese" />
          <FInput label="Unit" value={form.unit||''} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} placeholder="kg, grams, pcs, litres" />
        </div>
        <div style={s.formRow}>
          <FInput label="Current stock" type="number" value={form.current_stock||''} onChange={e=>setForm(f=>({...f,current_stock:e.target.value}))} placeholder="0" />
          <FInput label="Min stock (reorder level)" type="number" value={form.min_stock||''} onChange={e=>setForm(f=>({...f,min_stock:e.target.value}))} placeholder="0" />
        </div>
        <div style={{ marginBottom:10 }}><FInput label="Notes" value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Supplier, storage notes..." /></div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16, paddingTop:16, borderTop:`1px solid ${BRAND.border}` }}>
          <button style={s.btn(false)} onClick={closeModal}>Cancel</button>
          <button style={s.btn(true)} onClick={saveInventory}>Save</button>
        </div>
      </Modal>

      <Modal open={modal==='client'} onClose={closeModal} title="Add client">
        <div style={s.formRow}>
          <FInput label="Type" type="select" options={['B2C','B2B']} value={form.client_type||'B2C'} onChange={e=>setForm(f=>({...f,client_type:e.target.value}))} />
          <FInput label="Name" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Name or business" />
        </div>
        <div style={s.formRow}>
          <FInput label="Phone" value={form.phone||''} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+91..." />
          <FInput label="Email" value={form.email||''} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="optional" />
        </div>
        <div style={{ marginBottom:10 }}><FInput label="Notes" value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Billing terms, preferences..." /></div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16, paddingTop:16, borderTop:`1px solid ${BRAND.border}` }}>
          <button style={s.btn(false)} onClick={closeModal}>Cancel</button>
          <button style={s.btn(true)} onClick={saveClient}>Save</button>
        </div>
      </Modal>

      <Toast msg={toast} />
    </div>
  )
}
