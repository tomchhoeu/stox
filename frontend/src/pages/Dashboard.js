import React from 'react';

import {
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Container,
  Snackbar,
  Alert,
  Paper,
} from '@mui/material';

import { Link, useHistory } from 'react-router-dom';

import BalanceSnapshot from '../components/BalanceSnapshot';
import PortfoliosList from '../components/PortfoliosList';
import WatchlistsList from '../components/WatchlistsList';

const Dashboard = () => {
  return (
    <Container component="main" maxWidth="xl" className="main">
      <Container maxWidth="xl" sx={{ mt: 0, mb: 4 }}>
        <Grid container spacing={2}>
          {/* BALANCE SNAPSHOT CARD */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <BalanceSnapshot />
            </Paper>
          </Grid>
          {/* PORTFOLIOS CARD */}
          <Grid item xs={12} md={8} lg={8}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 560,
                overflowY: 'scroll',
              }}
            >
              <PortfoliosList />
            </Paper>
          </Grid>
          {/* WATCHLISTS CARD */}
          <Grid item xs={12} md={4} lg={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 560,
                overflowY: 'scroll',
              }}
            >
              <WatchlistsList />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};

export default Dashboard;
