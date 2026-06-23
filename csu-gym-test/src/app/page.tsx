import { FaFacebook } from 'react-icons/fa6';
import Navbar from '../components/Navbar';
import ExpandableImage from '../components/ExpandableImage';




export default function Home() {
  return (
    <main style={{ overflowX: 'hidden', minHeight: '100vh' }}>
      <Navbar />
      
      <section id="home" className="hero banner-image min-vh-100 d-flex justify-content-center align-items-center">
  <div className="container min-vh-100 d-flex justify-content-center align-items-center">
    <div className="content text-center">
      <img 
  src="/logo3.png" 
  alt="CSU Sports Logo" 
  className="hero-logo mx-auto d-block" 
  data-aos="zoom-in" 
  data-aos-duration="800"
/>
      
      <h1 className="title text-white" style={{ fontFamily: "'CMU Serif', serif" }} data-aos="zoom-in" data-aos-duration="800">
      Caraga State University <br/>University Center for Sports and Recreational 
      </h1>
      <p
        className="desc mt-2 text-white"
        style={{ fontFamily: 'Arial, sans-serif', fontSize: '1rem', fontStyle: 'italic' }}
        data-aos="zoom-in"
        data-aos-duration="800"
        data-aos-delay="500"
        
      >
        “Empowering Minds, Strengthening Bodies.”
      </p>
      
      <a 
  href="https://www.facebook.com/ucsrcsumain" 
  className="mb-3 text-white d-flex justify-content-center align-items-center" 
  style={{ width: '100%' }} // Ensure the div spans the full width
  data-aos="zoom-in"
>
  <FaFacebook size={40} /> 
</a>

      <div
        className="d-flex align-items-center justify-content-center mt-4 gap-2"
        data-aos="zoom-in"
        data-aos-duration="800"
        data-aos-delay="600"
      >
        
      </div>
    </div>
  </div>
</section>






      <section id="service" style={{ minHeight: '50vh' }}>
         <div className="container">
            <div data-aos="fade-up">
               <h2 className="section-title text-center mt-5" style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>Our Services</h2>
               <p className="text-center">The sports University Center provides a range of free services to help students and athletes enhance <br />their skills and enjoy their experience to the fullest.</p>
            </div>
            <div className="row mt-4">
               <div className="col-12 col-md-6 col-lg-3 mt-3 mt-lg-0" data-aos="flip-down">
                  <div className="card h-100">
                     <img
                        src="/sports equipment.png"
                        className="mx-auto mt-4"
                        alt="..."
                     />
                     <h5 className="text-center mt-2" style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>Borrowing of Sports Equipment</h5>
                     <div className="card-body text-center">
                        <p className="card-text text-center">
                           We offer a variety of sports equipment available for students to borrow free of charge. Our inventory includes basketballs, tennis rackets, soccer balls, volleyball nets, and more. All equipment is regularly inspected and maintained to ensure it's in great condition for use. Students can visit the equipment room and borrow what they need by presenting their student ID. This makes it easy to access the gear you need for practice, games, or recreational activities.
                        </p>
                     </div>
                  </div>
               </div>
               <div
                className="col-12 col-md-6 col-lg-3 mt-3 mt-lg-0"
                  data-aos="flip-down"
                  data-aos-delay="300"
               >
                  <div className="card h-100">
                     <img
                        src="/gym session.png"
                        className="mx-auto mt-4"
                        alt="..."
                     />
                     <h5 className="text-center mt-2" style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>Fitness Gym Sessions</h5>
                     <div className="card-body text-center">
                        <p className="card-text text-center">
                           We provide free training sessions aimed at improving physical fitness, endurance, and sport-specific skills. Led by certified trainers, these sessions include strength training, agility exercises, and conditioning workouts. They are open to all students, regardless of experience, allowing everyone to benefit from structured training programs. Sessions are held regularly, and students can join based on their fitness goals or upcoming competitions. These training programs are perfect for those looking to stay active and improve their athletic performance.
                        </p>
                     </div>
                  </div>
               </div>
               <div
                  className="col-12 col-md-6 col-lg-3 mt-3 mt-lg-0"
                  data-aos="flip-down"
                  data-aos-delay="500"
               >
                  <div className="card h-100">
                     <img
                        src="/dlc2.png"
                        className="mx-auto mt-4"
                        alt="..."
                     />
                     <h5 className="text-center mt-2" style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>Drum and Lyre Corps Request</h5>
                     <div className="card-body text-center">
                        <p className="card-text text-center">
                           The Drum and Lyre Corps (DLC) Request is an event-support service provided by the Sports Office to deliver live music and ceremonial structure for school and community events. Through this service, departments can book the ensemble to lead parades, play formal fanfares, and energize crowds during major athletic tournaments.
                        </p>
                     </div>
                  </div>
                  
               </div>
                <div
                  className="col-12 col-md-6 col-lg-3 mt-3 mt-lg-0"
                  data-aos="flip-down"
                  data-aos-delay="700"
               >
                  <div className="card h-100">
                     <img
                        src="athlete selection.png"
                        className="mx-auto mt-4"
                        alt="..."
                     />
                     <h5 className="text-center mt-2" style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>Selection for Student Athletes</h5>
                     <div className="card-body text-center">
                        <p className="card-text text-center">
                           The UCSR conducts organized tryouts and scouting programs to identify and recruit talented student-athletes for the university’s varsity teams. This selection process ensures that students with exceptional athletic potential receive the professional training, development opportunities, and support necessary to represent the university in regional and national competitions.
                        </p>
                     </div>
                  </div>
                  
               </div>
            </div>
         </div>
      </section>
      





      
       <section id="about">
         <h2 className="section-title text-center mt-5 mb-3"  
                  data-aos="fade-up"
                 data-aos-delay="400" style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>About</h2>
         <div className="container px-sm-0 px-lg-5 py-4">

            <div
                  className="wrapper mt-2"
                  data-aos="fade-up"
                  data-aos-delay="400"
               >
                  <div className="gallery_product card-project filter design">
                     <ExpandableImage src="/officers.jpeg" className="img-fluid" />
                     
                  </div>

                  <div className="gallery_product card-project filter development">
                     <ExpandableImage src="/mission vission.png" className="img-fluid" />
                     
                  </div>

                  <div className="gallery_product card-project filter development">
                     
                    <ExpandableImage src="/UCSR.jpeg" className="img-fluid" />
                  </div>

                  

                  

                  

                  

                  
               </div>
            <div className="row">
               <div
                  className="col-lg-6 col-12"
                  data-aos="fade-right"
                  data-aos-offset="400"
                  data-aos-duration="800"
               >
                  <img
                     className="w-100 mt-5"
                     src="/csu ucrs.jpg"
                     alt="University Center for Sports and Recreation"
                  />
               </div>
               <div
                  className="content col-lg-6 col-12 mt-4 mt-lg-0 align-self-center"
                  data-aos="fade-left"
                  data-aos-offset="400"
                  data-aos-duration="800"
               >
                 
                  <h2 className="section-title" style={{ fontFamily: "'CMU Serif', serif" }}>University Center for Sports and Recreation</h2>
                  <p className="desc text-center mt-3 mt-4">
                     The University Center for Sports and Recreation is situated at the heart of the campus, adjacent to the main gymnasium and near the student activity center.
                  </p>
                  <p className="desc text-center">
                    The center offers facilities for students, faculty, and staff to engage in sports, fitness, and recreational activities. From modern fitness equipment to spacious courts for basketball, volleyball, and badminton, the center promotes a healthy and active lifestyle. It also hosts inter-university sports events, fitness workshops, and wellness programs to foster teamwork, discipline, and overall well-being.
                  </p>

               </div>
               <div className="row mt-2">
              

               
            </div>
            </div>
         </div>
      </section>
      










      <section id="documentation">
         <div className="container">
            <div data-aos="fade-up">
               <h2 className="section-title text-center mt-5 mb-3" style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>Documentation</h2>
               <p className="section-title text-center">At the UCSR, we don't just host events, we guide the students. By incorporating facilities with inclusive programs, we translate the spirit of competition into lifelong habits of health. We are constantly evolving to meet the needs of our athletes and fitness enthusiasts, driven by a passion to inspire, connect, and elevate the standard of active living at CSU.</p>
            </div>




            
              




               <div
                  className="wrapper mt-2"
                  data-aos="fade-up"
                  data-aos-delay="400"
               >
                  <div className="gallery_product card-project filter design">
                     <a href="https://www.facebook.com/share/18kYAN7rCB/" target="_blank" rel="noopener noreferrer">
                     <img
                        src="/events1.jpg"
                        className="img-fluid"
                     />
                     </a>
                     <div className="overlay">
                        <a href="https://azurakit.vercel.app" target="_blank">
                           <i className="ai-link-out"></i>
                        </a>
                     </div>
                  </div>

                  <div className="gallery_product card-project filter development">
                     <a href="https://www.facebook.com/share/1BU8HQVFBk/" target="_blank" rel="noopener noreferrer">
                     <img
                        src="/events2.jpg"
                        className="img-fluid"
                     />
                     </a>
                     <div className="overlay">
                        <a href="https://azurakit.vercel.app" target="_blank">
                           <i className="ai-link-out"></i>
                        </a>
                     </div>
                  </div>

                  <div className="gallery_product card-project filter development">
                     
                    <a href="https://www.facebook.com/share/1XKgSVLWeX/" target="_blank" rel="noopener noreferrer">
                     <img
                        src="/events3.jpg"
                        className="img-fluid"
                     />
                     </a>
                     <div className="overlay">
                        <a href="https://azurakit.vercel.app" target="_blank">
                           <i className="ai-link-out"></i>
                        </a>
                     </div>
                  </div>

                  <div className="gallery_product card-project filter design">
                     <a href="https://www.carsu.edu.ph/csu-welcomes-new-president-honors-masts-champions/" target="_blank" rel="noopener noreferrer">
                     <img
                        src="/events4.jpg"
                        className="img-fluid"
                     />
                     </a>
                     <div className="overlay">
                        <a href="https://azurakit.vercel.app" target="_blank">
                           <i className="ai-link-out"></i>
                        </a>
                     </div>
                  </div>

                  <div className="gallery_product card-project filter design">
                     <a href="https://www.facebook.com/share/18kYAN7rCB/" target="_blank" rel="noopener noreferrer">
                     <img
                        src="/events5.jpg"
                        className="img-fluid"
                     />
                     </a>
                     <div className="overlay">
                        <a href="https://azurakit.vercel.app" target="_blank">
                           <i className="ai-link-out"></i>
                        </a>
                     </div>
                  </div>

                  <div className="gallery_product card-project filter design">
                    <a href="https://www.facebook.com/share/1GqceSrJ1G/" target="_blank" rel="noopener noreferrer">
                     <img
                        src="/events6.jpg"
                        className="img-fluid"
                     />
                     </a>
                     <div className="overlay">
                        <a href="https://azurakit.vercel.app" target="_blank">
                           <i className="ai-link-out"></i>
                        </a>
                     </div>
                  </div>

                  <div className="gallery_product card-project filter design">
                     <a href="https://www.facebook.com/share/1BNWxkopfq/" target="_blank" rel="noopener noreferrer">
                     <img
                        src="/events7.jpg"
                        className="img-fluid"
                     />
                     </a>
                     <div className="overlay">
                        <a href="https://azurakit.vercel.app" target="_blank">
                           <i className="ai-link-out"></i>
                        </a>
                     </div>
                  </div>

                  <div className="gallery_product card-project filter design">
                     <a href="https://www.facebook.com/share/p/1Buc42d2A6/" target="_blank" rel="noopener noreferrer">
                     <img
                        src="/events8.jpg"
                        className="img-fluid"
                     />
                     </a>
                     <div className="overlay">
                        <a href="https://azurakit.vercel.app" target="_blank">
                           <i className="ai-link-out"></i>
                        </a>
                     </div>
                  </div>
               </div>
            
         </div>
      </section>
   












       

      






      <footer className="text-center">
         <p>
            &copy;
            <a href="https://www.facebook.com/ucsrcsumain" target="_blank">UCSRCSUmain</a>  
              <br/>Competence, Service, and Uprightness
         </p>
      </footer>
     

      
   
    </main>
  );
}