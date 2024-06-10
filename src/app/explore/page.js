'use client';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Cookies from 'js-cookie';
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import GameCard from '@/components/GameCard';
import GameCreatedCard from '@/components/GameCreatedCard';
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { createClient } from "@supabase/supabase-js";
import useFonts from "@/components/hooks/useFonts";

export default function Dashboard() {

  const [token, settoken] = useState('');
  const [pagestatus, setpagestatus] = useState('snl');
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [createdGames, setCreatedGames] = useState([]);
  const [bgImage, setBgImage] = useState('/snake1.png');

  const accountDataKey = 'zklogin-demo.accounts';

  function loadAccounts(){
    if(typeof window !== 'undefined'){
    const dataRaw = sessionStorage.getItem(accountDataKey);
    if (!dataRaw) {
        return [];
    }
    const data = JSON.parse(dataRaw);
    return data;
  }
  }

  const accounts = useRef(loadAccounts());

  useEffect(() => {
    const call = () => {
      const loggedin = Cookies.get('snl_wallet');
      settoken(loggedin);
    };
    call();
  }, []);

  const NETWORK='devnet';
  const suiClient = new SuiClient({
      url: getFullnodeUrl(NETWORK),
  });

  const queryevents = async(objectId) => {
    let cursor = null;
    let hasNextPage = false;
    let allParsedJsonData = [];

    do {
      const res = await suiClient.queryEvents({
                query: {
                    MoveModule: {
                        module: `snl`,
                        package: '0xd348310f8e57743321ecbb0059c7c7c007f6cf9d1357df5cb600f4ba0ebde5bd',
                    },
                    // objectId,
                },
                limit: 50,
                order: "ascending",
                cursor,
            });

            cursor = res.nextCursor;
    hasNextPage = res.hasNextPage;

    console.log(
      res.data.length,
      res.data.map((d) => d.parsedJson),
      res.nextCursor,
      res.hasNextPage,
    );
    
    allParsedJsonData = allParsedJsonData.concat(res.data.map((d) => d.parsedJson));

  } while (hasNextPage);

  console.log("allParsedJsonData", allParsedJsonData);

  const details = allParsedJsonData.find((data) => data.object_id === objectId);

  console.log("details", details);
    return {
      name: details ? details.name : '',
      url: details ? details.url : '',
    };
  }

  useEffect(() => {
    const getnft = async() => {
      setLoading(true);
      const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });
      const objects = await suiClient.getOwnedObjects({ owner: accounts.current[0].userAddr});
      const widgets = [];
      
      // iterate through all objects owned by address
      for (let i = 0; i < objects.data.length; i++) {
        const currentObjectId = objects.data[i].data.objectId;

        // await queryevents();
      
        // get object information
        const objectInfo = await suiClient.getObject({
          id: currentObjectId,
          options: { showContent: true },
        });

        console.log("onject info", objectInfo);
            
        if (objectInfo.data.content.type == `0xd348310f8e57743321ecbb0059c7c7c007f6cf9d1357df5cb600f4ba0ebde5bd::snl::SNL_NFT`) {
          // const widgetObjectId = objectInfo.data.content.fields.id.id;
          const widgetObjectId = objectInfo.data;
          console.log("widget spotted:", widgetObjectId);
          widgets.push(widgetObjectId);
        }
      }
      // setOwnedWidgets(widgets);
      
      console.log("widgets:", widgets);
      setGames(widgets);
      setLoading(false);
    }

    getnft();
  }, [])

  useEffect(() => {
    setLoading(true);
    const fetchGames = async () => {
      
        try {

          const projectlink = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const anonkey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

          const supabase = createClient(projectlink, anonkey);

          const { data: selectdata } = await supabase.from("sln_suis").select();

          console.log("inseted data", selectdata);

          setCreatedGames(selectdata);
          } catch (error) {
            console.error('Error fetching reviews:', error);
          }
        }


    const fetchReviewsData = async () => {
      await fetchGames();
    };
  
    fetchReviewsData().finally(() => setLoading(false));
  }, [pagestatus]);

  const { righteous } = useFonts();

  return (
    <>
    <div className="z-10 w-full flex">
      <div className="z-10 w-full" style={{backgroundColor:'#C5FFF8'}}>
        <header>
    <nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
        <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <Link href="/" class="flex items-center">
                <img src="/snllogo.png" class="mr-3 h-6 sm:h-9" alt="Flowbite Logo" />
                <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white" style={righteous.style}>Snakes N Ladders</span>
            </Link>
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
                    <Link href="/explore" class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Explore</Link>
                    </li>
                    <li>
                        <Link href="/launch" class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Launch</Link>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</header>
      </div>
      </div>
      
    <main
      className="flex flex-col items-center justify-between p-20 min-h-screen"
      // style={{ backgroundImage: `url("${bgImage}")`, backgroundSize: 'cover' }}
      style={{backgroundColor:'#232C12'}}
    >
      <div className="text-3xl text-white font-semibold text-start z-10">Launched games available for mint</div>

          <div className='flex flex-wrap gap-10 justify-center'>
          {loading ? (
            <p>Loading...</p>
          ) : (
            createdGames.map((game, index) => (
              <GameCreatedCard key={index} game={game} />
            ))
          )}
          </div>

          <div className="text-3xl text-white font-semibold text-start z-10 mt-20">Your Minted Games</div>

          <div className='flex flex-wrap gap-10 justify-center'>
          {loading ? (
            <p>Loading...</p>
          ) : (
            games.map((game, index) => (
              <GameCard key={index} game={game} />
            ))
          )}
        </div>


        {loading && (
        <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 w-full max-h-full">
            <div className="relative rounded-lg shadow">
              <div className="flex justify-center gap-4">
                <img
                  src="/dice_loader.gif"
                  alt="Loading icon"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
    </>
  );
}
