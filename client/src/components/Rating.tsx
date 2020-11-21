import React from 'react'
import './Rating.css'
import { agents, bannedWords } from '../constants'
import { shuffle } from '../utilities'
import { DragDropContext, Droppable, Draggable, DropResult, ResponderProvided } from 'react-beautiful-dnd'
import { Submission } from '../models'

// a little function to help us with reordering the result
function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
}

type Props = {
    onSubmit: (submission: Submission) => void
}

const Component: React.FC<Props> = (props) => {
    const [manuallySortedAgents, updateManuallySortedAgents] = React.useState(() => shuffle(agents))
    const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        if (!result?.destination) {
            return
        }

        const reorderedAgents = reorder(
            manuallySortedAgents,
            result.source.index,
            result.destination.index
        )

        updateManuallySortedAgents(reorderedAgents)
    }

    const [submissionName, setName] = React.useState('')

    const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const lsub = submissionName.toLowerCase()
        const bannedWord = bannedWords.find(word => lsub.includes(word))
        if (bannedWord) {
            console.error(`Don't be a dick! Submission included banned word: ${bannedWord}`)
            return
        }

        const agentNames = manuallySortedAgents.map(agent => agent.id)
        const rawSubmission: Submission = {
            userName: submissionName,
            rankedAgentNames: agentNames,
        }

        setName('')
        props.onSubmit(rawSubmission)
    }

    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const n = event.target.value
        setName(n)
    }

    return (
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
                <div className="ranks">
                    {Array.from({ length: agents.length }, (_, i) => i + 1)
                        .map(v => (
                            <div key={v}>{v}</div>
                        ))}
                </div>

                <Droppable droppableId="agents" direction="horizontal">
                    {(provided) => {
                        return (
                            <ol className="list" {...provided.droppableProps} ref={provided.innerRef}>
                                {manuallySortedAgents.map((agent, index) => (
                                    <Draggable key={agent.id} draggableId={agent.id} index={index}>
                                        {(draggableProvided) => (
                                            <li
                                                className="agent"
                                                ref={draggableProvided.innerRef}
                                                {...draggableProvided.draggableProps}
                                                {...draggableProvided.dragHandleProps}
                                            >
                                                <img src={agent.imageUrl} alt={agent.name}/>
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
            <form onSubmit={onSubmitForm} className="rating-form">
                <label htmlFor="userName">Name:</label>
                <input type="text" name="name" id="userName" placeholder="Enter name" value={submissionName} onChange={onNameChange} required />
                <button type="submit" >Submit</button>
            </form>

        </DragDropContext>
    )
}

export default Component