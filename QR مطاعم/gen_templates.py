import os, pathlib

BASE = pathlib.Path(r'c:\Users\ELBOSTAN\Desktop\QR مطاعم\restaurants\templates\restaurants')

# ══════════════════════════════════════════════════════
# 1. SUPER ADMIN DASHBOARD
# ══════════════════════════════════════════════════════
SUPER_ADMIN = r"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HarpyMenu SaaS - لوحة المشرف العام</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
<style>
body{font-family:Cairo,sans-serif;background:#0f172a;color:#f1f5f9;min-height:100vh}
.sidebar{background:#0a0f1e;border-left:1px solid rgba(255,255,255,.06)}
.card{background:#111827;border:1px solid rgba(255,255,255,.07);border-radius:20px}
.stat-card{background:linear-gradient(135deg,#111827,#1e293b);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:24px;transition:transform .3s}
.stat-card:hover{transform:translateY(-4px)}
.tab-btn{padding:9px 22px;border-radius:12px;font-weight:900;font-size:13px;border:none;cursor:pointer;transition:all .2s;color:#64748b;background:transparent}
.tab-btn.active{background:#4f46e5;color:white;box-shadow:0 8px 20px rgba(79,70,229,.35)}
.btn-p{background:#4f46e5;color:white;padding:10px 20px;border-radius:12px;font-weight:900;font-size:13px;border:none;cursor:pointer;transition:all .2s}
.btn-p:hover{background:#4338ca}
.btn-d{background:#dc2626;color:white;padding:6px 14px;border-radius:10px;font-weight:900;font-size:11px;border:none;cursor:pointer}
.btn-g{background:#16a34a;color:white;padding:6px 14px;border-radius:10px;font-weight:900;font-size:11px;border:none;cursor:pointer}
.fi{background:#1e293b;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:11px 14px;color:#f1f5f9;font-family:Cairo;font-size:13px;width:100%;outline:none;transition:border .2s}
.fi:focus{border-color:#4f46e5}
.fl{font-size:11px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;display:block}
#toast-wrap{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast{background:#1e293b;color:white;padding:11px 22px;border-radius:14px;font-weight:900;font-size:13px;box-shadow:0 12px 40px rgba(0,0,0,.4);white-space:nowrap}
.toast.ok{background:linear-gradient(135deg,#16a34a,#22c55e)}
.toast.err{background:linear-gradient(135deg,#dc2626,#ef4444)}
table{width:100%;border-collapse:collapse}
th,td{padding:13px 16px;text-align:right}
thead{background:rgba(255,255,255,.03);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;color:#475569}
tbody tr{border-top:1px solid rgba(255,255,255,.04);transition:background .15s}
tbody tr:hover{background:rgba(255,255,255,.02)}
</style>
</head>
<body class="flex">
<div id="toast-wrap"></div>

<!-- Sidebar -->
<aside class="w-60 sidebar hidden lg:flex flex-col p-5 fixed h-full z-50 top-0 right-0">
  <div class="flex items-center gap-3 mb-8">
    <div class="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xs">HM</div>
    <div>
      <p class="font-black text-white text-sm">HarpyMenu</p>
      <p class="text-[10px] text-indigo-400 font-bold">SaaS Admin</p>
    </div>
  </div>
  <nav class="space-y-1 flex-1">
    <a href="#" data-tab="dash" onclick="sw(event,'dash')" class="side-lnk flex items-center gap-3 p-3 rounded-xl font-black text-sm text-indigo-400 bg-indigo-600/20 transition">
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      نظرة عامة
    </a>
    <a href="#" data-tab="restaurants" onclick="sw(event,'restaurants')" class="side-lnk flex items-center gap-3 p-3 rounded-xl font-black text-sm text-slate-400 hover:bg-white/5 transition">
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
      المطاعم
    </a>
    <a href="#" data-tab="add" onclick="sw(event,'add')" class="side-lnk flex items-center gap-3 p-3 rounded-xl font-black text-sm text-slate-400 hover:bg-white/5 transition">
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      إضافة مطعم
    </a>
  </nav>
  <div class="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
    <p class="text-[10px] font-black text-slate-500 mb-1">Logged in as</p>
    <p class="font-bold text-sm text-white">{{ request.user.username }}</p>
    <a href="/staff/logout/" class="text-xs text-red-400 mt-2 block">تسجيل الخروج</a>
  </div>
</aside>

<!-- Main Content -->
<main class="flex-1 lg:mr-60 p-6 min-h-screen">
  <!-- Mobile Tabs -->
  <div class="flex gap-2 mb-6 lg:hidden overflow-x-auto pb-1">
    <button onclick="sw(event,'dash')" class="tab-btn active" data-tab="dash">عامة</button>
    <button onclick="sw(event,'restaurants')" class="tab-btn" data-tab="restaurants">المطاعم</button>
    <button onclick="sw(event,'add')" class="tab-btn" data-tab="add">إضافة</button>
  </div>

  <!-- TAB 1: Dashboard -->
  <div id="tab-dash">
    <div class="mb-6">
      <h1 class="text-3xl font-black">نظرة عامة على المنصة</h1>
      <p class="text-slate-500 text-sm font-bold mt-1">harpymenu.com — بيانات حية من قاعدة البيانات</p>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card">
        <p class="text-xs font-black text-slate-500 uppercase mb-3">المطاعم</p>
        <p class="text-4xl font-black">{{ total_restaurants }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs font-black text-slate-500 uppercase mb-3">اشتراكات نشطة</p>
        <p class="text-4xl font-black text-green-400">{{ active_subscriptions }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs font-black text-slate-500 uppercase mb-3">إجمالي الطلبات</p>
        <p class="text-4xl font-black text-amber-400">{{ total_orders_platform }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs font-black text-slate-500 uppercase mb-3">الإيرادات ج.م</p>
        <p class="text-4xl font-black text-indigo-400" id="stat-revenue">—</p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-6"><h4 class="font-black mb-4 text-sm">طلبات آخر 7 أيام</h4><canvas id="growthChart" height="200"></canvas></div>
      <div class="card p-6"><h4 class="font-black mb-4 text-sm">توزيع الاشتراكات</h4><canvas id="subChart" height="200"></canvas></div>
    </div>
  </div>

  <!-- TAB 2: Restaurants -->
  <div id="tab-restaurants" class="hidden">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-black">المطاعم المشتركة</h1>
      <span id="rest-count" class="text-xs font-black text-slate-500 bg-white/5 px-3 py-1 rounded-full">...</span>
    </div>
    <div class="card overflow-hidden">
      <div id="rest-loading" class="p-12 text-center text-slate-500 font-bold">جارٍ التحميل...</div>
      <div id="rest-table-wrap" class="hidden overflow-x-auto">
        <table>
          <thead><tr><th>المطعم</th><th>الباقة</th><th>العنوان</th><th>طلبات</th><th>إيرادات</th><th>الحالة</th><th>إجراء</th></tr></thead>
          <tbody id="rest-tbody"></tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- TAB 3: Add Restaurant -->
  <div id="tab-add" class="hidden">
    <div class="mb-6">
      <h1 class="text-3xl font-black">إضافة مطعم جديد</h1>
      <p class="text-slate-500 text-sm font-bold mt-1">يُفعَّل فور إنشائه</p>
    </div>
    <div class="card p-7 max-w-2xl">
      <div id="add-err" class="hidden mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold"></div>
      <div id="add-ok" class="hidden mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-bold"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label class="fl">اسم المطعم *</label><input id="f-name" class="fi" placeholder="مطعم النيل"></div>
        <div><label class="fl">Slug (رابط فريد) *</label><input id="f-slug" class="fi" placeholder="nile-restaurant" dir="ltr"></div>
        <div class="md:col-span-2"><label class="fl">العنوان *</label><input id="f-address" class="fi" placeholder="القاهرة، مصر"></div>
        <div><label class="fl">الهاتف *</label><input id="f-phone" class="fi" placeholder="010xxxxxxxx" dir="ltr"></div>
        <div>
          <label class="fl">نوع الاشتراك</label>
          <select id="f-sub" class="fi">
            <option value="BASIC">Basic — عرض قائمة فقط</option>
            <option value="PREMIUM">Premium — نظام طلبات كامل</option>
          </select>
        </div>
        <div><label class="fl">Vodafone Cash</label><input id="f-wallet" class="fi" placeholder="01x xxxx xxxx" dir="ltr"></div>
        <div><label class="fl">InstaPay ID</label><input id="f-instapay" class="fi" placeholder="username" dir="ltr"></div>
        <div><label class="fl">Latitude</label><input id="f-lat" class="fi" type="number" step="any" placeholder="30.0444" dir="ltr"></div>
        <div><label class="fl">Longitude</label><input id="f-lng" class="fi" type="number" step="any" placeholder="31.2357" dir="ltr"></div>
      </div>
      <button onclick="addRest()" class="btn-p mt-6 w-full py-3 text-base rounded-2xl">إنشاء المطعم وتفعيله فوراً</button>
    </div>
  </div>
</main>

<script>
// ── Tab Switch
const TABS = ['dash','restaurants','add'];
function sw(e,name){
  if(e) e.preventDefault();
  TABS.forEach(t=>{const el=document.getElementById('tab-'+t);if(el)el.classList.add('hidden')});
  document.querySelectorAll('[data-tab]').forEach(el=>{
    const isActive=el.dataset.tab===name;
    if(el.tagName==='BUTTON'){el.classList.toggle('active',isActive)}
    else{el.classList.toggle('text-indigo-400',isActive);el.classList.toggle('bg-indigo-600/20',isActive);el.classList.toggle('text-slate-400',!isActive)}
  });
  const tab=document.getElementById('tab-'+name);
  if(tab) tab.classList.remove('hidden');
  if(name==='restaurants') loadRests();
}

// ── Toast
function toast(msg,ok=true){const w=document.getElementById('toast-wrap');const d=document.createElement('div');d.className='toast '+(ok?'ok':'err');d.innerText=msg;w.appendChild(d);setTimeout(()=>d.remove(),3500)}

// ── CSRF
function csrf(){let v=null;document.cookie.split(';').forEach(c=>{const t=c.trim();if(t.startsWith('csrftoken='))v=decodeURIComponent(t.slice(10))});return v}

// ── Stats
async function loadStats(){
  try{
    const r=await fetch('/api/saas/stats/');
    if(!r.ok) return;
    const d=await r.json();
    document.getElementById('stat-revenue').innerText=parseFloat(d.totals.total_revenue).toLocaleString('ar-EG');
    new Chart(document.getElementById('growthChart').getContext('2d'),{type:'bar',data:{labels:d.orders_chart.labels,datasets:[{label:'طلبات',data:d.orders_chart.data,backgroundColor:'rgba(79,70,229,.25)',borderColor:'#4f46e5',borderWidth:2,borderRadius:8,borderSkipped:false}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#64748b',font:{family:'Cairo',weight:'700'}}},x:{grid:{display:false},ticks:{color:'#64748b',font:{family:'Cairo',weight:'700'}}}}}});
    new Chart(document.getElementById('subChart').getContext('2d'),{type:'doughnut',data:{labels:d.subscription_chart.labels,datasets:[{data:d.subscription_chart.data,backgroundColor:['#334155','#4f46e5'],borderWidth:0}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:'#94a3b8',font:{family:'Cairo',weight:'700'}}}},cutout:'72%'}});
  }catch(e){console.error(e)}
}

// ── Load Restaurants
async function loadRests(){
  try{
    const r=await fetch('/api/saas/restaurants/');
    const d=await r.json();
    const tbody=document.getElementById('rest-tbody');
    tbody.innerHTML='';
    document.getElementById('rest-count').innerText=d.restaurants.length+' مطعم';
    d.restaurants.forEach(rest=>{
      const tr=document.createElement('tr');
      const badge=rest.subscription_type==='PREMIUM'?'bg-indigo-500/20 text-indigo-400':'bg-slate-700/50 text-slate-400';
      tr.innerHTML=`<td><p class="font-black text-white text-sm">${rest.name}</p><p class="text-[10px] text-slate-500">${rest.slug}</p></td>
        <td><span class="px-2 py-1 rounded-full text-[10px] font-black ${badge}">${rest.subscription_label}</span></td>
        <td class="text-xs text-slate-400 max-w-[140px] truncate">${rest.address}</td>
        <td class="font-black text-amber-400">${rest.total_orders}</td>
        <td class="font-black text-green-400">${parseFloat(rest.total_revenue).toFixed(0)}</td>
        <td><span class="flex items-center gap-1 text-[11px] font-black ${rest.is_active?'text-green-400':'text-red-400'}"><span class="w-1.5 h-1.5 rounded-full ${rest.is_active?'bg-green-400':'bg-red-400'}"></span>${rest.is_active?'مفعّل':'معطّل'}</span></td>
        <td><button id="tog-${rest.id}" onclick="toggleR(${rest.id})" class="${rest.is_active?'btn-d':'btn-g'}">${rest.is_active?'تعطيل':'تفعيل'}</button></td>`;
      tbody.appendChild(tr);
    });
    document.getElementById('rest-loading').classList.add('hidden');
    document.getElementById('rest-table-wrap').classList.remove('hidden');
  }catch(e){toast('خطأ في تحميل المطاعم',false)}
}

async function toggleR(id){
  const btn=document.getElementById('tog-'+id);
  if(btn){btn.disabled=true;btn.innerText='...'}
  try{
    const r=await fetch('/api/saas/restaurant/'+id+'/toggle/',{method:'POST',headers:{'X-CSRFToken':csrf()}});
    const d=await r.json();
    if(d.success){toast(d.message);loadRests()}else{toast('حدث خطأ',false);if(btn)btn.disabled=false}
  }catch(e){toast('خطأ في الاتصال',false);if(btn)btn.disabled=false}
}

async function addRest(){
  const name=document.getElementById('f-name').value.trim();
  const slug=document.getElementById('f-slug').value.trim();
  const address=document.getElementById('f-address').value.trim();
  const phone=document.getElementById('f-phone').value.trim();
  const errEl=document.getElementById('add-err');
  const okEl=document.getElementById('add-ok');
  errEl.classList.add('hidden');okEl.classList.add('hidden');
  if(!name||!slug||!address||!phone){errEl.innerText='الاسم، Slug، العنوان، والهاتف مطلوبون';errEl.classList.remove('hidden');return}
  try{
    const r=await fetch('/api/saas/restaurant/add/',{method:'POST',headers:{'Content-Type':'application/json','X-CSRFToken':csrf()},body:JSON.stringify({name,slug,address,phone,subscription_type:document.getElementById('f-sub').value,wallet_number:document.getElementById('f-wallet').value.trim()||null,instapay_id:document.getElementById('f-instapay').value.trim()||null,latitude:document.getElementById('f-lat').value||null,longitude:document.getElementById('f-lng').value||null})});
    const d=await r.json();
    if(r.ok){okEl.innerText=d.message;okEl.classList.remove('hidden');['f-name','f-slug','f-address','f-phone','f-wallet','f-instapay','f-lat','f-lng'].forEach(id=>document.getElementById(id).value='')}
    else{errEl.innerText=d.error||'حدث خطأ';errEl.classList.remove('hidden')}
  }catch(e){toast('خطأ في الاتصال',false)}
}

loadStats();
</script>
</body>
</html>"""

# ══════════════════════════════════════════════════════
# 2. KITCHEN DASHBOARD — Add Browser Notifications
# ══════════════════════════════════════════════════════
kitchen_path = BASE / 'kitchen_dashboard.html'
kitchen_html = kitchen_path.read_text(encoding='utf-8')

# Add Browser Notification permission request + notification on new order
notif_init = """
        // ── Browser Notifications ──
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        function sendBrowserNotif(title, body) {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body: body, icon: '/static/icon.png' });
            }
        }
"""

# Inject notification request after "// ─── Init ───"
kitchen_html = kitchen_html.replace(
    "// ─── Init ───\n        loadOrders();",
    notif_init + "        // ─── Init ───\n        loadOrders();"
)

# Inject browser notification inside the new_order handler
kitchen_html = kitchen_html.replace(
    "if (data.type === 'new_order') {\n                    try { new Audio(",
    "if (data.type === 'new_order') {\n                    sendBrowserNotif('طلب جديد - المطبخ', 'وصل طلب جديد يحتاج تحضير');\n                    try { new Audio("
)

# Remove kitchen link from waiter nav (will do in waiter file)
kitchen_path.write_text(kitchen_html, encoding='utf-8')
print('kitchen_dashboard.html DONE')

# ══════════════════════════════════════════════════════
# 3. WAITER DASHBOARD — Browser Notifications + remove kitchen link
# ══════════════════════════════════════════════════════
waiter_path = BASE / 'waiter_dashboard.html'
waiter_html = waiter_path.read_text(encoding='utf-8')

# Add Browser Notification init
waiter_notif = """
        // ── Browser Notifications ──
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        function sendBrowserNotif(title, body) {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body: body, icon: '/static/icon.png' });
            }
        }
"""

waiter_html = waiter_html.replace(
    "// ─── Auto Refresh every 30s ───",
    waiter_notif + "        // ─── Auto Refresh every 30s ───"
)

# Add sendBrowserNotif calls inside websocket handlers
waiter_html = waiter_html.replace(
    "if (data.type === 'waiter_call') {\n                    playChime('call');",
    "if (data.type === 'waiter_call') {\n                    sendBrowserNotif('نداء من طاولة ' + data.table_number, data.call_type === 'BILL' ? 'طلب فاتورة' : 'طلب مساعدة');\n                    playChime('call');"
)
waiter_html = waiter_html.replace(
    "} else if (data.type === 'new_order_staff') {\n                    playChime('order');",
    "} else if (data.type === 'new_order_staff') {\n                    sendBrowserNotif('طلب جديد', 'وصل طلب من طاولة ' + data.table);\n                    playChime('order');"
)
waiter_html = waiter_html.replace(
    "} else if (data.type === 'payment_alert') {\n                    playChime('payment');",
    "} else if (data.type === 'payment_alert') {\n                    sendBrowserNotif('دفع رقمي', 'تحويل من طاولة ' + data.table + ' ينتظر تأكيدك');\n                    playChime('payment');"
)

# Remove kitchen link from bottom nav (role-based)
waiter_html = waiter_html.replace(
    """        <a href="/kitchen/dashboard/" class="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 transition">
            <span class="text-xl">🔥</span>
            <span class="text-[10px] font-black">المطبخ</span>
        </a>""",
    """        {% if user_role == 'OWNER' or user_role == 'MANAGER' or user_role == 'SUPERUSER' %}
        <a href="/kitchen/dashboard/" class="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/></svg>
            <span class="text-[10px] font-black">المطبخ</span>
        </a>
        {% endif %}"""
)

waiter_path.write_text(waiter_html, encoding='utf-8')
print('waiter_dashboard.html DONE')

# ══════════════════════════════════════════════════════
# 4. SUPER ADMIN — Write it
# ══════════════════════════════════════════════════════
(BASE / 'super_admin_dashboard.html').write_text(SUPER_ADMIN, encoding='utf-8')
print('super_admin_dashboard.html DONE')

print('\nAll templates generated successfully!')
