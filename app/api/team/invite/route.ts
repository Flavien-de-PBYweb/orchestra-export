import { NextRequest, NextResponse } from "next/server";

async function sendInviteEmail({
  name, email, role, tempPassword, loginUrl,
}: {
  name: string; email: string; role: string;
  tempPassword: string; loginUrl: string;
}) {
  const roleLabel = role === "admin" ? "Administrateur" : role === "manager" ? "Manager" : "Membre";
  const year = new Date().getFullYear();

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invitation Orchestra Export</title>
</head>
<body style="margin:0;padding:0;background:#F0F2F8;font-family:system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F2F8;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header Navy -->
        <tr>
          <td style="background:#1B2E6B;border-radius:16px 16px 0 0;padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:26px;font-weight:900;color:#FFFFFF;letter-spacing:-1px;">ORCHESTRA</span>
                  <br/>
                  <span style="font-size:10px;font-weight:600;color:#FFCC00;letter-spacing:3px;text-transform:uppercase;">Export International</span>
                </td>
                <td align="right">
                  <div style="width:48px;height:48px;background:#E40E20;border-radius:50%;display:inline-block;"></div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Red accent bar -->
        <tr><td style="background:#E40E20;height:4px;"></td></tr>

        <!-- Body -->
        <tr>
          <td style="background:#FFFFFF;padding:40px 40px 32px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1A1A2E;">Bienvenue, ${name}&nbsp;!</h1>
            <p style="margin:0 0 28px;font-size:15px;color:#6B7280;line-height:1.6;">
              Votre accès à l'outil de pilotage <strong style="color:#1B2E6B;">Orchestra Export International</strong> vient d'être créé.
            </p>

            <!-- Role badge -->
            <div style="display:inline-block;background:#F4F6FB;border:1px solid #DDE3F3;border-radius:8px;padding:8px 16px;margin-bottom:28px;">
              <span style="font-size:12px;font-weight:600;color:#1B2E6B;text-transform:uppercase;letter-spacing:0.5px;">Rôle : ${roleLabel}</span>
            </div>

            <!-- Credentials box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FC;border:1px solid #E2E8F0;border-radius:12px;margin-bottom:32px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;">Vos identifiants de connexion</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                    <tr>
                      <td style="padding:6px 0;border-bottom:1px solid #E9ECF3;">
                        <span style="font-size:12px;color:#6B7280;">Adresse e-mail</span>
                      </td>
                      <td align="right" style="padding:6px 0;border-bottom:1px solid #E9ECF3;">
                        <strong style="font-size:13px;color:#1A1A2E;">${email}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0 0;">
                        <span style="font-size:12px;color:#6B7280;">Mot de passe temporaire</span>
                      </td>
                      <td align="right" style="padding:10px 0 0;">
                        <strong style="font-size:15px;color:#E40E20;font-family:monospace;letter-spacing:1px;background:#FFF0F0;padding:3px 10px;border-radius:6px;">${tempPassword}</strong>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:12px 0 0;font-size:11px;color:#9CA3AF;">⚠️ Changez votre mot de passe dès votre première connexion.</p>
                </td>
              </tr>
            </table>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#E40E20;border-radius:12px;">
                  <a href="${loginUrl}" style="display:inline-block;padding:16px 36px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;">
                    Accéder à mon espace →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#9CA3AF;">
              Ou copiez ce lien :<br/>
              <a href="${loginUrl}" style="color:#1B2E6B;word-break:break-all;">${loginUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1B2E6B;border-radius:0 0 16px 16px;padding:20px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td><p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);">© ${year} Orchestra Prémaman — Document confidentiel</p></td>
                <td align="right"><span style="font-size:11px;color:#FFCC00;font-weight:600;">Export International</span></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // ── Gmail via Nodemailer ──────────────────────────────────────────────────
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPass) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });
    await transporter.sendMail({
      from: `"Orchestra Export" <${gmailUser}>`,
      to: email,
      subject: `🎯 Votre accès Orchestra Export International`,
      html,
    });
    return { sent: true, via: "gmail" };
  }

  // ── Resend fallback ───────────────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    const from = process.env.RESEND_FROM_EMAIL ?? "Orchestra Export <onboarding@resend.dev>";
    const { error } = await resend.emails.send({ from, to: email, subject: `🎯 Votre accès Orchestra Export International`, html });
    if (error) throw new Error(error.message);
    return { sent: true, via: "resend" };
  }

  return { sent: false, via: null };
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, role, tempPassword } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Email et nom requis" }, { status: 400 });
    }

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://orchestra-export.vercel.app"}/login`;

    const { sent, via } = await sendInviteEmail({ name, email, role, tempPassword, loginUrl });

    if (!sent) {
      return NextResponse.json({
        ok: true,
        emailSent: false,
        message: "Compte créé — email non envoyé (GMAIL_USER ou RESEND_API_KEY manquant)",
      });
    }

    return NextResponse.json({ ok: true, emailSent: true, via });
  } catch (e) {
    console.error("[invite]", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
