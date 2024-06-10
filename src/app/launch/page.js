'use client';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Cookies from 'js-cookie';
import { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import { removePrefix } from "../../../modules/Utils/ipfsUtil";
import { NFTStorage } from "nft.storage";
const client = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFFODE2RTA3RjBFYTg4MkI3Q0I0MDQ2QTg4NENDQ0Q0MjA4NEU3QTgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3MzI0NTEzNDc3MywibmFtZSI6Im5mdCJ9.vP9_nN3dQHIkN9cVQH5KvCLNHRk3M2ZO4x2G99smofw" });
import 'react-datepicker/dist/react-datepicker.css';
import { createClient } from "@supabase/supabase-js";
import { gameContent } from '@/lib/GameData';
import {
  genAddressSeed,
  getZkLoginSignature,
  jwtToAddress,
  getExtendedEphemeralPublicKey,
} from "@mysten/zklogin";
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  SerializedSignature,
  decodeSuiPrivateKey,
} from "@mysten/sui.js/cryptography";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import useFonts from "@/components/hooks/useFonts";

export default function Dashboard() {
  const [token, settoken] = useState('');
  const [pagestatus, setpagestatus] = useState('create');
  const [gamename, setgamename] = useState('');
  const [price, setprice] = useState(null);
  const [symbol, setsymbol] = useState('');
  const [picture, setpicture] = useState('');
  const [coverimg, setcoverimg] = useState('');
  const [ticketimg, setticketimg] = useState('');
  const [description, setdescription] = useState('');
  const [type, settype] = useState('snl');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateAsU64, setDateAsU64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creategamedone, setcreategamedone] = useState(false);
  const [bgImage, setBgImage] = useState('/snake1.png');
  const [grids, setgrids] = useState("0");
  const [imageInputs, setImageInputs] = useState([]);
  const [imageinputarray, setImageInputArray] = useState([]);

  const [loadingdetails, setloadingdetails] = useState(0);

  const [topicName, setTopicName] = useState(""); // State to store the topic name

  const [viewhide, setviewhide] = useState(false);
  const [gamedataloading, setgamedataLoading] = useState(false);

  const [ipfsmetahashnft, setipfsmetahashnft] = useState("");

  const accountDataKey = 'zklogin-demo.accounts';

  function keypairFromSecretKey(privateKeyBase64) {
    const keyPair = decodeSuiPrivateKey(privateKeyBase64);
    return Ed25519Keypair.fromSecretKey(keyPair.secretKey);
  }

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

  const NETWORK='devnet';
  const MAX_EPOCH = 2; // keep ephemeral keys active for this many Sui epochs from now (1 epoch ~= 24h)
  const accounts = useRef(loadAccounts()); // useRef() instead of useState() because of setInterval()
  // const [balances, setBalances] = useState(new Map()); // Map<Sui address, SUI balance>
  const [modalContent, setModalContent] = useState('');
  const suiClient = new SuiClient({
      url: getFullnodeUrl(NETWORK),
  });

  // Function to handle input change
  const handleGenerateTextChange = (event) => {
    setTopicName(event.target.value); // Update the topicName state with the input value
  };


  useEffect(() => {
    const call = () => {
      const loggedin = Cookies.get('snl_wallet');
      settoken(loggedin);
    };
    call();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const millisecondsSinceEpoch = date.getTime();
      const secondsSinceEpoch = Math.floor(millisecondsSinceEpoch / 1000); // Convert milliseconds to seconds
      setDateAsU64(secondsSinceEpoch);
    } else {
      setDateAsU64(null);
    }
  };

  async function uploadImage(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const blobDataImage = new Blob([e.target.files[0]]);
      const metaHash = await client.storeBlob(blobDataImage);
      setpicture(`ipfs://${metaHash}`);
      console.log("profilePictureUrl",metaHash)
    } catch (error) {
      console.log("Error uploading file: ", error);
    } finally {
      setLoading(false);
    }
  }

  

  async function uploadcoverImage(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const blobDataImage = new Blob([e.target.files[0]]);
      const metaHash = await client.storeBlob(blobDataImage);
      setcoverimg(`ipfs://${metaHash}`);
      console.log("coverImageHash",metaHash)
    } catch (error) {
      console.log("Error uploading file: ", error);
    } finally {
      setLoading(false);
    }
  }


  async function uploadticketImage(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const blobDataImage = new Blob([e.target.files[0]]);
      const metaHash = await client.storeBlob(blobDataImage);
      setticketimg(`ipfs://${metaHash}`);
      console.log("coverImageHash",metaHash)
    } catch (error) {
      console.log("Error uploading file: ", error);
    } finally {
      setLoading(false);
    }
  }

  const creategame = async () => {
    const wallet = Cookies.get('snl_wallet');
    setLoading(true);

    try {

      const projectlink = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonkey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const supabase = createClient(projectlink, anonkey);


      const data = [{ contract_address: "testing" }];

      const { data: insertedData, error } = await supabase.from('snl_sui').insert(data).select();

      const { data: selectdata } = await supabase.from("snl_sui").select();

      console.log("inseted data", insertedData, selectdata);

      // Convert state variable to JSON string
      const stateVariableJSON = JSON.stringify(gameData);

      // Convert JSON string to Blob
      const blobData = new Blob([stateVariableJSON]);

      // Upload blob to IPFS
      const metaHash = await client.storeBlob(blobData);

      const ipfsmetahash = `ipfs://${metaHash}`;

        let snlData = {
          name: gamename,
          symbol: symbol,
          picture: picture,
          coverImage: coverimg,
          description: description,
          creatorWalletAddress: wallet,
          gameData: ipfsmetahash
        };

        console.log("snl game data", snlData);

        const gameNFTdata = JSON.stringify(snlData);

      // Convert JSON string to Blob
      const blobDatanft = new Blob([gameNFTdata]);

      // Upload blob to IPFS
      const metaHashnft = await client.storeBlob(blobDatanft);

      const ipfsmetahashnft = `ipfs://${metaHashnft}`;

      // console.log("response game post", response);
      setipfsmetahashnft(ipfsmetahashnft);

      // sendTransaction(accounts.current[0], ipfsmetahashnft);

      try{

        const postgamedata = { name: gamename, url: ipfsmetahashnft}
        const response = await fetch(
          `https://snl.lz9.in/v1.0/snl/insert-address`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // 'Authorization': `Bearer ${auth}`
            },
            body: JSON.stringify(postgamedata),
          }
        );

        console.log("post api", response);

        console.log("game created")
        setcreategamedone(true);
  
        setTimeout(() => {
          window.location.replace('/explore');
        }, 2000);

      }catch (error){
        console.error('Error handling', error);
      }
    
    } catch (error) {
      console.error('Error handling', error);
    } finally {
      setLoading(false);
    }
  };

  async function sendTransaction(account, ipfsmetahashnfturl) {
    
    try {
      setModalContent('🚀 Sending transaction...');
      console.log('[sendTransaction] Starting transaction');
  
      // Sign the transaction bytes with the ephemeral private key
      const txb = new TransactionBlock();
      const packageObjectId = "0xd348310f8e57743321ecbb0059c7c7c007f6cf9d1357df5cb600f4ba0ebde5bd";
      txb.moveCall({
        target: `${packageObjectId}::snl::initialize_game`,
        arguments: [
          txb.pure(gamename),        // Name argument
          txb.pure(ipfsmetahashnfturl), // Description argument
        ],
      });
  
      txb.setSender(accounts.current[0].userAddr);
      console.log('[sendTransaction] Account address:', accounts.current[0].userAddr);
  
      const ephemeralKeyPair = keypairFromSecretKey(account.ephemeralPrivateKey);
      const { bytes, signature: userSignature } = await txb.sign({
        client: suiClient,
        signer: ephemeralKeyPair,
      });
  
      console.log('[sendTransaction] Transaction signed:', { bytes, userSignature });
  
      // Generate an address seed by combining userSalt, sub (subject ID), and aud (audience)
      const addressSeed = genAddressSeed(
        window.BigInt(account.userSalt),
        'sub',
        account.sub,
        account.aud,
      ).toString();
  
      console.log('[sendTransaction] Address seed generated:', addressSeed);
  
      // Serialize the zkLogin signature by combining the ZK proof (inputs), the maxEpoch,
      // and the ephemeral signature (userSignature)
      const zkLoginSignature = getZkLoginSignature({
        inputs: {
          ...account.zkProofs,
          addressSeed,
        },
        maxEpoch: account.maxEpoch,
        userSignature,
      });
  
      console.log('[sendTransaction] ZK Login signature created:', zkLoginSignature);
  
      // Execute the transaction
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature: zkLoginSignature,
        options: {
          showEffects: true,
        },
      });
  
      console.debug('[sendTransaction] executeTransactionBlock response:', result);
   
      await queryevents();
      // await fetchBalances([account]);
    } catch (error) {
      console.warn('[sendTransaction] executeTransactionBlock failed:', error);
    } finally {
      setModalContent('');
    }
  }

  const queryevents = async() => {
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

   // Log the absolute last parsedJson data entry
   const lastParsedJson = allParsedJsonData.length > 0 ? allParsedJsonData[allParsedJsonData.length - 1] : null;
   console.log(lastParsedJson);


    // ----------------------------   send object id in backend api --------------------------------------------------

      // Redirect to a different page after 3 seconds
      setTimeout(() => {
        window.location.replace('/explore');
      }, 2000);

  }

  // Function to generate half the number of image input boxes
  useEffect(() => {
    const generateImageInputs = () => {
      const halfGrids = parseInt(grids) / 2; // Calculate half of the grids value
    const inputs = [];
    for (let i = 1; i <= halfGrids; i++) {
      inputs.push(
        <div className="flex items-center lg:justify-start md:justify-start justify-center mb-10">
                <div className="w-full h-48 ring-1 ring-gray-200 rounded-md">
                  {imageinputarray[i-1] ? (
                    <img
                      alt="alt"
                      src={`${'https://nftstorage.link/ipfs'}/${removePrefix(
                        imageinputarray[i-1]
                      )}`}
                      className="w-full h-full"
                    />
                  ) : (
        <label
                      htmlFor={`uploadmatch${i}`}
                      className="flex flex-col items-center gap-2 cursor-pointer mt-20"
                    >
                      <input
                        id={`uploadmatch${i}`}
                        key={i}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, i)}
                        accept="image/*"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 fill-none stroke-white"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </label>)}
                    </div>
                    </div>
      );
    }
    setImageInputs(inputs);
    }

    generateImageInputs();
  }, [grids])

  // Function to handle image upload
  async function handleImageUpload (e, index){
    // Handle image upload logic here
    e.preventDefault();
    try {
      setLoading(true);
      const blobDataImage = new Blob([e.target.files[0]]);
      const metaHash = await client.storeBlob(blobDataImage);
      setImageInputArray(prevInputs => {
        const updatedInputs = [...prevInputs]; // Create a copy of the previous state array
        updatedInputs[index] = `ipfs://${metaHash}`; // Update the specific index with the new image hash
        return updatedInputs; // Return the updated array
      });
      console.log("coverImageHash",metaHash, imageinputarray);
    } catch (error) {
      console.log("Error uploading file: ", error);
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------- gamedata user changes ------------------------------------------------------------

  const [gameData, setGameData] = useState([...gameContent]);

  // Function to handle changes in term or definition
  const handleInputChange = (id, field, value) => {
    setGameData(prevGameData =>
      prevGameData.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleOptionChange = (id, index, value) => {
    setGameData(prevGameData =>
      prevGameData.map(item =>
        item.id === id
          ? {
              ...item,
              options: item.options.map((option, i) =>
                i === index ? value : option
              )
            }
          : item
      )
    );
  };

  // Function to parse content and create objects
const parseContent = (content) => {
  console.log("content", content);
  const lines = content.split("\n");
  console.log("Lines", lines);
  const obj = {};

  let optionsStarted = false; // Flag to track when options start

  lines.forEach(line => {
    const [key, value] = line.split(":");

    // Check if the line indicates the start of options
    if (key.toLowerCase() === "options") {
      optionsStarted = true;
      obj.options = [];
      return; // Skip processing this line
    }
    
    if(key.toLowerCase() === "answer")
      {
        optionsStarted = false;
      }

    // If options have started, add each option to the array
    if (optionsStarted) {
      const optionContent = key.replace(/^\w+\)\s*/, '').trim();
      obj.options.push(optionContent);
    } else {
      // Otherwise, store other key-value pairs normally
      if(key.toLowerCase() === "answer")
        {
          const optionContent = value.slice(4).trim();
          console.log("answer remove alpha", optionContent);
          obj[key.toLowerCase()] = optionContent;
        }
        else{
          obj[key.toLowerCase()] = value;
        }

      optionsStarted = false;
    }
  });
  return obj;
};

const parseContentsArray = (contents) => {
  const contentBlocks = contents.split("\n\n").slice(1); // Splitting the string into content blocks
  const parsedContents = contentBlocks.map(block => {
    return parseContent(block); // Prepend "Content" to each block before parsing
  });
  return parsedContents;
};


  const generateGameContentfromChatgpt = async() => {
    // Define the topic for which you want to generate game content
const topic = topicName;

// Construct the prompt for generating game content
const prompt = `You are tasked with creating a dataset of only 9 topics for the subject of "${topic}". Each topic should include its term, definition, a question related to the topic, multiple-choice options for the question, and the correct answer. Use the following format for each topic:\n\nTerm : [Topic Name]\nDefinition: [Description of the topic].\nQuestion: [Question related to the topic]?\nOptions:\nA) [Option A]\nB) [Option B]\nC) [Option C]\nD) [Option D]\nAnswer: [Correct answer]\n\nDiscription should contain only 15 words\nAnd Question should contain only 15 words\n\nHere's an example of how the output should look:\n\nTerm := Data Structures and Algorithms\nDefinition: Data structures and algorithms are fundamental concepts in computer science, focusing on organizing and processing data efficiently.\nQuestion: What is the time complexity of a binary search algorithm?\nOptions:\nA) O(1)\nB) O(log n)\nC) O(n)\nD) O(n log n)\nAnswer: B) O(log n)`;

const requestBody = {
  "model": "gpt-4-turbo-preview",
  "messages": [
      {
          "role": "user",
          "content": prompt
      }
  ],
  "temperature": 1,
  "top_p": 1,
  "n": 1,
  "stream": false,
  "max_tokens": 4000,
  "presence_penalty": 0,
  "frequency_penalty": 0
}

// Assuming you have your API key stored somewhere accessible
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

// Define the base URL for the OpenAI API
const baseURL = "https://api.openai.com/v1/chat/completions";

// Define the headers
const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Accept", "application/json");
      headers.append(
        "Authorization",
        `Bearer ${apiKey}`
      );

// Fetch data from OpenAI API
const response = await fetch(baseURL, {
  method: "POST",
  headers: headers,
  body: JSON.stringify(requestBody),
});

if (!response.ok) {
  throw new Error("Failed to fetch game content");
}

const responseData = await response.json();

const parsedContents = parseContentsArray(responseData.choices[0].message.content);

// Now you have the generated content in the specified format and up to 72 items
console.log("generatedContent", parsedContents, responseData.choices[0].message.content);
return parsedContents;
  }

  const generate72items = async () => {
    setgamedataLoading(true);
    const allParsedContents = [];
  
    try {
      for (let count = 0; count < 9; count++) {
        const parsedContents = await generateGameContentfromChatgpt();
        if (parsedContents.length > 0) {

          allParsedContents.push(parsedContents[0]);
          allParsedContents.push(parsedContents[1]);
          allParsedContents.push(parsedContents[2]);
          allParsedContents.push(parsedContents[3]);
          allParsedContents.push(parsedContents[4]);
          allParsedContents.push(parsedContents[5]);
          allParsedContents.push(parsedContents[6]);
          allParsedContents.push(parsedContents[7]);
          setloadingdetails(allParsedContents.length);
          console.log("allParsedContents", allParsedContents);
        }
      }
      console.log("allParsedContents", allParsedContents);

      allParsedContents.forEach((item, index) => {
        item.id = index; // Add id field with index value to each object
      });
      
      setGameData(allParsedContents);
    } catch (error) {
      console.error("Error generating items:", error);
    } finally {
      setgamedataLoading(false);
    }
  }

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
      className="flex flex-col items-center justify-between lg:p-20 md:p-20 py-14"
      // style={{ backgroundImage: `url("${bgImage}")`, backgroundSize: 'cover' }}
      style={{ backgroundImage: `url("/launchbg.png")`}}
    >
      {/* Background div with blur */}
      <div
        style={{
          // filter: 'blur(8px)',
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundSize: 'cover',
          // backgroundImage: `url("${bgImage}")`,
          top: 0,
          left: 0,
          zIndex: 0, // Ensure the blur layer is below the content
        }}
      />

      {pagestatus === 'create' && (
        <div className="w-full z-10 lg:px-60">
          <div
            className="px-10 py-10 rounded-2xl mt-0"
            style={{
              border: '1px solid #0162FF',
              boxShadow: 'inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)',
              backgroundColor:'#E5E7EB'
            }}
          >
            <div>
              <div className="font-bold text-2xl">Launch your Game today</div>
              <div className="lg:flex md:flex justify-between">
                <div className="lg:w-1/2 md:w-1/2 mt-10">
              <input
                type="text"
                placeholder="Game name"
                value={gamename}
                onChange={(e) => setgamename(e.target.value)}
                className="mb-8 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                style={{border: "1px solid #75E2FF", color:'black', backgroundColor:'#41C9E2'}}
              />

              <input
                type="text"
                placeholder="Symbol"
                value={symbol}
                onChange={(e) => setsymbol(e.target.value)}
                className="mb-4 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                style={{border: "1px solid #75E2FF", color:'black', backgroundColor:'#41C9E2'}}
              />
                                        
              </div>

                {picture ? (
                  <>
                    <img
                      alt="alt"
                      src={`${'https://nftstorage.link/ipfs'}/${removePrefix(
                        picture
                      )}`}
                      className="rounded-full"
                      width="200"
                      height="200"
                    />
                  </>
                ) : (
                  <div className="rounded-full h-48 w-48 ring-1 ring-black bg-white w-1/2">
                    <div className="text-black pb-4 text-center pt-16">
                      Picture
                    </div>
                    <label
                      htmlFor="upload"
                      className="flex flex-col items-center gap-2 cursor-pointer -mt-4 ml-2"
                    >
                      <input
                        id="upload"
                        type="file"
                        className="hidden"
                        onChange={uploadImage}
                        accept="image/*"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 fill-white stroke-blue-500"
                        viewBox="0 0 32 32"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </label>
                    </div>
                )}
              
              </div>

              <input
                type="text"
                placeholder="Describe your game"
                value={description}
                onChange={(e) => setdescription(e.target.value)}
                className="mt-4 mb-4 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                style={{border: "1px solid #75E2FF", color:'black', backgroundColor:'#41C9E2'}}
              />

              { type === 'bingo' && (
                <div>
                  <h2 className="text-white pt-2 pb-2">NFT Price</h2>

                  <input
                type="number"
                placeholder="Enter Price in APT"
                value={price}
                onChange={(e) => setprice(e.target.value)}
                className="mb-8 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                style={{border: "1px solid #75E2FF", color:'black'}}
              />


<h2 className="text-white pt-2 pb-2">Prize fund</h2>

<input
type="number"
placeholder="Enter Price in APT"
className="mb-8 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
style={{border: "1px solid #75E2FF", color:'black'}}
/>


              <h2 className="text-white pt-2 pb-2">Select Start Date and Time of the game</h2>

              <div>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="dd-MM-yyyy HH:mm"
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15} // Show time options every 15 minutes
                  isClearable
                  placeholderText="Select Date and time"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="scroll"
                />
              </div>


              <div className="text-white mb-2 mt-4">Upload Ticket Image</div>

              <div className="flex items-center lg:justify-start md:justify-start justify-center mb-10">
                <div className="w-full h-48 ring-1 ring-gray-200 rounded-md">
                  {ticketimg ? (
                    <img
                      alt="alt"
                      src={`${'https://nftstorage.link/ipfs'}/${removePrefix(
                        ticketimg
                      )}`}
                      className="w-full h-full"
                    />
                  ) : (
                    <label
                      htmlFor="uploadticket"
                      className="flex flex-col items-center gap-2 cursor-pointer mt-20"
                    >
                      <input
                        id="uploadticket"
                        type="file"
                        className="hidden"
                        onChange={uploadticketImage}
                        accept="image/*"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 fill-none stroke-white"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </label>
                  )}
                </div>
              </div>

              
              </div>
              )}

              {/* {
                type === 'snl' && (
                  <div>
                    <div className="flex gap-10">
                    <div>
                    <h2 className="text-white pt-2 pb-2">Total number of Snakes</h2>

<input
type="number"
placeholder="Snakes count"
className="mb-8 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
style={{border: "1px solid #75E2FF", color:'black'}}
/>
</div>
<div>
<h2 className="text-white pt-2 pb-2">Total number of Ladders</h2>

<input
type="number"
placeholder="Ladders count"
className="mb-8 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
style={{border: "1px solid #75E2FF", color:'black'}}
/>
</div>
</div>

                  <div className='text-white flex justify-between mt-4 mb-8'>
                    Upload JSON File for trivia and questions
                    <input type="file"/>
                  </div>
                  </div>
                )
              } */}

{ type === 'memory' && (
  <div className="mb-16 w-full">

<h2 className="text-white pt-2 pb-2">Number of Characters</h2>

<input
type="number"
placeholder="Characters count"
className="mb-8 shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
style={{border: "1px solid #75E2FF", color:'black'}}
/>

<h2 className="text-white pt-2 pb-2">Select number of grids</h2>

                                          <select
                                            id="type"
                                            style={{border: "1px solid #75E2FF", color:'black'}}
                                            className="shadow border appearance-none rounded-xl w-full py-4 px-6 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
                                            value={grids}
                                            onChange={(e) => {setgrids(e.target.value);}}
                                            required
                                          >
                                            <option
                                              className="bg-white text-black"
                                              value=""
                                            >
                                              Select Grids
                                            </option>
                                            
                                            <option
                                              className="bg-white text-black"
                                              value="12"
                                            >
                                              12
                                            </option>
                                            <option
                                              className="bg-white text-black"
                                              value="16"
                                            >
                                              16
                                            </option>
                                          
                                          </select>

{/* Render half the number of image input boxes */}
<div className="grid grid-cols-4 gap-4 mt-4">
      {imageInputs.map((input, index) => (
        <div key={index} className="col-span-1 text-white">
          {/* Check if the image input exists */}
          {imageinputarray[index] ? (
            <img
              alt="alt"
              src={`${'https://nftstorage.link/ipfs'}/${removePrefix(
                imageinputarray[index]
              )}`}
              className="w-full h-full"
            />
          ) : (
            <label
              htmlFor={`uploadmatch${index}`}
              className="flex flex-col items-center gap-2 cursor-pointer mt-20"
            >
              <input
                id={`uploadmatch${index}`}
                key={index}
                type="file"
                className="hidden"
                onChange={(e) => handleImageUpload(e, index)}
                accept="image/*"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 fill-none stroke-white"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </label>
          )}
        </div>
      ))}
    </div>

    <div className='text-white flex justify-between mt-8'>
                    Upload JSON File 
                    <input type="file"/>
                  </div>
      
                                        </div>
)}

<div className="text-black mb-2 mt-4">Upload Cover Image</div>

              <div className="flex items-center lg:justify-start md:justify-start justify-center mb-10">
                <div className="w-full h-48 ring-1 ring-black rounded-md">
                  {coverimg ? (
                    <img
                      alt="alt"
                      src={`${'https://nftstorage.link/ipfs'}/${removePrefix(
                        coverimg
                      )}`}
                      className="w-full h-full"
                    />
                  ) : (
                    <label
                      htmlFor="uploadbg"
                      className="flex flex-col items-center gap-2 cursor-pointer mt-20"
                    >
                      <input
                        id="uploadbg"
                        type="file"
                        className="hidden"
                        onChange={uploadcoverImage}
                        accept="image/*"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 fill-none stroke-blue-500"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </label>
                  )}
                </div>
              </div>

              <input 
              type="text" 
              id="topicInput" 
              placeholder="Write topic name here.."
              value={topicName} 
              onChange={handleGenerateTextChange}
              className='rounded-lg border-none py-3' style={{backgroundColor:'#41C9E2'}}
              >
              </input>
              <button onClick={generate72items} className='text-white mb-10 mx-4 border rounded-lg py-4 px-4 text-xs' style={{backgroundColor:'#04AE91'}}>Generate Game Data</button>

              <button onClick={()=>setviewhide(!viewhide)} className={`mb-10 border py-4 px-4 rounded-lg text-xs ${viewhide ? 'bg-orange-500 text-black' : 'text-white bg-[#04AE91]'}`}>{viewhide? "Hide" : "Show"} Game Data to view or edit</button>

<div className="w-full">

{ viewhide && (
<>
              {gameData.map(item => (
        <div key={item.id} className='mb-10'>
          <div className="flex flex-col">
          <input
            type="text"
            value={item.term}
            onChange={e => handleInputChange(item.id, 'term', e.target.value)}
          />
          <textarea
            value={item.definition}
            onChange={e => handleInputChange(item.id, 'definition', e.target.value)}
          ></textarea>
          </div>
          {item.question && (
            <div>
              <div className='flex flex-col'>
              <input
                type="text"
                value={item.question}
                onChange={e => handleInputChange(item.id, 'question', e.target.value)}
              />
              </div>
              {item.options.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={e => handleOptionChange(item.id, index, e.target.value)}
                />
              ))}
              <select
                value={item.answer}
                onChange={e => handleInputChange(item.id, 'answer', e.target.value)}
              >
                {item.options.map((option, index) => (
                  <option key={index}>{option}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}
</>
)}

</div>

              <button
                onClick={creategame}
                className="rounded-lg py-4 px-10 text-white justify-end flex ml-auto text-xl"
                style={{ backgroundColor: '#008770' }}
              >
                Launch
              </button>
            </div>
          </div>
        </div>
      )}


{pagestatus === 'choose' && (
          <div className="relative p-4 lg:w-1/2 w-full max-w-2xl max-h-full mt-20">
            <div className="relative rounded-lg shadow bg-black text-white">
              <div className="flex items-center justify-end p-4 md:p-5 rounded-t dark:border-gray-600"></div>

              <div className="p-4 space-y-4 pt-10">
                <p className="text-3xl text-center font-bold text-green-500">
                  Choose Game to create
                </p>
                <div className="w-1/2 mx-auto">
                <button className="border rounded-full w-full py-2 bg-orange-500 my-6" onClick={()=>{setBgImage("/bingo1.png"); settype("bingo"); setpagestatus("create")}}>Bingo</button>
                <button className="border rounded-full w-full py-2 bg-blue-500 mb-6" onClick={()=>{setBgImage("/snake1.png"); settype("snl"); setpagestatus("create")}}>Snake and ladder</button>
                <button className="border rounded-full w-full py-2 bg-yellow-500 mb-20" onClick={()=>{setBgImage("/memory1.jpeg"); settype("memory"); setpagestatus("create")}}>Memory Match</button>
                </div>
              </div>
            </div>
          </div>
        // </div>
      )}

      {creategamedone && (
        <div
          style={{ backgroundColor: '#222944E5' }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/3 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow bg-black text-white">
              <div className="flex items-center justify-end p-4 md:p-5 rounded-t dark:border-gray-600"></div>

              <div className="p-4 space-y-4 pt-10">
                <p className="text-3xl text-center font-bold text-green-500">
                  Successfully Created!!
                </p>
                <p className="text-sm text-center pt-4 pb-20">
                  Redirecting you to Explore page to view your created game.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


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

      {
        gamedataloading && (
          <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 w-full max-h-full">
            <div className="relative rounded-lg shadow">
            <div className='text-white text-center text-2xl lg:w-1/3 mx-auto'>We are fetching 72 items so please wait 🙂</div>

            <div className='text-white text-center text-2xl lg:w-1/3 mx-auto'>{loadingdetails} items done</div>
            
              <div className="flex justify-center gap-4">
                <img
                  src="/dice_loader.gif"
                  alt="Loading icon"
                />
              </div>
            </div>
          </div>
        </div>
        )
      }

    </main>
    </>
  );
}
