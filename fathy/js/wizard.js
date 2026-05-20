let currentWizardStep = 1;
const wizardConfig = {
    sector: '',
    legal: '',
    location: '',
    clientName: ''
};

function selectWizardOption(step, label, val) {
    const stepContent = document.getElementById(`stepContent${step}`);
    if (!stepContent) return;

    const cards = stepContent.querySelectorAll('.option-card');
    cards.forEach(card => card.classList.remove('selected'));

    const selectedCard = event.currentTarget;
    selectedCard.classList.add('selected');

    if (step === 1) wizardConfig.sector = label;
    if (step === 2) wizardConfig.legal = label;
    if (step === 3) wizardConfig.location = label;

    setTimeout(() => {
        navigateWizard(1);
    }, 300);
}

function navigateWizard(direction) {
    if (direction === 1) {
        if (currentWizardStep === 1 && !wizardConfig.sector) {
            alert('يرجى اختيار قطاع النشاط أولاً للمتابعة.');
            return;
        }
        if (currentWizardStep === 2 && !wizardConfig.legal) {
            alert('يرجى اختيار الكيان القانوني للمتابعة.');
            return;
        }
        if (currentWizardStep === 3 && !wizardConfig.location) {
            alert('يرجى اختيار المحافظة المستهدفة لمشروعك.');
            return;
        }
    }

    const currentStepEl = document.getElementById(`stepContent${currentWizardStep}`);
    const currentIndicatorEl = document.getElementById(`stepInd${currentWizardStep}`);
    
    if (currentStepEl) currentStepEl.classList.remove('active');
    if (currentIndicatorEl) {
        currentIndicatorEl.classList.remove('active');
        if (direction === 1) {
            currentIndicatorEl.classList.add('completed');
        }
    }

    currentWizardStep += direction;

    const nextStepEl = document.getElementById(`stepContent${currentWizardStep}`);
    const nextIndicatorEl = document.getElementById(`stepInd${currentWizardStep}`);

    if (nextStepEl) nextStepEl.classList.add('active');
    if (nextIndicatorEl) {
        nextIndicatorEl.classList.add('active');
        nextIndicatorEl.classList.remove('completed');
    }

    const progressPercent = ((currentWizardStep - 1) / 3) * 100;
    const progressBar = document.getElementById('wizardProgress');
    if (progressBar) progressBar.style.width = `${progressPercent}%`;

    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.style.visibility = currentWizardStep > 1 ? 'visible' : 'hidden';
    }

    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        if (currentWizardStep === 4) {
            document.getElementById('resSector').innerText = wizardConfig.sector;
            document.getElementById('resLegal').innerText = wizardConfig.legal;
            document.getElementById('resLocation').innerText = wizardConfig.location;
            
            const timeEl = document.getElementById('resTime');
            if (wizardConfig.sector.includes('صناعي')) {
                timeEl.innerText = "من 15 إلى 30 يوم عمل (تراخيص هيئة التنمية الصناعية)";
            } else {
                timeEl.innerText = "من 3 إلى 5 أيام عمل (تأسيس إلكتروني بهيئة الاستثمار)";
            }

            nextBtn.innerHTML = 'إرسال الملف وتأسيس مشروعك ➔';
            nextBtn.onclick = submitWizardToWhatsApp;
        } else {
            nextBtn.innerHTML = 'التالي ➔';
            nextBtn.onclick = () => navigateWizard(1);
        }
    }
}

function openWizardWithConfig(sectorKey) {
    const wizardSection = document.getElementById('wizard');
    if (wizardSection) wizardSection.scrollIntoView();
    
    let cardIndex = 1; // Default commercial
    if (sectorKey === 'صناعي') cardIndex = 0;
    if (sectorKey === 'تقني') cardIndex = 2;
    if (sectorKey === 'طبي') cardIndex = 3;

    const stepContent = document.getElementById('stepContent1');
    if (stepContent) {
        const cards = stepContent.querySelectorAll('.option-card');
        if (cards && cards[cardIndex]) {
            cards[cardIndex].click();
        }
    }
}

function submitWizardToWhatsApp() {
    const clientNameInput = document.getElementById('wizardClientName');
    const clientName = clientNameInput ? clientNameInput.value.trim() : '';
    if (!clientName) {
        alert('يرجى كتابة اسمك الكريم لنتمكن من توجيه التقرير لك.');
        return;
    }

    const timeEl = document.getElementById('resTime');
    const expectedTime = timeEl ? timeEl.innerText : 'من 3 إلى 5 أيام عمل';

    const whatsappNumber = "201100631441";
    const message = `*طلب تأسيس واستشارة استثمارية جديدة*\n` +
                    `*مجموعة نجدي القانونية للاستثمار*\n\n` +
                    `بيانات المستثمر طالب الخدمة:\n` +
                    `- الاسم الكريم: ${clientName}\n\n` +
                    `تفاصيل التأسيس المختارة:\n` +
                    `- قطاع الاستثمار: ${wizardConfig.sector}\n` +
                    `- الكيان القانوني المقترح: ${wizardConfig.legal}\n` +
                    `- موقع التأسيس المستهدف: ${wizardConfig.location}\n\n` +
                    `مدة العمل المتوقعة: ${expectedTime}\n\n` +
                    `تم إرسال هذا الملف من المنصة الرقمية الرسمية لمكتب المستشار فتحي نجدي.`;

    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
}
