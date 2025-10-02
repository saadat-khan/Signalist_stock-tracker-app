import nodemailer from 'nodemailer'
import {WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE} from "@/lib/nodemailer/templates";
import {email} from "zod";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    try {
        const htmlTemplate = WELCOME_EMAIL_TEMPLATE
            .replace("{{name}}", name)
            .replace("{{intro}}", intro);

        const  mailOptions = {
            from: `"Signalist" <${process.env.NODEMAILER_EMAIL}>`,
            to: email,
            subject: `Welcome to Signalist - your stock market toolkit is ready!`,
            text: "Thanks for joining Signalist",
            html: htmlTemplate,
        }
        
        console.log(`Sending welcome email to: ${email}`);
        const result = await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent successfully to ${email}:`, result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error(`Failed to send welcome email to ${email}:`, error);
        throw error;
    }
}

export const sendNewsSummaryEmail = async ({ email, date, newsContent }: NewsSummaryEmailData) => {
    try {
        const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
            .replace("{{date}}", date)
            .replace("{{newsContent}}", newsContent);

        const mailOptions = {
            from: `"Signalist News" <${process.env.NODEMAILER_EMAIL}>`,
            to: email,
            subject: `Market News Summary Today - ${date}`,
            text: "Today's market news summary from Signalist.",
            html: htmlTemplate,
        }
        
        console.log(`Sending daily news summary email to: ${email}`);
        const result = await transporter.sendMail(mailOptions);
        console.log(`Daily news email sent successfully to ${email}:`, result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error(`Failed to send daily news email to ${email}:`, error);
        throw error;
    }
}

// Test function to verify email configuration
export const testEmailConfiguration = async () => {
    try {
        console.log('Testing email configuration...');
        console.log('Email:', process.env.NODEMAILER_EMAIL);
        console.log('Password configured:', !!process.env.NODEMAILER_PASSWORD);
        
        // Verify transporter configuration
        const verified = await transporter.verify();
        console.log('Email transporter verified:', verified);
        return { success: true, verified };
    } catch (error) {
        console.error('Email configuration test failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

