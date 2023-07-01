import React from 'react'
import { convertNamesToAgents } from '~/helpers'
import { Agent, Resolved, SavedSubmission } from '~/models'

type Props = {
    agents: Agent[]
    submissions: SavedSubmission[]
    currentUserId?: string
}

const datetimeOptions: Intl.DateTimeFormatOptions = {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
}
const Component: React.FC<Props> = (props) => {

    const resolveSubmissions = props.submissions.map<Resolved<SavedSubmission>>(submission => {
        const chosenAgentList = convertNamesToAgents(submission.rankedAgentNames, props.agents)

        return {
            id: submission.id,
            isWomen: submission.isWomen,
            userId: submission.userId,
            user: submission.user,
            createdAtMs: submission.createdAtMs,
            rankedAgents: chosenAgentList,
        }
    })

    return (
        <div className="ratings" data-agents={props.agents.length}>
            <div>User Name</div>
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
            {Array.from({ length: props.agents.length }, (_, i) => i + 1)
                .map(v => (
                    <div key={v}>{v}</div>
                ))}

            <div className="line"></div>

            {resolveSubmissions.length === 0
                ? <div className="empty">No ratings submitted yet! Submit the first!</div>
                : resolveSubmissions.map((resolvedSubmission, i) => {
                return (
                    <React.Fragment key={i}>
                        <div>
                            {resolvedSubmission.user?.username ?? resolvedSubmission.user?.firstName ?? 'Unknown User'}
                            {typeof props.currentUserId === 'string' && props.currentUserId === resolvedSubmission.user?.id && (
                                ` ⭐`
                            )}
                        </div>
                        <div>{new Date(resolvedSubmission.createdAtMs).toLocaleDateString('en-us', datetimeOptions)}</div>
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
