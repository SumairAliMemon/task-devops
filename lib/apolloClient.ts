
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export function makeApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_SUPABASE_URL + '/graphql/v1',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
    }),
    cache: new InMemoryCache(),
  });
}
