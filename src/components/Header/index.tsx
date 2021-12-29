import SignInButton from '../SignInButton'
import styles from './styles.module.scss'
import Link from 'next/link'
import { ActiveLink } from '../ActiveLink'

export default function Header (){

    return(
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <Link href='/'>
                    <img src="/image/logo.svg" alt="ig.news"/>
                </Link>

                <nav>
                    <ActiveLink activeClassName={styles.active} href="/">
                        <a className={styles.active}>Home</a>
                    </ActiveLink>

                    <ActiveLink  activeClassName={styles.active} href="/posts" prefetch>
                        <a>Posts</a>
                    </ActiveLink>
                       
                </nav>

                <SignInButton/>
            </div>
        </header>
    )
}