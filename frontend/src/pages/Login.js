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

import { alpha } from '@mui/system';

const Login = ({ setToken }) => {
  let history = useHistory();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errOpen, setErrOpen] = React.useState(false);

  const handleErrClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setErrOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log(email);
      // POST email and password to auth/login route
      const res = await fetch('http://localhost:8000/auth/login', {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });
      // check response status/code
      if (!res.ok) {
        console.log('login failed!');
        // make notification to user
        setErrOpen(true);
        return;
      }
      // get response back (should be token)
      const json = await res.json();
      console.log(json);
      // Store token
      sessionStorage.setItem('jwt', json);
      setToken(sessionStorage.getItem('jwt'));
      history.push('/');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        sx={{
          p: 3,
          mt: 10,
          // color: (theme) => {
          //   alpha(theme.palette.mode) === 'light' ? 'black' : 'white';
          // },
          color: 'text',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Log in
          </Typography>
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
                  required
                  fullWidth
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  color="text"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              color="primary"
            >
              Log in
            </Button>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row-reverse',
              }}
            >
              <Link to="/register">Don't have an account? Register</Link>
            </Box>
          </Box>
        </Box>
      </Paper>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        open={errOpen}
        autoHideDuration={5000}
        onClose={handleErrClose}
      >
        <Alert onClose={handleErrClose} severity="error" sx={{ width: '100%' }}>
          Invalid email or password!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
