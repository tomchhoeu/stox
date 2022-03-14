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
  Box,
} from '@mui/material';

import StocksAutocomplete from './StocksAutocomplete';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InputAdornment from '@mui/material/InputAdornment';

import { updateTrending } from '../helpers/TrendingHelpers';
import { formatWithCommas } from '../helpers/DashboardHelpers';

import ErrorSnackbar from '../components/ErrorSnackbar';

const WatchlistStocksList = () => {
  const loc = window.location.href.split('/');
  const watchlistId = loc[loc.length - 1];
  const [stocks, setStocks] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [errOpen, setErrOpen] = React.useState(false);
  //const [stockIds, setStockIds] = React.useState([]);

  const token = sessionStorage.getItem('jwt');
  // console.log(watchlistId);

  const getWatchlistSpecific = async function () {
    try {
      const res = await fetch(
        `http://localhost:8000/watchlist/${token}/${watchlistId}`,
        {
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-type': 'application/json',
          },
          method: 'GET',
        }
      );
      if (!res.ok) {
        const json = await res.json();
        setError(json);
        setErrOpen(true);
        return;
      }
      let temp_stocks = [];
      //let temp_stockIds = [];
      const watchlist = await res.json();
      // object = watchlist.stocks.reduce(
      //   (obj, item) => (obj[item.equitySymbol] = item, obj), {}
      // );
      for (const stock of watchlist.stocks) {
        temp_stocks.push(stock.equitySymbol);
        //temp_stockIds.push(stock);
      }
      //setStockIds(temp_stockIds);
      setStocks(temp_stocks);
    } catch (err) {
      console.log(err);
    }
  };
  React.useEffect(() => {
    getWatchlistSpecific();
  }, []);

  React.useEffect(() => {
    const updateData = async () => {
      setLoading(true);
      setRows([]);
      //await getWatchlistSpecific();
      let asyncCalls = stocks.map(async (stock) => {
        try {
          const res = await fetch(`http://localhost:8000/stock/${stock}`);
          if (!res.ok) {
            const json = await res.json();
            setError(json);
            setErrOpen(true);
            return;
          }
          const data = await res.json();
          return data;
        } catch (err) {
          console.log(err);
        }
      });

      console.log('Starting async Calls!');

      Promise.all(asyncCalls).then((data) => {
        for (let stockInfo of data) {
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
          setRows((rows) => [...rows, row]);
        }
        setLoading(false);
      });
      return;
    };
    try {
      updateData();
    } catch (err) {
      console.log(err);
    }
  }, [stocks]);

  // const getWatchlistStocks = async function() {
  //   try {
  //     const res = await fetch(`http://localhost:8000/watchlist/stocks/`)
  //   }
  // }

  const handleSearch = async () => {
    setLoading(true);
    console.log(`searching for: ${search}`);
    try {
      await addStockToWatchlist();
      await getWatchlistSpecific();
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const addStockToWatchlist = async function () {
    try {
      // console.log('Before add_stock fetch call');
      const stock_code = search;

      //const watchlistId = watchlistId;
      const res = await fetch(`http://localhost:8000/watchlist/add_stock`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          token,
          watchlistId,
          stock_code,
        }),
      });
      // console.log("?????")
      if (!res.ok) {
        const json = await res.json();
        setError(json);
        setErrOpen(true);
        return;
      }

      // update trending status for this stock
      // This is done after the stock is added to allow for any necessary checks to take place.
      updateTrending(stock_code);
      setSearch('');

      return;
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemove = async (code) => {
    try {
      await removeStockFromWatchlist(code);
      await getWatchlistSpecific();
    } catch (err) {
      console.log(err);
    }
  };

  const removeStockFromWatchlist = async function (stock_code) {
    try {
      const res = await fetch(`http://localhost:8000/watchlist/remove_stock`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          token,
          watchlistId,
          stock_code,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json);
        setErrOpen(true);
        return;
      }
      return;
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
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
            <TableCell />
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
                  <Link
                    to={`/stock/${row.code}`}
                    style={{
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      color: '#6FABC3',
                    }}
                  >
                    {' '}
                    {row.code}{' '}
                  </Link>
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell align="right">{formatWithCommas(row.ppu)}</TableCell>
                <TableCell
                  sx={{ color: row.dolChange < 0 ? '#E05260' : '#84C318' }}
                  align="right"
                >
                  {formatWithCommas(row.dolChange)}
                </TableCell>
                <TableCell
                  sx={{ color: row.perChange < 0 ? '#E05260' : '#84C318' }}
                  align="right"
                >
                  {formatWithCommas(row.perChange)}
                </TableCell>
                <TableCell align="right">
                  {formatWithCommas(row.volume)}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(row.code)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Watchlist Stocks Add Button*/}
      <Box component="form" noValidate onSubmit={handleSearch} sx={{ mt: 3 }}>
        <TextField
          name="search"
          size="small"
          id="search-bar"
          label="Stock Code"
          InputLabelProps={{
            shrink: true,
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleSearch}>
                <AddIcon />
              </IconButton>
            ),
          }}
          onKeyPress={(ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              handleSearch();
            }
          }}
          sx={{ mr: 2 }}
          fullWidth
        />
      </Box>
      <ErrorSnackbar
        error={error}
        setError={setError}
        errOpen={errOpen}
        setErrOpen={setErrOpen}
      />
    </div>
  );
};

export default WatchlistStocksList;
