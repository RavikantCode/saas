// import { Webhook } from "svix";
// import { headers } from "next/headers";

// import { WebhookEvent } from "@clerk/nextjs/server";

// import prisma from "../../../../../lib/prisma";

// export async function POST(req: Request) {
//     const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

//     if(!WEBHOOK_SECRET){
//         throw new Error('PLease provide a webhook secret')

//     }
//     const headerPayload = await headers();
//    const svix_id= headerPayload.get('svix-id')
//    const svix_timestamp= headerPayload.get('svix-timestamp')
//    const svix_signature= headerPayload.get('svix-signature')

//    if(!svix_id || !svix_timestamp || !svix_signature){
//        throw new Error('Missing headers')
//    }

//    const payload = await req.json()

//    const body = JSON.stringify(payload)
//    const wh = new Webhook(WEBHOOK_SECRET)

//    let evt;
//    try {
//     evt = wh.verify(body,{
//         "svix-id": svix_id,
//         "svix-timestamp": svix_timestamp,
//         "svix-signature": svix_signature,
//     }) as WebhookEvent;
//    } catch (error) {
//     console.log('Error verifying webhook',error)
//     return new Response("error occured",{status:400})
//    }
//    const {id} = evt.data
//    const eventType = evt.type

//    console.log(id,eventType);
//    if(eventType === 'user.created'){
//        try {
//         const {email_addresses,primary_email_address_id} = evt.data
//         console.log(email_addresses,primary_email_address_id);

//         const primaryEmail = email_addresses.find((email:any)=>{
//             email.id == primary_email_address_id
//         })
//         if(!primaryEmail){
//             return new Response('No primary email found',{status:400})
//         }
//         const newUser = await prisma.user.create({
//             data:{
//                 id:evt.data.id,
//                 email:primaryEmail.email_address,
//                 isSubscribed:false,
               
//             }
//         })
//         console.log(newUser);
        
        
//        } catch (error) {
//             return new Response('Error creating user',{status:400})
//        }
      
//    }
//    return new Response('webhook created successfully',{status:200})
   

// }

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "../../../../../lib/prisma";

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error('Please provide a webhook secret');
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Missing headers', { status: 400 });
    }

    // Retrieve the raw body as a Buffer
    const rawBody = await req.arrayBuffer();
    const bodyString = Buffer.from(rawBody).toString('utf-8');

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;
    try {
        evt = wh.verify(bodyString, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (error) {
        console.error('Error verifying webhook:', error);
        return new Response('Error occurred', { status: 400 });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    console.log(id, eventType);

    if (eventType === 'user.created') {
        try {
            const { email_addresses, primary_email_address_id } = evt.data;
            console.log(email_addresses, primary_email_address_id);

            const primaryEmail = email_addresses.find((email: any) => email.id === primary_email_address_id);
            if (!primaryEmail) {
                return new Response('No primary email found', { status: 400 });
            }

            const newUser = await prisma.user.create({
                data: {
                    id: evt.data.id,
                    email: primaryEmail.email_address,
                    isSubscribed: false,
                },
            });
            console.log(newUser);
        } catch (error) {
            console.error('Error creating user:', error);
            return new Response('Error creating user', { status: 400 });
        }
    }

    return new Response('Webhook processed successfully', { status: 200 });
}
