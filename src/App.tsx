import React from 'react'
import './App.css'
import Rating from './components/Rating'
import Ratings from './components/Ratings'
import StaticRating from './components/StaticRating'

function App() {

  return (
    <div className="center">
      <header>
        <h1>Rate the Women of Valorant</h1>
      </header>

      <section>
        <h2>Rank the Women:</h2>
        <p>Who do you find most attractive from Valorant?</p>
        <Rating />
      </section>

      <section>
        <h2>What the People Think:</h2>
        <p>Based on the average of all the 7234 ratings this is what the people think.</p>
        <StaticRating ratings={[1,4,3,2,0,5,6]} />
      </section>

      <section>
        <h2>Individual Ratings</h2>
        <p>Ratings by individual submissions.</p>
        <Ratings submissions={[
          {
            name: 'Matt',
            rating: [5,2,3,6,1,4,0],
          }
        ]} />
      </section>
    </div>
  )
}

export default App
