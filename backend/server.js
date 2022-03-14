const express = require('express');
const cors = require('cors');

const PORT = 8000;

const app = express();
app.use(cors());
app.use(express.json());

//define db
require('./db');
app.get('/', (req, res) => res.send('API Running'));

// define routes
app.use('/auth', require('./routes/auth'));
app.use('/stock', require('./routes/stock'));
app.use('/watchlist', require('./routes/watchlist'));
app.use('/portfolio', require('./routes/portfolio'));
app.use('/news', require('./routes/news'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
