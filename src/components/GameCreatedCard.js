import React from 'react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { removePrefix } from '../../modules/Utils/ipfsUtil';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
    SerializedSignature,
    decodeSuiPrivateKey,
  } from "@mysten/sui.js/cryptography";
  import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
  import {
    genAddressSeed,
    getZkLoginSignature,
  } from "@mysten/zklogin";

const GameCard = ({ game }) => {
  const starttime = game.startTimestamp;
  const gamestartTime = new Date(parseInt(starttime, 10));
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(gamestartTime));
  const [ipfsdata, setIpfsData] = useState(null);
  const [creategamedone, setcreategamedone] = useState(false);
  const [loading, setLoading] = useState(false);

  const accountDataKey = 'zklogin-demo.accounts';
  const NETWORK='devnet';
  const MAX_EPOCH = 2; // keep ephemeral keys active for this many Sui epochs from now (1 epoch ~= 24h)
  const accounts = useRef(loadAccounts()); // useRef() instead of useState() because of setInterval()
  // const [balances, setBalances] = useState(new Map()); // Map<Sui address, SUI balance>
  const [modalContent, setModalContent] = useState('');
  const suiClient = new SuiClient({
      url: getFullnodeUrl(NETWORK),
  });

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

  function keypairFromSecretKey(privateKeyBase64) {
    const keyPair = decodeSuiPrivateKey(privateKeyBase64);
    return Ed25519Keypair.fromSecretKey(keyPair.secretKey);
  }

  useEffect(() => {
    // Update the countdown every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(gamestartTime);
      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    // Cleanup on component unmount
    return () => clearInterval(timer);
  }, []);

  // Function to calculate the time left until the start time
  function calculateTimeLeft(startTime) {
    const difference = +startTime - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return timeLeft;
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlhash = game?.url.slice(7)
        console.log("urlhash", urlhash);
        const data = await fetch(`https://nftstorage.link/ipfs/${urlhash}`); // Replace with your IPFS hash
        const ipfsdata = await data.json();
        setIpfsData(ipfsdata);
        console.log("ipfs data", ipfsdata)
      } catch (err) {
        console.log('Failed to fetch data from IPFS');
      }
    };

    fetchData();
  }, [game]);



  // ------------------------------------------------------- mint game ----------------------------------------------------

  async function sendTransaction(account, ipfsmetahashnfturl) {
    setLoading(true);
    try {
      setModalContent('🚀 Sending transaction...');
      console.log('[sendTransaction] Starting transaction');
  
      // Sign the transaction bytes with the ephemeral private key
      const txb = new TransactionBlock();
      const packageObjectId = "0xd348310f8e57743321ecbb0059c7c7c007f6cf9d1357df5cb600f4ba0ebde5bd";
      txb.moveCall({
        target: `${packageObjectId}::snl::initialize_game`,
        arguments: [
          txb.pure(game?.name),        // Name argument
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
      setLoading(false);
      setcreategamedone(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.warn('[sendTransaction] executeTransactionBlock failed:', error);
      setLoading(false);
      alert(error);
    } 
  }

  return (
      <div className="border text-black rounded-2xl mt-10 h-full" style={{backgroundColor:'#CAF4FF'}}>
        <div className="w-full">
          {ipfsdata?.coverImage ? (<img
            alt="alt"
            src={`${'https://nftstorage.link/ipfs'}/${removePrefix(
              ipfsdata?.coverImage
            )}`}
            className="rounded-t-2xl"
            style={{ height: '200px', width: '400px' }}
          />) :(
            <img
            alt="alt"
            src="https://images.unsplash.com/photo-1642056448324-922ff603e0c4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c25ha2VzJTIwYW5kJTIwbGFkZGVyc3xlbnwwfHwwfHx8MA%3D%3D"
            className="rounded-t-2xl"
            style={{ height: '200px', width: '400px' }}
          />
          )}
        </div>
        <div>
        <div className="flex justify-between">
          <div className="pl-4 -mt-12">
            { ipfsdata?.picture ? (<img
              alt="alt"
              src={`${'https://nftstorage.link/ipfs'}/${removePrefix(
                ipfsdata?.picture
              )}`}
              className="rounded-full border border-black"
              width="100"
              height="100"
            />):
            (<img
              alt="alt"
              src="https://media.istockphoto.com/id/531466314/vector/snakes-and-ladders.jpg?s=612x612&w=0&k=20&c=YYRwkxtVxAXrYV7kFCHKW4h0SHFS4sSSoaj-s9OeHF4="
              className="rounded-full border border-black"
              width="100"
              height="100"
            />)}
          </div>
          <button className="rounded-lg px-4 py-2 m-2 text-white" style={{backgroundColor:'#232C12'}}
          onClick={()=>{sendTransaction(accounts.current[0], game?.url)}}
          >
            Mint Game
            </button>
          </div>

          <div className="m-4">
            <div className="flex justify-between font-bold">
              <h5>
                {game?.name} ({ipfsdata?.symbol})
              </h5>
            </div>
            {/* <p className="mt-2">{ipfsdata?.description}</p> */}
          </div>
        </div>

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
                  Successfully Minted!!
                </p>
                <p className="text-sm text-center pt-4 pb-20">
                  Please wait while we reload your content.
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
      </div>
  );
};

export default GameCard;
