import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

function sleep(delay = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export default function Asynchronous() {
  const [search, setSearch] = React.useState(stocksList[0]);
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [inputValue, setInputValue] = React.useState('');
  const loading = open && options.length === 0;

  React.useEffect(() => {
    console.log('ahahahah');
  }, [search]);

  React.useEffect(() => {
    console.log('hahahahah');
  }, [inputValue]);

  React.useEffect(() => {
    console.log('ot');
    let active = true;
    if (!loading) {
      return undefined;
    }

    (async () => {
      if (active) {
        setOptions([...stocksList]);
      }
    })();

    return () => {
      active = false;
    };
  }, [loading, search]);

  React.useEffect(() => {
    console.log('oepen');
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      id="asynchronous-demo"
      sx={{ width: 300 }}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      getOptionSelected={(option, value) => option === value}
      // getOptionLabel={(option) => option.name}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Asynchronous"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}

const stocksList = ['AMZN', 'GOOGL', 'TSLA', 'NFLX', 'FB', 'AAPL'];
