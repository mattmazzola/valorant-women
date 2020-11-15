import React from 'react'
import { agents } from '../constants'
import { convertNamesToAgents } from '../utilities'

type Props = {
    sortedAgentNames: string[]
}

const Component: React.FC<Props> = (props) => {

    const chosenAgentList = convertNamesToAgents(props.sortedAgentNames, agents)

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