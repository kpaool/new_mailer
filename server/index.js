import express from 'express';
import { verifyEmail } from '@devmehq/email-validator-js';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { handler } from '../build/handler.js';
import {emailVariations} from './emails.js'


export async function isValidated(emailAddress,printResults=false){
	const { validFormat, validSmtp, validMx } = await verifyEmail({ emailAddress, verifyMx: true, verifySmtp: true, timeout: 3000 });
	if(printResults){
		console.log(
			{"validFormat":validFormat, 
			"validSmtp":validSmtp, 
			"validMx":validMx}
		)
	}
	if(!validFormat){
		return false
	}
	if(!validSmtp){
		return false
	}
	if(!validMx){
		return false
	}
	return true
}

async function ValidateEmail(email){
    let tmpEmails =[email]
    if(tmpEmails.length<1 || tmpEmails[0]==''){
      alert("Please enter email")
      return
    }
    try {
        const validationPromises = tmpEmails.map(async email => {
            const isValid = await isValidated(email,false);
            console.log(isValid);
            return isValid ? email : null;
        });
    
        const results = await Promise.all(validationPromises);
    
        return results[0]
      } catch (error) {            
          console.error('There was a problem with the fetch operation:', error);
          return null
      }
    
  }



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

function capitalizeFirstLetter(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function createEmail(to,product, attachments){

    try {
        const randomIndex = Math.floor(Math.random() * emailVariations.length);
        const randomEmailVariation = emailVariations[randomIndex];
        let subject = randomEmailVariation.subject.replace("{{product}}", product).toUpperCase()
        let text = randomEmailVariation.body.replace("{{receiver}}", capitalizeFirstLetter(to.split("@")[0])).replace("{{product}}", product);
        text=text.replaceAll("{{department}}",process.env.DEPARTMENT).replaceAll("{{end_credits}}",process.env.END_CREDITS)
    
        let data ={
            from: process.env.FROM,
            to:[to],
            subject,
            plain_body:text,
            attachments
        }
        return data
    } catch (error) {
        console.log(error)
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function safeSend(ws, message) {
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message))
    }
  }

const port = 4000;
const app = express();
const server = createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
//   ws.send('Hello, World 👋');

  safeSend(ws, { message: 'Welcome to the WebSocket server!' });

  ws.on('message', async (data) => {
    let stringData = data.toString('utf-8');
    let input=stringData
    try {
        input = JSON.parse(stringData)

        if(input.product==""){
            safeSend(ws, {message:`Product is empty`});
            return
        }
        if(input.attachments.length==0){
            safeSend(ws, {message:`There are no attachments`});
            // return
        }

        if(input.emails.length ==1 && input.emails[0]==""){
            safeSend(ws, {message:`Add emails`});
            return
        }

        for (const email of input.emails) {
            if(email != "") {
                let validEmail= await ValidateEmail(email)
                let emailPart
                if(!validEmail){
                    safeSend(ws, {message:`${email} is not valid`});
                    console.log(`${email} is not valid`)
                    continue
                }else{
                    emailPart = createEmail(email,input.product, input.attachments);
                }
                try {
                    const response = await fetch(process.env.PUBLIC_SMTP_HOST_URL+'/api/v1/send/message', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Server-API-Key': process.env.PUBLIC_API_KEY // Add your API key here
                        },
                        body: JSON.stringify(emailPart)
                    });
            
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
            
                    const result = await response.json();
                    safeSend(ws, {message:`Email sent successfully to ${email}`});
                  } catch (error) {
                    safeSend(ws, {message:`Couldnt send email`});
                    console.log(error)
                }
            
                // Wait for 2.4 seconds before sending the next email
                await delay(2400);
            }
        }

    } catch (error) {
        // console.log(error)
    }
    // console.log('Received:',input );


    safeSend(ws, {message:`Completed all emails`});
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
