// src/mail/mail.service.ts

import { EmailOptions } from '@interfaces/emailOptions.interface';
import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';

dotenv.config();
@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    constructor() {
        // this.transporter = nodemailer.createTransport({
        //     // Configure your email service credentials here
        //     host: 'smtp.example.com',
        //     port: 587,
        //     secure: false,
        //     auth: {
        //         user: process.env.MAIL_USER,
        //         pass: process.env.MAIL_PASS,
        //     },
        // });
    }

    async sendEmail(emailOptions: EmailOptions): Promise<any> {
        let transport = await this.getNodeEmailerConfig();
        const info = await transport.sendMail({
            from: `"ChitChat" <noreply@chitchat.com>`,
            to: emailOptions.to,
            subject: emailOptions.subject,
            text: emailOptions.text,
            html: emailOptions.html,

        });
        return info;
    }


    private async getNodeEmailerConfig() {
        // let acc = await nodemailer.createTestAccount();
        let transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS,
            },
        });
        transport.verify(function (error, success) {
            if (error) {
                console.log(error.message);
            } else {
                console.log('Server validation done and ready for send mail.')
            }
        });
        return transport;
    }
}
