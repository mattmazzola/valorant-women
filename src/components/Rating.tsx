import React from 'react'
import './Rating.css'
import { agents } from '../constants'
import { shuffle } from '../utilities'
import { DragDropContext, Droppable, Draggable, DropResult, ResponderProvided } from 'react-beautiful-dnd'

// a little function to help us with reordering the result
function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
}

const Component: React.FC = () => {
    const [shuffledAgents, updateAgents] = React.useState(() => shuffle(agents))
    const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        if (!result?.destination) {
            return
        }

        const reorderedAgents = reorder(
            shuffledAgents,
            result.source.index,
            result.destination.index
        )

        updateAgents(reorderedAgents)
    }

    const [submissionName, setName] = React.useState('')

    const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const agentIndices = shuffledAgents.map(agent => agents.findIndex(a => a.id === agent.id))

        console.log({ submissionName, agentIndices, shuffledAgents })
        setName('')
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
                        Rank the Women
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
                                {shuffledAgents.map((agent, index) => (
                                    <Draggable key={agent.id} draggableId={agent.id} index={index}>
                                        {(draggableProvided) => (
                                            <li
                                                className="agent"
                                                ref={draggableProvided.innerRef}
                                                {...draggableProvided.draggableProps}
                                                {...draggableProvided.dragHandleProps}
                                            >
                                                <img src={agent.imageUrl} />
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