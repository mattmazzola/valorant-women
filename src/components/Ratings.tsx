import React from 'react'
import './Ratings.css'
import { agents } from '../constants'
import { Rating, ResolvedSubmission, Submission, Agent } from '../models'


type Props = {
    submissions: Submission<number>[]
}

const Component: React.FC<Props> = (props) => {

    const resolveSubmissions = props.submissions.map<ResolvedSubmission>(submission => {
        const chosenAgentList = submission.rating.map<Agent>(agentIndex => {
            if (agentIndex < 0 || agentIndex > agents.length - 1) {
                throw new Error(`Index of agent ouf of bounds`)
            }

            const agent = agents.find((_, i) => i === agentIndex)

            return agent!
        })

        return {
            name: submission.name,
            agents: chosenAgentList as Rating<Agent>
        }
    })

    return (
        <div className="ratings">
            <b></b>
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

            <b></b>
            {Array.from({ length: agents.length }, (_, i) => i + 1)
                .map(v => (
                    <div key={v}>{v}</div>
                ))}

            {resolveSubmissions.map((resolvedSubmission, i) => {
                return (
                    <React.Fragment key={i}>
                        <div>{resolvedSubmission.name}</div>
                        {resolvedSubmission.agents.map(agent => (
                            <div key={agent.id}>{agent.name}</div>
                        ))}
                    </React.Fragment>
                )
            })}

        </div>
    )
}

export default Component