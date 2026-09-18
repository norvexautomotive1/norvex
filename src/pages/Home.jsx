import React from 'react'
import Hero from '../components/Hero'
import Services from '../components/Services'
import WhyChooseUs from '../components/WhyChooseUs'
import Packages from '../components/Packages'
import Location from '../components/Location'
import Reviews from '../components/Reviews'
const Home = () => {
  return (
    <div>
      <Hero />
      <Services />
      <WhyChooseUs />
      <Packages /> 
      <Reviews />
      <Location />
      
    </div>
  )
}

export default Home