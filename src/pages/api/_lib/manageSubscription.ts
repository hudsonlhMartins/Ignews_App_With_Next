import {fauna} from '../../../services/fauna'
import {stripe} from '../../../services/stripe'
import {query as q} from 'faunadb'

export default async function saveSubscription (
    subscriptionId: string,
    customerId: string,
    createAction = false
){

    const userRef = await fauna.query(
        // esse select e para pegar somente o ref, poodia tbm ser o email etc.
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    )

    // pegar todos os dados do user que se escreveu
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        priceId: subscription.items.data[0].price.id,

    }

    // salva no faunadb
   if(createAction){

    await fauna.query(
        q.Create(
            q.Collection('Subscriptions'),
            {data: subscriptionData}
        )
    )

   } else{

    console.log('entrou aqui')

    await fauna.query(
        q.Replace(
            // esse replace e igual ao update so que ele substitui tudo o update pode atualizar so uma update
            // tem que passar a ref para o Replace
            q.Select(
                "ref",
                q.Get(
                    q.Match(
                        q.Index('subscription_by_id'),
                        subscriptionId,
                    )
                )
            ),
            {data: subscriptionData} // aqui e o segundo para do replace que oq vai colocar no lugar
        )
    )

   }

}