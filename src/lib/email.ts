
import { Resend } from 'resend';

export async function sendLoginEmail(email: string, code: string, apiKey: string, fromEmail: string) {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Your Login Code',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Login Verification</h2>
        <p>Enter the following code to log in to your dashboard:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; background: #f4f4f5; padding: 12px; border-radius: 8px; text-align: center;">${code}</p>
        <p>This code will expire in 5 minutes.</p>
        <p style="font-size: 12px; color: #71717a;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
    });

    if (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send verification email');
    }

    return data;
}
