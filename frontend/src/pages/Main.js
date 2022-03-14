import React from 'react';

import { Container, Grid, Paper } from '@mui/material';

import NewsList from '../components/NewsList';
import MarketSnapshot from '../components/MarketSnapshot';
import TrendingStocksList from '../components/TrendingStocksList';

const Main = () => {
  return (
    <Container component="main" maxWidth="lg" className="main">
      <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
        <Grid container spacing={2}>
          {/* MARKET SNAPSHOT CARD */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <MarketSnapshot />
            </Paper>
          </Grid>
          {/* TRENDING STOCKS CARD */}
          <Grid item xs={12} md={8} lg={8}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 560,
              }}
            >
              <TrendingStocksList />
              {/* <StocksList /> */}
            </Paper>
          </Grid>
          {/* NEWS LIST CARD */}
          <Grid item xs={12} md={4} lg={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'scroll',
                height: 560,
              }}
            >
              <NewsList stock={'NO_CODE'} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};

export default Main;
