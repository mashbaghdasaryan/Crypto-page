import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LineChart from "../../components/LineChaert/LineChart";
import { fetchWithRetry } from "../../helper";
import './Coin.css'

const CACHE_KEY_PREFIX = "coinHistoricalData_";

const Coin = () => {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);

  useEffect(() => {
    if (!coinId) return;

    const fetchCoin = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}`
        );
        if (!res.ok) {
          const text = await res.text();
          setError(`Coin fetch error: ${res.status} ${text}`);
          return;
        }
        const data = await res.json();
        setCoinData(data);
      } catch (err) {
        setError("Network error: " + err.message);
      }
    };

    fetchCoin();
  }, [coinId]);

  useEffect(() => {
    if (!coinId) return;

    const cached = localStorage.getItem(CACHE_KEY_PREFIX + coinId);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setHistoricalData(parsed);
        return;
      } catch {
        localStorage.removeItem(CACHE_KEY_PREFIX + coinId);
      }
    }

    const fetchHistorical = async () => {
      setIsLoadingHistorical(true);
      try {
        const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=10&interval=daily`;
        const data = await fetchWithRetry(url);
        setHistoricalData(data);
        localStorage.setItem(CACHE_KEY_PREFIX + coinId, JSON.stringify(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingHistorical(false);
      }
    };

    fetchHistorical();
  }, [coinId]);

  if (error) return <div style={{ color: "red" }}>⚠️ {error}</div>;

  if (!coinData || (!historicalData && isLoadingHistorical))
    return (
      <div className="spinner">
        <div className="spin"></div>
      </div>
    );

  return (
    <div className="coin">
      <div className="coin-name">
        {coinData.image?.large && (
          <img src={coinData.image.large} alt={coinData.name} />
        )}
        <p>
          <b>
            {coinData.name} ({coinData.symbol.toUpperCase()})
          </b>
        </p>
      </div>
      <div className="coin-chart" style={{ height: 400, width: "100%" }}>
        <LineChart historicalData={historicalData} />
      </div>
      <div className="coin-info">
        <p>
          <b>Current Price:</b> ${coinData.market_data?.current_price?.usd}
        </p>
        <p>
          <b>Market Cap:</b> $
          {coinData.market_data?.market_cap?.usd.toLocaleString()}
        </p>
        <p>
          <b>24h Volume:</b> $
          {coinData.market_data?.total_volume?.usd.toLocaleString()}
        </p>
        <p>
          <b>All-Time High:</b> $
          {coinData.market_data?.ath?.usd.toLocaleString()} on{" "}
          {new Date(coinData.market_data?.ath_date?.usd).toLocaleDateString()}
        </p>
    </div>
    </div>
  );
};

export default Coin;
