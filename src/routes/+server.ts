import type { RequestHandler } from '@sveltejs/kit';
import {PUBLIC_HOST,PUBLIC_PORT,PUBLIC_PASS,PUBLIC_USER,PUBLIC_USERNAME,PUBLIC_EMAIL} from '$env/static/public'
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: PUBLIC_HOST,
    port: PUBLIC_PORT,
    secure: false, // true for port 465, false for other ports
    auth: {
      user:PUBLIC_USER ,
      pass: PUBLIC_PASS,
    },
});

function createEmail(subject:string,body:string,receiver:string){
    return {
        from: `"${PUBLIC_USERNAME}" <${PUBLIC_EMAIL}>`, // sender address
        to: `${receiver},`, // list of receivers
        subject, // Subject line
        text: body, // plain text body
        html: `<b>${body}</b>`, // html body
    }
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export const POST = async ({ request }) => {
    const data = await request.json();
    // Handle the data received from the request
    let emails= data.emails.split("\n")
    if(data.subject==""){
        return new Response(JSON.stringify({ message: `Subject is empty` }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    if(data.body==""){
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
                const emailPart = createEmail(data.subject, data.body, email);
                try {
                    const info = await transporter.sendMail(emailPart);
                    // console.log("Message sent: %s", info);
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