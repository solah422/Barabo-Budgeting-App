import { AppProvider } from './providers/AppProvider';
import { MainLayout } from './components/MainLayout';

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
