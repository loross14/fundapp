import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

import './App.css';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const { ApolloClient, gql, InMemoryCache } = require('@apollo/client');

// Instantiate an Apollo client with the Uniswap subgraph
const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
  cache: new InMemoryCache()
});

// Fetch the current USD price of a token from the Uniswap subgraph
async function getTokenPrice(tokenAddress) {
  const query = gql`
    query TokenPrice($tokenAddress: Bytes!, $usdPrice: BigDecimal = 1) {
      token(id: $tokenAddress) {
        derivedETH
        tradeVolumeUSD
        totalSupply
        decimals
        name
        symbol
      }
      bundle(id: "1") {
        ethPrice
      }
    }
  `;

  const variables = { tokenAddress };
  const result = await client.query({ query, variables });
  const tokenData = result.data.token;
  const bundleData = result.data.bundle;
  const ethPrice = bundleData.ethPrice;

  console.log(tokenData.name, tokenData.decimals)

  const price = (tokenData.derivedETH * ethPrice) ;

  return {
    name: tokenData.name,
    symbol: tokenData.symbol,
    current_price: price
  };
}

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
        const priceData = await getTokenPrice(token.contractAddress);
        const value = priceData.current_price * balance;
        console.log(priceData.current_price)
        return {
          name: metadata.name,
          balance: balance,
          price: value.toFixed(2)
        }
      
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
            <p>{balance.balance} {balance.name} ${balance.price}</p>
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );

}

export default App;
