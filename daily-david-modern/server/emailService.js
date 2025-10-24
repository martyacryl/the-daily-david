const nodemailer = require('nodemailer');

const supportEmail = process.env.SUPPORT_EMAIL || 'dailydavidapp@gmail.com';

class EmailService {
  constructor() {
    this.isConfigured = !!(process.env.GMAIL_USER && process.env.GMAIL_PASS);
    
    if (!this.isConfigured) {
      console.log('⚠️  Email service not configured. Set GMAIL_USER and GMAIL_PASS environment variables.');
    } else {
      console.log('✅ Email service configured with Gmail SMTP');
    }
  }

  async sendSupportEmail({ userName, userEmail, subject, message, category }) {
    if (!this.isConfigured) {
      console.log('📧 [EMAIL MOCK] Support request:', { userName, userEmail, subject, category });
      return { success: true, message: 'Email service not configured - message logged only' };
    }

    try {
      // Create Gmail SMTP transporter
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS
        }
      });

      const mailOptions = {
        from: `Daily David Support <${process.env.GMAIL_USER}>`,
        to: supportEmail,
        subject: `[${category.toUpperCase()}] ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">New Support Request</h2>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>From:</strong> ${userName} (${userEmail})</p>
              <p><strong>Category:</strong> <span style="background-color: #16a34a; color: white; padding: 4px 8px; border-radius: 4px;">${category}</span></p>
              <p><strong>Subject:</strong> ${subject}</p>
            </div>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 8px; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">This support request was submitted via the Daily David app.</p>
              <p style="margin: 5px 0 0 0;">Reply directly to this email to respond to the user.</p>
            </div>
          </div>
        `,
        replyTo: userEmail
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Support email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();

