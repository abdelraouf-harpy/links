import pathlib

menu = pathlib.Path(r'restaurants\templates\restaurants\customer_menu.html').read_text(encoding='utf-8')
print('=== customer_menu.html ===')
print('card-info divs:', menu.count('id="card-info"'))
print('pay-card-btn buttons:', menu.count('id="pay-card-btn"'))
print('processCardPayment defs:', menu.count('async function processCardPayment'))
print('formatCard defs:', menu.count('function formatCard'))
print()

owner = pathlib.Path(r'restaurants\templates\restaurants\owner_dashboard.html').read_text(encoding='utf-8')
print('=== owner_dashboard.html ===')
print('logout links:', owner.count('تسجيل الخروج'))
print('CARD support:', 'CARD' in owner)
print('Old emojis present:', '\U0001f4b5' in owner or '\U0001f4f1' in owner)
print()
print('ALL OK!' if all([
    menu.count('id="card-info"') == 1,
    menu.count('id="pay-card-btn"') == 1,
    menu.count('async function processCardPayment') == 1,
    owner.count('تسجيل الخروج') == 1,
]) else 'ISSUES FOUND')
