import { Resend } from 'resend';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Retrieve Supabase and Resend environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Database environment variables are missing.' });
  }

  // Parse authorization token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing access token' });
  }
  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify user token against Supabase Auth API
    const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!authRes.ok) {
      const authErr = await authRes.json();
      return res.status(401).json({ error: `Unauthorized: ${authErr.error_description || 'Invalid token'}` });
    }

    const userData = await authRes.json();
    const userId = userData.id;
    const userEmail = userData.email;

    // 2. Parse request body
    const body = req.body;
    const {
      name,
      businessName,
      phone,
      industry,
      projectType,
      workflowDescription,
      challenges,
      desiredOutcome,
      notes,
      sourcePage,
      sourceCta,
      productInterest
    } = body;

    // Validate required fields
    if (!name || !businessName || !industry || !projectType || !workflowDescription || !challenges || !desiredOutcome) {
      return res.status(400).json({ error: 'All primary fields are required.' });
    }

    // 3. Compute Lead Score (future-proofed lead scoring system)
    let leadScore = 0;
    // Business email check (+3)
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com'];
    if (userEmail && userEmail.includes('@')) {
      const domain = userEmail.split('@')[1].toLowerCase().trim();
      if (!personalDomains.includes(domain)) {
        leadScore += 3;
      }
    }
    // Company name (+2)
    if (businessName && businessName.trim().length > 0 && !/^(n\/a|none|no)$/i.test(businessName.trim())) {
      leadScore += 2;
    }
    // Detailed descriptions check (+2 for long workflow description, +2 for long challenges)
    if (workflowDescription && workflowDescription.trim().length > 100) leadScore += 2;
    if (challenges && challenges.trim().length > 100) leadScore += 2;
    // Phone number provided (+1)
    if (phone && phone.trim().length > 0) leadScore += 1;

    // 4. Insert project request into Supabase Database
    const requestData = {
      user_id: userId,
      name,
      email: userEmail,
      business_name: businessName,
      phone: phone || null,
      industry,
      project_type: projectType,
      workflow_description: workflowDescription,
      challenges,
      desired_outcome: desiredOutcome,
      notes: notes || null,
      status: 'New',
      source_page: sourcePage || null,
      source_cta: sourceCta || null,
      product_interest: productInterest || null,
      lead_score: leadScore
    };

    const dbRes = await fetch(`${supabaseUrl}/rest/v1/project_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(requestData)
    });

    if (!dbRes.ok) {
      const dbErr = await dbRes.text();
      console.error('Database insertion error details:', dbErr);
      return res.status(500).json({ error: 'Failed to write project request to the database.' });
    }

    const insertedData = await dbRes.json();

    // 5. Send notification email to Sagar via Resend if API key is configured
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const priority = leadScore >= 7 ? '🔥 HOT LEAD' : (leadScore >= 4 ? '🟡 QUALIFIED LEAD' : '🚀 NEW INQUIRY');
      const subject = `${priority} | ${projectType} Request - ${businessName}`;
      const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) + ' (IST)';

      const emailText = `NEW PROJECT REQUEST SUBMITTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lead Profile
• Priority: ${priority}
• Lead Score: ${leadScore}/10
• Name: ${name}
• Business Email: ${userEmail}
• Phone: ${phone || 'N/A'}
• Company: ${businessName}
• Industry: ${industry}
• Submitted At: ${timestamp}

Context & Tracking
• Source Page: ${sourcePage || 'N/A'}
• Source CTA: ${sourceCta || 'N/A'}
• Product Interest: ${productInterest || 'N/A'}

Project Specs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Project Type: ${projectType}

• Current Workflow:
${workflowDescription}

• Major Challenges:
${challenges}

• Desired Outcome:
${desiredOutcome}

• Additional Notes:
${notes || 'None'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Originyx Lead Acquisition Platform
`;

      try {
        await resend.emails.send({
          from: 'Originyx Platform <onboarding@resend.dev>',
          to: ['contact.sagar3004@gmail.com'],
          subject: subject,
          text: emailText,
          replyTo: userEmail,
        });
      } catch (emailError) {
        console.warn('Resend email notification failed to send:', emailError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Project request submitted and logged successfully.',
      data: insertedData[0]
    });

  } catch (error) {
    console.error('Internal server error processing submission:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
