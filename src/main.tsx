import React from 'react';
        import ReactDOM from 'react-dom/client';
        import { BrowserRouter } from 'react-router-dom';
        import App from './App.tsx';
        import './index.css';
        import { ThemeProvider } from './providers/ThemeProvider.tsx';
        import { AuthProvider } from './contexts/AuthContext.tsx';
        import { Toaster } from "@/components/ui/sonner"


        ReactDOM.createRoot(document.getElementById('root')!).render(
          <React.StrictMode>
            <BrowserRouter>
              <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <AuthProvider>
                  <App />
                  <Toaster />
                </AuthProvider>
              </ThemeProvider>
            </BrowserRouter>
          </React.StrictMode>,
        );
