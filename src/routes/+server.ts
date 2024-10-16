import type { RequestHandler } from '@sveltejs/kit';
import {PUBLIC_HOST,PUBLIC_PORT,PUBLIC_PASS,PUBLIC_USER,PUBLIC_USERNAME,PUBLIC_EMAIL} from '$env/static/public'
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

const transporter = nodemailer.createTransport({
    host: PUBLIC_HOST,
    port: PUBLIC_PORT,
    secure: false, // true for port 465, false for other ports
    auth: {
      user:PUBLIC_USER ,
      pass: PUBLIC_PASS,
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certificate
    }
});

function createEmail(subject:string,body:string,receiver:string, attachmentBuffer?: Buffer, filename?: string){
    const emailOptions: any = {
        from: `"${PUBLIC_USERNAME}" <${PUBLIC_EMAIL}>`, // sender address
        to: `${receiver}`, // list of receivers
        subject, // Subject line
        text: body, // plain text body
        html: `${body}`, // html body
    };

    // Add attachment if provided
    if (attachmentBuffer) {
        emailOptions.attachments = [
            {
                filename: filename || 'attachment', // Use provided filename or default
                content: attachmentBuffer, // Use the buffer directly
            },
        ];
    }

    return emailOptions;
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export const POST = async ({ request }) => {

    const formData = await request.formData();
    const subject = formData.get('subject');
    const body = formData.get('body');
    let emails = formData.get('emails');
    const attachment = formData.get('attachment');
    let attachmentBuffer: Buffer | undefined;
    let filename: string | undefined;

    if (attachment ) {
        // Use the stream from the file and convert it into a buffer
        const chunks = [];
        const stream = attachment.stream();  // Create a readable stream from the uploaded PDF

        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        attachmentBuffer = Buffer.concat(chunks);  // Combine all chunks into a single buffer
    }

    // console.log(attachmentBuffer)
    
    // Handle the data received from the request
    emails= emails.split("\n")
    if(subject==""){
        return new Response(JSON.stringify({ message: `Subject is empty` }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    if(body==""){
        return new Response(JSON.stringify({ message: `Body is empty` }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    if(emails.length ==1 && emails[0]==""){
        return new Response(JSON.stringify({ message: `Add emails` }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        }); 
    }

    return new Promise<void>(async (resolve) => {
        // Collect promises for each email sending operation
        for (const email of emails) {
            if(email != "") {
                const emailPart = createEmail(subject, body, email, attachmentBuffer, filename); 
                try {
                    const info = await transporter.sendMail(emailPart);
                    console.log("Message sent:");
                } catch (error) {
                    console.log("Error sent: %s", error);
                }
                // Wait for 2.4 seconds before sending the next email
                await delay(2400);
            }
        }
        resolve();
    }).then(() => {
        return new Response(JSON.stringify({ message: `${emails.length} Emails processed successfully` }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    });
};