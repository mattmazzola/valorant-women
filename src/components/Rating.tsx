import React from 'react'
import styles from './Rating.module.css'
import { agents } from '../constants'
import { shuffle } from '../utilities'

const Component: React.FC = () => {

    const shuffledAgents = shuffle(agents)

    return (
        <div className={styles.rating}>
            <header className={styles.listHeader}>
                <div>
                    Hottest
                </div>
                <div className="arrow left"></div>
                <div>
                    Rank the Women
                </div>
                <div className="arrow right"></div>
                <div>
                    Nottest
                </div>
            </header>

            <ol className={styles.list}>
                {shuffledAgents.map(agent => {
                    return (
                        <li className={styles.agent}>
                            <img src={agent.imageUrl} />
                            <div className={styles.name}>{agent.name}</div>
                        </li>
                    )
                })}
            </ol>
            <div className={styles.ranks}>
                {Array.from({ length: agents.length }, (_, i) => i + 1)
                    .map(v => {
                        return (
                            <div>{v}</div>
                        )
                    })}
            </div>
        </div>
    )
}

export default Component