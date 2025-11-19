import type { JSX } from 'react';
import AppRouter from './AppRouter';
import { useGlobalClickListener } from '../hooks/useGlobalClickListener';

const App = (): JSX.Element => {
  useGlobalClickListener();
  return (
    <AppRouter />
  )
}

export default App;