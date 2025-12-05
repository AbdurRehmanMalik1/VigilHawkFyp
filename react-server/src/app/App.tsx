import type { JSX } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './AppRouter';
import { useGlobalClickListener } from '../hooks/useGlobalClickListener';

// Create a QueryClient instance
const queryClient = new QueryClient();

const App = (): JSX.Element => {
  useGlobalClickListener();

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;
