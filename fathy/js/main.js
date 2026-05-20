// Initialize date and scrolling listeners
document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.innerText = new Date().getFullYear();

    // Scroll effect for header
    window.addEventListener('scroll', () => {
        const header = document.getElementById('mainHeader');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // Close mobile menu when links are clicked
    const navLinksList = document.querySelectorAll('.nav-links a');
    navLinksList.forEach(link => {
        link.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) navLinks.classList.remove('mobile-active');
        });
    });

    // Start stats counters animations
    animateStats();
});

// Mobile menu toggle logic
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('mobile-active');
    }
}

// Stats Animation Counters
function animateStats() {
    const animateCounter = (id, target) => {
        let current = 0;
        const element = document.getElementById(id);
        if (!element) return;
        
        const step = () => {
            current += Math.ceil(target / 40);
            if (current >= target) {
                element.innerText = target + (id === 'statIncorporated' ? '+' : '');
            } else {
                element.innerText = current;
                requestAnimationFrame(step);
            }
        };
        step();
    };

    setTimeout(() => {
        animateCounter('statIncorporated', 480);
        animateCounter('statFactories', 140);
    }, 600);
}

// Services Filter Logic
function filterServices(category) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    if (event && event.target) {
        event.target.classList.add('active');
    }

    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Interactive Virtual Desk Tip Logic
const deskTips = {
    nameplate: {
        title: "المستشار فتحي عبد الرحمن نجدي",
        text: "محامٍ وباحث قانوني متميز، حاصل على بكالوريوس الحقوق من جامعة سوهاج. يتمتع بخبرة رائدة في قانون الاستثمار وتأسيس الشركات بكافة أنواعها، وممثل قانوني معتمد لعدة كيانات صناعية وتقنية كبرى بمصر."
    },
    book: {
        title: "قانون الاستثمار المصري (رقم 72 لسنة 2017)",
        text: "تخصص دقيق في صياغة وتطبيق بنود قانون الاستثمار الجديد، وتفعيل الحوافز الضريبية والامتيازات الجمركية وتسهيلات تخصيص الأراضي للمستثمرين في محافظات الصعيد والمناطق الحرة."
    },
    laptop: {
        title: "بوابة التأسيس الإلكتروني المتقدمة",
        text: "ارتباط إلكتروني مباشر بالمنظومة الرقمية للهيئة العامة للاستثمار والمناطق الحرة (GAFI) وهيئة التنمية الصناعية، مما يتيح إتمام إجراءات السجل التجاري والبطاقة الضريبية وتراخيص المصانع في أوقات قياسية."
    },
    cup: {
        title: "استشارة قانونية آمنة",
        text: "الاستشارة القانونية الدقيقة هي الدرع الواقي لأي مشروع ناجح. تفضل بمناقشة فكرة مشروعك معنا لتقنينها وحمايتها وتجنب النزاعات القانونية أو الثغرات الضريبية مستقبلاً."
    }
};

function showDeskTip(itemKey) {
    const tip = deskTips[itemKey];
    const pane = document.getElementById('deskInfoPane');
    if (!tip || !pane) return;
    
    pane.style.opacity = '0';
    pane.style.transform = 'translateY(5px)';
    
    setTimeout(() => {
        pane.innerHTML = `
            <div class="desk-tip-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:36px; height:36px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            </div>
            <h4 class="desk-tip-title">${tip.title}</h4>
            <p class="desk-tip-text">${tip.text}</p>
            <a href="#contact" class="service-action" style="margin-top: 20px;">
                حجز موعد استشارة مع المستشار
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </a>
        `;
        pane.style.opacity = '1';
        pane.style.transform = 'translateY(0)';
    }, 200);
}

// Egypt Interactive Map Navigation
const regionDetails = {
    sohag: {
        dotId: 'mapDotSohag'
    },
    cairo: {
        dotId: 'mapDotCairo'
    },
    alex: {
        dotId: 'mapDotAlex'
    },
    delta: {
        dotId: 'mapDotDelta'
    }
};

function highlightRegion(regionKey, element) {
    const cards = document.querySelectorAll('.region-card');
    cards.forEach(card => card.classList.remove('active'));
    
    if (element) {
        element.classList.add('active');
    }

    // Reset markers
    for (const key in regionDetails) {
        const dot = document.getElementById(regionDetails[key].dotId);
        if (dot) {
            dot.setAttribute('fill', 'rgba(255,255,255,0.4)');
            dot.setAttribute('r', '7');
        }
    }

    // Highlight dot
    const activeDot = document.getElementById(regionDetails[regionKey].dotId);
    if (activeDot) {
        activeDot.setAttribute('fill', 'var(--primary-gold)');
        activeDot.setAttribute('r', '11');
    }
}

function regionDotClick(regionKey) {
    const regionCards = document.querySelectorAll('.region-card');
    let targetIndex = 0;
    if (regionKey === 'cairo') targetIndex = 1;
    if (regionKey === 'alex') targetIndex = 2;
    if (regionKey === 'delta') targetIndex = 3;
    
    if (regionCards && regionCards[targetIndex]) {
        regionCards[targetIndex].click();
    }
}

// Contact Form Handler
function handleContactSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('cName').value.trim();
    const phone = document.getElementById('cPhone').value.trim();
    const service = document.getElementById('cType').value;
    const region = document.getElementById('cRegion').value;
    const messageText = document.getElementById('cMessage').value.trim() || 'لا توجد تفاصيل إضافية مضافة';

    const whatsappNumber = "201100631441";
    const message = `*طلب موعد استشارة قانونية جديدة*\n` +
                    `*مجموعة نجدي القانونية للاستثمار*\n\n` +
                    `بيانات المستثمر طالب الحجز:\n` +
                    `- الاسم: ${name}\n` +
                    `- الهاتف: ${phone}\n` +
                    `- المحافظة: ${region}\n\n` +
                    `الخدمة/الاستشارة المطلوبة:\n` +
                    `- الخدمة: ${service}\n\n` +
                    `تفاصيل إضافية للمستشار:\n${messageText}\n\n` +
                    `تم إرسال هذا الطلب من البوابة الرقمية للمجموعة.`;

    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
}

// Quick Whatsapp link Helper
function openDirectWhatsApp(serviceName) {
    const whatsappNumber = "201100631441";
    const message = `أهلاً مستشار فتحي، أود الاستفسار بخصوص خدمة: ${serviceName} وكيفية البدء في الإجراءات معكم.`;
    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
}
