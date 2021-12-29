import Primisc from '@prismicio/client'

export function getPrismicClient(req?: unknown){
// isso tudo seguindo a doc deles
    const prismic = Primisc.client(
        process.env.PRISMIC_ENDPOINT,
        // aqui e tipo url que vc pegar la em API ENDPOINT no site deles
        {
            req,
            accessToken :process.env.PRISMIC_ACCESS_TOKEN,
        }
    )

    return prismic
}