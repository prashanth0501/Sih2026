export function renderPasswordChangedEmail(params: {
  userName: string;
  timestampText: string;
  userAgentInfo?: string;
}): { html: string; text: string } {
  const { userName, timestampText, userAgentInfo = 'Unknown Device/Browser' } = params;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed Confirmation — Ignite SIH 2026</title>
</head>
<body style="font-family: 'Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fcf8ef; margin: 0; padding: 24px; color: #241b3a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid rgba(36,27,58,0.12); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <tr>
      <td style="background-color: #241b3a; padding: 28px 32px; text-align: center;">
        <h1 style="color: #ff7a1a; font-family: 'IBM Plex Mono', monospace; font-size: 24px; margin: 0; letter-spacing: 1px;">IGNITE — SIH 2026</h1>
        <p style="color: #ffa92e; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Security Advisory</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 36px 32px;">
        <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; color: #241b3a;">Hello ${userName},</h2>
        <p style="font-size: 15px; line-height: 1.6; color: rgba(36,27,58,0.85);">
          This email confirms that the password for your Ignite SIH 2026 portal account was successfully changed.
        </p>
        <div style="background-color: #f8f9fa; border: 1px solid rgba(36,27,58,0.1); border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 13px; color: rgba(36,27,58,0.8);">
          <p style="margin: 0 0 8px 0;"><strong>Timestamp:</strong> ${timestampText}</p>
          <p style="margin: 0;"><strong>Client Info:</strong> ${userAgentInfo}</p>
        </div>
        <p style="font-size: 13px; color: #d9534f; line-height: 1.5;">
          <strong>Did you not make this change?</strong> If you did not update your password, your account may be compromised. Please contact the NCET SIH Admin team immediately.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #fcf8ef; padding: 20px 32px; text-align: center; border-top: 1px solid rgba(36,27,58,0.08);">
        <p style="font-size: 12px; color: rgba(36,27,58,0.6); margin: 0;">
          Ignite Security • NCET Smart India Hackathon 2026
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hello ${userName},\n\nYour password for Ignite SIH 2026 was changed on ${timestampText} (${userAgentInfo}).\nIf you did not initiate this change, contact administrator support immediately.`;

  return { html, text };
}
