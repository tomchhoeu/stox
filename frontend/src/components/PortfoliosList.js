import React from 'react';

import { Link } from 'react-router-dom';

import {
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorSnackbar from '../components/ErrorSnackbar';

import { formatWithCommas } from '../helpers/DashboardHelpers';

const PortfoliosList = () => {
  // TODO: get user's actual portfolios from backend
  const token = sessionStorage.getItem('jwt');
  const [portfolio, setPortfolio] = React.useState('');
  const [portfolios, setPortfolios] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [errOpen, setErrOpen] = React.useState(false);

  /*
   * Requires:
   * No input variables.
   */
  const getPortfolios = async () => {
    try {
      // setLoading(true);
      const res = await fetch(`http://localhost:8000/portfolio/${token}`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json',
        },
        method: 'GET',
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json);
        setErrOpen(true);
        return;
      }
      // console.log(result)
      setPortfolios(json);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };
  React.useEffect(async () => {
    getPortfolios();
  }, []);

  const addPortfolio = async function () {
    try {
      const res = await fetch(`http://localhost:8000/portfolio/`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          token,
          portfolio_name: portfolio,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json);
        setErrOpen(true);
        return;
      }
      const portfolio_id = await res.json();
      console.log(portfolio_id);
    } catch (err) {
      console.log(err);
    }
    setPortfolio('');
  };
  /*
   * Requires:
   * portfolio_id - string - this can be changed to be obtained through code
   */
  const removePortfolio = async function (portfolio_id) {
    console.log(portfolio_id);
    try {
      const res = await fetch(`http://localhost:8000/portfolio/`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json',
        },
        method: 'DELETE',
        body: JSON.stringify({
          token,
          portfolio_id,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json);
        setErrOpen(true);
      }
      return;
    } catch (err) {
      console.log(err);
    }
  };
  const handleRemove = async (portfolio_id) => {
    setLoading(true);
    await removePortfolio(portfolio_id);
    getPortfolios();
  };
  const handleSearch = async () => {
    setLoading(true);
    await addPortfolio();
    getPortfolios();
  };
  return (
    <div>
      <Typography variant="h6" noWrap sx={{ ml: '10px' }}>
        Your portfolios
      </Typography>
      {/* Portfolios table */}
      <Table size="small" sx={{ mt: '10px' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Total Market Value
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Today's change $
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Today's change %
            </TableCell>
            <TableCell></TableCell>
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
            portfolios.map((row) => (
              <TableRow key={row._id}>
                <TableCell>
                  <Link
                    to={`/portfolio/${row._id}`}
                    style={{
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      color: '#6FABC3',
                    }}
                  >
                    {row.name}
                  </Link>
                </TableCell>
                <TableCell align="right">
                  {'$' + formatWithCommas(row.value)}
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
                <TableCell align="right">
                  <IconButton onClick={() => handleRemove(row._id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TextField
        name="add"
        fullWidth
        size="small"
        id="search-bar"
        label="Add a portfolio"
        color="text"
        sx={{ mt: 1 }}
        value={portfolio}
        onChange={(e) => setPortfolio(e.target.value)}
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
      />
      <ErrorSnackbar
        error={error}
        setError={setError}
        errOpen={errOpen}
        setErrOpen={setErrOpen}
      />
    </div>
  );
};

export default PortfoliosList;
