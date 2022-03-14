const News = require('../models/newsModel');

exports.storeNews = (req, res) => {
  const { source, title, description, body, url, date } = req.body;

  date = new Date(date);

  let news = new News(source, title, description, body, url, date);

  console.log('Recieved news request with title and date', title, date);

  payload = title;

  News.findOne({ url: url }, (err, result) => {
    // Check if news with url is already registered
    if (err) {
      return res.status(500).send(payload);
    }
    if (result) {
      console.log('Article already exists!');
      return res.status(403).json(payload);
    } else {
      // Save news
      news.save();
      console.log('Saved news');
      return res.status(200).json(payload);
    }
  });
};

exports.findNewsByDate = (req, res) => {
  const { start_date, end_date } = req.body;
  // Find user within daterange

  News.find(
    {
      date: {
        $gte: new Date(start_date),
        $lt: new Date(end_date),
      },
    },
    (err, result) => {
      if (err) {
        console.log(
          `Could not find news between ${start_date} and ${end_date}`
        );
        return res.status(500).send(err);
      }
      if (result) {
        console.log('returning result(s)');
        return res.status(200).json(result);
      }
      return res
        .status(401)
        .send("Yeah idk what's happening here, sorry chief");
    }
  );
};
