import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { handler } from '../build/handler.js';

const transporter = nodemailer.createTransport({
    host: process.env.PUBLIC_HOST,
    port: process.env.PUBLIC_PORT,
    secure: false, // true for port 465, false for other ports
    auth: {
      user:process.env.PUBLIC_USER ,
      pass: process.env.PUBLIC_PASS,
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certificate
    }
});

function createEmail(subject,body,receiver, attachmentBuffer=null, filename=null){
    const emailOptions = {
        from: `"${process.env.PUBLIC_USERNAME}" <${process.env.PUBLIC_EMAIL}>`, // sender address
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const port = 3000;
const app = express();
const server = createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
//   ws.send('Hello, World 👋');

  ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));

  ws.on('message', async (data) => {
    let stringData = data.toString('utf-8');
    let input=stringData
    try {
        input = JSON.parse(stringData)

        if(input.subject==""){
            ws.send(JSON.stringify({message:`Subject is empty`}));
            return
        }
        if(input.body==""){
            ws.send(JSON.stringify({message:`Body is empty`}));
            return
        }
        if(input.emails.length ==1 && input.emails[0]==""){
            ws.send(JSON.stringify({message:`Add emails`}));
            return
        }

        for (const email of input.emails) {
            if(email != "") {
                const emailPart = createEmail(input.subject, input.body, email); 
                try {
                    const info = await transporter.sendMail(emailPart);
                    // console.log("Message sent:", info);
                    ws.send(JSON.stringify({message:`Email sent to ${email}`}));
                } catch (error) {
                    console.log("Error sent: %s", error);
                }
                // Wait for 2.4 seconds before sending the next email
                await delay(2400);
            }
        }

    } catch (error) {
        // console.log(error)
    }
    // console.log('Received:',input );


    ws.send(JSON.stringify({message:`Completed all emails`}));
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

});

// SvelteKit should handle everything else
app.use(handler);

server.listen(port, () => {
  console.log(`Server is running on ws://localhost:${port}`);
});
