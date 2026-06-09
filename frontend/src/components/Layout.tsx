import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ConnectionModal from './ConnectionModal';

export default function Layout() {
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onConnectClick={() => setShowConnectionModal(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="app-main flex-1">
          <Outlet />
        </main>
      </div>

      <ConnectionModal
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
      />
    </div>
  );
}
