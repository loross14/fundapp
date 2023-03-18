import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

import './App.css';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

const SafeWallet = '0x0f82438e71ef21e07b6a5871df2a481b2dd92a98'

function App() {
  const [balances, setBalances] = useState();

  useEffect(() => {
    async function getBalances() {
      setBalances(await alchemy.core.getTokenBalances(SafeWallet).then(console.log));
    }
    getBalances();
  });

  async function displayBalances() {
    const tokenBalances = JSON.parse(balances).tokenBalances
    for (let i = 0; i < tokenBalances.length; i++){
      return <div className="App">Balances: {tokenBalances[i]}</div>;
    }
  }
  displayBalances()

}

export default App;
