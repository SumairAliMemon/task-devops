import { gql } from '@apollo/client';

export const GET_POSTS = gql`
  query GetPosts($first: Int = 5, $offset: Int = 0) {
    postsCollection(
      first: $first
      offset: $offset
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          title
          content
          created_at
          author_id
          profiles {
            id
            full_name
            email
          }
        }
      }
    }
  }
`;

export const GET_POST = gql`
  query GetPost($id: UUID!) {
    postsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          title
          content
          created_at
          author_id
          profiles {
            id
            full_name
            email
          }
        }
      }
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($object: postsInsertInput!) {
    insertIntopostsCollection(objects: [$object]) {
      records {
        id
        title
        content
        created_at
        author_id
      }
    }
  }
`;
