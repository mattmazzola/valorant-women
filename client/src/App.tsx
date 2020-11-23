import React from 'react'
import './App.css'
import Rating from './components/Rating'
import Ratings from './components/Ratings'
import StaticRating from './components/StaticRating'
import Toggle from './components/Toggle'
import { Submission, SavedSubmission } from './models'
import { agents } from './constants'
import { getRatings, postRating } from './client'

const zeroRatings = agents.reduce<Record<string, number>>((aggregate, agent) => {
  aggregate[agent.id] = 0
  return aggregate
}, {})

function App() {

  const [agentType, setAgentType] = React.useState(true)
  const [submissions, setSubmissions] = React.useState<SavedSubmission[]>([])

  React.useEffect(() => {
    let isMounted = true

    async function loadRatings() {
      const ratings = await getRatings()

      if (isMounted) {
        setSubmissions(ratings)
      }
    }

    loadRatings()

    return () => {
      isMounted = false
    }
  }, [])

  const totalRatings = submissions.reduce((totals, submission) => {

    for (const [i, a] of submission.rankedAgentNames.entries()) {
      totals[a] += i
    }

    return totals
  }, { ...zeroRatings })

  const avgRatings = { ...totalRatings }
  Object.entries(avgRatings)
    .forEach(([key, value]) => {
      avgRatings[key] = value / submissions.length
    })

  const avgRatingNames = Object.entries(avgRatings)
    .sort(([key1, v1], [key2, v2]) => v1 - v2)
    .map(([key]) => key)

  const onSubmit = async (submission: Submission) => {

    const savedSubmission = await postRating(submission)
    console.log({ submission, savedSubmission })

    setSubmissions([...submissions, savedSubmission])
  }

  const onChangeAgentType = (agentType: boolean) => {
    console.log({ agentType })
    setAgentType(x => !x)
  }

  return (
    <div className="center">
      <header>
        <h1>Rate the Women of Valorant</h1>
      </header>

      <section>
        <h2>Rank the Women:</h2>
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
        <Rating onSubmit={onSubmit} />
      </section>

      <section>
        <h2>What the People Think:</h2>
        <p>Based on the average of all the 7234 ratings this is what the people think.</p>
        <StaticRating sortedAgentNames={avgRatingNames} />
      </section>

      <section>
        <h2>Individual Ratings</h2>
        <p>Ratings by individual submissions.</p>
        <Ratings submissions={submissions} />
      </section>
    </div>
  )
}

export default App
