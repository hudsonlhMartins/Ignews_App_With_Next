
import { Subscription } from 'faunadb/src/types/Stream'
import {NextApiRequest, NextApiResponse} from 'next'
import {Readable} from 'stream'
import Stripe from 'stripe'
import {stripe} from '../../services/stripe'
import saveSubscription from './_lib/manageSubscription'


async function buffer(readable: Readable){
    const chunks = []

    for await (const chunk of readable){
        chunks.push(
            typeof chunk === "string" ? Buffer.from(chunk) : chunk
        )
    }

    return Buffer.concat(chunks)
}

export const config = {
    api:{
        bodyParser: false
    }
}

const relevantEvents = new Set([
    // e como fosse uma array mais não pode ter nada repedido
    'checkout.session.completed',
    'customer.subscription.deleted',
    'customer.subscription.updated',
])

export default async (req: NextApiRequest, res: NextApiResponse) =>{

    // os webhooks e uma rota como qualquer outra da aplicação
    // para deixa seguro a aplicação 3terceira manda um codigo para a gente sabe que e ela

    if(req.method === "POST"){

        const buf = await buffer(req)

        // isso aqui e para ver o codigo que o stripe esta mandando
        const secret = req.headers['stripe-signature']
        // vamos ver essa essa codigo e o mesmo que aparce no terminal para

        let event: Stripe.Event;

        try{
            event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
        }catch(err){
            return res.status(400).send(`webhoos error ${err.message}`)
        }

        const type = event.type // aqui pegar o tipo do evento vindo do stripe

        if(relevantEvents.has(type)){
            try{
                switch(type){

                    case 'customer.subscription.deleted':
                    case 'customer.subscription.updated':

                        const subscription = event.data.object as Stripe.Subscription

                        await saveSubscription(
                            subscription.id,
                            subscription.customer.toString(),
                            false
                        )

                        break
                    
                    case 'checkout.session.completed':
                        const checkoutSession = event.data.object as Stripe.Checkout.Session
                    // aqui dando a tipazem
                        await saveSubscription(
                            checkoutSession.subscription.toString(),
                            checkoutSession.customer.toString(),
                            true
                        )
                        break;
                    
                    default:
                        throw new Error('Unhandled event.')
                }
            }catch(err){
                return res.json({err: 'Webhooks handler failed'})
            }
        }

        res.json({received: true})

        
    } else{

        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed') // entragando um error

    }


    
} 