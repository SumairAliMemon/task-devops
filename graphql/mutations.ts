import { gql } from '@apollo/client';

export const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!, $author_id: uuid!) {
    insert_posts_one(object: {
      title: $title,
      content: $content,
      author_id: $author_id
    }) {
      id
      title
      content
      created_at
      author {
        id
        full_name
        email
      }
    }
  }
`;
