'use client';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Zoom } from 'react-reveal';

export default function Home() {
  const [wallet, setwallet] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);

  useEffect(() => {
    const call = () => {
      const loggedin = Cookies.get('snl_wallet');
      setwallet(loggedin);
    };
    call();
  }, []);

  const [scrollDirection, setScrollDirection] = useState('down');
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > prevScrollY) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }

      setPrevScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY]);

  return (
    <>
    <header>
    <nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
        <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <a href="/" class="flex items-center">
                <img src="/bingo_lion2.png" class="mr-3 h-6 sm:h-9" alt="Flowbite Logo" />
                <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">SNL</span>
            </a>
            <div class="flex items-center lg:order-2">
                <Navbar/>
                <button data-collapse-toggle="mobile-menu-2" type="button" class="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu-2" aria-expanded="false">
                    <span class="sr-only">Open main menu</span>
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
                    <svg class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                </button>
            </div>
            <div class="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1 z-10" id="mobile-menu-2">
                <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                    <li>
                    <a href="/explore" class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Explore</a>
                    </li>
                    <li>
                        <a href="/launch" class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Launch</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</header>
  
    <main
      className="flex min-h-screen flex-col items-center justify-between p-20"
      style={{
        backgroundImage:
          'radial-gradient(circle at bottom left, #040819 10%, #0162FF 40% , #1D73FF, #5696FF, #8EB9FF, #AACBFF)',
      }}
    >
      

      <div className="lg:flex md:flex justify-between gap-20 my-10">
        <div className='my-auto'>
          <div className="text-6xl text-white font-bold mb-10 text-center">
          SNL
          </div>
          <div className="text-center text-white">
            Onchain game platform to experience the classic Snake and <br></br>
            Ladder game reimagined for modern learning, with dynamic <br></br>
            content integration for an engaging educational journey.
          </div>
        </div>
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`pb-8 border border-gray-500 rounded-3xl transition-transform duration-300 mt-20 lg:mt-0 md:mt-0 ${
            isHovered
              ? 'transform scale-125 shadow-2xl'
              : 'transform scale-110 shadow-lg'
          }`}
        >
          <Link href="/explore">
            <Image
              src="/snake1.png"
              width={300}
              height={300}
              className="rounded-t-3xl w-full"
            />
            <div className="text-center text-white mx-auto text-xl py-4">
              SNAKE N LADDER
            </div>
            <div className="text-center text-white text-xs">
              Discover something new and receive an <br></br>NFT to show off
              your achievement.
            </div>
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen text-white mt-40 max-w-5xl">
        <Zoom when={scrollDirection === 'down'}>
          <h1 className="lg:text-5xl font-bold mb-8 text-2xl">
            Unleash Your Competitive Spirit
          </h1>
          <div className="lg:text-2xl font-bold mb-8 text-lg">
            Launch and Play Board Games with Ease!
          </div>
          </Zoom>

          <div id="features" className="mt-16 lg:flex md:flex gap-10">
          {/* Your feature sections here */}
          <div className="lg:w-1/2 md:w-1/2 text-lg">
            <div className="rounded-2xl px-4 py-4 text-black" 
            style={{
        backgroundImage:
          'radial-gradient(circle at top left, #F7418F 10%, #FFE6E6 40%)',
      }}>
              <div className='font-bold text-end' style={{color: '#F7418F'}}>Dynamic Learning Experience</div>
              <div className='w-4/5 mt-4 text-end flex ml-auto' style={{fontSize:16}}>Whether you are ascending ladders or descending snakes, each interaction with the board presents a new opportunity to absorb valuable information.</div>
            </div>
            <div className="rounded-2xl px-4 py-4 mt-6 text-black" 
            style={{
              backgroundImage:
                'radial-gradient(circle at bottom right, #5AB2FF 10%, #FFE6E6 40%)',
            }}>
              <div className='font-bold' style={{color: '#8576FF'}}>Personalized Learning Path</div>
              <div className='w-4/5 mt-4' style={{fontSize:16}}>Customize your learning path with our JSON file upload feature, ensuring an educational and entertaining journey awaits.</div>

            </div>

            <div className="rounded-2xl px-4 py-4 mt-6 text-black" 
            style={{
              backgroundImage:
                'radial-gradient(circle at top left, #AD88C6 10%, #FFE6E6 40%)',
            }}>
              <div className='font-bold text-end' style={{color: '#86469C'}}>Educational Content Integration</div>
              <div className='w-4/5 mt-4 text-end flex ml-auto' style={{fontSize:16}}>Whether its tackling challenging questions or delving into informative topics, every step you take on the board brings you closer to enhancing your understanding.</div>

            </div>
          </div>
          <Zoom when={scrollDirection === 'down'}>
          <div className="w-1/2 rounded-2xl px-60 py-60 lg:mt-0 md:mt-0 mt-10" 
          style={{backgroundImage: "url('/diceroll.gif')", backgroundRepeat:'no-repeat', backgroundSize:'cover', backgroundPosition:'center'}}
          >
          </div>
          </Zoom>
        </div>
        

        
      </div>
    </main>
    </>
  );
}
