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
      const tokenBalances = await alchemy.core.getTokenBalances(SafeWallet);
      const balances = await Promise.all(tokenBalances.tokenBalances.map(async (token) => {
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
        const balance = Number(token.tokenBalance) / (10 ** metadata.decimals);
        return { name: metadata.name, balance };
      }));
      setBalances(balances);
    }
    getBalances();
  }, []);

  return (
    <div>
      <h1>Web3 Equities Token Holdings</h1>
      {balances && balances.length !== 0 ? (
        balances.map((balance, index) => (
          <div key={index}>
            <p>{balance.name} Balance: {balance.balance}</p>
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );

}

export default App;
