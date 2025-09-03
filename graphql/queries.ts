import { gql } from '@apollo/client';

// Get all posts with pagination
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
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Get posts by specific user with pagination
export const GET_USER_POSTS = gql`
  query GetUserPosts($authorId: UUID!, $first: Int = 5, $offset: Int = 0) {
    postsCollection(
      filter: { author_id: { eq: $authorId } }
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
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Get single post by ID
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

// Create a new post
export const CREATE_POST = gql`
  mutation CreatePost($object: postsInsertInput!) {
    insertIntopostsCollection(objects: [$object]) {
      records {
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
`;

// Get current user profile
export const GET_PROFILE = gql`
  query GetProfile($id: UUID!) {
    profilesCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          email
          full_name
          created_at
        }
      }
    }
  }
`;

// Create user profile
export const CREATE_PROFILE = gql`
  mutation CreateProfile($object: profilesInsertInput!) {
    insertIntoprofilesCollection(objects: [$object]) {
      records {
        id
        email
        full_name
        created_at
      }
    }
  }
`;