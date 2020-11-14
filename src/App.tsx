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
        <Rating />

        <form action="">
          <label htmlFor="userName">Name:</label>
          <input type="text" name="name" id="userName" />
          <button type="submit" >Submit</button>
        </form>
      </section>

      <section>
        <h2>What the people think:</h2>
        <p>Based on the average of all the ratings this is what the people think.</p>
        <StaticRating ratings={[1,4,3,2,0,5,6]} />
      </section>

      <section>
        <h2>Individual Ratings</h2>

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
