import React from 'react';
import { Link } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from '@mui/material';

import { formatWithCommas } from '../helpers/DashboardHelpers';

import StockLink from './StockLink';

const TrendingStocksList = () => {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // update row data on initial render and when stocks first changes
  React.useEffect(() => {
    const updateData = async () => {
      setLoading(true);
      setRows([]);

      // first set stocks to what is currently trending
      console.log('getting trending');
      let stocks = [];
      try {
        // GET trending stocks
        const res = await fetch('http://localhost:8000/stock/trending/top');
        const json = await res.json();
        // console.log('new stocks should be!!!', json.stocks);
        stocks = json.stocks;
      } catch (err) {
        console.log(err);
      }
      // console.log('set trending to: ', stocks);

      let asyncCalls = stocks.map(async (stock) => {
        try {
          // GET current stock data
          const res = await fetch(`http://localhost:8000/stock/${stock}`);
          // check response status/code
          if (!res.ok) {
            console.log('call failed!');
            return;
          }
          const data = await res.json();
          return data;
        } catch (err) {
          console.log(err);
        }
      });

      console.log('starting async calls');

      await Promise.all(asyncCalls).then((data) => {
        // once finished async calls, update rows with the data
        for (let stockInfo of data) {
          try {
            // create row object
            // console.log(stockInfo.code);
            // console.log(stockInfo.change_percent);
            const row = {
              code: stockInfo.code,
              name: stockInfo.name,
              ppu: parseFloat(stockInfo.price).toFixed(2),
              dolChange: parseFloat(stockInfo.change).toFixed(2),
              perChange: parseFloat(
                stockInfo.change_percent.slice(0, -1)
              ).toFixed(2),
              volume: stockInfo.volume,
            };
            // add row to rows
            setRows((rows) => [...rows, row]);
          } catch (err) {
            console.log(err);
            console.log(data);
          }
        }

        // setLoading(false);
      });
      setLoading(false);
    };
    updateData();
  }, []);

  return (
    <div>
      <Typography variant="h6" noWrap sx={{ ml: '10px' }}>
        Trending Stocks
      </Typography>
      {/* Stocks table */}
      <Table size="small" sx={{ mt: '10px' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Last Price $
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Today's Change $
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Today's Change %
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Volume
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableCell
              colSpan="6"
              align="center"
              height="300px"
              variant="footer"
            >
              <CircularProgress />
            </TableCell>
          ) : (
            rows.map((row) => (
              <TableRow key={row.code}>
                <TableCell>
                  <StockLink code={row.code} />
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell align="right">{formatWithCommas(row.ppu)}</TableCell>
                <TableCell
                  sx={{
                    color: row.dolChange < 0 ? 'error.main' : 'success.main',
                  }}
                  align="right"
                >
                  {formatWithCommas(row.dolChange)}
                </TableCell>
                <TableCell
                  sx={{
                    color: row.perChange < 0 ? 'error.main' : 'success.main',
                  }}
                  align="right"
                >
                  {formatWithCommas(row.perChange)}
                </TableCell>
                <TableCell align="right">
                  {formatWithCommas(row.volume)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TrendingStocksList;
