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
// 1. WELCOME EMAIL (Originyx Redesigned Visual Layout)
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
  const year = new Date().getFullYear();

  // CTA button configuration based on verification state & provider
  let ctaText = 'Verify Email Address \u2192';
  let ctaUrl = 'https://originyx.in/client-portal/';
  if (!needsVerification) {
    ctaText = 'Explore Originyx \u2192';
    ctaUrl = 'https://originyx.in';
  }

  // Verification callout box content
  let calloutIconSvg = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>`;
  let calloutTitle = 'Verify your email address';
  let calloutSubtext = 'Before accessing your account, please verify your email address to activate your Originyx account.';

  if (!needsVerification) {
    const providerName = provider === 'google' ? 'Google' : (provider === 'microsoft' ? 'Microsoft' : 'Originyx');
    calloutIconSvg = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>`;
    calloutTitle = `Account ready with ${escapeHtml(providerName)}`;
    calloutSubtext = `You signed up using your ${escapeHtml(providerName)} account. Your email is already verified and you can explore Originyx directly.`;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Welcome to Originyx</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width:600px) {
      .email-wrapper { width:100% !important; border-radius:0 !important; }
      .email-body-inner { padding:24px 20px !important; }
      .grid-card-cell { display:block !important; width:100% !important; padding:0 0 12px 0 !important; }
      .banner-stack { display:block !important; width:100% !important; text-align:left !important; }
      .banner-btn-cell { display:block !important; width:100% !important; padding-top:14px !important; text-align:left !important; }
      .h1-headline { font-size:26px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f4f7f5; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f7f5; min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- EMAIL CONTAINER -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="email-wrapper"
               style="max-width:600px; width:100%; background-color:#ffffff; border-radius:18px; border:1px solid #e5e7eb; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.04);">

          <!-- TOP DECORATIVE ACCENT & LOGO -->
          <tr>
            <td style="padding:36px 36px 12px 36px; background:linear-gradient(180deg, #f0f7f3 0%, #ffffff 160px); text-align:center;">
              <!-- LOGO -->
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
                <tr>
                  <td align="center" valign="middle">
                    <img src="https://originyx.in/logo.png" alt="Originyx Icon" width="28" height="28" style="display:inline-block; border:0; vertical-align:middle;" />
                    <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:16px; font-weight:800; letter-spacing:0.18em; color:#0f172a; vertical-align:middle; margin-left:8px; display:inline-block;">ORIGINYX</span>
                  </td>
                </tr>
              </table>

              <!-- HEADLINE -->
              <h1 class="h1-headline" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:32px; font-weight:800; color:#111827; letter-spacing:-0.02em; line-height:1.2; margin:28px 0 8px 0; text-align:center;">
                Welcome to <span style="color:#1b4332;">Originyx.</span>
              </h1>
              <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:17px; font-weight:500; color:#374151; margin:0 0 20px 0; text-align:center;">
                ${name ? `Hi ${displayName}, your account has been created successfully.` : 'Your account has been created successfully.'}
              </p>

              <!-- INTRO PARAGRAPH -->
              <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:14px; line-height:1.65; color:#4b5563; margin:0 auto 28px auto; max-width:510px; text-align:center;">
                Originyx works with businesses to identify operational bottlenecks, design intelligent workflows, and build automation systems that improve how their operations function.
              </p>
            </td>
          </tr>

          <!-- BODY INNER -->
          <tr>
            <td class="email-body-inner" style="padding:0 36px 36px 36px;">

              <!-- VERIFY EMAIL ADDRESS CALLOUT BOX -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                     style="margin:0 0 24px 0; background-color:#fff7ed; border:1px solid #ffedd5; border-radius:14px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <!-- Icon box -->
                        <td width="48" valign="middle" style="padding-right:16px;">
                          <div style="width:44px; height:44px; background-color:#ffedd5; border-radius:10px; text-align:center; line-height:44px;">
                            ${calloutIconSvg}
                          </div>
                        </td>
                        <!-- Vertical divider line -->
                        <td width="1" style="background-color:#fed7aa; font-size:1px; line-height:1px;">&nbsp;</td>
                        <!-- Text description -->
                        <td style="padding-left:16px;" valign="middle">
                          <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:15px; font-weight:700; color:#111827; margin:0 0 3px 0;">
                            ${calloutTitle}
                          </p>
                          <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:13px; color:#6b7280; line-height:1.45; margin:0;">
                            ${calloutSubtext}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- PRIMARY ORANGE PILL BUTTON -->
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:20px auto 36px auto;">
                <tr>
                  <td align="center" style="border-radius:9999px; background-color:#eb5e1e;">
                    <a href="${ctaUrl}"
                       target="_blank"
                       rel="noopener noreferrer"
                       style="display:inline-block; padding:14px 38px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:9999px; background-color:#eb5e1e; letter-spacing:0.01em;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- SECTION DIVIDER & TITLE: WHAT YOU CAN EXPLORE WITH ORIGINYX -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:8px 0 24px 0;">
                <tr>
                  <td width="15%" style="border-bottom:1px solid #e5e7eb; font-size:1px; line-height:1px;">&nbsp;</td>
                  <td align="center" style="padding:0 12px; white-space:nowrap;">
                    <h2 style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:18px; font-weight:800; color:#1b4332; margin:0; letter-spacing:-0.01em;">
                      What you can explore with Originyx
                    </h2>
                  </td>
                  <td width="15%" style="border-bottom:1px solid #e5e7eb; font-size:1px; line-height:1px;">&nbsp;</td>
                </tr>
              </table>

              <!-- 2x2 CARDS GRID -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px 0;">
                <!-- ROW 1 -->
                <tr>
                  <!-- CARD 1: INTELLIGENT AUTOMATION -->
                  <td class="grid-card-cell" width="50%" valign="top" style="padding:0 6px 12px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                           style="background-color:#ffffff; border:1px solid #e5e7eb; border-radius:12px; height:100%;">
                      <tr>
                        <td style="padding:16px 18px;" valign="top">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="42" valign="top">
                                <div style="width:38px; height:38px; background-color:#ecfdf5; border-radius:8px; text-align:center; line-height:38px;">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;">
                                    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
                                    <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2 12.5"/>
                                    <path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2 17.5"/>
                                  </svg>
                                </div>
                              </td>
                              <td valign="top" style="padding-left:12px;">
                                <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:15px; font-weight:700; color:#111827; margin:0 0 4px 0;">
                                  Intelligent Automation
                                </p>
                                <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:12.5px; color:#4b5563; line-height:1.45; margin:0;">
                                  Explore workflow automation systems designed to reduce repetitive operational work and improve execution.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- CARD 2: BUSINESS SYSTEMS -->
                  <td class="grid-card-cell" width="50%" valign="top" style="padding:0 0 12px 6px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                           style="background-color:#ffffff; border:1px solid #e5e7eb; border-radius:12px; height:100%;">
                      <tr>
                        <td style="padding:16px 18px;" valign="top">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="42" valign="top">
                                <div style="width:38px; height:38px; background-color:#ecfdf5; border-radius:8px; text-align:center; line-height:38px;">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;">
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                  </svg>
                                </div>
                              </td>
                              <td valign="top" style="padding-left:12px;">
                                <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:15px; font-weight:700; color:#111827; margin:0 0 4px 0;">
                                  Business Systems
                                </p>
                                <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:12.5px; color:#4b5563; line-height:1.45; margin:0;">
                                  Discover solutions built around operational requirements, process efficiency, and business workflows.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- ROW 2 -->
                <tr>
                  <!-- CARD 3: PROJECT CONSULTATION -->
                  <td class="grid-card-cell" width="50%" valign="top" style="padding:0 6px 0 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                           style="background-color:#ffffff; border:1px solid #e5e7eb; border-radius:12px; height:100%;">
                      <tr>
                        <td style="padding:16px 18px;" valign="top">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="42" valign="top">
                                <div style="width:38px; height:38px; background-color:#ecfdf5; border-radius:8px; text-align:center; line-height:38px;">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;">
                                    <path d="M18 20V10"/>
                                    <path d="M12 20V4"/>
                                    <path d="M6 20v-6"/>
                                  </svg>
                                </div>
                              </td>
                              <td valign="top" style="padding-left:12px;">
                                <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:15px; font-weight:700; color:#111827; margin:0 0 4px 0;">
                                  Project Consultation
                                </p>
                                <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:12.5px; color:#4b5563; line-height:1.45; margin:0;">
                                  Share your operational challenges, workflow requirements, and expected outcomes for architectural review.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- CARD 4: CLIENT PORTAL -->
                  <td class="grid-card-cell" width="50%" valign="top" style="padding:0 0 0 6px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                           style="background-color:#ffffff; border:1px solid #e5e7eb; border-radius:12px; height:100%;">
                      <tr>
                        <td style="padding:16px 18px;" valign="top">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="42" valign="top">
                                <div style="width:38px; height:38px; background-color:#ecfdf5; border-radius:8px; text-align:center; line-height:38px;">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;">
                                    <rect width="20" height="14" x="2" y="3" rx="2"/>
                                    <line x1="8" x2="16" y1="21" y2="21"/>
                                    <line x1="12" x2="12" y1="17" y2="21"/>
                                  </svg>
                                </div>
                              </td>
                              <td valign="top" style="padding-left:12px;">
                                <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:15px; font-weight:700; color:#111827; margin:0 0 4px 0;">
                                  Client Portal
                                </p>
                                <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:12.5px; color:#4b5563; line-height:1.45; margin:0;">
                                  Access your projects, track deliverables, and manage your engagement with Originyx.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- BOTTOM BANNER: BUILD SYSTEMS AROUND YOUR OPERATIONS -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                     style="background-color:#163627; background-image:linear-gradient(135deg, #163627 0%, #1b4332 100%); border-radius:14px; overflow:hidden;">
                <tr>
                  <td style="padding:22px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <!-- Left: Title & Subtitle with orange accent -->
                        <td class="banner-stack" valign="middle">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="4" style="background-color:#ea580c; border-radius:2px; font-size:1px; line-height:1px;">&nbsp;</td>
                              <td style="padding-left:10px;">
                                <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:17px; font-weight:700; color:#ffffff; line-height:1.2;">
                                  Build systems around your operations.
                                </span>
                              </td>
                            </tr>
                          </table>
                          <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:12.5px; color:rgba(255,255,255,0.85); line-height:1.45; margin:8px 0 0 0;">
                            From identifying workflow inefficiencies to implementing intelligent automation, Originyx focuses on building systems that address real operational requirements.
                          </p>
                        </td>

                        <!-- Right: White Pill Button -->
                        <td class="banner-btn-cell" width="160" align="right" valign="middle" style="padding-left:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" align="right">
                            <tr>
                              <td align="center" style="border-radius:9999px; background-color:#ffffff;">
                                <a href="https://originyx.in"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   style="display:inline-block; padding:10px 22px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:13px; font-weight:700; color:#111827; text-decoration:none; border-radius:9999px; background-color:#ffffff; white-space:nowrap;">
                                  Explore Originyx &rarr;
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- FOOTER SECTION -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #e5e7eb; margin-top:32px;">
                <tr>
                  <td align="center" style="padding-top:24px; text-align:center;">
                    <!-- Footer Logo -->
                    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 8px auto;">
                      <tr>
                        <td align="center" valign="middle">
                          <img src="https://originyx.in/logo.png" alt="Originyx" width="20" height="20" style="display:inline-block; border:0; vertical-align:middle;" />
                          <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:13px; font-weight:800; letter-spacing:0.15em; color:#0f172a; vertical-align:middle; margin-left:6px; display:inline-block;">ORIGINYX</span>
                        </td>
                      </tr>
                    </table>

                    <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:12px; color:#6b7280; margin:0 0 10px 0; line-height:1.5;">
                      AI Workflow Automation &amp; Business Systems Architecture
                    </p>

                    <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:11px; color:#6b7280; margin:0 0 14px 0; line-height:1.5;">
                      <a href="https://originyx.in" style="color:#059669; text-decoration:none;">originyx.in</a>
                      &nbsp;&middot;&nbsp;
                      <a href="https://originyx.in/privacy-policy/" style="color:#059669; text-decoration:none;">Privacy Policy</a>
                      &nbsp;&middot;&nbsp;
                      <a href="https://originyx.in/terms-and-conditions/" style="color:#059669; text-decoration:none;">Terms</a>
                    </p>

                    <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:11px; color:#9ca3af; margin:0 0 4px 0; line-height:1.5;">
                      If you did not create this account, you can safely ignore this email.
                    </p>
                    <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:11px; color:#9ca3af; margin:0; line-height:1.5;">
                      This is an automated account notification. Please do not reply directly to this email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hi ${name || 'there'},

Welcome to Originyx.
Your account has been created successfully.

Originyx works with businesses to identify operational bottlenecks, design intelligent workflows, and build automation systems that improve how their operations function.

${needsVerification ? '[Verify your email address]\nBefore accessing your account, please verify your email address to activate your Originyx account.\nVerify Email Address: https://originyx.in/client-portal/\n\n' : ''}${provider !== 'email' ? `You signed up using your ${provider === 'google' ? 'Google' : 'Microsoft'} account. Your email is already verified.\n\n` : ''}What you can explore with Originyx:
• Intelligent Automation — Explore workflow automation systems designed to reduce repetitive operational work and improve execution.
• Business Systems — Discover solutions built around operational requirements, process efficiency, and business workflows.
• Project Consultation — Share your operational challenges, workflow requirements, and expected outcomes for architectural review.
• Client Portal — Access your projects, track deliverables, and manage your engagement with Originyx.

Build systems around your operations.
From identifying workflow inefficiencies to implementing intelligent automation, Originyx focuses on building systems that address real operational requirements.
Explore Originyx: https://originyx.in

—
ORIGINYX
AI Workflow Automation & Business Systems Architecture
https://originyx.in • Privacy: https://originyx.in/privacy-policy/ • Terms: https://originyx.in/terms-and-conditions/
If you did not create this account, you can safely ignore this email.
This is an automated account notification. Please do not reply directly to this email.`;

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
