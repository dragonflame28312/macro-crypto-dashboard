/*
 * Macro & Crypto Dashboard React App
 * This script defines several components to fetch and display
 * macroeconomic and cryptocurrency data using public APIs. The
 * application uses React running in the browser via Babel.
 */

// PriceTicker fetches cryptocurrency prices from CoinGecko via a CORS proxy.
function PriceTicker() {
  const [prices, setPrices] = React.useState(null);

  React.useEffect(() => {
    async function fetchPrices() {
      try {
        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,cardano,ripple&vs_currencies=usd';
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
        const res = await fetch(proxyUrl);
        const data = await res.json();
        setPrices(data);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    }
    fetchPrices();
    // Update every minute
    const intervalId = setInterval(fetchPrices, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (!prices) {
    return React.createElement('p', null, 'Loading crypto prices…');
  }
  const items = Object.entries(prices).map(([key, value]) => {
    return { name: key.toUpperCase(), price: value.usd };
  });
  return (
    <div>
      <h2>Crypto Prices (USD)</h2>
      <ul className="ticker-list">
        {items.map(item => (
          <li key={item.name} className="ticker-item">
            {item.name}: ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </li>
        ))}
      </ul>
    </div>
  );
}

// CryptoMarket fetches global cryptocurrency market statistics from CoinGecko.
function CryptoMarket() {
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const url = 'https://api.coingecko.com/api/v3/global';
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
        const res = await fetch(proxyUrl);
        const data = await res.json();
        setStats(data.data);
      } catch (error) {
        console.error('Error fetching global stats:', error);
      }
    }
    fetchStats();
    const intervalId = setInterval(fetchStats, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (!stats) {
    return <p>Loading crypto market stats…</p>;
  }
  const totalCap = stats.total_market_cap.usd;
  const btcDominance = stats.market_cap_percentage.btc;
  const ethDominance = stats.market_cap_percentage.eth;
  const otherDominance = 100 - btcDominance - ethDominance;
  return (
    <div>
      <h2>Global Crypto Market</h2>
      <p>Total Market Cap: ${totalCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
      <p>BTC Dominance: {btcDominance.toFixed(2)}%</p>
      <p>ETH Dominance: {ethDominance.toFixed(2)}%</p>
      <p>Other Dominance: {otherDominance.toFixed(2)}%</p>
    </div>
  );
}

// FearGreed fetches the crypto fear & greed index from alternative.me.
function FearGreed() {
  const [indexData, setIndexData] = React.useState(null);

  React.useEffect(() => {
    async function fetchIndex() {
      try {
        const url = 'https://api.alternative.me/fng/?limit=1';
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
        const res = await fetch(proxyUrl);
        const data = await res.json();
        if (data && data.data && data.data.length > 0) {
          setIndexData(data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching Fear & Greed index:', error);
      }
    }
    fetchIndex();
    // Update every hour
    const intervalId = setInterval(fetchIndex, 3600000);
    return () => clearInterval(intervalId);
  }, []);

  if (!indexData) {
    return <p>Loading Fear &amp; Greed Index…</p>;
  }
  const timestamp = Number(indexData.timestamp) * 1000;
  return (
    <div>
      <h2>Fear &amp; Greed Index</h2>
      <p style={{ fontSize: '32px', margin: '8px 0' }}>{indexData.value} ({indexData.value_classification})</p>
      <p>Last Updated: {new Date(timestamp).toLocaleString()}</p>
    </div>
  );
}

// NewsFeed component fetches and parses RSS feeds via allorigins proxy.
function NewsFeed({ feedUrl, title }) {
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    async function fetchFeed() {
      try {
        const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(feedUrl);
        const res = await fetch(proxyUrl);
        const data = await res.json();
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, 'application/xml');
        const entries = Array.from(xml.querySelectorAll('item')).slice(0, 5).map(item => ({
          title: item.querySelector('title') ? item.querySelector('title').textContent : '',
          link: item.querySelector('link') ? item.querySelector('link').textContent : '',
          description: item.querySelector('description') ? item.querySelector('description').textContent : '',
          pubDate: item.querySelector('pubDate') ? item.querySelector('pubDate').textContent : ''
        }));
        setItems(entries);
      } catch (error) {
        console.error('Error fetching news feed:', error);
      }
    }
    fetchFeed();
    const intervalId = setInterval(fetchFeed, 1800000); // 30 minutes
    return () => clearInterval(intervalId);
  }, [feedUrl]);

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>{title}</h2>
      {items.map((item, idx) => (
        <div key={idx} className="news-item">
          <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
          <div className="news-description" dangerouslySetInnerHTML={{ __html: item.description }}></div>
        </div>
      ))}
    </div>
  );
}

// MarketCharts embeds mini TradingView widgets for various financial instruments.
function MarketCharts() {
  return (
    <div>
      <h2>Market Charts</h2>
      <div className="market-grid">
        <iframe title="BTCUSD" className="widget-frame" src="https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=CRYPTO%3ABTCUSD&width=100%25&height=300&locale=en&dateRange=12M&colorTheme=light"></iframe>
        <iframe title="ETHUSD" className="widget-frame" src="https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=CRYPTO%3AETHUSD&width=100%25&height=300&locale=en&dateRange=12M&colorTheme=light"></iframe>
        <iframe title="Gold" className="widget-frame" src="https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=OANDA%3AXAUUSD&width=100%25&height=300&locale=en&dateRange=12M&colorTheme=light"></iframe>
        <iframe title="Crude Oil" className="widget-frame" src="https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=NYMEX%3ACL1!&width=100%25&height=300&locale=en&dateRange=12M&colorTheme=light"></iframe>
        <iframe title="S&P 500" className="widget-frame" src="https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=SP%3ASPX&width=100%25&height=300&locale=en&dateRange=12M&colorTheme=light"></iframe>
        <iframe title="FTSE 100" className="widget-frame" src="https://s.tradingview.com/embed-widget/mini-symbol-overview/?symbol=INDEXFTSE%3AUKX&width=100%25&height=300&locale=en&dateRange=12M&colorTheme=light"></iframe>
      </div>
    </div>
  );
}

// FredCharts embeds FRED graph images for macro indicators.
function FredCharts() {
  const charts = [
    { title: 'M2 Money Supply (USA)', id: 'M2SL' },
    { title: 'Unemployment Rate (USA)', id: 'UNRATE' },
    { title: 'Unemployment Rate (UK)', id: 'LRHUTTTTGBM156S' },
    { title: 'CPI (USA)', id: 'CPIAUCSL' },
    { title: 'CPI (UK)', id: 'GBRCPIALLMINMEI' }
  ];
  return (
    <div>
      <h2>Macro Indicators</h2>
      {charts.map(chart => (
        <div key={chart.id} style={{ marginBottom: '24px' }}>
          <h3>{chart.title}</h3>
          <img className="fred-image" src={`https://fred.stlouisfed.org/graph/fredgraph.png?id=${chart.id}`} alt={chart.title} />
        </div>
      ))}
    </div>
  );
}

function App() {
  return (
    <div className="dashboard">
      <div className="card header-card">
        <h1>Macro &amp; Crypto Dashboard</h1>
        <p>Real‑time cryptocurrency prices, global market data and macroeconomic indicators.</p>
      </div>
      <div className="card">
        <PriceTicker />
        <CryptoMarket />
        <FearGreed />
      </div>
      <div className="card">
        <MarketCharts />
      </div>
      <div className="card">
        <FredCharts />
      </div>
      <div className="card">
        <NewsFeed title="Crypto News" feedUrl="https://news.google.com/rss/search?q=cryptocurrency&hl=en-US&gl=US&ceid=US:en" />
        <NewsFeed title="Global Business &amp; Macro News" feedUrl="https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en" />
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
