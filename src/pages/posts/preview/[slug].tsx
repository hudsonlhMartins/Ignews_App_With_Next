import {GetStaticProps, GetStaticPaths} from 'next'
import {getSession, useSession} from 'next-auth/react'
import Head from 'next/head'
import { RichText } from 'prismic-dom'
import { getPrismicClient } from '../../../services/prismic'
import Link from 'next/link'
import styles from '../post.module.scss'
import { useEffect } from 'react'
import {useRouter} from 'next/router'


interface PreviewPostProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string
    }
}



export default function PreviewPost ({post}: PreviewPostProps){

    const router = useRouter()

    const {data: session} = useSession()
    // aqui ja vai ter nossa activeSubscription por causa da nossa calback no [...auth]
    console.log(session)

    useEffect(()=>{

        if(session?.activeSubscription){
            router.push(`/posts/${post.slug}`)
        }

    }, [session])

    return(

        <>
        
            <Head>
                <title>{post.title} | Ignews </title>
            </Head>

            <main className={styles.container}> 
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div 
                    className={`${styles.postContent} ${styles.previewContent}`}
                    dangerouslySetInnerHTML={{__html: post.content}} />


                    <Link href='/'>
                        <div className={styles.continueReading}>
                            Wanna continue reading ? 
                            
                                <a>
                                    Subscribe Now 🤗
                                </a>
                            
                        </div>
                    </Link>

                </article>
            </main>


        </>
    )
}

//  <div dangerouslySetInnerHTML={{__html: post.content}} />
// isso e para colocaro html que vem do prismic aqui no jsx, 1° e o __html: e passa oque vai colocar no html


export const getStaticPaths: GetStaticPaths = ()=>{

    // isso aqui server para carregar os post na build
    // ai no path vc passar enter {} params : {slug: 'qdqd'} e passa o slug
    // isso so exister em pagina com parms dinamico com []


    return{
        paths: [],
        fallback: 'blocking'
        // esse fallback receb true false e blockig
    }
}


export const getStaticProps: GetStaticProps = async ({params})=>{


    const {slug} = params
    // pegar o slug

    const prismic = getPrismicClient()

    // aqui para buscar pelo uid que e o slug, passa em qual doc vc quer buscar,
    // 2° params passa oque vai buscar, 3° não vamos usar então denxa vazio
    const response = await prismic.getByUID('publication', String(slug), {})

    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content.splice(0 ,3)),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
    }
    

    return {
        props:{
            post
        }, revalidate: 60 * 60, // 1hr 
    }


}