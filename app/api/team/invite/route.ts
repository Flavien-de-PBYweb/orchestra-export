import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, role, tempPassword } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Email et nom requis" }, { status: 400 });
    }

    // If no Resend key, skip email but still return success
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ ok: true, emailSent: false, message: "Compte créé (email non envoyé — RESEND_API_KEY manquante)" });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://orchestra-export.vercel.app"}/login`;

    const { error } = await resend.emails.send({
      from: "Orchestra Export <noreply@orchestra-export.vercel.app>",
      to: email,
      subject: "Accès à votre espace Orchestra Export International",
      html: `
        <div style="font-family: 'DM Sans', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: #1B2E6B; padding: 28px 32px; border-radius: 16px 16px 0 0;">
            <div style="color: #E40E20; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">ORCHESTRA</div>
            <div style="color: rgba(255,255,255,0.5); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;">Export International</div>
          </div>
          <div style="background: white; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 16px 16px; padding: 32px;">
            <h2 style="margin: 0 0 8px; color: #1A1A2E; font-size: 20px;">Bonjour ${name} 👋</h2>
            <p style="color: #6B7280; margin: 0 0 24px; line-height: 1.6;">
              Votre accès à l'outil de pilotage export international Orchestra vient d'être créé avec le rôle <strong>${role}</strong>.
            </p>

            <div style="background: #F4F6FB; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #374151;">Vos identifiants</p>
              <p style="margin: 0; font-size: 13px; color: #6B7280;">Email : <strong style="color: #1A1A2E;">${email}</strong></p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #6B7280;">Mot de passe temporaire : <strong style="color: #E40E20; font-family: monospace;">${tempPassword}</strong></p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #9CA3AF;">Pensez à changer votre mot de passe après la première connexion.</p>
            </div>

            <a href="${loginUrl}" style="display: inline-block; background: #E40E20; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Accéder à l'outil →
            </a>

            <p style="margin: 24px 0 0; font-size: 12px; color: #9CA3AF;">
              URL : <a href="${loginUrl}" style="color: #1B2E6B;">${loginUrl}</a>
            </p>
          </div>
          <p style="text-align: center; margin: 20px 0 0; font-size: 11px; color: #D1D5DB;">
            © 2026 Orchestra Prémaman — Confidentiel
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, emailSent: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
