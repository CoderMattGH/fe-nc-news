import {Link} from 'react-router-dom';
import dateParsing from '../../util-functions/date-parsing';

import './ArticleCard.css';

function ArticleCard({article, upVoteArticle, downVoteArticle}) {
  const handleUpVoteClick = (event) => {
    event.preventDefault();

    upVoteArticle();
  };

  const handleDownVoteClick = (event) => {
    event.preventDefault();

    downVoteArticle();
  };

  const preventLinkRedirect = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <img alt="Article Image" className="article-card__img" src={article.article_img_url} />
      <h2 className="article-card__title">{article.title}</h2>
      <p className="article-card__desc-summary">
        {(article.body_preview.length >= 410) ?
            article.body_preview.slice(0, 410).trim() + "..."
          : 
            article.body_preview
        }
      </p>
      <div className="article-card__footer">
        <p className="button__votes button__element--gray" onClick={preventLinkRedirect} >
          <img
            className="button__vote_btn" onClick={handleUpVoteClick} alt="upvote" 
            src="/images/buttons/upvote.svg" 
          />
          <span>{article.votes}</span>
          <img
            className="button__vote_btn" onClick={handleDownVoteClick} alt="downvote" 
            src="/images/buttons/downvote.svg" 
          />
        </p>
        <p className="button__category button__element--gray">{article.topic}</p>
        <p className="article_card__date button__element--gray">
          {dateParsing.convertUnixDate(article.created_at)}
        </p>
        <p className="article_card__comment-count button__element--gray">
          {article.comment_count} comments
        </p>
      </div>
    </>
  );
}

export default ArticleCard;