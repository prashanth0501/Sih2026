export function renderAdminResetNoticeEmail(params: {
  userName: string;
  resetUrl: string;
  adminActorName?: string;
  expiresInMinutes?: number;
}): { html: string; text: string } {
  const { userName, resetUrl, adminActorName = 'Portal Coordinator', expiresInMinutes = 60 } = params;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Password Reset Requested — Ignite SIH 2026</title>
</head>
<body style="font-family: 'Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fcf8ef; margin: 0; padding: 24px; color: #241b3a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid rgba(36,27,58,0.12); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <tr>
      <td style="background-color: #241b3a; padding: 28px 32px; text-align: center;">
        <h1 style="color: #ff7a1a; font-family: 'IBM Plex Mono', monospace; font-size: 24px; margin: 0; letter-spacing: 1px;">IGNITE — SIH 2026</h1>
        <p style="color: #ffa92e; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Admin Initiated Password Reset</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 36px 32px;">
        <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; color: #241b3a;">Hello ${userName},</h2>
        <p style="font-size: 15px; line-height: 1.6; color: rgba(36,27,58,0.85); margin-bottom: 24px;">
          An administrator (<strong>${adminActorName}</strong>) initiated a secure password reset link for your account. Please click the button below to choose a new password:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #ff7a1a; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; display: inline-block; box-shadow: 0 2px 6px rgba(255,122,26,0.3);">
            Set New Password
          </a>
        </div>
        <p style="font-size: 13px; color: rgba(36,27,58,0.65); line-height: 1.5;">
          This link will expire in <strong>${expiresInMinutes} minutes</strong>. If you did not request help resetting your account, please verify with your NCET coordinator.
        </p>
        <hr style="border: 0; border-top: 1px solid rgba(36,27,58,0.1); margin: 28px 0;" />
        <p style="font-size: 12px; color: rgba(36,27,58,0.5); word-break: break-all;">
          Or copy and paste this link into your browser:<br />
          <a href="${resetUrl}" style="color: #4a3ab4;">${resetUrl}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #fcf8ef; padding: 20px 32px; text-align: center; border-top: 1px solid rgba(36,27,58,0.08);">
        <p style="font-size: 12px; color: rgba(36,27,58,0.6); margin: 0;">
          Ignite Admin Console • NCET Smart India Hackathon 2026
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hello ${userName},\n\nAn administrator (${adminActorName}) requested a password reset for your account.\nPlease use the link below to set a new password:\n${resetUrl}\n\nLink expires in ${expiresInMinutes} minutes.`;

  return { html, text };
}
