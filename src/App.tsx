import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Category = { id?: number | string; name: string; description?: string }
type Product = { id?: number | string; name: string; price?: number; categoryId?: number | string; description?: string; stock?: number }
type View = 'overview' | 'categories' | 'products'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) }, ...options })
  if (!response.ok) throw new Error((await response.text()) || `Request failed (${response.status})`)
  if (response.status === 204) return undefined as T
  return response.json()
}

function App() {
  const [view, setView] = useState<View>('overview')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<{ type: 'category' | 'product'; item?: Category | Product } | null>(null)
  const load = async () => {
    setLoading(true); setError('')
    try {
      const [cs, ps] = await Promise.all([request<Category[]>('/categories'), request<Product[]>('/products')])
      setCategories(Array.isArray(cs) ? cs : (cs as { data: Category[] }).data)
      setProducts(Array.isArray(ps) ? ps : (ps as { data: Product[] }).data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const filteredCategories = useMemo(() => categories.filter(x => x.name?.toLowerCase().includes(query.toLowerCase())), [categories, query])
  const filteredProducts = useMemo(() => products.filter(x => x.name?.toLowerCase().includes(query.toLowerCase())), [products, query])
  const remove = async (type: 'category' | 'product', id?: string | number) => {
    if (id == null || !confirm('Bạn có chắc muốn xóa mục này?')) return
    try { await request(`/${type}s/${id}`, { method: 'DELETE' }); await load() } catch (e) { setError(e instanceof Error ? e.message : 'Xóa thất bại') }
  }
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">⌁</span><span>Store<span className="brand-accent">Desk</span></span></div><div className="workspace"><div className="avatar">A</div><div><b>Admin workspace</b><small>Quản trị cửa hàng</small></div><span className="chevron">⌄</span></div><nav><span className="nav-label">MENU</span><Nav icon="⌂" active={view === 'overview'} onClick={() => setView('overview')}>Tổng quan</Nav><Nav icon="▦" active={view === 'categories'} onClick={() => setView('categories')}>Categories <em>{categories.length}</em></Nav><Nav icon="◇" active={view === 'products'} onClick={() => setView('products')}>Products <em>{products.length}</em></Nav></nav><div className="sidebar-bottom"><div className="help"><span>?</span><div><b>Cần trợ giúp?</b><small>Đọc tài liệu API</small></div></div><small className="version">StoreDesk v1.0.0</small></div></aside>
    <main className="main"><header className="topbar"><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{view === 'overview' ? 'Tổng quan' : view === 'categories' ? 'Categories' : 'Products'}</strong></div><div className="top-actions"><button className="icon-button">◔</button><div className="profile"><div className="avatar">AD</div><span>Admin</span><span>⌄</span></div></div></header><div className="content">{error && <div className="error">⚠ {error}<button onClick={() => setError('')}>×</button></div>}{view === 'overview' ? <Overview categories={categories} products={products} go={setView} /> : <ListView type={view} products={products} query={query} setQuery={setQuery} filteredCategories={filteredCategories} filteredProducts={filteredProducts} loading={loading} open={(type: 'category' | 'product', item?: Category | Product) => setEditor({ type, item })} remove={remove} />}</div></main>
    {editor && <Editor type={editor.type} item={editor.item} categories={categories} close={() => setEditor(null)} saved={() => { setEditor(null); load() }} />}
  </div>
}

function Nav({ icon, active, children, onClick }: { icon: string; active: boolean; children: React.ReactNode; onClick: () => void }) { return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}><span>{icon}</span>{children}</button> }
function Overview({ categories, products, go }: { categories: Category[]; products: Product[]; go: (v: View) => void }) { return <><div className="page-heading"><div><p className="eyebrow">THỨ TƯ, 14 THÁNG 10, 2026</p><h1>Chào buổi sáng, Admin <span>✦</span></h1><p className="muted">Đây là những gì đang diễn ra trong cửa hàng của bạn.</p></div><button className="primary" onClick={() => go('products')}>+ Thêm sản phẩm</button></div><div className="stats"><Stat label="Tổng sản phẩm" value={products.length} icon="◇" tone="blue" /><Stat label="Danh mục" value={categories.length} icon="▦" tone="purple" /><Stat label="API status" value="Online" icon="●" tone="green" /></div><section className="panel welcome"><div><span className="eyebrow">QUICK START</span><h2>Quản lý dữ liệu dễ dàng hơn</h2><p className="muted">Bắt đầu bằng cách tạo danh mục và thêm sản phẩm vào cửa hàng của bạn.</p><div className="quick-actions"><button className="primary" onClick={() => go('categories')}>Quản lý danh mục <span>→</span></button><button className="secondary" onClick={() => go('products')}>Xem sản phẩm</button></div></div><div className="abstract"><i></i><i></i><i></i></div></section><div className="section-title"><h2>Truy cập nhanh</h2></div><div className="quick-grid"><button onClick={() => go('categories')}><span className="card-icon purple">▦</span><div><b>Categories</b><small>Thêm hoặc chỉnh sửa danh mục</small></div><span>→</span></button><button onClick={() => go('products')}><span className="card-icon blue">◇</span><div><b>Products</b><small>Quản lý sản phẩm cửa hàng</small></div><span>→</span></button></div></> }
function Stat({ label, value, icon, tone }: { label: string; value: string | number; icon: string; tone: string }) { return <div className="stat"><span className={`stat-icon ${tone}`}>{icon}</span><div><small>{label}</small><strong>{value}</strong></div><span className="trend">↗</span></div> }
function ListView({ type, products, query, setQuery, filteredCategories, filteredProducts, loading, open, remove }: { type: View; products: Product[]; query: string; setQuery: (v: string) => void; filteredCategories: Category[]; filteredProducts: Product[]; loading: boolean; open: (t: 'category' | 'product', item?: Category | Product) => void; remove: (t: 'category' | 'product', id?: string | number) => void }) {
  const isCat = type === 'categories'; const rows: any[] = isCat ? filteredCategories : filteredProducts
  return <><div className="page-heading"><div><p className="eyebrow">QUẢN LÝ DỮ LIỆU</p><h1>{isCat ? 'Categories' : 'Products'}</h1><p className="muted">{isCat ? 'Tổ chức sản phẩm theo các danh mục rõ ràng.' : 'Theo dõi và quản lý toàn bộ sản phẩm của bạn.'}</p></div><button className="primary" onClick={() => open(isCat ? 'category' : 'product')}>+ {isCat ? 'Thêm danh mục' : 'Thêm sản phẩm'}</button></div><div className="toolbar"><div className="search">⌕<input value={query} onChange={e => setQuery(e.target.value)} placeholder={`Tìm ${isCat ? 'danh mục' : 'sản phẩm'}...`} /></div><button className="filter">☷ Bộ lọc</button><button className="refresh" onClick={loadPage}>↻</button></div><section className="panel table-panel"><div className="table-meta"><b>{rows.length} {isCat ? 'danh mục' : 'sản phẩm'}</b><span>{loading ? 'Đang tải...' : 'Cập nhật vừa xong'}</span></div>{rows.length === 0 ? <div className="empty"><div>◌</div><h3>Chưa có dữ liệu</h3><p>Hãy tạo mục đầu tiên để bắt đầu.</p></div> : <div className="table-wrap"><table><thead><tr><th>{isCat ? 'TÊN DANH MỤC' : 'TÊN SẢN PHẨM'}</th><th>{isCat ? 'MÔ TẢ' : 'GIÁ'}</th><th>{isCat ? 'SỐ SẢN PHẨM' : 'TỒN KHO'}</th><th>CẬP NHẬT</th><th></th></tr></thead><tbody>{rows.map((row, i) => <tr key={row.id ?? i}><td><div className="name-cell"><span className={`row-icon ${isCat ? 'purple' : 'blue'}`}>{isCat ? '▦' : '◇'}</span><div><b>{row.name}</b><small>#{row.id ?? `new-${i + 1}`}</small></div></div></td><td>{isCat ? (row.description || '—') : (row.price != null ? `${Number(row.price).toLocaleString('vi-VN')} ₫` : '—')}</td><td>{isCat ? <span className="pill">{products.filter(p => String(p.categoryId) === String(row.id)).length} sản phẩm</span> : <span className={`stock ${Number(row.stock) > 0 ? '' : 'out'}`}>{row.stock ?? '—'}</span>}</td><td className="muted">Vừa cập nhật</td><td><button className="row-action" onClick={e => (e.currentTarget.nextElementSibling as HTMLElement)?.classList.toggle('show')}>•••</button><div className="row-menu"><button onClick={() => open(isCat ? 'category' : 'product', row)}>Sửa</button><button onClick={() => remove(isCat ? 'category' : 'product', row.id)}>Xóa</button></div></td></tr>)}</tbody></table></div>}</section></>
}
let loadPage = () => window.location.reload()
function Editor({ type, item, categories, close, saved }: { type: 'category' | 'product'; item?: Category | Product; categories: Category[]; close: () => void; saved: () => void }) {
  const [form, setForm] = useState<any>(item || {}); const [saving, setSaving] = useState(false); const isCat = type === 'category'
  const submit = async (e: FormEvent) => { e.preventDefault(); setSaving(true); try { await request(`/${isCat ? 'categories' : 'products'}${form.id ? `/${form.id}` : ''}`, { method: form.id ? 'PATCH' : 'POST', body: JSON.stringify({ ...form, price: form.price === '' ? undefined : Number(form.price), stock: form.stock === '' ? undefined : Number(form.stock) }) }); saved() } catch (e) { alert(e instanceof Error ? e.message : 'Lưu thất bại') } finally { setSaving(false) } }
  const update = (key: string, value: any) => setForm({ ...form, [key]: value })
  return <div className="modal-backdrop" onMouseDown={close}><form className="modal" onSubmit={submit} onMouseDown={e => e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">{form.id ? 'CHỈNH SỬA' : 'TẠO MỚI'}</p><h2>{form.id ? 'Cập nhật' : 'Thêm'} {isCat ? 'danh mục' : 'sản phẩm'}</h2></div><button type="button" className="close" onClick={close}>×</button></div><label>Tên {isCat ? 'danh mục' : 'sản phẩm'} *<input required value={form.name || ''} onChange={e => update('name', e.target.value)} placeholder="Nhập tên..." /></label>{isCat ? <label>Mô tả<textarea value={form.description || ''} onChange={e => update('description', e.target.value)} placeholder="Mô tả ngắn..." /></label> : <><div className="form-row"><label>Giá bán<input type="number" min="0" value={form.price ?? ''} onChange={e => update('price', e.target.value)} placeholder="0" /></label><label>Tồn kho<input type="number" min="0" value={form.stock ?? ''} onChange={e => update('stock', e.target.value)} placeholder="0" /></label></div><label>Danh mục<select value={form.categoryId || ''} onChange={e => update('categoryId', e.target.value)}><option value="">Chọn danh mục</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Mô tả<textarea value={form.description || ''} onChange={e => update('description', e.target.value)} placeholder="Mô tả sản phẩm..." /></label></>}<div className="modal-actions"><button type="button" className="secondary" onClick={close}>Hủy</button><button className="primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button></div></form></div>
}
export default App

