import { useState, useEffect } from 'react';

import { useTheme } from '@mui/material/styles';
import { Tab, Card, Tabs, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

import BrokerService, { BrokerAccount } from '../../Services/api-services/market-Type-Mana';

import type { TradingRulesData } from './view';

const CardWrapper = ({ theme }: { theme: any }) => ({
  overflow: 'hidden',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(210.04deg, ${theme.palette.warning.dark} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
    borderRadius: '50%',
    top: -30,
    right: -180,
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: `linear-gradient(140.9deg, ${theme.palette.warning.dark} -14.02%, rgba(144, 202, 249, 0) 70.50%)`,
    borderRadius: '50%',
    top: -160,
    right: -130,
  },
});

interface MarketType {
  name: string;
  shortName: string;
}

interface StockRegion {
  name: string;
  shortName: string;
}

interface MyAccountsDetailsProps {
  onTradingRulesChange?: (data: TradingRulesData) => void;
  selectedMarketTypeId: string;
  setSelectedMarketTypeId: (tab: string) => void;
}

export function MyAccountsDetails({ onTradingRulesChange, selectedMarketTypeId, setSelectedMarketTypeId }: MyAccountsDetailsProps) {
  const theme = useTheme();
  const [selectedBrokerId, setSelectedBrokerId] = useState('');
  const [selectedSubbroker, setSelectedSubbroker] = useState('');
  const [marketTypes] = useState<MarketType[]>([
    { name: 'Stock Market', shortName: 'stock' },
    { name: 'Cryptocurrency', shortName: 'crypto' },
    { name: 'Forex', shortName: 'forex' },
  ]);
  const [stockRegions] = useState<StockRegion[]>([
    { name: 'Indian Stock Market', shortName: 'india' },
    { name: 'US Stock Market', shortName: 'us' },
    { name: 'Singapore Stock Market', shortName: 'singapore' },
  ]);
  const [selectedStockRegion, setSelectedStockRegion] = useState('');
  const [brokers, setBrokers] = useState<BrokerAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedBrokerAccount, setSelectedBrokerAccount] = useState<BrokerAccount | null>(null);

  // Fetch trading rules
  const fetchTradingRules = async (brokerAccountId: string) => {
    try {
      const response = await BrokerService.getTradingRules(brokerAccountId);
      // Parse the trading rules into the expected format
      const parsedRules = {
        ...response.data,
        option: response.data.option.map((rule: string) => {
          const [key, value] = rule.split(':').map((item) => item.trim());
          return { key, value };
        }),
        future: response.data.future.map((rule: string) => {
          const [key, value] = rule.split(':').map((item) => item.trim());
          return { key, value };
        }),
        cash: response.data.cash.map((rule: string) => {
          const [key, value] = rule.split(':').map((item) => item.trim());
          return { key, value };
        }),
      };

      return parsedRules;
    } catch (error) {
      console.error('Error fetching trading rules:', error);
      return null;
    }
  };

  // Fetch brokers by market type or stock region
  const fetchBrokersByMarketType = async (marketType: string) => {
    setLoading(true);
    try {
      // Use selectedStockRegion for stock market, otherwise use marketType
      const fetchMarketType = marketType === 'stock' && selectedStockRegion ? selectedStockRegion : marketType;
      const response = await BrokerService.getBrokerDetails(fetchMarketType);

      console.log('MyAccountDetails API Response:', response);

      // Access the data property from ApiResponse
      const brokersData = response.data || [];
      setBrokers(Array.isArray(brokersData) ? brokersData : []);
    } catch (error) {
      console.error('Error fetching brokers:', error);
      setBrokers([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const uniqueBrokers = Array.from(new Set(brokers.map((broker) => broker.brokerName)))
    .map((brokerName) => brokers.find((broker) => broker.brokerName === brokerName))
    .filter(
      (broker): broker is BrokerAccount =>
        broker !== undefined
    );

  const handleTabChange = (marketType: string) => {
    setSelectedMarketTypeId(marketType);
    setSelectedStockRegion(''); // Reset region when changing tabs
    setBrokers([]); // Clear brokers
    setSelectedBrokerId(''); // Clear broker selection
    setSelectedSubbroker(''); // Clear sub-broker selection
    setSelectedBrokerAccount(null); // Clear selected account
    if (marketType !== 'stock') {
      fetchBrokersByMarketType(marketType); // Fetch brokers directly for non-stock markets
    }
  };

  const handleStockRegionChange = (region: string) => {
    setSelectedStockRegion(region);
    setBrokers([]); // Clear brokers
    setSelectedBrokerId(''); // Clear broker selection
    setSelectedSubbroker(''); // Clear sub-broker selection
    setSelectedBrokerAccount(null); // Clear selected account
    fetchBrokersByMarketType('stock'); // Fetch brokers for selected region
  };

  useEffect(() => {
    // Set default market type to 'stock' on mount
    if (marketTypes.length > 0 && !selectedMarketTypeId) {
      setSelectedMarketTypeId(marketTypes[0].shortName);
      // Do not fetch brokers until a region is selected for stock market
    }
  }, );

  return (
    <Card sx={{ ...CardWrapper({ theme }), height: '100%' }}>
      <Tabs value={selectedMarketTypeId}>
        {marketTypes.map((marketType) => (
          <Tab
            key={marketType.shortName}
            label={<span style={{ fontWeight: 'bold' }}>{marketType.name}</span>}
            value={marketType.shortName}
            onClick={() => handleTabChange(marketType.shortName)}
            sx={{ gap: 8 }}
          />
        ))}
      </Tabs>

      {selectedMarketTypeId === 'stock' && (
        <FormControl fullWidth variant="filled" sx={{ m: 1, py: 0, minWidth: 200 }}>
        
          <Select
            value={selectedStockRegion}
            onChange={(e) => handleStockRegionChange(e.target.value)}
            disabled={loading}
          >
            <MenuItem value="">
              <em>Select Region</em>
            </MenuItem>
            {stockRegions.map((region) => (
              <MenuItem key={region.shortName} value={region.shortName}>
                {region.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FormControl fullWidth variant="filled" sx={{ m: 1, py: 0, minWidth: 120 }}>
          <InputLabel>Broker</InputLabel>
          <Select
            value={selectedBrokerId}
            onChange={(e) => setSelectedBrokerId(e.target.value)}
            disabled={loading || brokers.length === 0}
          >
            {uniqueBrokers.map((broker, index) => (
              <MenuItem key={index} value={broker._id}>
                {broker.brokerName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth variant="filled" sx={{ m: 1, py: 0, minWidth: 140 }}>
          <InputLabel>Subbroker</InputLabel>
          <Select
            value={selectedSubbroker}
            onChange={async (e) => {
              const selectedAccount = brokers.find((b) => b.brokerAccountName === e.target.value);
              if (selectedAccount) {
                setSelectedSubbroker(e.target.value);
                setSelectedBrokerAccount(selectedAccount);
                const rules = await fetchTradingRules(selectedAccount._id);
                if (rules && onTradingRulesChange) {
                  onTradingRulesChange({
                    brokerAccountName: selectedAccount.brokerAccountName,
                    marketTypeId: selectedMarketTypeId,
                    brokerId: selectedBrokerId,
                    cash: rules.cash,
                    option: rules.option,
                    future: rules.future,
                  });
                }
              }
            }}
            disabled={loading || brokers.length === 0 || !selectedBrokerId}
          >
            {brokers
              .filter((broker) => !selectedBrokerId || broker._id === selectedBrokerId)
              .map((broker) => (
                <MenuItem key={broker._id} value={broker.brokerAccountName}>
                  {broker.brokerAccountName}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </div>
    </Card>
  );
}