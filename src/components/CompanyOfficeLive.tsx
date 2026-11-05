import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type Employee = { id: string; display_name: string; job_title: string; department: string; agent_key: string | null; activation_status: string };
type Task = { id: string; title: string; description: string | null; status: string; priority: string; assigned_employee_id: string | null; created_at: string };
type Run = { id: string; status: string; input: { instruction?: string }; created_at: string; employee_id: string | null };

const names: Record<string,string> = {zein:'زين',hanan:'حنان',loqman:'لقمان',abrar:'أبرار',aseel:'أسيل',abderrahman:'عبدالرحمان'};
const statusLabel: Record<string,string> = {pending:'جديدة',in_progress:'قيد التنفيذ',blocked:'متوقفة',completed:'مكتملة',cancelled:'ملغاة',queued:'في قائمة الانتظار',running:'قيد التشغيل',succeeded:'نجحت',failed:'فشلت',needs_approval:'تحتاج موافقتك'};
export default function CompanyOfficeLive() {
 const [user,setUser] = useState<any>(null);
 const [company,setCompany] = useState<any>(null);
 const [employees,setEmployees] = useState<Employee[]>([]);
 const [tasks,setTasks] = useState<Task[]>([]);
 const [runs,setRuns] = useState<Run[]>([]);
 const [section,setSection] = useState('home');
 const [title,setTitle] = useState('');
 const [assignee,setAssignee] = useState('');
 const [instruction,setInstruction] = useState('');
 const [busy,setBusy] = useState(false);
 const [error,setError] = useState('');
 const [notice,setNotice] = useState('');
 const refresh = useCallback(async () => {
  if (!supabase) return;
  const {data:{user:current},error:userError} = await supabase.auth.getUser();
  if (userError) throw userError;
  setUser(current);
  if (!current) return;
  const {data:members,error:memberError} = await supabase.from('company_members').select('company_id,role').eq('user_id',current.id);
  if (memberError) throw memberError;
  const ownerMembership = members?.find(m => m.role === 'owner');
  if (!ownerMembership) throw new Error('لم نعثر على عضوية المالك لهذا الحساب. تأكد أنك سجلت الدخول بالبريد المعتمد.');
  const {data:co,error:coError} = await supabase.from('companies').select('id,name,owner_display_name').eq('id',ownerMembership.company_id).single();
  if (coError) throw coError;
  setCompany(co);
  const [e,t,r] = await Promise.all([
   supabase.from('company_employees').select('id,display_name,job_title,department,agent_key,activation_status').eq('company_id',co.id).order('created_at'),
   supabase.from('company_tasks').select('id,title,description,status,priority,assigned_employee_id,created_at').eq('company_id',co.id).order('created_at',{ascending:false}),
   supabase.from('company_agent_runs').select('id,status,input,created_at,employee_id').eq('company_id',co.id).order('created_at',{ascending:false}).limit(20)
  ]);
  if(e.error) throw e.error; if(t.error) throw t.error; if(r.error) throw r.error;
  setEmployees(e.data || []); setTasks(t.data || []); setRuns(r.data || []);
 },[]);
 useEffect(()=>{ refresh().catch(e=>setError(e.message || 'تعذر تحميل بيانات الشركة')); },[refresh]);
 const addTask = async () => {
  if(!supabase || !company || !user || !title.trim()) return;
  setBusy(true); setError('');
  const {error:e} = await supabase.from('company_tasks').insert({company_id:company.id,title:title.trim(),assigned_employee_id:assignee || null,created_by:user.id,priority:'normal'});
  if(e) setError(e.message); else {setTitle('');setNotice('تم حفظ المهمة في قاعدة البيانات المشتركة.');await refresh();}
  setBusy(false);
 };
 const updateTask = async (task:Task) => {
  if(!supabase) return;
  const next = task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'pending';
  const {error:e}=await supabase.from('company_tasks').update({status:next,updated_at:new Date().toISOString()}).eq('id',task.id);
  if(e) setError(e.message); else await refresh();
 };
 const queueAgent = async () => {
  if(!supabase || !company || !user || !instruction.trim()) return;
  const target = employees.find(e=>e.agent_key==='zein');
  setBusy(true);setError('');
  const {error:e}=await supabase.from('company_agent_runs').insert({company_id:company.id,employee_id:target?.id || null,requested_by:user.id,input:{instruction:instruction.trim(),requested_agent:'zein'},status:'queued'});
  if(e) setError(e.message); else {setInstruction('');setNotice('تم تسجيل طلبك في قائمة زين. التنفيذ الآلي ينتظر ربط مزود الذكاء الاصطناعي.');await refresh();}
  setBusy(false);
 };
 if(!isSupabaseConfigured) return <Shell><Alert>إعدادات Supabase غير موجودة في نسخة المعاينة.</Alert></Shell>;
 if(error && !company && !user) return <Shell><Alert>{error}</Alert><button className="btn" onClick={()=>location.reload()}>إعادة المحاولة</button></Shell>;
 if(!user) return <Shell><h1>مقر ZaLoVoice</h1><p>سجّل الدخول أولاً إلى ZaLoVoice بنفس حساب المالك.</p><p className="muted">الحساب المعتمد: 2alovoic@gmail.com</p><button className="btn" onClick={()=>location.assign('/')}>العودة لتسجيل الدخول</button></Shell>;
 if(error && !company) return <Shell><Alert>{error}</Alert></Shell>;
 if(!company) return <Shell><p>جارٍ تحميل مقر الشركة…</p></Shell>;
 return <Shell>
  <header className="top"><div><small>ZaLoVoice · مركز القيادة</small><h1>مرحباً عبدالهادي</h1><p className="muted">مالك الشركة وصاحب القرار النهائي</p></div><button className="btn secondary" onClick={()=>supabase?.auth.signOut().then(()=>location.reload())}>تسجيل الخروج</button></header>
  <nav className="nav">{[['home','الرئيسية'],['team','الفريق'],['tasks','المهام'],['agents','زين والوكلاء']].map(([id,label])=><button key={id} className={section===id?'active':''} onClick={()=>setSection(id)}>{label}</button>)}</nav>
  {notice && <p className="notice">{notice}</p>}{error && <Alert>{error}</Alert>}
  {section==='home' && <><div className="stats"><Card label="الفريق" value={employees.length}/><Card label="المهام" value={tasks.length}/><Card label="طلبات الوكلاء" value={runs.length}/><Card label="وكلاء نشطون" value={employees.filter(e=>e.activation_status==='active').length}/></div><h2>قاعة القيادة</h2><div className="owner">👑 عبدالهادي · المالك</div><div className="manager">⭐ زين · المدير العام والمنسق <span>بانتظار ربط محرك الذكاء الاصطناعي</span></div><div className="people">{employees.filter(e=>e.agent_key!=='zein').map(e=><div className="person" key={e.id}><b>{e.display_name}</b><small>{e.job_title}</small><em>{e.activation_status==='active'?'نشط': 'بانتظار التفعيل'}</em></div>)}</div></>}
  {section==='team' && <><h2>فريق الشركة</h2><div className="people">{employees.map(e=><div className="person" key={e.id}><b>{e.display_name}</b><small>{e.job_title}</small><small>{e.department}</small><em>{e.activation_status}</em></div>)}</div></>}
  {section==='tasks' && <><h2>المهام المشتركة</h2><div className="panel"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="عنوان المهمة الجديدة"/><select value={assignee} onChange={e=>setAssignee(e.target.value)}><option value="">اختر المسؤول لاحقاً</option>{employees.map(e=><option value={e.id} key={e.id}>{e.display_name}</option>)}</select><button className="btn" disabled={busy || !title.trim()} onClick={addTask}>حفظ المهمة</button></div><div className="stack">{tasks.map(t=><article className="item" key={t.id}><div><b>{t.title}</b><small>{statusLabel[t.status] || t.status} · {t.priority}</small></div><button className="btn secondary" onClick={()=>updateTask(t)}>{t.status==='completed'?'إعادة فتح':'تحديث الحالة'}</button></article>)}</div></>}
  {section==='agents' && <><h2>زين · مركز استقبال الأوامر</h2><p className="muted">تُحفظ الطلبات في قاعدة البيانات، لكن لا يتم تنفيذها تلقائياً قبل تزويد النظام بمفتاح مزود الذكاء الاصطناعي ونشر عامل التنفيذ.</p><div className="panel"><textarea value={instruction} onChange={e=>setInstruction(e.target.value)} placeholder="اكتب أمراً لزين…"/><button className="btn" disabled={busy || !instruction.trim()} onClick={queueAgent}>إرسال إلى قائمة زين</button></div><h3>سجل الطلبات</h3><div className="stack">{runs.map(r=><article className="item" key={r.id}><div><b>{r.input?.instruction || 'طلب وكيل'}</b><small>{statusLabel[r.status] || r.status}</small></div><small>{new Date(r.created_at).toLocaleString('ar-DZ')}</small></article>)}</div></>}
  <footer>بيانات حية من Supabase · لا تنفيذ لأوامر خطرة أو نشر إنتاجي دون موافقتك</footer>
 </Shell>;
}
function Shell({children}:{children:any}) { return <div dir="rtl" className="office"><style>{`
.office{min-height:100vh;background:#071321;color:#eef6ff;padding:24px;font-family:system-ui;max-width:1200px;margin:auto}.office h1{font-size:30px;font-weight:800;margin:5px 0}.office h2{font-size:21px;font-weight:750;margin:28px 0 14px}.office h3{margin:24px 0 12px}.office small,.muted{color:#93a9bf}.office small{display:block;font-size:12px;margin-top:6px}.top{display:flex;justify-content:space-between;gap:15px;align-items:center}.top small{color:#67d9e8}.nav{display:flex;gap:8px;overflow:auto;margin:24px 0}.nav button,.btn{border:1px solid #26445f;border-radius:12px;padding:11px 16px;background:#10263c;color:#eaf8ff;white-space:nowrap}.nav .active,.btn{background:#39c5d7;color:#04202a;font-weight:750}.btn:disabled{opacity:.5}.secondary{background:#10263c;color:#eaf8ff}.stats,.people{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.stats>div,.person,.panel,.item,.owner,.manager{background:#102238;border:1px solid #23415d;border-radius:16px;padding:16px}.stats b{font-size:26px;display:block}.stats span{color:#91a9c0;font-size:12px}.owner{text-align:center;border-color:#bd9b42;margin:12px auto;max-width:420px}.manager{text-align:center;border-color:#298b9a;margin:12px auto;max-width:520px}.manager span{display:block;color:#e8c47a;font-size:12px;margin-top:8px}.person b{display:block}.person em{font-size:11px;color:#f2c879;display:block;margin-top:12px;font-style:normal}.panel{display:grid;gap:10px;margin-bottom:16px}.office input,.office select,.office textarea{width:100%;background:#071727;border:1px solid #294763;color:white;border-radius:10px;padding:12px}.office textarea{min-height:90px}.stack{display:grid;gap:10px}.item{display:flex;align-items:center;justify-content:space-between;gap:12px}.notice{background:#0b3a42;border:1px solid #237582;padding:12px;border-radius:12px}.office footer{margin-top:35px;padding-top:18px;border-top:1px solid #23415d;color:#91a9c0;font-size:12px}.alert{padding:16px;border:1px solid #ad7643;background:#382515;border-radius:14px;margin:14px 0}@media(max-width:600px){.office{padding:15px}.top{align-items:flex-start;flex-direction:column}.item{align-items:flex-start;flex-direction:column}}`} </style>{children}</div> }
function Card({label,value}:{label:string;value:number}){return <div><span>{label}</span><b>{value}</b></div>}
function Alert({children}:{children:any}){return <div className="alert">{children}</div>}
