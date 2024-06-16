import axios from 'axios';
import {useState,useEffect, useRef} from 'react';
import constants from '../../constants';
import './index.css';

import FilterBar from './FilterBar';
import ArticleCard from './ArticleCard';
import Loading from '../Loading';

function Articles() {
  const RESULT_LIMIT = 10;

  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Used to implement infinite scrolling
  const lastCardRef = useRef(null);

  const pageRef = useRef(null);
  const totalArticleCount = useRef(null);
  const abortController = useRef(null);
  const currentReqCount = useRef(0);

  // On initial mount
  useEffect(() => {
    console.log("Mounting Articles component!");
    abortController.current = new AbortController();

    pageRef.current = 1;
    setArticles([]);

    fetchAppendArticles(pageRef.current, abortController.current);

    return () => {
      abortController.current.abort();
    };
  }, []);

  // When articles data changes
  useEffect(() => {
    // Add IntersectionObserver for infinite scrolling
    let interOptions = {
      rootMargin: "0px",
      threshold: 0.5
    };

    let observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const hasMoreArticles = ((pageRef.current * RESULT_LIMIT) < totalArticleCount.current);

          if (hasMoreArticles && entry.isIntersecting && !isLoading) {
            pageRef.current = pageRef.current + 1;
            fetchAppendArticles(pageRef.current, abortController.current);
          }
        });
      }, 
      interOptions
    );

    if (lastCardRef.current)
      observer.observe(lastCardRef.current);

    return () => {
      observer.disconnect();
    };
  }, [articles]);

  const fetchAppendArticles = (page = 1, abortController) => {
    if (isLoading) {
      console.log("Already fetching articles!  Returning!");

      return; 
    }
    
    setIsLoading(true);
    currentReqCount.current++;

    console.log("Fetching articles!");

    const url = constants.ARTICLES_API_URL;

    const axOptions = {
      signal: abortController.signal,
      params: {
        p: page
      }
    };

    axios.get(url, axOptions)
        .then(({data}) => {
          console.log("Successfully fetched articles!");

          // Append articles
          setArticles((currArticles) => {return [...currArticles, ...data.articles]});

          // Append totalArticleCount
          if (data.articles.length)
            totalArticleCount.current = data.articles[0].total_count;
        })
        .catch((err) => {
          console.log(err);
          console.log("ERROR: Unable to fetch articles!");
        })
        .finally(() => {
          currentReqCount.current--;
          if (!currentReqCount.current)
            setIsLoading(false);
        });
  };

  let articlesBody;
  if (!isLoading && !articles.length) {
    articlesBody = <p className="no-articles-found">No articles found!</p>;
  } else {
    articlesBody = articles.map((article, i, arr) => {
      const isLastCard = (arr.length - 1 === i);

      if (isLastCard) {
        return (
          <div className="article-card last-card" ref={lastCardRef} key={article.article_id} >
            <ArticleCard article={article} />
          </div>
        );
      } else {
        return (
          <div className="article-card" key={article.article_id} >
            <ArticleCard article={article} />
          </div>
        );      
      }
    });
  }

  return (
      <section className="articles-section">
        <FilterBar />
        {articlesBody}

        {(isLoading ? <Loading /> : null)}
      </section>    
  );
}

export default Articles;