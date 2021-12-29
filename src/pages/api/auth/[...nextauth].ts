import {query as q} from 'faunadb'
//import { FaunaAdapter } from "@next-auth/fauna-adapter"

//import {app, store, firebaseConfig} from '../../../services/firebase'


//import {collection, addDoc, setDoc, doc, getDocs} from 'firebase/firestore'

//import {useState} from 'react'


import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"

 import { fauna } from "../../../services/fauna"




export default NextAuth({

  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params:{
          scope: 'read:user'
        }
      }
    }),
  ],

  callbacks: {

    async session ({session}) {
      // esse call aqui e para adicionar algo a mais no session, assim__
      // podemos usar tudo que esta aqui em todo a aplicação
      
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_ref'),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                "active"
              )
            ])
          )
        )

        return {
          ...session,
          activeSubscription: userActiveSubscription
        }
      }catch(err){
        return {
          ...session,
          activeSubscription: null
        }
      }

      
    },

    async signIn({ user, account, profile, credentials }) {
      
      const {email} = user

      try{
       
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(user.email)
                )
              )
            ),
            q.Create(
              q.Collection('testando'), {data: {email: user.email}}
            ),
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(user.email) // isso para deixa ele digita com letra mas e min
              )
            )
          )
        )
  
        return true

      }catch{

        return false

      }


    },
  }

})


/*


 const collectionRef = collection(store, 'users')
        const list = []
        await getDocs(collectionRef).then(snapshot => {
          
          const find = snapshot.forEach( async doc =>{
           list.push({
             email: doc.data().email
           })
          })
        })

        const findIndex = list.findIndex(item =>{
          return item === user.email
        })

        if(!list || findIndex <0 ){
          await addDoc(collectionRef, {
            email: user.email
          })
        }else{
          return
        }


*/