import React from 'react'

function Hero() {
    return ( 
        <section className="container-fluid" id="superHero">
      <div className="p-5 " id="supportWrapper">
        <h5>Support Portal</h5>
       <a href=" "  style={{textDecoration:"none"}}>Track Ticket</a>
      </div>
      <div className="row p-5 m-3" >
        <div className="col-6 p-5 " >
          <h1 className='fs-3'>Search for an answer or browse help topics to create a ticket</h1>
          <input placeholder='Eg: how do i activate F&O, why is my order getting rejected...' /> <br/>
           <a href=' '>Track account opening</a>
           <a href=' '>Track segment activation</a> 
           <a href=' '>Intraday margins </a>
          <a href=' '> Kite user manual</a>

        </div>
        <div className="col-6 p-5 " >
          <h1 className='fs-3'>Featured</h1>
          <ol>
            <li><a href=' ' style={{textDecoration:"none"}}>Rights Entitlements listing in May 2025 </a></li>
            <li><a href=' ' style={{textDecoration:"none"}}> Offer for sale (OFS) – May 2025</a></li>
          </ol>
           
          
        </div>
      </div>
    </section>
     );
}

export default Hero;