import { Resend } from 'resend';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY environment variable.');
    return res.status(500).json({ error: 'Server configuration error. Missing API Key.' });
  }

  const resend = new Resend(apiKey);

  try {
    const body = req.body;
    const { formType, name, email, phone } = body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, Email, and Phone are required fields.' });
    }

    let subject = '';
    let emailText = '';

    if (formType === 'start-project') {
      const { company, discussion } = body;
      if (!discussion) {
        return res.status(400).json({ error: 'Discussion topic is required.' });
      }
      subject = 'New Strategy Call Request';
      emailText = `
Strategy Call Request Details:
------------------------------------------
Name:       ${name}
Email:      ${email}
Phone:      ${phone}
Company:    ${company || 'N/A'}
Discussion: ${discussion}
------------------------------------------
      `;
    } else if (formType === 'project-consultation') {
      const { company, projectType, description, budget, timeline, revenueImpact } = body;
      subject = 'New AI Project Consultation';
      emailText = `
Project Consultation Details:
------------------------------------------
Name:                    ${name}
Email:                   ${email}
Phone:                   ${phone}
Company:                 ${company || 'N/A'}
Project Type:            ${projectType || 'N/A'}
Expected Revenue Impact: ${revenueImpact || 'N/A'}
Budget Range:            ${budget || 'N/A'}
Timeline:                ${timeline || 'N/A'}

Project Description:
${description || 'No description provided.'}
------------------------------------------
      `;
    } else if (formType === 'project-interest') {
      const { company, projectName, businessInfo, outcome } = body;
      if (!projectName) {
        return res.status(400).json({ error: 'Project name is required.' });
      }
      subject = `${projectName} Interest Lead`;
      emailText = `
Project Lead Details (${projectName}):
------------------------------------------
Name:                  ${name}
Email:                 ${email}
Phone:                 ${phone}
Company:               ${company || 'N/A'}
Business Details:      ${businessInfo || 'N/A'}
Desired Outcomes:      ${outcome || 'N/A'}
------------------------------------------
      `;
    } else if (formType === 'automation-audit') {
      const { company, website, processTime } = body;
      subject = 'Free AI Automation Audit Request';
      emailText = `
Automation Audit Request Details:
------------------------------------------
Name:             ${name}
Email:            ${email}
Phone:            ${phone}
Company:          ${company || 'N/A'}
Website:          ${website || 'N/A'}
Wasted Workflow:  ${processTime || 'N/A'}
------------------------------------------
      `;
    } else {
      return res.status(400).json({ error: 'Invalid form type provided.' });
    }

    const { data, error } = await resend.emails.send({
      from: 'Acquisition Platform <onboarding@resend.dev>',
      to: ['contact.300408@gmail.com'],
      subject: subject,
      text: emailText,
      replyTo: email,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, message: 'Email sent successfully!', data });
  } catch (err) {
    console.error('Server error handling email dispatch:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
