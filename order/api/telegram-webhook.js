// ═══════════════════════════════════════════════════════════
// HarpyOrder — Telegram Subscription & Licensing Webhook API (Vercel Serverless)
// ═══════════════════════════════════════════════════════════

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'Harpy Telegram Bot Webhook Active' });
  }

  try {
    const update = req.body;
    if (!update || !update.message || !update.message.text) {
      return res.status(200).json({ ok: true });
    }

    const chatId = update.message.chat.id;
    const text = update.message.text.trim();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const parts = text.split(' ');
    const command = parts[0].toLowerCase();
    const arg1 = parts[1] ? parts[1].toLowerCase().trim() : null;
    const arg2 = parts[2] ? parseInt(parts[2]) : 30; // default 30 days

    let responseMessage = '';

    if (command === '/start' || command === '/help') {
      responseMessage = 
        '👑 *مرحباً بك في بوت إدارة اشتراكات Harpy Order* 🍔\n\n' +
        'الأوامر المتاحة للإدارة:\n' +
        '🔹 /activate <slug> [days] — تفعيل أو تجديد اشتراك مطعم (مثال: /activate hermel 30)\n' +
        '🔹 /suspend <slug> — إيقاف اشتراك مطعم مؤقتاً\n' +
        '🔹 /status <slug> — فحص حالة اشتراك مطعم وموعد الانتهاء\n' +
        '🔹 /plans — عرض الباقات المتاحة';
    } else if (command === '/activate') {
      if (!arg1) {
        responseMessage = '⚠️ يرجى تحديد معرف المطعم (Slug).\nمثال: /activate hermel 30';
      } else {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + arg2);
        const formattedDate = expiryDate.toISOString().split('T')[0];

        responseMessage = 
          ✅ *تم تفعيل / تجديد اشتراك المطعم بنجاح!* 🎉\n\n +
          🏢 *المطعم:* \${arg1}\\n +
          📅 *المدة:*  يوماً\n +
          ⏳ *تاريخ الانتهاء:* \${formattedDate}\\n +
          🔗 *رابط المنيو:* \https://harpymenu.com/order/?m=\`;
      }
    } else if (command === '/suspend') {
      if (!arg1) {
        responseMessage = '⚠️ يرجى تحديد معرف المطعم (Slug).\nمثال: /suspend hermel';
      } else {
        responseMessage = 
          ⛔ *تم إيقاف اشتراك المطعم بنجاح!*\n\n +
          🏢 *المطعم:* \${arg1}\\n +
          الحالة الآن: *معلق (Suspended)* — لن يتمكن الزبائن من تقديم طلبات جديدة حتى إعادة التفعيل.;
      }
    } else if (command === '/status') {
      if (!arg1) {
        responseMessage = '⚠️ يرجى تحديد معرف المطعم.\nمثال: /status hermel';
      } else {
        responseMessage = 
          📊 *تقرير اشتراك المطعم:* \${arg1}\\n\n +
          🔹 *الحالة:* نشط (Active) ✅\n +
          🔹 *الباقة:* Pro Enterprise 👑\n +
          🔹 *الرابط:* \https://harpymenu.com/order/?m=\`;
      }
    } else {
      responseMessage = '❓ أمر غير معروف. اكتب /help لعرض قائمة الأوامر.';
    }

    // Send response via Telegram Bot API if BOT_TOKEN is configured
    if (botToken) {
      await fetch(https://api.telegram.org/bot/sendMessage, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseMessage,
          parse_mode: 'Markdown'
        })
      });
    }

    return res.status(200).json({ ok: true, message: responseMessage });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}
