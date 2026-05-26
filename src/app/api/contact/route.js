import { NextResponse } from 'next/server';
import { createAdminMessage } from '@/lib/cloudflare-d1';

// Simple email sending utility (logs to console; for production use SendGrid, Resend, or similar)
async function sendEmail(to, subject, message, senderEmail, senderName) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'sazedulislam9126@gmail.com';

    // Log to console (for development/debugging)
    console.log('\n📧 EMAIL NOTIFICATION:');
    console.log(`To: ${adminEmail}`);
    console.log(`From: ${senderName} <${senderEmail}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${message}`);
    console.log('---\n');

    // TODO: For production, integrate with Resend, SendGrid, or Mailgun:
    // Example with Resend (install: npm install resend):
    // const { send } = require('resend');
    // await send({
    //   from: 'noreply@yourdomain.com',
    //   to: adminEmail,
    //   subject,
    //   html: `<p>${message}</p><p>From: ${senderName} (${senderEmail})</p>`
    // });

    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { firstName, lastName, email, phone, service, message } = body;

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    const name = `${firstName || ''} ${lastName || ''}`.trim() || 'Anonymous';
    const subject = `New contact from ${name}${service ? ` (${service})` : ''}`;

    // Save to database
    await createAdminMessage({
      name,
      email,
      subject,
      message,
      service,
      phone,
    });

    // Send email notification
    const emailContent = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      service ? `Service: ${service}` : null,
      '',
      `Message:\n${message}`,
    ]
      .filter(Boolean)
      .join('\n');

    await sendEmail(
      process.env.ADMIN_EMAIL || 'sazedulislam9126@gmail.com',
      subject,
      emailContent,
      email,
      name
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been received and saved. Thank you!',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to process contact form',
      },
      { status: 500 }
    );
  }
}
