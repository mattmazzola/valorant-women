import React from 'react'
import styles from './Rating.module.css'

const Component: React.FC = () => {

    const agentImageUrls = [
        '/images/Jett.png',
        '/images/Killjoy.png',
        '/images/Raze.png',
        '/images/Reyna.png',
        '/images/Sage.png',
        '/images/Skye.png',
        '/images/Viper.png',
    ]

    return (
        <div>
            <header className={styles.listHeader}>
                <div>
                    Hottest
                </div>
                <div>
                    Rank the Women
                </div>
                <div>
                    Nottest
                </div>
            </header>

            <ol className={styles.list}>
                {agentImageUrls.map((url, index) => {
                    const number = index + 1

                    return (
                        <li className={styles.agent}>
                            <img src={url} />
                            <div className={styles.number}>{number}</div>
                        </li>
                    )
                })}
            </ol>
        </div>

    )
}

export default Component