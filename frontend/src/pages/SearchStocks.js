import React from 'react';

import { Typography, Container, Grid, Paper } from '@mui/material';

import StocksList from '../components/StocksList';
import NewsList from '../components/NewsList';

const SearchStocks = () => {
  return (
    <Container component="main" maxWidth="lg" className="main">
      <Typography variant="h5" noWrap style={{ marginBottom: '30px' }}>
        Stocks
      </Typography>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2}>
          {/* STOCKS LIST CARD */}
          <Grid item xs={12} md={8} lg={8}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 600,
              }}
            >
              <StocksList />
            </Paper>
          </Grid>
          {/* NEWS LIST CARD */}
          <Grid item xs={12} md={4} lg={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 600,
                overflowY: 'scroll',
              }}
            >
              <NewsList />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};

export default SearchStocks;
