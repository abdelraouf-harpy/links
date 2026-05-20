const checkerDocs = {
    single: [
        "صورة بطاقة الرقم القومي سارية للمؤسس",
        "عقد إيجار موثق بالشهر العقاري أو سند ملكية المقر",
        "توكيل رسمي للمحامي بتأسيس الشركات",
        "طلب فحص وتحديد اسم تجاري غير مكرر بالهيئة",
        "بيانات النشاط التفصيلي ورأس مال الشركة المقترح"
    ],
    llc: [
        "صورة بطاقة الرقم القومي سارية لكافة الشركاء",
        "عقد إيجار المقر الرئيسي للشركة موثق أو سند ملكية المقر",
        "توكيل رسمي للمحامي بتأسيس الشركات بهيئة الاستثمار",
        "شهادة بنكية تفيد إيداع نسبة رأس المال المطلوبة",
        "تحديد أسماء المديرين والممثل القانوني وسلطاتهم الإدارية"
    ],
    factory: [
        "السجل التجاري والبطاقة الضريبية للشركة التابع لها المصنع",
        "سند حيازة الأرض أو المصنع عقد إيجار أو تخصيص أو ملكية",
        "رسم هندسي متكامل معتمد للموقع والمنشأة الصناعية",
        "موافقات هيئة شؤون البيئة والدفاع المدني والأمن الصناعي",
        "طلب استخراج رخصة تشغيل مؤقتة أو دائمة بالتنمية الصناعية"
    ],
    trademark: [
        "نموذج واضح للعلامة التجارية شعار بدقة عالية",
        "صورة السجل التجاري للشركة أو المنشأة الفردية طالبة التسجيل",
        "توكيل رسمي بتسجيل علامة تجارية وحماية ملكية فكرية للمحامي",
        "بيان دقيق بالفئات والسلع والخدمات المراد حمايتها وتسجيلها"
    ]
};

function loadCheckerDocuments() {
    const selectEl = document.getElementById('checkerServiceSelect');
    if (!selectEl) return;
    
    const selectVal = selectEl.value;
    const docList = checkerDocs[selectVal] || [];
    const listContainer = document.getElementById('checkerList');
    const titleElement = document.getElementById('checkerTitle');
    
    if (!listContainer || !titleElement) return;
    
    // Set title
    const selectedText = selectEl.options[selectEl.selectedIndex].text;
    titleElement.innerText = `مستندات: ${selectedText}`;

    listContainer.innerHTML = '';
    
    docList.forEach((doc, index) => {
        const item = document.createElement('div');
        item.className = 'checker-item';
        item.onclick = () => toggleCheckerItem(item);
        item.innerHTML = `
            <div class="checker-checkbox">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <div class="checker-item-text">${doc}</div>
        `;
        listContainer.appendChild(item);
    });

    updateCheckerProgress();
}

function toggleCheckerItem(item) {
    item.classList.toggle('checked');
    updateCheckerProgress();
}

function updateCheckerProgress() {
    const items = document.querySelectorAll('.checker-item');
    const checkedItems = document.querySelectorAll('.checker-item.checked');
    
    let percent = 0;
    if (items.length > 0) {
        percent = Math.round((checkedItems.length / items.length) * 100);
    }

    const fill = document.getElementById('checkerFill');
    const percentText = document.getElementById('checkerPercent');

    if (fill) fill.style.width = `${percent}%`;
    if (percentText) percentText.innerText = `${percent}%`;
}

function submitCheckerRequest() {
    const selectEl = document.getElementById('checkerServiceSelect');
    if (!selectEl) return;

    const serviceName = selectEl.options[selectEl.selectedIndex].text;
    const items = document.querySelectorAll('.checker-item');
    
    let readyList = [];
    let missingList = [];

    items.forEach(item => {
        const text = item.querySelector('.checker-item-text').innerText;
        if (item.classList.contains('checked')) {
            readyList.push(text);
        } else {
            missingList.push(text);
        }
    });

    const whatsappNumber = "201100631441";
    const message = `*فحص مستندات التأسيس الفوري*\n` +
                    `*مجموعة نجدي القانونية للاستثمار*\n\n` +
                    `الخدمة المطلوبة: ${serviceName}\n\n` +
                    `المستندات الجاهزة والمتوفرة لدي:\n` +
                    (readyList.length > 0 ? readyList.map(doc => `- ${doc}`).join('\n') : `- لا يوجد مستندات جاهزة حالياً`) + `\n\n` +
                    `المستندات الناقصة المطلوب استكمالها:\n` +
                    (missingList.length > 0 ? missingList.map(doc => `- ${doc}`).join('\n') : `- كافة المستندات متوفرة بنسبة 100%`) + `\n\n` +
                    `يرجى التنسيق معي للبدء في تجهيز الملف الفعلي واستكمال النواقص مع المستشار.`;

    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
}
