import React from 'react'
import Hero from '../components/Hero'
import Services from '../components/Services'
import WhyChooseUs from '../components/WhyChooseUs'
import Packages from '../components/Packages'
import Location from '../components/Location'
import Reviews from '../components/Reviews'
import LastCta from '../components/LastCta'
const Home = () => {
  return (
    <div>
      <Hero />
      <Services />
      <WhyChooseUs />
      <Packages /> 
      <Reviews />
      <Location />
      <LastCta />
    </div>
  )
}

export default Home