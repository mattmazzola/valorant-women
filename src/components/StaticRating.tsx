import React from 'react'
import { agents } from '../constants'

type Props = {
    ratings: [number, number, number, number, number, number, number]
}

const Component: React.FC<Props> = (props) => {

    const chosenAgentList = props.ratings.map(agentIndex => {
        if (agentIndex < 0 || agentIndex > agents.length - 1) {
            throw new Error(`Index of agent ouf of bounds`)
        }

        const agent = agents.find((a, i) => i === agentIndex)

        return agent!
    })

    return (
        <div className="rating">
            <header className="listHeader">
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

            <div className="ranks">
                {Array.from({ length: agents.length }, (_, i) => i + 1)
                    .map(v => (
                        <div key={v}>{v}</div>
                    ))}
            </div>

            <ol className="list">
                {chosenAgentList.map(agent => (
                    <li className="agent2" key={agent.id}>
                        <img
                            src={agent.imageUrl}
                            alt={agent.name}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                // other code
                            }}
                        />
                        <div className="name">{agent.name}</div>
                    </li>
                ))}
            </ol>


        </div>
    )
}

export default Component