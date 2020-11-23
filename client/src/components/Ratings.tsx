import React from 'react'
import './Ratings.css'
import { agents } from '../constants'
import { Resolved, SavedSubmission } from '../models'
import { convertNamesToAgents } from '../utilities'

type Props = {
    submissions: SavedSubmission[]
}

const datetimeOptions: Intl.DateTimeFormatOptions = {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
}
const Component: React.FC<Props> = (props) => {

    const resolveSubmissions = props.submissions.map<Resolved<SavedSubmission>>(submission => {
        const chosenAgentList = convertNamesToAgents(submission.rankedAgentNames, agents)

        return {
            id: submission.id,
            userName: submission.userName,
            createdAt: submission.createdAt,
            rankedAgents: chosenAgentList,
        }
    })

    return (
        <div className="ratings">
            <b></b>
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
            <b></b>
            {Array.from({ length: agents.length }, (_, i) => i + 1)
                .map(v => (
                    <div key={v}>{v}</div>
                ))}

            <div className="line"></div>

            {resolveSubmissions.map((resolvedSubmission, i) => {
                return (
                    <React.Fragment key={i}>
                        <div>{resolvedSubmission.userName}</div>
                        <div>{new Date(resolvedSubmission.createdAt).toLocaleDateString('en-us', datetimeOptions)}</div>
                        {resolvedSubmission.rankedAgents.map(agent => (
                            <div key={agent.id}>{agent.name}</div>
                        ))}
                    </React.Fragment>
                )
            })}

        </div>
    )
}

export default Component