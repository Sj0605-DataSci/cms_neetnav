import React, { createContext, useEffect, useState, ReactNode } from 'react';

import { apiFetch, AUTH_STORAGE_KEY } from '@/lib/utils';

        export type UserRole = 'student' | 'mentor' | 'admin';

        interface AuthState {
          token: string;
          email: string;
          role: UserRole;
          expiresAt: string;
        }

        interface AuthContextType {
          isAuthenticated: boolean;
          user: { name: string; email: string; role: UserRole } | null;
          login: (email: string, password: string, role: UserRole) => Promise<void>;
          logout: () => void;
        }

        export const AuthContext = createContext<AuthContextType | undefined>(undefined);

        const buildUser = (state: AuthState) => ({
          name: state.email.split('@')[0],
          email: state.email,
          role: state.role,
        });

        export const AuthProvider = ({ children }: { children: ReactNode }) => {
          const [authState, setAuthState] = useState<AuthState | null>(null);

          const persist = (state: AuthState | null) => {
            if (state) {
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
            } else {
              localStorage.removeItem(AUTH_STORAGE_KEY);
            }
          };

          useEffect(() => {
            const stored = localStorage.getItem(AUTH_STORAGE_KEY);
            if (stored) {
              const parsed: AuthState = JSON.parse(stored);
              if (new Date(parsed.expiresAt) > new Date()) {
                setAuthState(parsed);
              } else {
                persist(null);
              }
            }
          }, []);

          const login = async (email: string, password: string, role: UserRole) => {
            const response = await apiFetch<{ access_token: string; expires_at: string } | null>('/auth/signin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, role }),
              auth: false,
            });
            if (!response) {
              throw new Error('Failed to authenticate');
            }
            const state: AuthState = {
              token: response.access_token,
              email,
              role,
              expiresAt: response.expires_at,
            };
            setAuthState(state);
            persist(state);
          };

          const logout = () => {
            setAuthState(null);
            persist(null);
          };

          const isAuthenticated = !!authState;

          return (
            <AuthContext.Provider value={{ isAuthenticated, user: authState ? buildUser(authState) : null, login, logout }}>
              {children}
            </AuthContext.Provider>
          );
        };
