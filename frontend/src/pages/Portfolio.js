import React from 'react';

import AreaChart from '../components/AreaChart';
import NewsList from '../components/NewsList';
import SentimentCard from '../components/SentimentCard';
import PortfolioStocksList from '../components/PortfolioStocksList';
import ErrorSnackbar from '../components/ErrorSnackbar';

import { Typography, Container, TextField, Grid, Paper } from '@mui/material';

const Portfolio = () => {
  const [name, setName] = React.useState('');
  const [stocks, setStocks] = React.useState([]);
  const loc = window.location.href.split('/');
  const portfolio_id = loc[loc.length - 1];
  const [error, setError] = React.useState('');
  const [errOpen, setErrOpen] = React.useState(false);
  /*
   * Requires:
   * portfolio_id - string - this can be changed to be obtained through code
   */
  React.useEffect(() => {
    const getPortfolioSpecific = async function () {
      try {
        const token = sessionStorage.getItem('jwt');
        const res = await fetch(
          `http://localhost:8000/portfolio/${token}/${portfolio_id}`,
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
        setName(portfolio.name);

        let stks = [];
        Object.values(portfolio.stocks).forEach((val) => {
          stks.push(val.equitySymbol);
        });
        setStocks(stks);
      } catch (err) {
        console.log(err);
      }
    };

    getPortfolioSpecific();
    console.log('now stocks are:', stocks);
  }, []);

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
                overflowX: 'scroll',
                overflowY: 'scroll',
                height: 500,
              }}
            >
              <PortfolioStocksList portfolioId={portfolio_id} />
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

export default Portfolio;
