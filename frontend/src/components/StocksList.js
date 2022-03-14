import React from 'react';
import { Link } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  IconButton,
  Paper,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';

import StockLink from './StockLink';

const StocksList = () => {
  const [stocks, setStocks] = React.useState([
    'AMZN',
    'GOOGL',
    'TSLA',
    'NFLX',
    'FB',
    'AAPL',
  ]);
  const [search, setSearch] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // update row data on initial render and when stocks first changes
  React.useEffect(() => {
    const updateData = () => {
      setLoading(true);
      setRows([]);

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

      Promise.all(asyncCalls).then((data) => {
        // once finished async calls, update rows with the data
        for (let stockInfo of data) {
          try {
            // create row object
            const row = {
              code: stockInfo.code,
              name: stockInfo.name,
              ppu: stockInfo.price ? parseFloat(stockInfo.price).toFixed(2) : 0,
              dolChange: stockInfo.change
                ? parseFloat(stockInfo.change).toFixed(2)
                : 0,
              perChange: stockInfo.change_percent
                ? parseFloat(stockInfo.change_percent.slice(0, -1)).toFixed(2)
                : 0,
              volume: stockInfo.volume ? stockInfo.volume : 0,
            };
            // add row to rows
            setRows((rows) => [...rows, row]);
          } catch (err) {
            console.log(err);
            //console.log(data);
          }
        }

        setLoading(false);
      });
    };
    updateData();
  }, [stocks]);

  const handleSearch = async () => {
    console.log(`searching for: ${search}`);

    setLoading(true);

    try {
      // GET search endpoint
      const res = await fetch(`http://localhost:8000/stock/search/${search}`);
      // check response status/code
      if (!res.ok) {
        console.log('call failed!');
        return;
      }
      const data = await res.json();
      console.log(data);
      // cut search results to only first 10 entries
      data['codes'].slice(0, 10);
      // update stocks codes with the search results
      setStocks(data['codes']);
    } catch (err) {
      console.log(err);
      // setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Search bar */}
      <TextField
        name="search"
        fullWidth
        size="small"
        id="search-bar"
        label="Search for a stock..."
        color="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton onClick={handleSearch}>
              <SearchIcon />
            </IconButton>
          ),
        }}
        onKeyPress={(ev) => {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            handleSearch();
          }
        }}
      />
      {/* Stocks table */}
      <Table size="small" sx={{ mt: '10px' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              $/unit
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              $ change
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              % change
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
                <TableCell align="right">{row.ppu}</TableCell>
                <TableCell
                  sx={{
                    color: row.dolChange < 0 ? 'error.main' : 'success.main',
                  }}
                  align="right"
                >
                  {row.dolChange}
                </TableCell>
                <TableCell
                  sx={{
                    color: row.perChange < 0 ? 'error.main' : 'success.main',
                  }}
                  align="right"
                >
                  {row.perChange}
                </TableCell>
                <TableCell align="right">{row.volume}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StocksList;
