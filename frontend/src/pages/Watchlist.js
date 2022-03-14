import React from 'react';

import AreaChart from '../components/AreaChart';
import NewsList from '../components/NewsList';
import SentimentCard from '../components/SentimentCard';
import WatchlistStocksList from '../components/WatchlistStocksList';
import ErrorSnackbar from '../components/ErrorSnackbar';

import { Typography, Container, TextField, Grid, Paper } from '@mui/material';

const Watchlist = () => {
  const [name, setName] = React.useState('');
  const [stocks, setStocks] = React.useState([]);
  const [error, setError] = React.useState('');
  const [errOpen, setErrOpen] = React.useState(false);
  const loc = window.location.href.split('/');
  const watchlistId = loc[loc.length - 1];

  /*
   * Requires:
   * watchlistId - string - this can be changed to be obtained through code
   */
  React.useEffect(() => {
    const getWatchlistSpecific = async function () {
      setStocks([]);
      try {
        const token = sessionStorage.getItem('jwt');
        const res = await fetch(
          `http://localhost:8000/Watchlist/${token}/${watchlistId}`,
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
        const Watchlist = await res.json();
        //console.log(Watchlist);
        setName(Watchlist.name);
        let stks = []
        Object.values(Watchlist.stocks).forEach((val) => {
          stks.push(val.equitySymbol);
        });
        setStocks(stks);
      } catch (err) {
        console.log(err);
      }
    };
    getWatchlistSpecific();
  }, []);
  // React.useEffect(() => {
  //   getWatchlistSpecific();
  // })

  return (
    <Container component="main" maxWidth="xl" className="main">
      <Typography variant="h5" noWrap style={{ marginBottom: '30px' }}>
        {name}
      </Typography>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item sx={12} md={8} lg={8}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 500,
                overflowY: 'scroll',
              }}
            >
              <WatchlistStocksList WatchlistId={watchlistId} />
            </Paper>
          </Grid>
          <Grid item sx={12} md={4} lg={4}>
            <Grid container spacing={3} direction="row">
              <Grid item sx={12} md={12} lg={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'scroll',
                    height: 500,
                  }}
                >
                  {/* NEWS LIST CARD */}
                  <NewsList stock={stocks} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <ErrorSnackbar
        error={error}
        setError={setError}
        errOpen={errOpen}
        setErrOpen={setErrOpen}
      />
    </Container>
  );
};

export default Watchlist;
