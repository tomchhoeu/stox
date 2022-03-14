import React from 'react';

import './App.css';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';

import darkTheme from './assets/DarkTheme';
import lightTheme from './assets/LightTheme';

import darkBackground from './assets/dark-background.svg';
import lightBackground from './assets/light-background-2.svg';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Main from './pages/Main';
import Stock from './pages/Stock';
import SearchStocks from './pages/SearchStocks';
import Insights from './pages/Insights';
import Portfolio from './pages/Portfolio';
import Account from './pages/Account';
import Advice from './pages/Advice';
import Watchlist from './pages/Watchlist';
import NoAccess from './pages/NoAccess';

const App = () => {
  // token management
  const [token, setToken] = React.useState(null);
  // on initial load, set jwt if there
  React.useEffect(() => {
    setToken(sessionStorage.getItem('jwt'));
  }, []);

  // testing token behaviour
  React.useEffect(() => {
    console.log('token changed: ', token);
  }, [token]);

  // use state for theme
  const [theme, setTheme] = React.useState(lightTheme);

  // handles flipping theme
  const flipTheme = () => {
    theme === lightTheme ? setTheme(darkTheme) : setTheme(lightTheme);
  };

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div
          className="root"
          style={{
            backgroundImage:
              theme === darkTheme
                ? `url(${darkBackground})`
                : `url(${lightBackground})`,
          }}
        >
          <Navbar token={token} setToken={setToken} flipTheme={flipTheme} />
          <Switch>
            <Route path="/login">
              <Login setToken={setToken} />
            </Route>
            <Route path="/register">
              <Register token={token} setToken={setToken} />
            </Route>
            <Route path="/dashboard">
              {token === null ? <NoAccess /> : <Dashboard />}
            </Route>
            <Route path="/stock">
              <Stock />
            </Route>
            <Route path="/stocks">
              <SearchStocks />
            </Route>
            <Route path="/insights">
              <Insights />
            </Route>
            <Route path="/portfolio">
              <Portfolio />
            </Route>
            <Route path="/account">
              <Account setToken={setToken} />
            </Route>
            <Route path="/advice">
              <Advice />
            </Route>
            <Route path="/watchlist">
              <Watchlist />
            </Route>
            <Route path="/">
              <Main />
            </Route>
          </Switch>
          <Footer />
        </div>
      </ThemeProvider>
    </Router>
  );
};

export default App;
