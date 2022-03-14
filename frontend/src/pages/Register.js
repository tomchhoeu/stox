import React from 'react';

import {
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Container,
  Paper,
} from '@mui/material';

import { Link, useHistory } from 'react-router-dom';

import ErrorSnackbar from '../components/ErrorSnackbar';

const Register = ({ setToken }) => {
  let history = useHistory();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [errOpen, setErrOpen] = React.useState(false);

  // checks if a string is a valid email address
  const validEmail = (s) => {
    if (s === '') return true;
    // regex checking
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; //eslint-disable-line
    return re.test(s);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // password and email checks
    if (!validEmail(email) || password !== confirmPassword) {
      return;
    }

    try {
      // POST email and password to auth/register route
      const res = await fetch('http://localhost:8000/auth/register', {
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
      const json = await res.json();
      // check response status/code
      if (!res.ok) {
        setError(json);
        setErrOpen(true);
        return;
      }
      // get response back (should be token)

      sessionStorage.setItem('jwt', json);
      setToken(sessionStorage.getItem('jwt'));
      history.push('/');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper sx={{ p: 3, mt: 10 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Register
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
                  error={!validEmail(email) ? true : false}
                  helperText={!validEmail(email) ? 'Not a valid email!' : false}
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
              <Grid item xs={12}>
                <TextField
                  name="confirm-password"
                  required
                  fullWidth
                  id="confirm-password"
                  label="Confirm Password"
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
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              color="primary"
            >
              Create account
            </Button>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row-reverse',
              }}
            >
              <Link to="/login">Already have an account? Sign in</Link>
            </Box>
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

export default Register;
