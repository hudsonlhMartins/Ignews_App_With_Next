import styles from './styles.module.scss'
import {useSession, signIn} from 'next-auth/react'
import { api } from '../../services/api'
import {getStripeJs} from '../../services/stripe-js'


interface SubcribeButtonProps{
    priceId: string
}


export default function SubcribeButton ({priceId}: SubcribeButtonProps){

    const {data: session} = useSession()


    async function handleSubscribe(){
        if(!session){
            signIn('github')
            return
        }

        // aqui a gente vai pegar o return da route que criamos no api subscribe

        try{
            const res = await api.post('/subscribe')

            const {sessionId} = res.data

            const stripe = await getStripeJs()

            await stripe.redirectToCheckout({sessionId: sessionId})
            // aqui passando o id do stripe

        }catch(err){
            alert(err.message)
        }


    }

    return (
        <button
            type="button"
            className={styles.subcribeButton}
            onClick={handleSubscribe}
        >
            Subcribe Now
        </button>
    )
}