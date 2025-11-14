import nodemailer from 'nodemailer';
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

/**
 * Email transporter configuration
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email notification
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('Email configuration not set, skipping email send');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html,
    });

    logger.info({ messageId: info.messageId }, 'Email sent successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to send email');
    throw error;
  }
}

/**
 * Generate email templates
 */
export const emailTemplates = {
  newAssignment: (meterNumber: string, location: string) => ({
    subject: `New Meter Assignment: ${meterNumber}`,
    html: `
      <h2>New Meter Assignment</h2>
      <p>You have been assigned to read meter <strong>${meterNumber}</strong> at <strong>${location}</strong>.</p>
      <p>Please log in to your dashboard to view details and submit readings.</p>
    `,
  }),

  readingDue: (meterNumber: string, dueDate: string) => ({
    subject: `Reading Due: ${meterNumber}`,
    html: `
      <h2>Meter Reading Due</h2>
      <p>The reading for meter <strong>${meterNumber}</strong> is due on <strong>${dueDate}</strong>.</p>
      <p>Please submit the reading as soon as possible.</p>
    `,
  }),

  readingMissed: (meterNumber: string, daysOverdue: number) => ({
    subject: `Overdue Reading: ${meterNumber}`,
    html: `
      <h2>Overdue Meter Reading</h2>
      <p>The reading for meter <strong>${meterNumber}</strong> is <strong>${daysOverdue} days</strong> overdue.</p>
      <p>Please submit the reading immediately.</p>
    `,
  }),
};

