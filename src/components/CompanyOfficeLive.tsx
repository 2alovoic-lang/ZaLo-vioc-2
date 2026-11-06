import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type Employee = { id:string; display_name:string; job_title:string; department:string; agent_key:string|null; activation_status:string };
type Task = { id:string; title:string; description:string|null; status:string; priority:string; assigned_employee_id:string|null; created_at:string };
type Run = { id:string; status:string; input:any; output:any; error:string|null; created_at:string; employee_id:string|null };
type Approval = { id:string; action_type:string; target_ref:string|null; details:any; status:string; created_at:string };
const ar:Record<string,string>={planned:'مخطط له',configured:'مهيأ',active:'نشط',paused:'متوقف',pending:'جديد',in_progress:'قيد التنفيذ',blocked:'متعثر',completed:'مكتمل',cancelled:'ملغى',queued:'في قائمة الانتظار',running:'قيد التشغيل',succeeded:'نجح',failed:'فشل',needs_approval:'بانتظار موافقتك',approved:'مقبول',rejected:'مرفوض'};
export default function CompanyOfficeLive(){
 const [user,setUser]=useState<any>(null),[company,setCompany]=useState<any>(null);
 const [employees,setEmployees]=useState<Employee[]>([]),[tasks,setTasks]=useState<Task[]>([]),[runs,setRuns]=useState<Run[]>([]),[approvals,setApprovals]=useState<Approval[]>([]);
 const [tab,setTab]=useState('home'),[title,setTitle]=useState(''),[assignee,setAssignee]=useState(''),[instruction,setInstruction]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const refresh=useCallback(async()=>{
  if(!supabase)throw new Error('إعداد Supabase غير مكتمل');
  const {data:{user:u},error:ue}=await supabase.auth.getUser();if(ue)throw ue;setUser(u);
  if(!u){setCompany(null);return;}
  const {data:members,error:me}=await supabase.from('company_members').select('company_id,role').eq('user_id',u.id);if(me)throw me;
  const membership=members?.find(m=>['owner','admin'].includes(m.role))||members?.[0];if(!membership)throw new Error('هذا الحساب ليس عضواً في الشركة.');
  const {data:c,error:ce}=await supabase.from('companies').select('id,name,owner_display_name').eq('id',membership.company_id).single();if(ce)throw ce;setCompany(c);
  const [e,t,r,a]=await Promise.all([
   supabase.from('company_employees').select('id,display_name,job_title,department,agent_key,activation_status').eq('company_id',c.id).order('created_at'),
   supabase.from('company_tasks').select('id,title,description,status,priority,assigned_employee_id,created_at').eq('company_id',c.id).order('created_at',{ascending:false}),
   supabase.from('company_agent_runs').select('id,status,input,output,error,created_at,employee_id').eq('company_id',c.id).order('created_at',{ascending:false}).limit(30),
   supabase.from('company_approvals').select('id,action_type,target_ref,details,status,created_at').eq('company_id',c.id).order('created_at',{ascending:false}).limit(30)
  ]);
  for(const x of [e,t,r,a])if(x.error)throw x.error;
  setEmployees(e.data||[]);setTasks(t.data||[]);setRuns(r.data||[]);setApprovals(a.data||[]);
 },[]);
 useEffect(()=>{refresh().catch(e=>setError(e.message||'تعذر تحميل الشركة'));},[refresh]);
 const addTask=async()=>{if(!supabase||!company||!user||!title.trim())return;setBusy(true);setError('');
  const {error:e}=await supabase.from('company_tasks').insert({company_id:company.id,title:title.trim(),assigned_employee_id:assignee||null,created_by:user.id,priority:'normal'});
  if(e)setError(e.message);else{setTitle('');setAssignee('');setNotice('حُفظت المهمة في سجل الشركة.');await refresh();}setBusy(false);
 };
 const sendToManager=async()=>{if(!supabase||!company||!user||!instruction.trim())return;setBusy(true);setError('');
  const manager=employees.find(e=>e.agent_key==='zein');
  const {error:e}=await supabase.from('company_agent_runs').insert({company_id:company.id,employee_id:manager?.id||null,requested_by:user.id,input:{instruction:instruction.trim(),requested_agent:'zein'},status:'queued'});
  if(e)setError(e.message);else{setInstruction('');setNotice('سُجل الطلب في قائمة زين. لم يبدأ التنفيذ الآلي بعد.');await refresh();}setBusy(false);
 };
 const changeTask=async(t:Task)=>{if(!supabase)return;const next=t.status==='pending'?'in_progress':t.status==='in_progress'?'completed':'pending';
  const {error:e}=await supabase.from('company_tasks').update({status:next,updated_at:new Date().toISOString()}).eq('id',t.id);if(e)setError(e.message);else await refresh();
 };
 if(!isSupabaseConfigured)return <Frame><Alert>إعدادات الاتصال بقاعدة البيانات غير متاحة في هذه النسخة.</Alert></Frame>;
 if(error&&!company&&!user)return <Frame><Alert>{error}</Alert><button onClick={()=>refresh().catch(e=>setError(e.message))}>إعادة المحاولة</button></Frame>;
 if(!user)return <Frame><h1>مقر شركة ZaLoVoice</h1><p>سجّل الدخول بحسابك المرتبط بعضوية الشركة.</p><button onClick={()=>location.assign('/login')}>الانتقال لتسجيل الدخول</button></Frame>;
 if(!company)return <Frame><Alert>{error||'جارٍ تحميل بيانات الشركة…'}</Alert></Frame>;
 return <Frame>
  <header className="head"><div><small>مركز قيادة الشركة</small><h1>{company.name}</h1><p>المالك: {company.owner_display_name}</p></div><button className="ghost" onClick={()=>refresh().catch(e=>setError(e.message))}>تحديث البيانات</button></header>
  <nav>{[['home','المقر'],['team','الفريق'],['tasks','المهام'],['agents','العمليات'],['approvals','الموافقات']].map(([k,v])=><button key={k} className={tab===k?'selected':''} onClick={()=>setTab(k)}>{v}</button>)}</nav>
  {notice&&<p className="notice">{notice}</p>}{error&&<Alert>{error}</Alert>}
  {tab==='home'&&<><div className="stats"><Metric n={employees.length} t="أعضاء الفريق"/><Metric n={tasks.length} t="المهام"/><Metric n={runs.length} t="طلبات الوكلاء"/><Metric n={employees.filter(e=>e.activation_status==='active').length} t="وكلاء نشطون فعلياً"/></div><h2>مكتب القيادة</h2><div className="owner">👑 {company.owner_display_name} · المالك وصاحب القرار</div><div className="manager">⭐ زين · المدير العام والمنسق <small>استقبال الطلبات مفعّل؛ التنفيذ الآلي غير منشور بعد</small></div><div className="grid">{employees.filter(e=>e.agent_key!=='zein').map(e=><Person key={e.id} e={e}/>)}</div></>}
  {tab==='team'&&<><h2>الموظفون والوكلاء</h2><div className="grid">{employees.map(e=><Person key={e.id} e={e}/>)}</div></>}
  {tab==='tasks'&&<><h2>إدارة المهام</h2><section className="panel"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="عنوان المهمة"/><select value={assignee} onChange={e=>setAssignee(e.target.value)}><option value="">دون تعيين</option>{employees.map(e=><option key={e.id} value={e.id}>{e.display_name}</option>)}</select><button disabled={busy||!title.trim()} onClick={addTask}>إضافة مهمة</button></section><div className="list">{tasks.map(t=><article key={t.id}><div><b>{t.title}</b><small>{ar[t.status]||t.status} · {t.priority}</small></div><button className="ghost" onClick={()=>changeTask(t)}>تغيير الحالة</button></article>)}</div></>}
  {tab==='agents'&&<><h2>مركز عمليات الوكلاء</h2><p>تُحفظ الأوامر في قائمة انتظار دائمة. لن ينفذها أي وكيل حتى ننشر محركاً آمناً ونربط مفتاح مزود الذكاء الاصطناعي.</p><section className="panel"><textarea value={instruction} onChange={e=>setInstruction(e.target.value)} placeholder="اكتب توجيهاً لزين…"/><button disabled={busy||!instruction.trim()} onClick={sendToManager}>تسجيل الطلب</button></section><div className="list">{runs.map(r=><article key={r.id}><div><b>{r.input?.instruction||'طلب تشغيل'}</b><small>{ar[r.status]||r.status}</small>{r.error&&<small className="bad">{r.error}</small>}</div><small>{new Date(r.created_at).toLocaleString('ar-DZ')}</small></article>)}</div></>}
  {tab==='approvals'&&<><h2>مركز الموافقات</h2><p>أي إجراء حساس يجب أن ينتظر قرار المالك.</p><div className="list">{approvals.map(a=><article key={a.id}><div><b>{a.action_type}</b><small>{a.target_ref||'بدون مرجع'} · {ar[a.status]||a.status}</small></div><small>{new Date(a.created_at).toLocaleString('ar-DZ')}</small></article>)}</div></>}
  <footer>مزامنة مباشرة مع Supabase · لا تُنفذ تغييرات إنتاجية أو إجراءات حساسة دون موافقة المالك.</footer>
 </Frame>;
}
function Frame({children}:{children:any}){return <main dir="rtl" className="office"><style>{`.office{min-height:100vh;background:#071321;color:#eef6ff;padding:22px;max-width:1200px;margin:auto;font-family:system-ui}.office h1{font-size:28px;margin:4px 0}.office h2{font-size:21px;margin:26px 0 14px}.office p,.office small{color:#9bb0c5}.head{display:flex;justify-content:space-between;align-items:center;gap:12px}.head>div>small{color:#61d9e7}.office nav{display:flex;gap:8px;overflow:auto;margin:22px 0}.office button{border:1px solid #28506b;background:#153149;color:#e9f8ff;border-radius:11px;padding:10px 14px;white-space:nowrap}.office button.selected,.office .panel button{background:#45c9d8;color:#06212b;font-weight:700}.office button:disabled{opacity:.5}.office .ghost{background:#153149}.stats,.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.stats>div,.person,.panel,.list article,.owner,.manager{border:1px solid #254660;background:#10263b;border-radius:15px;padding:15px}.stats b{font-size:25px;display:block}.stats span{font-size:12px;color:#9bb0c5}.owner,.manager{text-align:center;margin:12px auto;max-width:520px}.owner{border-color:#a98d48}.manager{border-color:#268c9c}.person b{display:block}.person small{display:block;margin-top:7px}.person em{font-size:11px;color:#edc47b;font-style:normal}.panel{display:grid;gap:10px;margin-bottom:14px}.office input,.office select,.office textarea{box-sizing:border-box;width:100%;padding:12px;border-radius:10px;border:1px solid #31516b;background:#081a2a;color:white}.office textarea{min-height:90px}.list{display:grid;gap:9px}.list article{display:flex;justify-content:space-between;align-items:center;gap:12px}.list small{display:block;margin-top:6px}.notice{background:#0c3942;padding:12px;border-radius:10px}.bad,.office .alert{color:#ffc58e}.office .alert{background:#382719;padding:14px;border-radius:12px}.office footer{margin-top:30px;border-top:1px solid #254660;padding-top:15px;font-size:12px;color:#9bb0c5}@media(max-width:600px){.office{padding:14px}.head,.list article{align-items:flex-start;flex-direction:column}}`}</style>{children}</main>}
function Metric({n,t}:{n:number;t:string}){return <div><span>{t}</span><b>{n}</b></div>}
function Person({e}:{e:Employee}){return <div className="person"><b>{e.display_name}</b><small>{e.job_title} · {e.department}</small><em>{ar[e.activation_status]||e.activation_status}</em></div>}
function Alert({children}:{children:any}){return <div className="alert">{children}</div>}
