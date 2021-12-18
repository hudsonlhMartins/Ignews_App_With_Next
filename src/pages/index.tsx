import SubcribeButton from '../components/SubcribeButton'
import {GetStaticProps, GetServerSideProps} from 'next'
import {stripe} from '../services/stripe'

import styles from './home.module.scss'


interface HomeProps {
  product: {
    priceId: string,
    amount : number,
  }
}


export default function Home({product}: HomeProps) {
  return (
    <>
      

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> World</h1>

          <p>
            Get acess to all the publications <br/>
            <span>for month {product.amount}</span>
          </p>

          <SubcribeButton priceId={product.priceId}/>

        </section>
        <img src="/image/Mulher.svg" alt='banner' />
      </main>

    </> 
  )
}


export const getStaticProps: GetStaticProps = async ()=>{

  const price = await stripe.prices.retrieve('price_1K774vCw8bqQLJEPx5eeuQ3C',{
    expand:['product']
  })


  console.log(price.id)

  
  const product = {

    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100), // isso pq o preco sempre vem em centavos

  }
  

  return{
    props:{
      product
    }, revalidate: 60 * 60 * 48 // 2dias, 48hrs
 }


}


/*

  const pricee = await stripe.prices.retrieve('price_1K774vCw8bqQLJEPx5eeuQ3C',{
    expand:['product'] // esse expand vai return toda as info do produto que o preco esta relaciodado
  })
  // aqui pegando o valor do preco esse retrive e que vai pegar so um__
  // e passar o id do preco e so pegar la no site

  console.log(pricee.id)

  
  const product = {

    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100), // isso pq o preco sempre vem em centavos

  }
  

  return{
    props:{
      product
    },
    revalidate: 60 * 60 * 48 // 2dias, 48hrs
 }

*/