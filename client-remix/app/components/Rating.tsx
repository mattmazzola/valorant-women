import React from 'react'
import { DragDropContext, Draggable, Droppable, DropResult, ResponderProvided } from 'react-beautiful-dnd'
import { femaleSex } from "~/constants"
import { Agent, Submission } from '../models'

// function to help us with reordering the result
function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
}

type Props = {
    gender: "women" | "men"
    agents: Agent[]
    onSubmit: (submission: Submission) => void
}

const Rating: React.FC<Props> = (props) => {
    const [manuallySortedAgents, setManuallySortedAgents] = React.useState(() => props.agents)
    const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        if (!result?.destination) {
            return
        }

        const reorderedAgents = reorder(
            manuallySortedAgents,
            result.source.index,
            result.destination.index
        )

        setManuallySortedAgents(reorderedAgents)
    }

    const onClickSubmit: React.MouseEventHandler<HTMLButtonElement> = e => {
        e.preventDefault()
        console.log('onClickSubmit')
        const agentNames = manuallySortedAgents.map(agent => agent.id)
        const submission: Submission = {
            isWomen: props.gender === femaleSex.toLowerCase(),
            rankedAgentNames: agentNames,
        }

        console.log('onClickSubmit', { submission })
        props.onSubmit(submission)
    }

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
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
                    <div className="ranks" data-agents={props.agents.length}>
                        {Array.from({ length: props.agents.length }, (_, i) => i + 1)
                            .map(v => (
                                <div key={v}>{v}</div>
                            ))}
                    </div>

                    <Droppable droppableId={`agents-${props.agents[0].id}`} direction="horizontal">
                        {(provided) => {
                            return (
                                <ol className="list" data-agents={props.agents.length} {...provided.droppableProps} ref={provided.innerRef}>
                                    {manuallySortedAgents.map((agent, index) => (
                                        <Draggable key={agent.id} draggableId={agent.id} index={index}>
                                            {(draggableProvided) => (
                                                <li
                                                    className="agent"
                                                    ref={draggableProvided.innerRef}
                                                    {...draggableProvided.draggableProps}
                                                    {...draggableProvided.dragHandleProps}
                                                >
                                                    <img src={agent.imageUrl} alt={agent.name} />
                                                    <div className="name">{agent.name}</div>
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </ol>
                            )
                        }}
                    </Droppable>
                </div>
            </DragDropContext>
            <button type="button" className="orangeButton large spaced" onClick={onClickSubmit}>Submit</button>
        </>
    )
}

export default Rating