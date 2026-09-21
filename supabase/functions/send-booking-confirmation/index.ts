import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

const formatDate = (value: unknown) => {
  if (typeof value !== "string" || !value) return "data stabilită";
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
};

const formatTime = (value: unknown) =>
  typeof value === "string" && value ? value.slice(0, 5) : "ora stabilită";

const buildEmailHtml = (reservation: Record<string, unknown>) => {
  const firstName = escapeHtml(reservation.prenume);
  const appointmentDate = escapeHtml(formatDate(reservation.data_programare));
  const appointmentTime = escapeHtml(formatTime(reservation.ora_programare));
  const details = [
    ["Nume", `${reservation.prenume ?? ""} ${reservation.nume ?? ""}`],
    ["Telefon", reservation.telefon],
    ["Mașină", reservation.tip_masina],
    ["Număr mașină", reservation.numar_masina],
    ["Categorie", reservation.categorie_serviciu],
    ["Pachet", reservation.pachet_selectat],
    ["Data", formatDate(reservation.data_programare)],
    ["Ora", formatTime(reservation.ora_programare)],
  ];

  const detailRows = details
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 0;color:#b9b1a4;font-size:13px;width:38%;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:10px 0;color:#f2ede3;font-size:13px;font-weight:600;">
            ${escapeHtml(value)}
          </td>
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
              <div style="color:#d2ad59;font-size:12px;letter-spacing:4px;text-transform:uppercase;">
                NORVEX AUTOMOTIVE
              </div>
              <h1 style="margin:22px 0 0;color:#f2ede3;font-size:28px;font-weight:600;">
                Rezervarea ta a fost acceptată
              </h1>
            </div>
            <div style="padding:32px;">
              <p style="margin:0 0 16px;color:#f2ede3;font-size:16px;">
                Salut, ${firstName}!
              </p>
              <p style="margin:0 0 20px;color:#c4bdb1;font-size:15px;line-height:1.7;">
                Rezervarea ta la Norvex Automotive a fost acceptată.
                Te așteptăm pe <strong style="color:#f2ede3;">${appointmentDate}</strong>,
                la ora <strong style="color:#f2ede3;">${appointmentTime}</strong>.
              </p>
              <table role="presentation" style="width:100%;border-collapse:collapse;margin:20px 0 28px;border-top:1px solid #3b301b;border-bottom:1px solid #3b301b;">
                ${detailRows}
              </table>
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
      "id, nume, prenume, tip_masina, numar_masina, categorie_serviciu, pachet_selectat, email, telefon, data_programare, ora_programare, confirmation_sent_at"
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

  console.log(`Reservation ${reservation.id}: processing acceptance email`);

  if (reservation.confirmation_sent_at) {
    console.log(`Reservation ${reservation.id}: acceptance email already sent`);
    return jsonResponse(200, {
      ok: true,
      alreadySent: true,
    });
  }

  const email =
    typeof reservation.email === "string" ? reservation.email.trim() : "";

  if (!email || !isValidEmail(email)) {
    return jsonResponse(400, { error: "Reservation email is invalid" });
  }

  const resend = new Resend(resendApiKey);
  const emailHtml = buildEmailHtml(reservation);

  console.log(`Reservation ${reservation.id}: sending acceptance email`);
  const { data, error } = await resend.emails.send({
    from: RESEND_FROM,
    to: [email],
    subject: "Rezervarea ta la Norvex Automotive a fost acceptată",
    html: emailHtml,
  });

  if (error) {
    console.error("Resend error:", error);
    return jsonResponse(502, { error: "Acceptance email failed" });
  }

  console.log(
    `Reservation ${reservation.id}: Resend email accepted`,
    data ? { emailId: data.id } : undefined,
  );

  const { error: sentAtError } = await supabaseAdmin
    .from("rezervari_norvex")
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq("id", reservation.id)
    .is("confirmation_sent_at", null);

  if (sentAtError) {
    console.error("confirmation_sent_at update error:", sentAtError);
    return jsonResponse(500, {
      error: "Email accepted but reservation could not be updated",
    });
  }

  return jsonResponse(200, {
    ok: true,
    alreadySent: false,
    emailId: data?.id ?? null,
  });
});
