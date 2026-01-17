/* eslint-disable no-unused-vars */
import React from 'react'
import Hero from '../home/Hero';
import Awards from '../home/Awards';
import Stats from '../home/Stats';
import Pricing from '../home/Pricing';
import Education from '../home/Education';



import OpenAccount from '../OpenAccount';
import Navbar from '../Navbar';
import Footer from '../Footer';

function HomePage() {
    return ( 
        <>
         
          <Hero/>
          <Awards />
          <Stats />
          <Pricing/>
          <Education/>
          <OpenAccount />
          
        </>
     );
}

export default HomePage;