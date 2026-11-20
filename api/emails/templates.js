/**
 * ORIGINYX — Shared Email Template System
 * =========================================
 * Provides HTML and plain-text email templates for all transactional emails.
 * All templates use inline CSS for maximum email-client compatibility.
 * Brand colours:
 *   Primary dark green : #244235
 *   Accent green       : #3a6b54
 *   Light green        : #e8f1ec
 *   Text dark          : #1c1c1c
 *   Text muted         : #6b7280
 *   White              : #ffffff
 *   Background         : #f4f7f5
 */

// ---------------------------------------------------------------------------
// Shared design tokens (email-safe, inline CSS values)
// ---------------------------------------------------------------------------
const T = {
  primaryDark: '#244235',
  primaryMid:  '#3a6b54',
  primaryLight:'#e8f1ec',
  accentGold:  '#c9a84c',
  textDark:    '#1c1c1c',
  textMid:     '#374151',
  textMuted:   '#6b7280',
  white:       '#ffffff',
  bg:          '#f4f7f5',
  border:      '#e2e8f0',
  danger:      '#dc2626',
  success:     '#16a34a',
};

// ---------------------------------------------------------------------------
// Shared logo block (uses hosted PNG; works in all email clients)
// ---------------------------------------------------------------------------
function logoBlock() {
  return `
    <div style="text-align:center; padding:0 0 8px 0;">
      <img src="https://originyx.in/logo.png"
           alt="Originyx"
           width="36"
           height="36"
           style="display:inline-block; border:0; line-height:36px; vertical-align:middle;"
      />
      <img src="https://originyx.in/brand.png"
           alt="Originyx"
           height="20"
           style="display:inline-block; border:0; vertical-align:middle; margin-left:8px; margin-top:8px;"
      />
    </div>`;
}

// ---------------------------------------------------------------------------
// Shared footer
// ---------------------------------------------------------------------------
function footerBlock() {
  const year = new Date().getFullYear();
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
           style="border-top:1px solid ${T.border}; margin-top:32px;">
      <tr>
        <td style="padding:24px 32px; text-align:center;">
          ${logoBlock()}
          <p style="font-family:Arial,sans-serif; font-size:12px; color:${T.textMuted};
                     line-height:1.6; margin:12px 0 6px 0;">
            &copy; ${year} Originyx. All rights reserved.
          </p>
          <p style="font-family:Arial,sans-serif; font-size:11px; color:${T.textMuted};
                     line-height:1.6; margin:0 0 8px 0;">
            AI Workflow Automation &amp; Business Systems Architecture
          </p>
          <p style="font-family:Arial,sans-serif; font-size:11px; color:${T.textMuted};
                     margin:0; line-height:1.6;">
            <a href="https://originyx.in" style="color:${T.primaryMid}; text-decoration:none;">originyx.in</a>
            &nbsp;&middot;&nbsp;
            <a href="https://originyx.in/privacy-policy/" style="color:${T.primaryMid}; text-decoration:none;">Privacy Policy</a>
            &nbsp;&middot;&nbsp;
            <a href="https://originyx.in/terms-and-conditions/" style="color:${T.primaryMid}; text-decoration:none;">Terms</a>
          </p>
          <p style="font-family:Arial,sans-serif; font-size:10px; color:${T.textMuted};
                     margin:12px 0 0 0; line-height:1.6;">
            You received this email because it relates to your Originyx account.
            This is an automated message &mdash; please do not reply directly to this email.
          </p>
        </td>
      </tr>
    </table>`;
}

// ---------------------------------------------------------------------------
// Wrapper — applies consistent outer chrome around any email body content
// ---------------------------------------------------------------------------
function emailWrapper(headerBg, headerContent, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Originyx</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width:600px) {
      .email-wrapper { width:100% !important; }
      .email-body { padding:24px 20px !important; }
      .email-header { padding:28px 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:${T.bg}; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
         style="background-color:${T.bg}; min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <!-- Email wrapper -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600"
               class="email-wrapper"
               style="max-width:600px; width:100%; background-color:${T.white};
                      border-radius:12px; overflow:hidden;
                      box-shadow:0 2px 16px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td class="email-header"
                style="background:${headerBg}; padding:36px 32px; text-align:center;">
              ${headerContent}
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="email-body" style="padding:36px 40px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:${T.bg}; border-radius:0 0 12px 12px;">
              ${footerBlock()}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// CTA Button
// ---------------------------------------------------------------------------
function ctaButton(label, href) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0"
           style="margin:28px auto 8px auto;">
      <tr>
        <td style="border-radius:8px; background-color:${T.primaryDark};">
          <a href="${href}"
             target="_blank"
             rel="noopener noreferrer"
             style="display:inline-block; padding:14px 32px;
                    font-family:Arial,sans-serif; font-size:15px; font-weight:700;
                    color:${T.white}; text-decoration:none; border-radius:8px;
                    letter-spacing:0.01em; mso-padding-alt:0;
                    background-color:${T.primaryDark};">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

// ---------------------------------------------------------------------------
// Security notice block (small)
// ---------------------------------------------------------------------------
function securityNotice(text) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
           style="margin-top:24px; background-color:${T.primaryLight};
                  border-radius:8px; border-left:3px solid ${T.primaryMid};">
      <tr>
        <td style="padding:14px 16px;">
          <p style="font-family:Arial,sans-serif; font-size:12px; color:${T.textMid};
                     margin:0; line-height:1.6;">
            🔒 ${text}
          </p>
        </td>
      </tr>
    </table>`;
}

// ---------------------------------------------------------------------------
// Utility: safe HTML escaping for user-supplied values
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ===========================================================================
// 1. WELCOME EMAIL
// ===========================================================================

/**
 * @param {Object} opts
 * @param {string} opts.name        - User's display name (or empty string)
 * @param {string} opts.email       - User's email address
 * @param {string} opts.provider    - 'email' | 'google' | 'microsoft'
 * @param {boolean} opts.needsVerification - true for email+password accounts awaiting verification
 * @returns {{ subject: string, html: string, text: string }}
 */
function welcomeEmail({ name, email, provider = 'email', needsVerification = false }) {
  const displayName = escapeHtml(name || 'there');

  const headerContent = `
    ${logoBlock()}
    <h1 style="font-family:Georgia,serif; font-size:28px; font-weight:700;
               color:${T.white}; margin:20px 0 6px 0; line-height:1.2;">
      Welcome to Originyx
    </h1>
    <p style="font-family:Arial,sans-serif; font-size:14px; color:rgba(255,255,255,0.85);
               margin:0; line-height:1.5;">
      Your account is ready. Let's build something extraordinary.
    </p>`;

  const verificationNote = needsVerification ? `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
           style="margin:20px 0; background-color:#fef3c7; border-radius:8px;
                  border-left:3px solid #d97706;">
      <tr>
        <td style="padding:14px 16px;">
          <p style="font-family:Arial,sans-serif; font-size:13px; color:#92400e;
                     margin:0; line-height:1.6;">
            <strong>One more step:</strong> Please verify your email address by clicking
            the verification link we sent alongside this email. Your account is created —
            you just need to confirm your email before you can sign in.
          </p>
        </td>
      </tr>
    </table>` : '';

  const providerNote = provider !== 'email' ? `
    <p style="font-family:Arial,sans-serif; font-size:14px; color:${T.textMid};
               margin:0 0 20px 0; line-height:1.6;">
      You signed up using your <strong>${escapeHtml(provider === 'google' ? 'Google' : 'Microsoft')}</strong> account.
      Your email is already verified — you can sign in immediately.
    </p>` : '';

  const bodyContent = `
    <p style="font-family:Arial,sans-serif; font-size:16px; color:${T.textDark};
               font-weight:600; margin:0 0 16px 0;">
      Hi ${displayName},
    </p>
    <p style="font-family:Arial,sans-serif; font-size:14px; color:${T.textMid};
               margin:0 0 16px 0; line-height:1.7;">
      Your Originyx account has been created successfully. We're glad you're here.
    </p>
    ${verificationNote}
    ${providerNote}
    <p style="font-family:Arial,sans-serif; font-size:14px; color:${T.textMid};
               margin:0 0 20px 0; line-height:1.7;">
      Originyx helps businesses eliminate operational friction by building intelligent
      AI workflow automation systems, autonomous agents, and enterprise-grade SaaS solutions
      tailored to your operations.
    </p>

    <!-- What's available -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
           style="margin:0 0 24px 0; background-color:${T.bg}; border-radius:8px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="font-family:Arial,sans-serif; font-size:12px; font-weight:700;
                     letter-spacing:0.08em; text-transform:uppercase; color:${T.primaryMid};
                     margin:0 0 12px 0;">
            What you can do with Originyx
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:6px 0; font-family:Arial,sans-serif; font-size:13px; color:${T.textMid}; line-height:1.6;">
                &#x2713;&nbsp; <strong>Explore Products</strong> — Discover HunterOS, AI Receptionist, ShadowOS and more
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0; font-family:Arial,sans-serif; font-size:13px; color:${T.textMid}; line-height:1.6;">
                &#x2713;&nbsp; <strong>Start a Project</strong> — Consult directly on custom AI automation
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0; font-family:Arial,sans-serif; font-size:13px; color:${T.textMid}; line-height:1.6;">
                &#x2713;&nbsp; <strong>Client Portal</strong> — Track your project, view deliverables, manage your account
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${ctaButton('Explore Originyx', 'https://originyx.in')}

    <p style="font-family:Arial,sans-serif; font-size:12px; color:${T.textMuted};
               text-align:center; margin:12px 0 0 0; line-height:1.6;">
      If the button above doesn't work, copy and paste this link into your browser:<br>
      <a href="https://originyx.in" style="color:${T.primaryMid}; word-break:break-all;">https://originyx.in</a>
    </p>

    ${securityNotice(`If you did not create an Originyx account, you can safely ignore this email. No action is required.`)}`;

  const headerGradient = `linear-gradient(135deg, ${T.primaryDark} 0%, ${T.primaryMid} 100%)`;

  const html = emailWrapper(headerGradient, headerContent, bodyContent);

  const text = `Welcome to Originyx, ${name || 'there'}!

Your account has been created successfully.

${needsVerification ? 'IMPORTANT: Please verify your email address using the separate verification email we sent you. Your account exists but requires verification before you can sign in.\n\n' : ''}${provider !== 'email' ? `You signed up with ${provider === 'google' ? 'Google' : 'Microsoft'} — your email is already verified.\n\n` : ''}What you can do with Originyx:
✓ Explore Products — HunterOS, AI Receptionist, ShadowOS and more
✓ Start a Project — Consult on custom AI automation
✓ Client Portal — Track your project, manage your account

Visit Originyx: https://originyx.in

—
© ${new Date().getFullYear()} Originyx | originyx.in
If you did not create this account, please ignore this email.`;

  return {
    subject: 'Welcome to Originyx | Your Account Is Ready',
    html,
    text,
  };
}

// ===========================================================================
// 2. ACCOUNT VERIFICATION EMAIL
// ===========================================================================

/**
 * @param {Object} opts
 * @param {string} opts.name           - User's display name
 * @param {string} opts.verificationUrl - The Supabase verification URL with token
 * @returns {{ subject: string, html: string, text: string }}
 */
function verificationEmail({ name, verificationUrl }) {
  const displayName = escapeHtml(name || 'there');
  const safeUrl = verificationUrl || '#';

  const headerContent = `
    ${logoBlock()}
    <div style="display:inline-block; background:rgba(255,255,255,0.15); border-radius:50%;
                width:60px; height:60px; line-height:60px; text-align:center;
                margin:16px auto 0 auto; font-size:28px;">
      &#x2709;
    </div>
    <h1 style="font-family:Georgia,serif; font-size:26px; font-weight:700;
               color:${T.white}; margin:16px 0 6px 0; line-height:1.2;">
      Verify Your Account
    </h1>
    <p style="font-family:Arial,sans-serif; font-size:14px; color:rgba(255,255,255,0.85);
               margin:0; line-height:1.5;">
      One click and you're in.
    </p>`;

  const bodyContent = `
    <p style="font-family:Arial,sans-serif; font-size:16px; color:${T.textDark};
               font-weight:600; margin:0 0 16px 0;">
      Hi ${displayName},
    </p>
    <p style="font-family:Arial,sans-serif; font-size:14px; color:${T.textMid};
               margin:0 0 16px 0; line-height:1.7;">
      Thank you for creating your Originyx account. To complete registration and activate
      your account, please verify your email address by clicking the button below.
    </p>
    <p style="font-family:Arial,sans-serif; font-size:14px; color:${T.textMid};
               margin:0 0 20px 0; line-height:1.7;">
      This verification step ensures the security of your account and confirms
      that you have access to this email address.
    </p>

    ${ctaButton('Verify My Account', safeUrl)}

    <!-- Expiry info -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
           style="margin:24px 0 0 0; background-color:${T.bg}; border-radius:8px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="font-family:Arial,sans-serif; font-size:13px; color:${T.textMid};
                     margin:0; line-height:1.6;">
            &#x23F0;&nbsp;<strong>Link expiration:</strong> This verification link will expire
            within <strong>24 hours</strong>. If it expires, you can request a new one by
            attempting to sign in and following the prompts.
          </p>
        </td>
      </tr>
    </table>

    <!-- Fallback link -->
    <p style="font-family:Arial,sans-serif; font-size:12px; color:${T.textMuted};
               margin:20px 0 0 0; line-height:1.7;">
      <strong>Button not working?</strong> Copy and paste the link below into your browser:
    </p>
    <p style="font-family:Arial,sans-serif; font-size:11px; color:${T.primaryMid};
               margin:6px 0 0 0; word-break:break-all; line-height:1.6;">
      <a href="${safeUrl}" style="color:${T.primaryMid}; text-decoration:underline;">${safeUrl}</a>
    </p>

    ${securityNotice(`If you did not create an Originyx account, please ignore this email. The link will expire automatically and no account will be activated without verification.`)}`;

  const headerGradient = `linear-gradient(135deg, #1a3a2a 0%, ${T.primaryMid} 60%, #4a8a6a 100%)`;

  const html = emailWrapper(headerGradient, headerContent, bodyContent);

  const text = `Verify Your Originyx Account

Hi ${name || 'there'},

Thank you for registering with Originyx. Please verify your email address to activate your account.

Click the link below to verify your email:
${safeUrl}

This link will expire in 24 hours. If it expires, sign in again to request a new verification email.

Security notice: If you did not create an Originyx account, please ignore this email.

—
© ${new Date().getFullYear()} Originyx | originyx.in`;

  return {
    subject: 'Verify Your Originyx Account',
    html,
    text,
  };
}

// ===========================================================================
// 3. LOGOUT NOTIFICATION & FEEDBACK EMAIL
// ===========================================================================

/**
 * @param {Object} opts
 * @param {string} opts.name       - User's display name
 * @param {string} opts.email      - User's email address
 * @param {string} opts.logoutTime - ISO timestamp of logout event
 * @returns {{ subject: string, html: string, text: string }}
 */
function logoutEmail({ name, email, logoutTime }) {
  const displayName = escapeHtml(name || 'there');
  const feedbackUrl = 'https://originyx.in/contact/';

  // Format date/time in IST
  let formattedTime = 'just now';
  try {
    if (logoutTime) {
      formattedTime = new Date(logoutTime).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      }) + ' IST';
    }
  } catch (_) { /* use default */ }

  const headerContent = `
    ${logoBlock()}
    <div style="display:inline-block; background:rgba(255,255,255,0.15); border-radius:50%;
                width:60px; height:60px; line-height:60px; text-align:center;
                margin:16px auto 0 auto; font-size:28px;">
      &#x1F510;
    </div>
    <h1 style="font-family:Georgia,serif; font-size:26px; font-weight:700;
               color:${T.white}; margin:16px 0 6px 0; line-height:1.2;">
      You've Been Logged Out
    </h1>
    <p style="font-family:Arial,sans-serif; font-size:14px; color:rgba(255,255,255,0.85);
               margin:0; line-height:1.5;">
      Your Originyx session has ended securely.
    </p>`;

  const bodyContent = `
    <p style="font-family:Arial,sans-serif; font-size:16px; color:${T.textDark};
               font-weight:600; margin:0 0 16px 0;">
      Hi ${displayName},
    </p>
    <p style="font-family:Arial,sans-serif; font-size:14px; color:${T.textMid};
               margin:0 0 16px 0; line-height:1.7;">
      Your Originyx session has ended successfully.
      Thank you for using Originyx. We hope your experience has been useful.
    </p>

    <!-- Session summary -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
           style="margin:0 0 24px 0; background-color:${T.bg}; border-radius:8px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="font-family:Arial,sans-serif; font-size:12px; font-weight:700;
                     letter-spacing:0.08em; text-transform:uppercase; color:${T.primaryMid};
                     margin:0 0 12px 0;">
            Session Summary
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:5px 0; font-family:Arial,sans-serif; font-size:13px; color:${T.textMuted}; width:40%;">
                Status
              </td>
              <td style="padding:5px 0; font-family:Arial,sans-serif; font-size:13px; color:${T.textDark}; font-weight:600;">
                &#x2714; Signed out successfully
              </td>
            </tr>
            <tr>
              <td style="padding:5px 0; font-family:Arial,sans-serif; font-size:13px; color:${T.textMuted};">
                Time
              </td>
              <td style="padding:5px 0; font-family:Arial,sans-serif; font-size:13px; color:${T.textDark}; font-weight:600;">
                ${escapeHtml(formattedTime)}
              </td>
            </tr>
            <tr>
              <td style="padding:5px 0; font-family:Arial,sans-serif; font-size:13px; color:${T.textMuted};">
                Account
              </td>
              <td style="padding:5px 0; font-family:Arial,sans-serif; font-size:13px; color:${T.textDark};">
                ${escapeHtml(email || '')}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Feedback ask -->
    <p style="font-family:Arial,sans-serif; font-size:14px; color:${T.textMid};
               margin:0 0 20px 0; line-height:1.7;">
      We would appreciate a few moments of your time to understand how we can improve
      Originyx for you and your team.
    </p>

    ${ctaButton('Share Your Feedback', feedbackUrl)}

    <p style="font-family:Arial,sans-serif; font-size:12px; color:${T.textMuted};
               text-align:center; margin:12px 0 0 0; line-height:1.6;">
      If the button above doesn't work:<br>
      <a href="${feedbackUrl}" style="color:${T.primaryMid}; word-break:break-all;">${feedbackUrl}</a>
    </p>

    ${securityNotice(`If you did not initiate this logout, please sign back in immediately and change your password. Contact us at <a href="mailto:info@originyx.in" style="color:${T.primaryMid};">info@originyx.in</a> if you need assistance.`)}`;

  const headerGradient = `linear-gradient(135deg, #1a3a2a 0%, ${T.primaryDark} 50%, ${T.primaryMid} 100%)`;

  const html = emailWrapper(headerGradient, headerContent, bodyContent);

  const text = `You've Been Logged Out of Originyx

Hi ${name || 'there'},

Your Originyx session has ended successfully.
Thank you for using Originyx. We hope your experience has been useful.

Session Summary:
  Status  : Signed out successfully
  Time    : ${formattedTime}
  Account : ${email || ''}

We would appreciate a few moments of your time to understand how we can improve.
Share your feedback: ${feedbackUrl}

Security: If you did not initiate this logout, please sign back in and change your password.

—
© ${new Date().getFullYear()} Originyx | originyx.in`;

  return {
    subject: "You've been Logged Out of Originyx",
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
export { welcomeEmail, verificationEmail, logoutEmail, escapeHtml };
