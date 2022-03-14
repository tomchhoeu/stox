import React, { useEffect, useState } from 'react';

import { Link, useHistory } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InsightsIcon from '@mui/icons-material/Insights';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';

import TourIcon from '@mui/icons-material/Tour';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';

import DarkModeSwitch from './DarkModeSwitch';
import ErrorSnackbar from '../components/ErrorSnackbar';

import {
  Divider,
  Toolbar,
  AppBar,
  Button,
  Modal,
  Typography,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  IconButton,
  Fade,
} from '@mui/material';

// Style for modal popup
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// Style for close button
const closeButtonStyle = {
  position: 'absolute',
  left: '95%',
  top: '-15%',
  backgroundColor: 'lightgray',
  color: 'gray',
};

const Navbar = ({ token, setToken, flipTheme }) => {
  const history = useHistory();
  const [anchor, setAnchor] = React.useState(null);
  const menuOpen = Boolean(anchor);
  const [error, setError] = React.useState('');
  const [errOpen, setErrOpen] = React.useState(false);
  const handleMenu = (event) => {
    setAnchor(event.currentTarget);
  };
  const handleClose = () => {
    setAnchor(null);
  };
  const logOut = async () => {
    const token = sessionStorage.getItem('jwt');
    try {
      console.log('!!!');
      const res = await fetch('http://localhost:8000/auth/logout', {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          token,
        }),
      });
      // check response status/code
      if (!res.ok) {
        const json = await res.json();
        setError(json);
        setErrOpen(true);
      }
      setToken(null);
      sessionStorage.removeItem('jwt');
    } catch (err) {
      console.log(err);
    }
  };

  // switch state
  const [checked, setChecked] = React.useState(true);
  const handleSwitch = () => {
    checked ? setChecked(false) : setChecked(true);
    flipTheme();
  };

  // Tips selector
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openTips = Boolean(anchorEl);
  const handleClickTips = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseTips = () => {
    setAnchorEl(null);
  };

  // Tour Modals
  // Start
  const [open, setOpen] = React.useState(false);
  const handleOpenStart = () => setOpen(true);
  const handleCloseStart = () => setOpen(false);

  // Home
  const [openHome, setOpenHome] = React.useState(false);
  const handleOpenHome = () => setOpenHome(true);
  const handleCloseHome = () => setOpenHome(false);

  // Stocks
  const [openStocks, setOpenStocks] = React.useState(false);
  const handleOpenStocks = () => setOpenStocks(true);
  const handleCloseStocks = () => setOpenStocks(false);

  // Insights
  const [openInsights, setOpenInsights] = React.useState(false);
  const handleOpenInsights = () => setOpenInsights(true);
  const handleCloseInsights = () => setOpenInsights(false);

  // Dashboard
  const [openDash, setOpenDash] = React.useState(false);
  const handleOpenDash = () => setOpenDash(true);
  const handleCloseDash = () => setOpenDash(false);

  // Advice
  const [openAdvice, setOpenAdvice] = React.useState(false);
  const handleOpenAdvice = () => setOpenAdvice(true);
  const handleCloseAdvice = () => setOpenAdvice(false);

  // Tour End
  const [openFinal, setOpenFinal] = React.useState(false);
  const handleOpenFinal = () => setOpenFinal(true);
  const handleCloseFinal = () => setOpenFinal(false);

  // Tour Start
  const handleBeginTour = () => {
    handleCloseTips();
    handleOpenStart();
  };

  // Step 1
  const handleStep1 = () => {
    handleCloseStart();
    handleOpenHome();
  };

  // Step 2
  const handleStep2 = () => {
    handleCloseHome();
    handleOpenStocks();
  };

  // Step 3
  const handleStep3 = () => {
    handleCloseStocks();
    handleOpenDash();
  };

  // Alt step 3 for not logged in
  const handleStep3Alt = () => {
    handleCloseStocks();
    handleOpenInsights();
  };

  // Step 4
  const handleStep4 = () => {
    handleCloseDash();
    handleOpenInsights();
  };

  // Step 5
  const handleStep5 = () => {
    handleCloseInsights();
    handleOpenAdvice();
  };

  // Alt step 5 for not logged in
  const handleStep5Alt = () => {
    handleCloseInsights();
    handleOpenFinal();
  };

  //Step 6
  const handleStep6 = () => {
    handleCloseAdvice();
    handleOpenFinal();
  };

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar sx={{ backgroundColor: '#2E2D4D' }}>
        <h1
          style={{
            cursor: 'pointer',
            margin: '0',
            marginRight: '40px',
          }}
          onClick={() => {
            history.push('/');
          }}
        >
          stox
        </h1>
        {token !== null && (
          <Tooltip title="View portfolios and watchlists!" arrow>
            <Button
              color="inherit"
              component={Link}
              to="/dashboard"
              startIcon={<DashboardIcon />}
              size="large"
            >
              Dashboard
            </Button>
          </Tooltip>
        )}
        <Tooltip title="Search all stocks!" arrow>
          <Button
            color="inherit"
            component={Link}
            to="/stocks"
            startIcon={<TrendingUpIcon />}
            size="large"
          >
            Stocks
          </Button>
        </Tooltip>
        <Tooltip title="View current trends!" arrow>
          <Button
            color="inherit"
            component={Link}
            to="/insights"
            startIcon={<InsightsIcon />}
            size="large"
          >
            Insights
          </Button>
        </Tooltip>
        <Tooltip title="Get help!" arrow>
          <Button
            color="inherit"
            //component={Link}
            // to='/tutorial'
            startIcon={<LightbulbIcon />}
            size="large"
            onClick={handleClickTips}
          >
            Tips
          </Button>
        </Tooltip>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={openTips}
          onClose={handleCloseTips}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleBeginTour}>
            <ListItemIcon>
              <TourIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Tour</ListItemText>
          </MenuItem>
          {token !== null ? (
            <MenuItem onClick={handleCloseTips} component={Link} to="/advice">
              <ListItemIcon>
                <HelpIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Advice</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem onClick={handleCloseTips} component={Link} to="/login">
              <ListItemIcon>
                <HelpIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Advice</ListItemText>
            </MenuItem>
          )}
        </Menu>
        <div style={{ flexGrow: '1' }} />
        <DarkModeSwitch checked={checked} onChange={handleSwitch} />
        {token !== null ? (
          <div>
            <IconButton onClick={handleMenu}>
              <AccountCircleIcon sx={{ fill: 'white' }}></AccountCircleIcon>
            </IconButton>
            <Menu
              anchorEl={anchor}
              open={menuOpen}
              onClose={handleClose}
              onClick={handleClose}
            >
              <MenuItem color="inherit" component={Link} to="/account">
                <Settings sx={{ mr: 1 }} /> Account Settings
              </MenuItem>
              <Divider />
              <MenuItem
                color="inherit"
                component={Link}
                to="/"
                onClick={logOut}
              >
                <Logout sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </div>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        )}

        {/* Site Tour Code */}
        {/* Start Tour */}
        <Modal open={open} onClose={handleCloseStart}>
          <Fade in={open}>
            <Paper sx={style}>
              <IconButton sx={closeButtonStyle} onClick={handleCloseStart}>
                <CloseIcon font="small" />
              </IconButton>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-around' }}
                >
                  <Typography variant="h6" component="h2">
                    Welcome to the stox site tour!
                  </Typography>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-around' }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStep1}
                    component={Link}
                    to="/"
                  >
                    Get started
                  </Button>
                </div>
              </div>
            </Paper>
          </Fade>
        </Modal>
        {/* Home */}
        <Modal open={openHome} onClose={handleCloseHome}>
          <Fade in={openHome}>
            <Paper sx={style}>
              <IconButton sx={closeButtonStyle} onClick={handleCloseHome}>
                <CloseIcon font="small" />
              </IconButton>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                  }}
                >
                  <Typography variant="h6" component="h2">
                    The home page
                  </Typography>
                  <Typography variant="body1">
                    The home page displays trending stocks and news.
                  </Typography>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-around' }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStep2}
                    component={Link}
                    to="/stocks"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Paper>
          </Fade>
        </Modal>
        {/* Stocks */}
        <Modal open={openStocks} onClose={handleCloseStocks}>
          <Fade in={openStocks}>
            <Paper sx={style}>
              <IconButton sx={closeButtonStyle} onClick={handleCloseStocks}>
                <CloseIcon font="small" />
              </IconButton>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                  }}
                >
                  <Typography variant="h6" component="h2">
                    The stocks page
                  </Typography>
                  <Typography variant="body1">
                    The stocks page lets you view and search stock data.
                    Clicking on a stock will bring you to its listing.
                  </Typography>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-around' }}
                >
                  {token !== null ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleStep3}
                      component={Link}
                      to="/dashboard"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleStep3Alt}
                      component={Link}
                      to="/insights"
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </Paper>
          </Fade>
        </Modal>
        {/* Dashboard */}
        <Modal open={openDash} onClose={handleCloseDash}>
          <Fade in={openDash}>
            <Paper sx={style}>
              <IconButton sx={closeButtonStyle} onClick={handleCloseDash}>
                <CloseIcon font="small" />
              </IconButton>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                  }}
                >
                  <Typography variant="h6" component="h2">
                    The dashboard
                  </Typography>
                  <Typography variant="body1">
                    Here is your dashboard. Here you can create new portfolios
                    and watchlists as well as view their performance.
                  </Typography>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-around' }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStep4}
                    component={Link}
                    to="/insights"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Paper>
          </Fade>
        </Modal>
        {/* Insights */}
        <Modal open={openInsights} onClose={handleCloseInsights}>
          <Fade in={openInsights}>
            <Paper sx={style}>
              <IconButton sx={closeButtonStyle} onClick={handleCloseInsights}>
                <CloseIcon font="small" />
              </IconButton>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                  }}
                >
                  <Typography variant="h6" component="h2">
                    The insights page
                  </Typography>
                  <Typography variant="body1">
                    The insights page provides information on stock trends and
                    overall sentiment towards them.
                  </Typography>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-around' }}
                >
                  {token !== null ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleStep5}
                      component={Link}
                      to="/advice"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleStep5Alt}
                      component={Link}
                      to="/"
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </Paper>
          </Fade>
        </Modal>
        {/* Advice */}
        <Modal open={openAdvice} onClose={handleCloseAdvice}>
          <Fade in={openAdvice}>
            <Paper sx={style}>
              <IconButton sx={closeButtonStyle} onClick={handleCloseAdvice}>
                <CloseIcon font="small" />
              </IconButton>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                  }}
                >
                  <Typography variant="h6" component="h2">
                    The advice page
                  </Typography>
                  <Typography variant="body1">
                    Provides trading advice and how to develop your portfolios.
                    Login to get advice applicable to your listed portfolios.
                  </Typography>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-around' }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStep6}
                    component={Link}
                    to="/"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Paper>
          </Fade>
        </Modal>
        {/* Final */}
        <Modal open={openFinal} onClose={handleCloseFinal}>
          <Fade in={openFinal}>
            <Paper sx={style}>
              <IconButton sx={closeButtonStyle} onClick={handleCloseFinal}>
                <CloseIcon font="small" />
              </IconButton>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                  }}
                >
                  <Typography variant="h6" component="h2">
                    You're done!
                  </Typography>
                  <Typography variant="body1">
                    Congratulations! You've finished the stox site tour!
                  </Typography>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-around' }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCloseFinal}
                  >
                    Finish
                  </Button>
                </div>
              </div>
            </Paper>
          </Fade>
        </Modal>
      </Toolbar>
      <ErrorSnackbar
        error={error}
        setError={setError}
        errOpen={errOpen}
        setErrOpen={setErrOpen}
      />
    </AppBar>
  );
};

export default Navbar;
