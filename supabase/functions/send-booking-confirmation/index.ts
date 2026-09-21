import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CONFIRMATION_URL =
  "https://norvexauto.netlify.app/confirmare?token=";
const RESEND_FROM = "Norvex Automotive <onboarding@resend.dev>";

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const buildEmailHtml = (reservation: Record<string, unknown>, confirmationLink: string) => {
  const prenume = escapeHtml(reservation.prenume);
  const confirmationUrl = escapeHtml(confirmationLink);
  const details = [
    ["Nume", `${reservation.prenume ?? ""} ${reservation.nume ?? ""}`],
    ["Telefon", reservation.telefon],
    ["Mașină", reservation.tip_masina],
    ["Număr mașină", reservation.numar_masina],
    ["Categorie", reservation.categorie_serviciu],
    ["Pachet", reservation.pachet_selectat],
  ];

  const detailRows = details
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 0;color:#b9b1a4;font-size:13px;width:38%;">${escapeHtml(label)}</td>
          <td style="padding:10px 0;color:#f2ede3;font-size:13px;font-weight:600;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `
    <!doctype html>
    <html lang="ro">
      <body style="margin:0;background:#090806;color:#f2ede3;font-family:Arial,Helvetica,sans-serif;">
        <div style="padding:32px 16px;background:#090806;">
          <div style="max-width:600px;margin:0 auto;background:#11100c;border:1px solid #4b3b1c;">
            <div style="padding:30px 32px;border-bottom:1px solid #4b3b1c;">
              <div style="color:#d2ad59;font-size:12px;letter-spacing:4px;text-transform:uppercase;">NORVEX AUTOMOTIVE</div>
              <h1 style="margin:22px 0 0;color:#f2ede3;font-size:28px;font-weight:600;">Confirmă rezervarea</h1>
            </div>
            <div style="padding:32px;">
              <p style="margin:0 0 16px;color:#f2ede3;font-size:16px;">Salut, ${prenume}!</p>
              <p style="margin:0 0 20px;color:#c4bdb1;font-size:15px;line-height:1.7;">
                Am primit solicitarea ta de programare la Norvex Automotive.
                Pentru a finaliza rezervarea, confirmă solicitarea apăsând butonul de mai jos.
              </p>
              <table role="presentation" style="width:100%;border-collapse:collapse;margin:20px 0 28px;border-top:1px solid #3b301b;border-bottom:1px solid #3b301b;">
                ${detailRows}
              </table>
              <div style="text-align:center;margin:30px 0;">
                <a href="${confirmationUrl}" style="display:inline-block;background:#d2ad59;color:#090806;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:1px;padding:15px 24px;">
                  CONFIRMĂ REZERVAREA
                </a>
              </div>
              <p style="margin:0 0 10px;color:#c4bdb1;font-size:13px;line-height:1.6;">
                Linkul de confirmare este valabil timp de 24 de ore.
              </p>
              <p style="margin:0 0 8px;color:#c4bdb1;font-size:13px;line-height:1.6;">
                Dacă butonul nu funcționează, copiază acest link în browser:
              </p>
              <p style="margin:0 0 24px;word-break:break-all;font-size:12px;line-height:1.6;">
                <a href="${confirmationUrl}" style="color:#d2ad59;">${confirmationUrl}</a>
              </p>
              <p style="margin:0;color:#81796d;font-size:12px;line-height:1.6;">
                Dacă nu ai făcut această rezervare, poți ignora acest email.
              </p>
            </div>
            <div style="padding:20px 32px;border-top:1px solid #4b3b1c;color:#81796d;font-size:11px;">
              Norvex Automotive
            </div>
          </div>
        </div>
      </body>
    </html>`;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  let body: { reservationId?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const reservationId =
    typeof body.reservationId === "string" ? body.reservationId.trim() : "";

  if (!reservationId || reservationId.length > 100) {
    return jsonResponse(400, { error: "Invalid reservation ID" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    console.error("Required server configuration is missing");
    return jsonResponse(500, { error: "Server configuration is incomplete" });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: reservation, error: reservationError } = await supabaseAdmin
    .from("rezervari_norvex")
    .select(
      "id, created_at, nume, prenume, tip_masina, numar_masina, categorie_serviciu, pachet_selectat, status, email, telefon, confirmation_token, confirmation_expires_at, confirmation_sent_at"
    )
    .eq("id", reservationId)
    .maybeSingle();

  if (reservationError) {
    console.error("Reservation lookup error:", reservationError);
    return jsonResponse(500, { error: "Could not load reservation" });
  }

  if (!reservation) {
    return jsonResponse(404, { error: "Reservation not found" });
  }

  console.log(`Reservation ${reservation.id}: processing confirmation email`);

  if (reservation.confirmation_sent_at) {
    console.log(`Reservation ${reservation.id}: confirmation email already sent`);
    return jsonResponse(200, {
      ok: true,
      alreadySent: true,
      emailAlreadySent: true,
    });
  }

  const email = typeof reservation.email === "string"
    ? reservation.email.trim()
    : "";

  if (!email || !isValidEmail(email)) {
    return jsonResponse(400, { error: "Reservation email is invalid" });
  }

  const confirmationToken =
    typeof reservation.confirmation_token === "string" &&
      reservation.confirmation_token
      ? reservation.confirmation_token
      : crypto.randomUUID();
  const confirmationExpiresAt =
    typeof reservation.confirmation_expires_at === "string" &&
      reservation.confirmation_expires_at
      ? reservation.confirmation_expires_at
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  if (
    confirmationToken !== reservation.confirmation_token ||
    confirmationExpiresAt !== reservation.confirmation_expires_at
  ) {
    const { error: tokenUpdateError } = await supabaseAdmin
      .from("rezervari_norvex")
      .update({
        confirmation_token: confirmationToken,
        confirmation_expires_at: confirmationExpiresAt,
      })
      .eq("id", reservation.id);

    if (tokenUpdateError) {
      console.error("Confirmation token update error:", tokenUpdateError);
      return jsonResponse(500, {
        error: "Could not prepare confirmation token",
      });
    }
  }

  const confirmationLink =
    `${CONFIRMATION_URL}${encodeURIComponent(confirmationToken)}`;
  const emailHtml = buildEmailHtml(reservation, confirmationLink);
  const resend = new Resend(resendApiKey);

  console.log(`Reservation ${reservation.id}: sending confirmation email`);
  const { data, error } = await resend.emails.send({
    from: RESEND_FROM,
    to: [email],
    subject: "Confirmă rezervarea ta la Norvex Automotive",
    html: emailHtml,
  });

  if (error) {
    console.error("Resend error:", error);
    return jsonResponse(502, { error: "Confirmation email failed" });
  }

  console.log(`Reservation ${reservation.id}: Resend email accepted`, data
    ? { emailId: data.id }
    : undefined);

  const { error: sentAtError } = await supabaseAdmin
    .from("rezervari_norvex")
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq("id", reservation.id)
    .is("confirmation_sent_at", null);

  if (sentAtError) {
    console.error("confirmation_sent_at update error:", sentAtError);
    return jsonResponse(500, {
      error: "Event accepted but reservation status could not be updated",
    });
  }

  return jsonResponse(200, {
    ok: true,
    emailAlreadySent: false,
    emailId: data?.id ?? null,
  });
});
