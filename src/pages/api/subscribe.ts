import {NextApiRequest, NextApiResponse} from 'next'
import {stripe} from '../../services/stripe'
import {getSession} from 'next-auth/react'
import {query as q} from 'faunadb'
import { fauna } from '../../services/fauna'
import email from 'next-auth/providers/email'

type User = {
    ref:{
        id: string,
    }
    data: {
        stripe_customer_id: string
    }
}


export default async (req: NextApiRequest, res: NextApiResponse) =>{
    if(req.method === 'POST'){
// isso pq o metado tem que ser post pq estou criando algo na api do striped

// quando user clocar na inteção de comprar, vamos criar um customer dentro do__
// painel do stripe

// vamos pegar as info do user pelo cokkis pq pelo seesion não da pq ele so function com react
// e a gente aqui esta no servidor


        const session = await getSession({req});
        // assim a gente consegue pegar os cookis
  

        const user = await fauna.query <User> (q.Get(
            q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )

        let customerId = user.data.stripe_customer_id

        if(!customerId) {
            const stripeCustomer = await stripe.customers.create({
                email: session.user.email,
                
            })

            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('testando'), user.ref.id),
                    {data: {
                        stripe_customer_id: stripeCustomer.id
                    }}
                )
            ) 

            customerId = stripeCustomer.id
        }


        const stripeCheckoutSession= await stripe.checkout.sessions.create({
            customer: customerId, // que esta comprando
            // esse id e o id no stripe
            payment_method_types: ['card'],
            // aqui passamos nossos params. 1° e qual method de pagamen vamos aceita
            billing_address_collection: 'required',
            // isso e para obrigar user a colocar endereço ou auto deixa o stripe lida com isso
            line_items: [{
                price: 'price_1K774vCw8bqQLJEPx5eeuQ3C', quantity: 1

            }],
            mode: 'subscription',
            // isso e o para falar que e um pagemento recorrente 
            allow_promotion_codes: true, // isso se tiver cupom de desconto
            success_url: process.env.STRIPE_SUCCESS_URL, // se ter sucesso vamos redireceio para
            cancel_url: process.env.STRIPE_CANCEL_URL // se user cancelar vai se redirecionando
        })

        return res.status(200).json({sessionId: stripeCheckoutSession.id})

    }else{

        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed') // entragando um error

    }
}