import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

import './App.css';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

//${balance.current_price}
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
        //const priceData = await getTokenPrice(token.contractAddress);
        return {
          name: metadata.name,
          balance: balance,
          //symbol: priceData.symbol,
          //price: priceData.current_price
        }
      }));
      setBalances(balances);
    }
    getBalances();
  }, []);

  async function getTokenPrice(tokenAddress) {
    const response = await fetch(`https://api.alchemyapi.io/v2/tokens/${tokenAddress}/quote?vs_currency=usd`, {
      headers: {
        'Content-Type': 'application/json',
        'x-alchemy-token': settings.apiKey
      }
    });
    const data = await response.json();
    return data;
  }

  return (
    <div>
      <h1>Web3 Equities Token Holdings</h1>
      {balances && balances.length !== 0 ? (
        balances.map((balance, index) => (
          <div key={index}>
            <p>{balance.balance} {balance.name} </p>
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );

}

export default App;
