import DEBUG from '../../../constants/debug';

import axios from 'axios';
import {useState, useRef, useEffect, useContext} from 'react';

import constants from '../../../constants';

import CommentCard from './CommentCard';
import PostComment from './PostComment';
import Loading from '../../Loading';
import ErrorOverlay from '../../ErrorOverlay';

import {UserContext} from '../../../contexts/User';

import './index.css';

function Comments({article}) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState(null);
  const [errOverlayMsg, setErrOverlayMsg] = useState(null);

  const {user} = useContext(UserContext);

  const abortController = useRef(null);
  const currentReqCount = useRef(0);

  useEffect(() => {
    if (DEBUG)
      console.log("Mounting Comments component!");

    setComments([]);

    abortController.current = new AbortController();

    fetchPopulateComments(article.article_id, abortController.current);

    return () => {
      abortController.current.abort();
    };
  }, []);

  const fetchPopulateComments = (articleId, abortController) => {
    if (DEBUG)
      console.log("Fetching comments!");

    currentReqCount.current++;
    setErrMsg(null);
    setIsLoading(true);

    const url = `${constants.ARTICLES_API_URL}/${articleId}/comments`;

    const axOptions = {
      signal: abortController.signal
    };

    axios.get(url, axOptions)
        .then(({data}) => {
          if (DEBUG)
            console.log("Successfully fetched comments!");

          setErrMsg(null);
          setComments(data.comments)
        })
        .catch((err) => {
          if (DEBUG)
            console.log(err);

          setErrMsg("Unable to fetch comments!");
        })
        .finally(() => {
          currentReqCount.current--;

          if(!currentReqCount.current)
            setIsLoading(false);
        });
  };

  const handleCommentVote = () => {
    setErrOverlayMsg("Comment voting is coming soon!");
  };

  let commentsBody;
  if (errMsg) {
    commentsBody = (<p className="err-msg-default">{errMsg}</p>);
  }
  else if (!article.comment_count) {
    commentsBody = (<p className="no-comments-msg">This article does not contain any comments</p>);
  } else {
    commentsBody = comments.map((comment) => {
      return (
        <CommentCard 
          comment={comment} key={comment.comment_id} setComments={setComments} 
          handleCommentVote={handleCommentVote}
        />
      );
    });
  }

  return (
    <>
      <h3 className="article-comments__comments_title">Comments ({article.comment_count})</h3>
      {isLoading ?  
          <Loading size={'small'} />
        :
          <>
            {user ?
                <PostComment articleId={article.article_id} setComments={setComments} />
              :
                null
            }

            {commentsBody}
          </>
      }

      {errOverlayMsg ? 
          <ErrorOverlay errOverlayMsg={errOverlayMsg} setErrOverlayMsg={setErrOverlayMsg} />
        :
          null
      }
    </>
  );
};

export default Comments;