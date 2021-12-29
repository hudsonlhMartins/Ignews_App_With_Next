import {GetServerSideProps} from 'next'
import {getSession} from 'next-auth/react'
import Head from 'next/head'
import { RichText } from 'prismic-dom'
import { getPrismicClient } from '../../services/prismic'
import styles from './post.module.scss'

interface PostProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string
    }
}



export default function Post ({post}: PostProps){

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
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{__html: post.content}} />
                </article>
            </main>


        </>
    )
}

//  <div dangerouslySetInnerHTML={{__html: post.content}} />
// isso e para colocaro html que vem do prismic aqui no jsx, 1° e o __html: e passa oque vai colocar no html

export const getServerSideProps: GetServerSideProps = async ({req, params})=>{

    const session = await getSession({req})
    // aqui para pegar o coockie que tem se esta logado ou não

    console.log(session)



    const {slug} = params
    // pegar o slug

    if(session){
        if(!session.activeSubscription){
            return{
                redirect: {
                    destination: '/',
                    permanent: false,
                }
            }
        }
    }else{
            return{
                redirect:{
                    destination: `/posts/preview/${slug}`,
                    permanent: false
            }
        }
    }



    const prismic = getPrismicClient(req)

    // aqui para buscar pelo uid que e o slug, passa em qual doc vc quer buscar,
    // 2° params passa oque vai buscar, 3° não vamos usar então denxa vazio
    const response = await prismic.getByUID('publication', String(slug), {})

    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
    }
    

    return {
        props:{
            post
        }
    }


}