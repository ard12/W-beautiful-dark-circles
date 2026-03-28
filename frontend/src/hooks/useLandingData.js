import { useState, useEffect } from "react";
import { getHeadlines, getMarketSnapshot } from "../api/client";

export function useLandingData() {
  const [headlines, setHeadlines] = useState(null);
  const [marketSnapshot, setMarketSnapshot] = useState(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getHeadlines().catch(() => null),
      getMarketSnapshot().catch(() => null)
    ]).then(([hData, mData]) => {
      if (mounted) {
        setHeadlines(hData);
        setMarketSnapshot(mData);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { headlines, marketSnapshot };
}
