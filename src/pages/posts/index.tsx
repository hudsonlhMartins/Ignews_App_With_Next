import {GetStaticProps} from 'next'
import Head from 'next/head'
import { getPrismicClient } from '../../services/prismic'
import Primisc from '@prismicio/client'
import {RichText} from 'prismic-dom'
import Link from 'next/link'


import styles from './styles.module.scss'


type Post = {
    slug: string,
    title: string,
    execerpt: string,
    updatedAt: string,

}

interface PostsProps{
    posts: Post[]
}


export default function  Posts ({posts}: PostsProps) {

    return (
        <>
            <Head>
                <title>Post | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts.map(post => (
                        <Link href={`/posts/${post.slug}`}>
                            <a key={post.slug}>
                                <time>{post.updatedAt}</time>
                                <strong>{post.title}</strong>
                                <p>{post.execerpt}</p>
                            </a>
                        </Link>

                    ))}

                </div>
            </main>

        </>
    )
}

export const getStaticProps: GetStaticProps = async () =>{
    // com static para que ela não vai no prismic toda os que um user entrar
    // assim consumir memas bando do prismic
    const prismic = getPrismicClient()

    // query buscar dados do primsic
    // para saber mais olha na docs dos os tipo de buscar que tem
    const response = await prismic.query(
        // buscar todos os document que o tipo e publication
       [ Primisc.predicates.at('document.type', 'publication')],
       {
           // qual dados queremos pegar dessa publication
           fetch: ['publication.title', 'publication.content'],
           // quantidade que vamos trazer
           pageSize: 100,
       }
    )


    const posts = response.results.map(post =>{
        // isso para format os dados
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title), 
            execerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
            // primeiro ? e caso acha faer isso os outro ?? caso não
            updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            })
        }
    })

    // esse posts vai ser outro array ja formartado
    return{
        props:{
            posts
        }, revalidate: 60 * 60 * 2  // 2 hrs
    }
}