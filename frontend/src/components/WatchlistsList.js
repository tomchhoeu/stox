import React from 'react';
import { Link } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Box,
} from '@mui/material';

// import StocksAutocomplete from '../components/StocksAutocomplete';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FormControl from '@mui/material/FormControl';

import ErrorSnackbar from '../components/ErrorSnackbar';

// const rows = [
//   {
//     name: 'Crypto',
//     numStocks: 5,
//   },
//   {
//     name: 'Tech',
//     numStocks: 9,
//   },
//   {
//     name: 'Minerals',
//     numStocks: 29,
//   },
// ];

const WatchlistsList = () => {
  // TODO: get user's actual watchlists from backend
  const [watchlists, setWatchlists] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [watchlistName, setWatchlistName] = React.useState('');
  const [error, setError] = React.useState('');
  const [errOpen, setErrOpen] = React.useState(false);

  const token = sessionStorage.getItem('jwt');

  const getWatchlists = async function () {
    try {
      const res = await fetch(`http://localhost:8000/watchlist/${token}`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json',
        },
        method: 'GET',
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json);
        setErrOpen(true);
        return;
      }

      const result = await res.json();
      setWatchlists(result);
      console.log(result);
    } catch (err) {
      console.log(err);
    }
  };
  React.useEffect(() => {
    getWatchlists();
  }, []);

  const addWatchlist = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/watchlist/`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          token,
          watchlistName,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json);
        setErrOpen(true);
      }
      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.log(err);
    }
    await getWatchlists();
    setLoading(false);
  };

  const handleRemove = async (watchlistId) => {
    try {
      await removeWatchlist(watchlistId);
      await getWatchlists();
    } catch (err) {
      console.log(err);
    }
  };

  const removeWatchlist = async function (watchlistId) {
    try {
      const res = await fetch(`http://localhost:8000/watchlist/`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json',
        },
        method: 'DELETE',
        body: JSON.stringify({
          token,
          watchlistId,
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

  /*
  // Update trending status for this stock
  try {
    // Increment trending score of this stock
    await fetch('http://localhost:8000/stock/trending/increment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        equitySymbol: stock_code,
      }),
    });
  } catch (err) {
    console.log(err);
  }
  */

  return (
    <div>
      <Typography variant="h6" noWrap sx={{ ml: '10px' }}>
        Your watchlists
      </Typography>
      {/* Watchlists table */}
      <Table size="small" sx={{ mt: '10px' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              # Stocks
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {watchlists.map((row) => (
            <TableRow key={row.code}>
              <TableCell>
                <Link
                  to={`/watchlist/${row._id}`}
                  style={{
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    color: '#6FABC3',
                  }}
                >
                  {row.name}
                </Link>
              </TableCell>
              <TableCell align="right">{row.numStocks}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleRemove(row._id)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* addWatchlists Button */}
      <Box component="form" noValidate onSubmit={addWatchlist} sx={{ mt: 3 }}>
        <TextField
          name="watchlistName"
          size="small"
          id="watchlistName"
          label="Watchlist Name"
          InputLabelProps={{
            shrink: true,
          }}
          value={watchlistName}
          onChange={(e) => setWatchlistName(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton onClick={addWatchlist}>
                <AddIcon />
              </IconButton>
            ),
          }}
          onKeyPress={(ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              addWatchlist();
            }
          }}
          sx={{ mr: 3 }}
        />
        {/* <IconButton onClick={addWatchlist}>
          <AddIcon />
        </IconButton> */}
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

export default WatchlistsList;
