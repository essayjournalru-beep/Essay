import express from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedTestAccount: nodemailer.TestAccount | null = null;

async function getSmtpTransport(): Promise<{
  transporter: nodemailer.Transporter;
  fromAddress: string;
  isCustomSmtp: boolean;
}> {
  const smtpHost = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
  const smtpUser = process.env.SMTP_USER?.trim() || 'essayjournal.ru@gmail.com';
  const rawPass = process.env.SMTP_PASS?.trim() || '';
  // If using smtp.gmail.com and a 16-char Google App Password with spaces is provided, strip spaces automatically
  const smtpPass =
    smtpHost.includes('gmail.com') && /^[a-z]{4}(\s+[a-z]{4}){3}$/i.test(rawPass)
      ? rawPass.replace(/\s+/g, '')
      : rawPass;
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpFrom =
    process.env.SMTP_FROM?.trim() ||
    `"Журнал ЭССЕ" <${smtpUser}>`;

  if (smtpHost && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    return {
      transporter,
      fromAddress: smtpFrom,
      isCustomSmtp: true,
    };
  }

  if (!cachedTestAccount) {
    cachedTestAccount = await nodemailer.createTestAccount();
  }

  const transporter = nodemailer.createTransport({
    host: cachedTestAccount.smtp.host,
    port: cachedTestAccount.smtp.port,
    secure: cachedTestAccount.smtp.secure,
    auth: {
      user: cachedTestAccount.user,
      pass: cachedTestAccount.pass,
    },
  });

  return {
    transporter,
    fromAddress: smtpFrom,
    isCustomSmtp: false,
  };
}

function buildWelcomeEmailHtml(email: string, rubricTitles: string[], appUrl: string): string {
  const topicsText =
    rubricTitles && rubricTitles.length > 0
      ? rubricTitles.join(', ')
      : 'Все рубрики издания «ЭССЕ»';

  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8" />
      <title>Добро пожаловать в почтовую рассылку «ЭССЕ»</title>
    </head>
    <body style="margin:0;padding:0;background-color:#FAF7F2;font-family:Georgia,'Times New Roman',serif;color:#1F1914;">
      <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
        <div style="background-color:#F4EFE6;border:1px solid #E2D3BE;border-radius:20px;padding:32px;">
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#C85D36;font-weight:bold;margin-bottom:12px;">
            ПОЧТОВАЯ РАССЫЛКА «ЭССЕ»
          </div>
          <h1 style="font-size:26px;line-height:1.3;margin:0 0 16px 0;color:#1F1914;">
            Вы в списке читателей литературно-философского издания «ЭССЕ»
          </h1>
          <p style="font-size:15px;line-height:1.6;color:#4A4036;margin:0 0 20px 0;">
            Здравствуйте! Ваш адрес <strong>${email}</strong> успешно подключён к почтовой рассылке. Мы отправляем только избранные авторские лонгриды и эссе — без информационного шума и спама.
          </p>
          <div style="background-color:#FAF7F2;border:1px solid #E2D3BE;border-radius:12px;padding:16px;margin-bottom:24px;">
            <div style="font-size:12px;color:#8C827A;margin-bottom:6px;font-family:Arial,sans-serif;">
              Выбранные вами рубрики:
            </div>
            <div style="font-size:14px;font-weight:bold;color:#1F1914;font-family:Arial,sans-serif;">
              ${topicsText}
            </div>
          </div>
          <a href="${appUrl}" style="display:inline-block;background-color:#C85D36;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:12px;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">
            Перейти к чтению эссе →
          </a>
          <hr style="border:none;border-top:1px solid #E2D3BE;margin:28px 0 16px 0;" />
          <p style="font-size:11px;color:#8C827A;margin:0;font-family:Arial,sans-serif;">
            Издание современной эссеистики «ЭССЕ» • Контакты редакции: elshan@ozat.kz
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Subscribe and send welcome email via SMTP
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const { email, rubricTitles } = req.body || {};
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        res.status(400).json({ ok: false, error: 'Некорректный email адрес' });
        return;
      }

      const appUrl = process.env.APP_URL || 'https://essay.ru';
      const { transporter, fromAddress, isCustomSmtp } = await getSmtpTransport();

      const info = await transporter.sendMail({
        from: fromAddress,
        to: email.trim(),
        subject: 'Вы подписаны на почтовую рассылку «ЭССЕ»',
        html: buildWelcomeEmailHtml(email.trim(), Array.isArray(rubricTitles) ? rubricTitles : [], appUrl),
      });

      const previewUrl = !isCustomSmtp ? nodemailer.getTestMessageUrl(info) || undefined : undefined;

      res.json({
        ok: true,
        messageId: info.messageId,
        isCustomSmtp,
        previewUrl,
      });
    } catch (err: any) {
      console.error('SMTP subscribe email error:', err);
      res.status(500).json({
        ok: false,
        error: err?.message || 'Ошибка при отправке приветственного письма по SMTP',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
