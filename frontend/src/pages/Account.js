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

import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { Link, useHistory } from 'react-router-dom';

import ErrorSnackbar from '../components/ErrorSnackbar';

const Account = ({ setToken }) => {
  let history = useHistory();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [errOpen, setErrOpen] = React.useState(false);

  const validEmail = (s) => {
    if (s === '') return true;
    // regex checking
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; //eslint-disable-line
    return re.test(s);
  };

  React.useEffect(async () => {
    const token = sessionStorage.getItem('jwt');
    const res = await fetch('http://localhost:8000/auth/email', {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        token,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json);
      setErrOpen(true);
      return;
    }
    setEmail(json.email);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validEmail(email) || password !== confirmPassword) {
      return;
    }
    try {
      const token = sessionStorage.getItem('jwt');
      const res = await fetch('http://localhost:8000/auth/update', {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      });
      const json = await res.json();
      // check response status/code
      if (!res.ok) {
        setError(json);
        setErrOpen(true);
        return;
      }
      // Store token
      sessionStorage.setItem('jwt', json.token);
      setToken(sessionStorage.getItem('jwt'));
      history.push('/');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Container component="main" maxWidth="lg" className="main">
      <Typography
        variant="h5"
        noWrap
        style={{ marginBottom: '30px' }}
      ></Typography>
      <Paper
        sx={{
          p: 3,
          mt: 10,
          color: 'text',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
            }}
          >
            <AccountCircleIcon sx={{ mr: 1 }} fontSize="large" />
            <Typography component="h1" variant="h5">
              Account Settings
            </Typography>
          </Box>

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="email"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  color="text"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="password"
                  fullWidth
                  id="password"
                  label="Set New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  color="text"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="confirm-password"
                  fullWidth
                  id="confirm-password"
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={password !== confirmPassword ? true : false}
                  helperText={
                    password !== confirmPassword
                      ? 'Passwords do not match!'
                      : ''
                  }
                  color="text"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              color="primary"
            >
              Save
            </Button>
          </Box>
        </Box>
      </Paper>
      <ErrorSnackbar
        error={error}
        setError={setError}
        errOpen={errOpen}
        setErrOpen={setErrOpen}
      />
    </Container>
  );
};

export default Account;
