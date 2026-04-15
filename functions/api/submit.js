// Cloudflare Pages Function - Form Submission Handler
// Bind this to your D1 database with the binding name "DB"

// Helper function to send email notification via Resend
async function sendEmailNotification(env, submissionData) {
  if (!env.RESEND_API_KEY || !env.NOTIFICATION_EMAIL) {
    console.log('Email not configured - skipping notification');
    return;
  }

  const { id, fullName, email, phone, preference, description, existingTattoos, palette, style, days, time, dateTime, budget, extraInfo, language, photoUrl, referenceUrl } = submissionData;

  const contactInfo = preference === 'email' ? email :
                      preference === 'phone' ? phone :
                      `${email} / ${phone}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #1A1A1A; border-bottom: 2px solid #E8E5E0; padding-bottom: 10px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: 600; color: #6B6B6B; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { font-size: 15px; margin-top: 4px; }
    .highlight { background: #FAFAF8; padding: 15px; border-radius: 4px; }
    .links { margin-top: 10px; }
    .links a { display: block; color: #1A1A1A; margin-bottom: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>New Tattoo Inquiry #${id}</h1>

    <div class="highlight">
      <div class="field">
        <div class="label">Client</div>
        <div class="value">${fullName}</div>
      </div>
      <div class="field">
        <div class="label">Preferred Contact</div>
        <div class="value">${preference} - ${contactInfo}</div>
      </div>
      <div class="field">
        <div class="label">Language</div>
        <div class="value">${language === 'de' ? 'Deutsch' : 'English'}</div>
      </div>
    </div>

    <div class="field" style="margin-top: 20px;">
      <div class="label">Tattoo Description</div>
      <div class="value">${description.replace(/\n/g, '<br>')}</div>
    </div>

    ${existingTattoos ? `
    <div class="field">
      <div class="label">Existing Tattoos / Placement</div>
      <div class="value">${existingTattoos.replace(/\n/g, '<br>')}</div>
    </div>
    ` : ''}

    <div class="field">
      <div class="label">Style Preferences</div>
      <div class="value">
        ${palette ? `Palette: ${palette}<br>` : ''}
        ${style ? `Style: ${style}<br>` : ''}
        ${days?.length > 0 ? `Available days: ${days.join(', ')}<br>` : ''}
        ${time ? `Preferred time: ${time}` : ''}
      </div>
    </div>

    ${dateTime ? `
    <div class="field">
      <div class="label">Desired Date/Time</div>
      <div class="value">${dateTime}</div>
    </div>
    ` : ''}

    ${budget ? `
    <div class="field">
      <div class="label">Budget</div>
      <div class="value">${budget}</div>
    </div>
    ` : ''}

    ${extraInfo ? `
    <div class="field">
      <div class="label">Additional Information</div>
      <div class="value">${extraInfo.replace(/\n/g, '<br>')}</div>
    </div>
    ` : ''}

    ${(photoUrl || referenceUrl) ? `
    <div class="field links">
      <div class="label">Attachments</div>
      ${photoUrl ? `<a href="${photoUrl}">Client Photo</a>` : ''}
      ${referenceUrl ? `<a href="${referenceUrl}">Reference Image</a>` : ''}
    </div>
    ` : ''}

    <hr style="border: none; border-top: 1px solid #E8E5E0; margin: 30px 0;">
    <p style="font-size: 13px; color: #6B6B6B;">
      Submission #${id} received on ${new Date().toLocaleString('de-CH')}
    </p>
  </div>
</body>
</html>
  `;

  const textContent = `
New Tattoo Inquiry #${id}

Client: ${fullName}
Preferred Contact: ${preference} - ${contactInfo}
Language: ${language === 'de' ? 'Deutsch' : 'English'}

Tattoo Description:
${description}

${existingTattoos ? `Existing Tattoos/Placement:\n${existingTattoos}\n\n` : ''}Style Preferences:
${palette ? `Palette: ${palette}\n` : ''}${style ? `Style: ${style}\n` : ''}${days?.length > 0 ? `Available days: ${days.join(', ')}\n` : ''}${time ? `Preferred time: ${time}\n` : ''}

${dateTime ? `Desired Date/Time: ${dateTime}\n\n` : ''}${budget ? `Budget: ${budget}\n\n` : ''}${extraInfo ? `Additional Info:\n${extraInfo}\n\n` : ''}${photoUrl ? `Photo: ${photoUrl}\n` : ''}${referenceUrl ? `Reference: ${referenceUrl}\n` : ''}
Submission #${id} received on ${new Date().toLocaleString('de-CH')}
  `.trim();

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL || 'Klementina Tattoo <noreply@klementina-tattoo.com>',
        to: env.NOTIFICATION_EMAIL,
        subject: `New Tattoo Inquiry #${id} - ${fullName}`,
        html: htmlContent,
        text: textContent,
        reply_to: email || undefined
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
    } else {
      console.log('Email notification sent successfully');
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();

    // Extract form fields
    const fullName = formData.get('fullName')?.toString() || '';
    const preference = formData.get('preference')?.toString() || 'email';
    const email = formData.get('email')?.toString() || '';
    const phone = formData.get('phone')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const existingTattoos = formData.get('existingTattoos')?.toString() || '';
    const palette = formData.get('palette')?.toString() || '';
    const style = formData.get('style')?.toString() || '';
    const time = formData.get('time')?.toString() || '';
    const dateTime = formData.get('dateTime')?.toString() || '';
    const budget = formData.get('budget')?.toString() || '';
    const extraInfo = formData.get('extraInfo')?.toString() || '';
    const language = formData.get('language')?.toString() || 'en';

    // Get selected days as array
    const days = formData.getAll('days').map(d => d.toString());

    // Validate required fields
    if (!fullName || !description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insert into D1 database
    const { success } = await env.DB.prepare(
      `INSERT INTO submissions (
        full_name, preference, email, phone, description, existing_tattoos,
        palette, style, days, preferred_time, preferred_datetime, budget, extra_info,
        language, photo_url, reference_url, created_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'new')`
    ).bind(
      fullName,
      preference,
      email,
      phone,
      description,
      existingTattoos,
      palette,
      style,
      JSON.stringify(days),
      time,
      dateTime,
      budget,
      extraInfo,
      language,
      null, // photo_url - will be updated after R2 upload
      null  // reference_url
    ).run();

    if (!success) {
      throw new Error('Failed to insert submission');
    }

    // Get the inserted record ID
    const { results } = await env.DB.prepare(
      'SELECT id FROM submissions WHERE full_name = ? AND description = ? ORDER BY id DESC LIMIT 1'
    ).bind(fullName, description).all();

    const submissionId = results?.[0]?.id;

    // Handle file uploads to R2 if R2 bucket is configured
    let photoUrl = null;
    let referenceUrl = null;

    if (env.SUBMISSIONS_BUCKET) {
      const photo = formData.get('photo');
      const reference = formData.get('reference');

      if (photo && photo.size > 0) {
        const photoKey = `submissions/${submissionId}/photo-${Date.now()}-${photo.name}`;
        await env.SUBMISSIONS_BUCKET.put(photoKey, photo);
        photoUrl = `${env.R2_PUBLIC_URL}/${photoKey}`;
      }

      if (reference && reference.size > 0) {
        const refKey = `submissions/${submissionId}/reference-${Date.now()}-${reference.name}`;
        await env.SUBMISSIONS_BUCKET.put(refKey, reference);
        referenceUrl = `${env.R2_PUBLIC_URL}/${refKey}`;
      }

      // Update record with file URLs
      if (photoUrl || referenceUrl) {
        await env.DB.prepare(
          'UPDATE submissions SET photo_url = ?, reference_url = ? WHERE id = ?'
        ).bind(photoUrl, referenceUrl, submissionId).run();
      }
    }

    // Send email notification (non-blocking)
    const submissionData = {
      id: submissionId,
      fullName,
      email,
      phone,
      preference,
      description,
      existingTattoos,
      palette,
      style,
      days,
      time,
      dateTime,
      budget,
      extraInfo,
      language,
      photoUrl,
      referenceUrl
    };
    
    // Fire and forget - don't block response on email
    context.waitUntil(sendEmailNotification(env, submissionData));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Submission received',
        id: submissionId
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('Form submission error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
