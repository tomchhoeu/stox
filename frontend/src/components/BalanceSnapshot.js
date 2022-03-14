import React from 'react';

import { Typography } from '@mui/material';

import { formatWithCommas } from '../helpers/DashboardHelpers';

const dummyData = {
  tBalance: 13062.98,
  tChange: 231.1,
  tPercentChange: 1.77,
};

const BalanceSnapshot = () => {
  // TODO: get data from actual backend route
  const { tBalance, tChange, tPercentChange } = dummyData;

  const [balance, setBalance] = React.useState(0);
  const [change, setChange] = React.useState(0);
  const [percentChange, setPercentChange] = React.useState(0);

  const token = sessionStorage.getItem('jwt');

  const getSummary = async function () {
    try {
      const res = await fetch(
        `http://localhost:8000/portfolio/summary/${token}`,
        {
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-type': 'application/json',
          },
          method: 'GET',
        }
      );

      if (!res.ok) {
        console.log('getSummary call failed!');
        return;
      }

      const data = await res.json();
      console.log(data);
      setBalance(data.dailyLastSum.toFixed(2));
      setChange(data.totalChange.toFixed(2));
      console.log(data.totalChangePercentage);
      setPercentChange(parseFloat(data.totalChangePercentage).toFixed(2));
    } catch (err) {
      console.log(err);
    }
  };
  React.useEffect(() => {
    getSummary();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
        Total Balance:
      </Typography>
      {/* <Typography variant='subtitle1'>{tBalance}</Typography> */}
      <Typography variant="subtitle1">
        {'$' + formatWithCommas(balance)}
      </Typography>
      <Typography
        variant="subtitle1"
        // sx={{ color: tChange < 0 ? 'red' : 'green' }}
        sx={{ color: change < 0 ? 'red' : 'green' }}
      >
        {/* {tChange > 0 ? `+$${tChange}` : `${tChange}`} */}
        {change > 0
          ? `+$${formatWithCommas(change)}`
          : `-$${formatWithCommas(Math.abs(change))}`}
      </Typography>
      <Typography
        variant="subtitle1"
        // sx={{ color: tPercentChange < 0 ? 'red' : 'green' }}
        sx={{ color: percentChange < 0 ? 'red' : 'green' }}
      >
        {/* {tPercentChange > 0 ? `+${tPercentChange}%` : `${tPercentChange}%`} */}
        {percentChange > 0
          ? `+${formatWithCommas(percentChange)}%`
          : `${formatWithCommas(percentChange)}%`}
      </Typography>
    </div>
  );
};

export default BalanceSnapshot;
