import { LineWebViewRedirect } from '@components/LineWebViewRedirect';
import Navigation from '@components/Navigation';
import ProtectedRoute from '@components/ProtectedRoute';
import { routes } from '@config/routes';
import { AuthProvider } from '@contexts/AuthContext';
import { HintDialogProvider } from '@contexts/HintDialogContext';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <HintDialogProvider>
        <Router>
          <div className="App">
            <LineWebViewRedirect />
            <Navigation />
            <main className="main-content">
              <Routes>
                {routes.map(route => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <ProtectedRoute
                        requireAuth={route.requireAuth}
                        requireAdmin={route.requireAdmin}
                      >
                        <route.element />
                      </ProtectedRoute>
                    }
                  />
                ))}
              </Routes>
            </main>
          </div>
        </Router>
      </HintDialogProvider>
    </AuthProvider>
  );
}

export default App;
