import type { JSX } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import AppRouter from './AppRouter';
import { useGlobalClickListener } from '../hooks/useGlobalClickListener';
import { store } from '../feature/store/store';

const queryClient = new QueryClient();

const App = (): JSX.Element => {
  useGlobalClickListener();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
