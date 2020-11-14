import React from 'react'
import './App.css'
import Rating from './components/Rating'

function App() {

  return (
    <div>
      <header>
        <h1>Rate the Women of Valorant</h1>
      </header>

      <section>
        <h2>Rank the Women:</h2>
        <Rating />
      </section>

      <section>
        <h2>What the people think:</h2>
        <p>Based on the average of all the ratings this is what the people think.</p>
        <Rating />
      </section>

      <section>
        <h2>Individual Ratings</h2>

      </section>
    </div>
  )
}

export default App
