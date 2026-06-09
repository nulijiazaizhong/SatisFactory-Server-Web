import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConnectionProvider } from './contexts/ConnectionContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ServerOptions from './pages/ServerOptions';
import GameSettings from './pages/GameSettings';
import Sessions from './pages/Sessions';
import Actions from './pages/Actions';

export default function App() {
  return (
    <ConnectionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="options" element={<ServerOptions />} />
            <Route path="settings" element={<GameSettings />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="actions" element={<Actions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConnectionProvider>
  );
}
