import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Image,
  Button,
  Textarea,
  HStack,
} from '@chakra-ui/react';
import { getBlogPostDetails, createComment } from '../actions/blogActions';
import Comment from '../components/Comment'; // Comment component for displaying individual comments
import { cleanMediaPath } from '../utils/urlUtils';

function BlogPost({ post, commentsCount }) {
  const { id } = useParams();
  const postId = id;
  const dispatch = useDispatch();
  const [commentContent, setCommentContent] = useState('');
  const { userInfo } = useSelector(state => state.userLogin);
  const { comments } = post;
  // const { post, comments, isAuthenticated } = useSelector(state => state.blog);

  const handleCommentSubmit = () => {
    if (userInfo) {
      dispatch(createComment(post.id, commentContent)); // Submit the comment
      setCommentContent(''); // Clear the textarea
    } else {
      alert('Please log in to comment');
    }
  };
  // console.log('BLOG:', post);
  // console.log('BLOG:', post.image);

  return (
    <Box p={5} mt={50}>
      <Heading fontFamily={'lato'} mb={10}>
        {post.content}
      </Heading>
      {post.image && (
        <Image
          // src={post.image}
          src={
            post.image
              ? cleanMediaPath(post.image)
              : cleanMediaPath('default/placeholder.jpg')
          }
          alt={post.content}
        />
      )}
      <HStack mt={10}>
        <Text fontFamily={'lato'} fontWeight={800}>
          Created At:{' '}
        </Text>
        <Text fontFamily={'lato'} fontWeight={300}>
          {new Date(post.created_at).toLocaleString()}
        </Text>
      </HStack>
      <HStack>
        <Text fontFamily={'lato'} fontWeight={800}>
          Posted By:{' '}
        </Text>
        <Text
          fontFamily={'rale'}
          fontWeight="bold"
          fontSize="lg"
          color="teal.600"
          isTruncated
        >
          {post.user}
        </Text>
      </HStack>
      <Text fontFamily={'lato'}>
        Likes: {post.likes_count} | Comments: {commentsCount}
      </Text>

      {/* Display Comments */}
      <Box mt={5}>
        <Heading size="md">Comments</Heading>
        {comments &&
          comments.map(comment => (
            <Comment key={comment.id} comment={comment} />
          ))}
      </Box>
    </Box>
  );
}

export default BlogPost;
