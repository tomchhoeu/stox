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

import StocksAutocomplete from '../components/StocksAutocomplete';
import AddIcon from '@mui/icons-material/Add';
import InputAdornment from '@mui/material/InputAdornment';
import DeleteIcon from '@mui/icons-material/Delete';

import { formatWithCommas } from '../helpers/DashboardHelpers';

import ErrorSnackbar from '../components/ErrorSnackbar';

const PortfolioStocksList = (props) => {
  const { portfolioId } = props;
  const [stocks, setStocks] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [amount, setAmount] = React.useState(0);
  const [price, setPrice] = React.useState(0);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [errOpen, setErrOpen] = React.useState(false);
  let object = {};

  const getPortfolioSpecific = async function () {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('jwt');
      const res = await fetch(
        `http://localhost:8000/portfolio/${token}/${portfolioId}`,
        {
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-type': 'application/json',
          },
          method: 'GET',
        }
      );
      const portfolio = await res.json();
      if (!res.ok) {
        setError(portfolio);
        setErrOpen(true);
        return;
      }
      object = portfolio.stocks.reduce(
        (obj, item) => ((obj[item.equitySymbol] = item), obj),
        {}
      );
      console.log('!!!!');
      console.log(object);
      console.log(portfolio.stocks);
      return;
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const getPortfolioStocks = async function () {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('jwt');
      const res = await fetch(
        `http://localhost:8000/portfolio/stocks/${token}/${portfolioId}`,
        {
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-type': 'application/json',
          },
          method: 'GET',
        }
      );
      const portfolio = await res.json();
      if (!res.ok) {
        setError(portfolio);
        setErrOpen(true);
        return;
      }

      console.log(portfolio);

      setStocks(portfolio.stocks);
      return;
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };
  React.useEffect(() => {
    getPortfolioStocks();
  }, []);
  // update row data on initial render and when stocks first changes
  React.useEffect(() => {
    const updateData = async () => {
      setLoading(true);
      setRows([]);
      await getPortfolioSpecific();
      let asyncCalls = stocks.map(async (stock) => {
        try {
          // GET current stock data
          const res = await fetch(`http://localhost:8000/stock/${stock}`);
          // check response status/code
          const json = await res.json();
          if (!res.ok) {
            setError(json);
            setErrOpen(true);
            return;
          }

          return json;
        } catch (err) {
          console.log(err);
        }
      });

      console.log('starting async calls');

      Promise.all(asyncCalls).then((data) => {
        // once finished async calls, update rows with the data
        try {
          for (let stockInfo of data) {
            // create row object
            const stockBuySum =
              object[stockInfo.code].buyPrice * object[stockInfo.code].amount;
            const currentWorth = parseFloat(
              stockInfo.price * object[stockInfo.code].amount
            ).toFixed(2);
            const dolChange = parseFloat(currentWorth - stockBuySum).toFixed(2);
            const perChange = stockBuySum
              ? ((dolChange / stockBuySum) * 100).toFixed(2)
              : 0;
            const row = {
              code: stockInfo.code,
              uo: object[stockInfo.code].amount,
              buyPrice: object[stockInfo.code].buyPrice.toFixed(3),
              lastPrice: parseFloat(stockInfo.price).toFixed(3),
              currentWorth: currentWorth,
              dolChange: dolChange,
              perChange: perChange,
              dolDailyChange: parseFloat(stockInfo.change).toFixed(2),
            };
            // add row to rows
            setRows((rows) => [...rows, row]);
          }
        } catch (err) {
          console.log(err);
        }
        setLoading(false);
      });
    };
    updateData();
  }, [stocks]);

  const handleRemove = async (stock_code) => {
    await removeStockFromPortfolio(stock_code);
    await getPortfolioStocks();
  };

  const handleSearch = async () => {
    //console.log(`searching for: ${search}`);
    try {
      await addStockToPortfolio();
      await getPortfolioStocks();
    } catch (err) {
      console.log(err);
    }
  };

  const addStockToPortfolio = async function () {
    try {
      const stock_code = search;
      const token = sessionStorage.getItem('jwt');
      const portfolio_id = portfolioId;
      const res = await fetch(`http://localhost:8000/portfolio/add_stock`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          token,
          portfolio_id,
          stock_code,
          amount,
          price,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json);
        setErrOpen(true);
        return;
      }
      setSearch('');
      setAmount(0);
      setPrice(0);
      return;
    } catch (err) {
      console.log(err);
    }
  };
  /*
   * Requires:
   * portfolio_id - string - this can be changed to be obtained through code
   * portfolio_stock_id - string - this can be changed to be obtained through code
   */
  const removeStockFromPortfolio = async function (stock_code) {
    try {
      const token = sessionStorage.getItem('jwt');
      const portfolio_id = portfolioId;
      const res = await fetch(`http://localhost:8000/portfolio/remove_stock`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          token,
          portfolio_id,
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
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Units Owned
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Purchase Price $
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Current Price $
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Market Value $
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Profit/Loss $
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Profit/Loss %
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Today's Change $
            </TableCell>
            <TableCell align="right"></TableCell>
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
                    {row.code}
                  </Link>
                </TableCell>
                <TableCell align="right">{formatWithCommas(row.uo)}</TableCell>
                <TableCell align="right">
                  {formatWithCommas(row.buyPrice)}
                </TableCell>
                <TableCell align="right">
                  {formatWithCommas(row.lastPrice)}
                </TableCell>
                <TableCell align="right">
                  {formatWithCommas(row.currentWorth)}
                </TableCell>
                <TableCell
                  sx={{ color: row.dolChange < 0 ? 'red' : 'green' }}
                  align="right"
                >
                  {formatWithCommas(row.dolChange)}
                </TableCell>
                <TableCell
                  sx={{ color: row.perChange < 0 ? 'red' : 'green' }}
                  align="right"
                >
                  {formatWithCommas(row.perChange)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: row.dolDailyChange < 0 ? 'red' : 'green' }}
                >
                  {formatWithCommas(row.dolDailyChange)}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleRemove(row.code)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Search bar */}
      {/* <StocksAutocomplete /> */}
      <Box
        component="form"
        noValidate
        onSubmit={handleSearch}
        sx={{
          mt: 3,
          display: 'flex',
        }}
      >
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
          onKeyPress={(ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              handleSearch();
            }
          }}
          sx={{ mr: 1 }}
        />
        <TextField
          id="amount"
          size="small"
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyPress={(ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              handleSearch();
            }
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mr: 1 }}
        />
        <TextField
          id="amount"
          size="small"
          label="Buy Price Per Stock"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          onKeyPress={(ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              handleSearch();
            }
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          sx={{ mr: 1 }}
        />
        <IconButton onClick={handleSearch}>
          <AddIcon />
        </IconButton>
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

export default PortfolioStocksList;
