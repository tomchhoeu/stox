import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2E2D4D',
    },
    secondary: {
      main: '#a5a3e3',
    },
    success: {
      main: '#84C318',
    },
    error: {
      main: '#E05260',
    },
  },
  // components: {
  //   // this works:

  //   MuiInputLabel: {
  //     styleOverrides: {
  //       root: {
  //         backgroundColor: 'red',
  //         fontSize: '20px',
  //       },
  //     },
  //   },

  //   // this does not work:
  //   MuiOutlinedInput: {
  //     styleOverrides: {
  //       input: {
  //         root: {
  //           backgroundColor: 'red',
  //           fontSize: '20px',
  //         },
  //       },
  //     },
  //   },
  // },
});

export default theme;
