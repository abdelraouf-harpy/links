import pathlib, re

BASE = pathlib.Path(r'c:\Users\ELBOSTAN\Desktop\QR مطاعم\restaurants\templates\restaurants')

# ═══════════════════════════════════════════
# TASK 1 — owner_dashboard.html
# Replace emoji icons with SVG + add logout link
# ═══════════════════════════════════════════
owner_path = BASE / 'owner_dashboard.html'
owner = owner_path.read_text(encoding='utf-8')

# Fix sidebar emoji icons
owner = owner.replace(
    '<div class="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-lg">🍴</div>',
    '<div class="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg></div>'
)
owner = owner.replace(
    '<span>🔥</span> لوحة المطبخ',
    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg> لوحة المطبخ'
)
owner = owner.replace(
    '<span>🙋</span> لوحة النادل',
    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> لوحة النادل'
)
owner = owner.replace(
    '<span>📱</span> طباعة QR',
    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5V16a2 2 0 01-2 2h-2.5M4 7.5V8a2 2 0 002 2h2.5"/></svg> طباعة QR'
)
owner = owner.replace(
    '<span>⚙️</span> الإعدادات',
    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> الإعدادات'
)

# Add logout link after sidebar user info
owner = owner.replace(
    '        </div>\n    </aside>',
    '            <a href="/staff/logout/" class="text-xs text-red-400 mt-2 block font-bold">تسجيل الخروج</a>\n        </div>\n    </aside>'
)

# Fix stat card emojis → SVG
owner = owner.replace(
    '<div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl mb-4">💰</div>',
    '<div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>'
)
owner = owner.replace(
    '<div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl mb-4">📦</div>',
    '<div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg></div>'
)
owner = owner.replace(
    '<div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-xl mb-4">🪑</div>',
    '<div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></div>'
)
owner = owner.replace(
    '<div class="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl mb-4">⏱️</div>',
    '<div class="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>'
)

# Fix section title emojis
owner = owner.replace('🏆 الأكثر مبيعاً', 'الأكثر مبيعاً')
owner = owner.replace('📈 نشاط الطلبات (آخر 7 أيام)', 'نشاط الطلبات (آخر 7 أيام)')
owner = owner.replace('🔴 النشاط اللحظي', 'النشاط اللحظي')
owner = owner.replace("'🎉 لا يوجد طلبات نشطة حالياً'", "'لا يوجد طلبات نشطة حالياً'")
owner = owner.replace("'⏳ جاري التحميل...'", "'جارٍ التحميل...'")
owner = owner.replace('⏳ جاري التحميل...', 'جارٍ التحميل...')

# Fix payment labels (remove emojis from JS)
owner = owner.replace("'💵 كاش'", "'كاش'")
owner = owner.replace("'📱 رقمي'", "'رقمي'")

owner_path.write_text(owner, encoding='utf-8')
print('owner_dashboard.html DONE')

# ═══════════════════════════════════════════
# TASK 2 — customer_menu.html
# Add CARD payment button + mock credit card modal
# ═══════════════════════════════════════════
menu_path = BASE / 'customer_menu.html'
menu = menu_path.read_text(encoding='utf-8')

# 1. Change payment grid from 2-cols to 3-cols and add CARD button
old_payment = '''                <div class="grid grid-cols-2 gap-4">
                    <button onclick="setPayment('CASH')" id="pay-cash"
                        class="payment-card border-2 border-red-500 bg-red-50/50 p-6 rounded-3xl flex flex-col items-center gap-3 transition-all">
                        <div class="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl">
                            💵</div>
                        <span class="text-sm font-black text-red-600" data-i18n="cash">كاش</span>
                    </button>
                    <button onclick="setPayment('DIGITAL')" id="pay-digital"
                        class="payment-card border-2 border-gray-100 bg-gray-50/30 p-6 rounded-3xl flex flex-col items-center gap-3 transition-all">
                        <div class="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl">
                            📱</div>
                        <span class="text-sm font-black text-gray-600" data-i18n="digital">رقمي</span>
                    </button>
                </div>'''

new_payment = '''                <div class="grid grid-cols-3 gap-3">
                    <button onclick="setPayment('CASH')" id="pay-cash"
                        class="payment-card border-2 border-red-500 bg-red-50/50 p-4 rounded-3xl flex flex-col items-center gap-2 transition-all">
                        <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        </div>
                        <span class="text-xs font-black text-red-600" data-i18n="cash">كاش</span>
                    </button>
                    <button onclick="setPayment('DIGITAL')" id="pay-digital"
                        class="payment-card border-2 border-gray-100 bg-gray-50/30 p-4 rounded-3xl flex flex-col items-center gap-2 transition-all">
                        <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                        </div>
                        <span class="text-xs font-black text-gray-600" data-i18n="digital">محفظة</span>
                    </button>
                    <button onclick="setPayment('CARD')" id="pay-card"
                        class="payment-card border-2 border-gray-100 bg-gray-50/30 p-4 rounded-3xl flex flex-col items-center gap-2 transition-all">
                        <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <svg class="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                        </div>
                        <span class="text-xs font-black text-gray-600">بطاقة</span>
                    </button>
                </div>'''

menu = menu.replace(old_payment, new_payment)

# 2. Add CARD info section after digital-info div
card_info_block = '''
            <!-- Card Payment Info -->
            <div id="card-info" class="hidden">
                <div class="bg-slate-900 border border-slate-700 rounded-[32px] p-6 mb-8 relative overflow-hidden">
                    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 text-center">بطاقة ائتمان / خصم (تجريبي)</p>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase mb-2">رقم البطاقة</label>
                            <input id="card-number" type="text" maxlength="19" placeholder="1234 5678 9012 3456"
                                class="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white font-mono text-sm outline-none focus:border-indigo-500 transition"
                                oninput="formatCard(this)">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[10px] font-black text-slate-400 uppercase mb-2">تاريخ الانتهاء</label>
                                <input id="card-expiry" type="text" maxlength="5" placeholder="MM/YY"
                                    class="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white font-mono text-sm outline-none focus:border-indigo-500 transition"
                                    oninput="formatExpiry(this)">
                            </div>
                            <div>
                                <label class="block text-[10px] font-black text-slate-400 uppercase mb-2">CVV</label>
                                <input id="card-cvv" type="password" maxlength="4" placeholder="•••"
                                    class="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white font-mono text-sm outline-none focus:border-indigo-500 transition">
                            </div>
                        </div>
                    </div>
                    <p class="text-[10px] text-slate-500 text-center mt-4 font-bold">أي بيانات تجريبية مقبولة — هذا نظام mock</p>
                </div>
            </div>

'''

menu = menu.replace(
    '\n            <!-- Footer -->',
    card_info_block + '\n            <!-- Footer -->'
)

# 3. Add confirm-card-btn after confirm-digital-btn
old_digital_btn = '''                <button onclick="confirmDigitalPayment()" id="confirm-digital-btn"
                    class="hidden w-full bg-indigo-600 text-white font-black text-lg py-5 rounded-[24px] shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-95 transition-all">
                    <span data-i18n="confirm_payment">تأكيد التحويل الآن</span>
                </button>'''

new_digital_btn = '''                <button onclick="confirmDigitalPayment()" id="confirm-digital-btn"
                    class="hidden w-full bg-indigo-600 text-white font-black text-lg py-5 rounded-[24px] shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-95 transition-all">
                    <span data-i18n="confirm_payment">تأكيد التحويل الآن</span>
                </button>
                <button onclick="processCardPayment()" id="pay-card-btn"
                    class="hidden w-full text-white font-black text-lg py-5 rounded-[24px] active:scale-95 transition-all"
                    style="background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 20px 40px rgba(99,102,241,0.35)">
                    الدفع بالبطاقة الآن
                </button>'''

menu = menu.replace(old_digital_btn, new_digital_btn)

# 4. Update setPayment() JS function to handle CARD
old_setpayment = '''        function setPayment(method) {
            selectedPayment = method;
            document.querySelectorAll('.payment-card').forEach(c => {
                c.classList.remove('border-red-500', 'bg-red-50/50');
                c.classList.add('border-gray-100', 'bg-gray-50/30');
            });
            const selected = document.getElementById(method === 'CASH' ? 'pay-cash' : 'pay-digital');
            selected.classList.add('border-red-500', 'bg-red-50/50');
            selected.classList.remove('border-gray-100', 'bg-gray-50/30');

            document.getElementById('digital-info').classList.toggle('hidden', method === 'CASH');
        }'''

new_setpayment = '''        function setPayment(method) {
            selectedPayment = method;
            document.querySelectorAll('.payment-card').forEach(c => {
                c.classList.remove('border-red-500', 'bg-red-50/50', 'border-indigo-500', 'bg-indigo-50/50', 'border-purple-500', 'bg-purple-50/50');
                c.classList.add('border-gray-100', 'bg-gray-50/30');
            });
            const ids = { CASH: 'pay-cash', DIGITAL: 'pay-digital', CARD: 'pay-card' };
            const colors = { CASH: ['border-red-500','bg-red-50/50'], DIGITAL: ['border-indigo-500','bg-indigo-50/50'], CARD: ['border-purple-500','bg-purple-50/50'] };
            const sel = document.getElementById(ids[method]);
            if (sel) { sel.classList.add(...colors[method]); sel.classList.remove('border-gray-100','bg-gray-50/30'); }

            document.getElementById('digital-info').classList.toggle('hidden', method !== 'DIGITAL');
            document.getElementById('card-info').classList.toggle('hidden', method !== 'CARD');

            // Show correct action button
            document.getElementById('final-order-btn').classList.toggle('hidden', method !== 'CASH');
            document.getElementById('confirm-digital-btn').classList.add('hidden');
            document.getElementById('pay-card-btn').classList.toggle('hidden', method !== 'CARD');
        }'''

menu = menu.replace(old_setpayment, new_setpayment)

# 5. Add card helper functions + processCardPayment before closing </script>
card_js = '''
        // ── Card Formatters
        function formatCard(el) {
            let v = el.value.replace(/\\D/g,'').substring(0,16);
            el.value = v.replace(/(\\d{4})(?=\\d)/g,'$1 ');
        }
        function formatExpiry(el) {
            let v = el.value.replace(/\\D/g,'').substring(0,4);
            if (v.length >= 2) v = v.substring(0,2) + '/' + v.substring(2);
            el.value = v;
        }

        // ── Process Mock Card Payment
        async function processCardPayment() {
            const num = (document.getElementById('card-number').value || '').replace(/\\s/g,'');
            const exp = document.getElementById('card-expiry').value || '';
            const cvv = document.getElementById('card-cvv').value || '';
            if (num.length < 8 || exp.length < 4 || cvv.length < 3) {
                showNotification('يرجى إدخال بيانات البطاقة كاملة');
                return;
            }
            const btn = document.getElementById('pay-card-btn');
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-pulse">جارٍ معالجة الدفع...</span>';

            // Simulate processing delay
            await new Promise(r => setTimeout(r, 1800));

            // Place order with CARD payment
            const items = Object.keys(cart).filter(id => cart[id].qty > 0).map(id => ({
                item_id: id, quantity: cart[id].qty, notes: cart[id].notes,
                extras: (cart[id].extras || []).map(e => e.id)
            }));
            if (!items.length) { btn.disabled=false; btn.innerText='الدفع بالبطاقة الآن'; return; }

            try {
                const res = await fetch('/api/order/place/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
                    body: JSON.stringify({
                        restaurant_id: menuData.restaurant.id,
                        table_token: tableToken,
                        items,
                        payment_method: 'CARD',
                        latitude: userLocation.lat || 0,
                        longitude: userLocation.lng || 0
                    })
                });
                const order = await res.json();
                if (!res.ok) { showNotification(order.error || 'حدث خطأ'); btn.disabled=false; btn.innerText='الدفع بالبطاقة الآن'; return; }
                currentOrderId = order.id;
                // Mock success — notify staff then show success
                btn.innerHTML = '<span>✓ تمت عملية الدفع!</span>';
                btn.style.background = 'linear-gradient(135deg,#16a34a,#22c55e)';
                showNotification('تمت عملية الدفع بنجاح! طلبك في طريقه إليك');
                // Notify waiter about card payment
                await fetch(`/api/order/${order.id}/confirm-payment/`, {
                    method: 'POST',
                    headers: { 'Content-Type':'application/json','X-CSRFToken':getCookie('csrftoken') }
                });
                setTimeout(() => location.reload(), 2500);
            } catch (e) {
                showNotification('فشل الاتصال بالسيرفر');
                btn.disabled = false;
                btn.innerText = 'الدفع بالبطاقة الآن';
            }
        }
'''

menu = menu.replace(
    '\n        async function confirmDigitalPayment()',
    card_js + '\n        async function confirmDigitalPayment()'
)

menu_path.write_text(menu, encoding='utf-8')
print('customer_menu.html DONE')

print('\nAll remaining tasks completed!')
