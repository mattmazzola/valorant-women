import React from 'react'
import './App.css'
import Rating from './components/Rating'
import Ratings from './components/Ratings'
import StaticRating from './components/StaticRating'
import { Submission } from './models'
import { agents } from './constants'
import { convertNamesToAgents } from './utilities'

const zeroRatings = agents.reduce<Record<string, number>>((aggregate, agent) => {
  aggregate[agent.name] = 0
  return aggregate
}, {})

function App() {

  const [submissions, setSubmissions] = React.useState<Submission<string>[]>([
    {
      name: 'Matt',
      datetime: 1605430818981,
      rating: ['Jett', 'Killjoy', 'Reyna', 'Sage', 'Skye', 'Raze', 'Viper'],
    },
    {
      name: 'Colton',
      datetime: 1605430818981,
      rating: ['Killjoy', 'Viper', 'Reyna', 'Sage', 'Jett', 'Raze', 'Skye'],
    },
    {
      name: 'Rance',
      datetime: 1605430818981,
      rating: ['Skye', 'Jett', 'Killjoy', 'Raze', 'Sage', 'Reyna', 'Viper'],
    },
  ])

  const totalRatings = submissions.reduce((totals, submission) => {
    const ratedAgents = convertNamesToAgents(submission.rating, agents)

    for (const [i, a] of ratedAgents.entries()) {
      totals[a.id] += i
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

  console.log(avgRatingNames)

  const onSubmit = (submission: Submission<string>) => {
    console.log({ submission })

    setSubmissions([...submissions, submission])
  }

  return (
    <div className="center">
      <header>
        <h1>Rate the Women of Valorant</h1>
      </header>

      <section>
        <h2>Rank the Women:</h2>
        <p>Who do you find most attractive from Valorant?</p>
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
