import React from 'react';

import { Typography } from '@mui/material';

import NewsCard from './NewsCard';

const NewsList = ({ stock }) => {
  const [news, setNews] = React.useState([]);
  React.useEffect(() => {
    const updateData = () => {
      const asyncCall = async () => {
        try {
          // GET current news
          let res = {};
          if (typeof stock === 'string') {
            res = await fetch(`http://localhost:8000/news/${stock}`);
          } else {
            res = await fetch(`http://localhost:8000/news/multistock`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json;charset=utf-8',
              },
              body: JSON.stringify(stock),
            });
          }
          // check response status/code
          if (!res.ok) {
            console.log('news call failed!');
            return {};
          }
          const data = await res.json();
          return data;
        } catch (err) {
          console.log(err);
        }
      };

      asyncCall().then((data) => {
        if (data === undefined) return;
        setNews([]);
        if (Object.entries(data).length == 0) {
          console.log('No news data found');
          return;
        }
        const articles = data.news.articles;
        const seen_titles = [];
        try {
          Object.entries(articles).forEach((val) => {
            let first_title = val[1].title.split(' ').slice(0, 2);
            first_title = first_title[0] + first_title[1];

            // check if we've seen this title before
            if (seen_titles.indexOf(first_title) === -1) {
              seen_titles.push(first_title);
              const row = {
                id: val[0],
                title: val[1].title,
                date: val[1].publishedAt.slice(0, -10),
                url: val[1].url,
              };
              setNews((news) => [...news, row]);
              // console.log("SET NEWS UPDATED", news);
            }
          });
        } catch(err) {
          console.log('news error:', err);
        }
      });
    };
    updateData();
  }, [stock]);

  return (
    <div>
      <Typography variant="h6" noWrap sx={{ mb: '10px' }}>
        News
      </Typography>
      <div sx={{ display: 'flex', gap: '10px', overflow: 'scroll' }}>
        {news.map((row) => (
          <NewsCard
            key={row.id}
            title={row.title}
            date={row.date}
            url={row.url}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsList;
