import React from 'react'
import styles from './StaticRating.module.css'
import { agents } from '../constants'

type Props = {
    ratings: [number, number, number, number, number, number, number]
}

const Component: React.FC<Props> = (props) => {

    const chosenAgentList = props.ratings.map(agentIndex => {
        if (agentIndex < 0 || agentIndex > agents.length - 1) {
            throw new Error(`Index of agent ouf of bounds`)
        }

        const agent = agents.find((a, i) => i == agentIndex)

        return agent!
    })

    return (
        <div className={styles.rating}>
            <header className={styles.listHeader}>
                <div>
                    Hottest
                </div>
                <div className="arrow left"></div>
                <div>
                    Sort Order
                </div>
                <div className="arrow right"></div>
                <div>
                    Nottest
                </div>
            </header>

            <div className={styles.ranks}>
                {Array.from({ length: agents.length }, (_, i) => i + 1)
                    .map(v => {
                        return (
                            <div>{v}</div>
                        )
                    })}
            </div>

            <ol className={styles.list}>
                {chosenAgentList.map(agent => {
                    return (
                        <li className={styles.agent}>
                            <img src={agent.imageUrl}  alt={agent.name}/>
                            <div className={styles.number}>{agent.name}</div>
                        </li>
                    )
                })}
            </ol>


        </div>
    )
}

export default Component