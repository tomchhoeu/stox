import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const ErrorSnackbar = ({ error, setError, errOpen, setErrOpen }) => {
  const handleErrClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setErrOpen(false);
  };
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      open={errOpen}
      autoHideDuration={5000}
      onClose={handleErrClose}
    >
      <Alert onClose={handleErrClose} severity="error" sx={{ width: '100%' }}>
        {error}
      </Alert>
    </Snackbar>
  );
};

export default ErrorSnackbar;
