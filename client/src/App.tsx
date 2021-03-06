import React from 'react'
import './App.css'
import Rating from './components/Rating'
import Ratings from './components/Ratings'
import StaticRating from './components/StaticRating'
import Toggle from './components/Toggle'
import { Submission, SavedSubmission } from './models'
import { femaleAgents, maleAgents } from './constants'
import { getRatings, postRating } from './client'
import { getAgentNamesSortedByRating } from './utilities'

console.log({ femaleAgents, maleAgents })

function App() {

  const [agentType, setAgentType] = React.useState(true)
  const activeSex = agentType ? 'Women' : 'Men'

  React.useEffect(() => {
    document.title = `${activeSex} of Valorant`
  })

  const [womenSubmissions, setWomenSubmissions] = React.useState<SavedSubmission[]>([])
  const [menSubmissions, setMenSubmissions] = React.useState<SavedSubmission[]>([])

  React.useEffect(() => {
    let isMounted = true

    async function loadRatings() {
      const [womenRatings, menRatings] = await Promise.all([getRatings("women"), getRatings("men")])

      if (isMounted) {
        setWomenSubmissions(womenRatings)
        setMenSubmissions(menRatings)
      }
    }

    loadRatings()

    return () => {
      isMounted = false
    }
  }, [])

  const avgWomenRatingNames = getAgentNamesSortedByRating(womenSubmissions, femaleAgents)
  const avgMenRatingNames = getAgentNamesSortedByRating(menSubmissions, maleAgents)

  const onSubmitWomenRating = async (submission: Submission) => {
    const savedSubmission = await postRating(submission)
    console.log({ submission, savedSubmission })

    setWomenSubmissions([...womenSubmissions, savedSubmission])
  }

  const onSubmitMenRating = async (submission: Submission) => {
    const savedSubmission = await postRating(submission)
    console.log({ submission, savedSubmission })

    setMenSubmissions([...menSubmissions, savedSubmission])
  }

  const onChangeAgentType = (aType: boolean) => {
    setAgentType(x => aType)
  }



  return (
    <div className="center">
      <header>
        <h1>Rate the {activeSex} of Valorant</h1>
      </header>

      <section>
        <h2>Rank the {activeSex}:</h2>
        <p>Who do you find most attractive from Valorant?</p>
        <div className="toggler">
          <b></b>
          <Toggle
            on={agentType}
            onChange={onChangeAgentType}
            onLabel="Women"
            offLabel="Men"
          />
          <b></b>
        </div>
        {agentType
          ? <Rating onSubmit={onSubmitWomenRating} agents={femaleAgents} gender="women" key="female" />
          : <Rating onSubmit={onSubmitMenRating} agents={maleAgents} gender="men" key="male" />}
      </section>

      <section>
        <h2>What the People Think:</h2>
        <p>Based on the average of all the {agentType ? womenSubmissions.length : menSubmissions.length} ratings this is what the people think.</p>
        {agentType
          ? <StaticRating sortedAgentNames={avgWomenRatingNames} agents={femaleAgents} />
          : <StaticRating sortedAgentNames={avgMenRatingNames} agents={maleAgents} />}
      </section>

      <section>
        <h2>Individual Ratings</h2>
        <p>Ratings by individual submissions.</p>
        {agentType
          ? <Ratings submissions={womenSubmissions} agents={femaleAgents} />
          : <Ratings submissions={menSubmissions} agents={maleAgents} />}
      </section>
    </div>
  )
}

export default App
