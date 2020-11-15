import React from 'react'
import './Ratings.css'
import { agents } from '../constants'
import { ResolvedSubmission, Submission, Agent } from '../models'
import { convertNamesToAgents } from '../utilities'

type Props = {
    submissions: Submission<string>[]
}

const Component: React.FC<Props> = (props) => {

    const resolveSubmissions = props.submissions.map<ResolvedSubmission>(submission => {
        const chosenAgentList = convertNamesToAgents(submission.rating, agents)

        return {
            name: submission.name,
            agents: chosenAgentList
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