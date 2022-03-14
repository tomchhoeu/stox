import React from 'react';
import Chart from 'react-apexcharts';

import {
  Typography,
  Container,
  Grid,
  Paper,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material';

import FlashOnIcon from '@mui/icons-material/FlashOn';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

function std(array) {
  if (!array || array.length === 0) {
    return 0;
  }
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
  );
}

function avg(array) {
  if (!array || array.length === 0) {
    return 0;
  }
  const n = array.length;
  return array.reduce((a, b) => a + b) / n;
}

const IconTextContainer = ({ icon, text }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: '10px',
      }}
    >
      {icon}
      <Typography variant="body" sx={{ verticalAlign: 'middle' }}>
        {text}
      </Typography>
    </div>
  );
};

const Advice = () => {
  // First must select a portfolio
  // To do this first obtain all listed portfolios for a user
  const token = sessionStorage.getItem('jwt');
  const [stocks, setStocks] = React.useState([]);
  const [portfolioID, setPortfolioID] = React.useState('');
  const [portfolios, setPortfolios] = React.useState([]);
  const [error, setError] = React.useState('');
  const [errOpen, setErrOpen] = React.useState(false);
  const [options, setOptions] = React.useState({});
  const [series, setSeries] = React.useState([]);
  const [portSectors, setSectors] = React.useState([]);
  const [portFrequencies, setFrequencies] = React.useState([]);
  const [outliers, setOutliers] = React.useState([]);
  let object = {};

  React.useEffect(() => {
    // Get all portofolios for a user
    const getPortfolios = async () => {
      try {
        const res = await fetch(`http://localhost:8000/portfolio/${token}`, {
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-type': 'application/json',
          },
          method: 'GET',
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json);
          setErrOpen(true);
          return;
        }
        setPortfolios(json);
      } catch (err) {
        console.log(err);
      }
    };
    getPortfolios();
  }, []);

  React.useEffect(() => {
    // Get all stocks in a portfolio
    const getPortfolioStocks = async function () {
      try {
        const token = sessionStorage.getItem('jwt');
        const ID = portfolioID;
        const res = await fetch(
          `http://localhost:8000/portfolio/stocks/${token}/${ID}`,
          {
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-type': 'application/json',
            },
            method: 'GET',
          }
        );
        const portfolio = await res.json();
        if (!res.ok) {
          setError(portfolio);
          setErrOpen(true);
          return;
        }
        object = portfolio.stocks.reduce(
          (obj, item) => ((obj[item.equitySymbol] = item), obj),
          {}
        );

        console.log(portfolio.stocks);

        setStocks(portfolio.stocks);
        return;
      } catch (err) {
        console.log(err);
      }
    };
    getPortfolioStocks();
  }, [portfolioID]);

  React.useEffect(() => {
    var sectors = [];
    var frequencies = [];

    const updateData = async () => {
      let asyncCalls = stocks.map(async (stock) => {
        try {
          // GET current stock data
          const res = await fetch(`http://localhost:8000/stock/${stock}`);
          // check response status/code
          const json = await res.json();
          if (!res.ok) {
            setError(json);
            setErrOpen(true);
            return;
          }

          return json;
        } catch (err) {
          console.log(err);
        }
      });

      await Promise.all(asyncCalls).then((data) => {
        // once finished async calls, update rows with the data
        for (let stockInfo of data) {
          var index = sectors.indexOf(stockInfo.sector);
          if (index == -1) {
            sectors.push(stockInfo.sector);
            frequencies.push(1);
          } else {
            frequencies[index]++;
          }
        }
      });

      const chart_config = {
        options: {
          chart: {
            id: 'bar-chart',
          },
          xaxis: {
            categories: sectors,
          },
          title: {
            text: 'Unique stocks per sector',
          },
        },
        series: [
          {
            name: 'frequency',
            data: frequencies,
          },
        ],
      };

      setOptions(chart_config.options);
      setSeries(chart_config.series);

      setSectors(sectors);
      setFrequencies(frequencies);

      var tempOutliers = [];
      var meanFreq = avg(frequencies);
      var stdFreq = std(frequencies);
      for (let i = 0; i < frequencies.length; i++) {
        if (frequencies[i] > meanFreq + stdFreq) {
          tempOutliers.push(sectors[i]);
        }
      }

      setOutliers(tempOutliers);
    };
    updateData();
  }, [stocks]);

  const handleChange = (event) => {
    setPortfolioID(event.target.value);
  };

  return (
    <Container component="main" maxWidth="lg" className="main">
      <Typography variant="h5" noWrap style={{ marginBottom: '30px' }}>
        Advice
      </Typography>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2}>
          {/* LEFT COLUMN */}
          <Grid item xs={12} md={8} lg={8}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 600,
              }}
            >
              <FormControl fullWidth>
                <InputLabel id="select-label" color="text">
                  Portfolio
                </InputLabel>
                <Select
                  labelId="select-label"
                  id="select"
                  value={portfolioID}
                  onChange={handleChange}
                  label="Portfolio"
                >
                  {portfolios.map((selectPortfolio) => (
                    <MenuItem
                      color="inherit"
                      key={selectPortfolio._id}
                      value={selectPortfolio._id}
                    >
                      {selectPortfolio.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Chart options={options} series={series} type="bar" />
            </Paper>
          </Grid>
          {/* RIGHT COLUMN */}
          <Grid item xs={12} md={4} lg={4}>
            <Grid container spacing={2} direction="row">
              <Grid item xs={12} md={12} lg={12}>
                {/* CRYPTOCURRENCY CARD */}
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'scroll',
                    height: 400,
                  }}
                >
                  <Typography variant="h6" style={{ marginBottom: '30px' }}>
                    Suggestions
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '15px' }}>
                    You are invested in {portSectors.length} market sector
                    {portSectors.length == 1 ? '' : 's'},
                    {portSectors.length < 4
                      ? ' consider diversifying your portfolio.'
                      : ' your portfolio has a diverse array of stocks.'}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '5px' }}>
                    Consider if you are over-invested in the following sectors:
                  </Typography>
                  {outliers.map((outSector) => (
                    <Typography variant="body1" key={outSector}>
                      {outSector}
                    </Typography>
                  ))}
                </Paper>
              </Grid>
              <Grid item xs={12} md={12} lg={12}>
                {/* DAILY REMINDER CARD */}
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 182,
                  }}
                >
                  <Typography variant="h6">Daily Reminder</Typography>
                  <IconTextContainer
                    icon={<FlashOnIcon />}
                    text={'Never make rushed decisions.'}
                  />
                  <IconTextContainer
                    icon={<SentimentVeryDissatisfiedIcon />}
                    text={'Keep emotions out of your trading.'}
                  />
                  <IconTextContainer
                    icon={<HealthAndSafetyIcon />}
                    text={'Practice safe investment strategies.'}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};

export default Advice;
