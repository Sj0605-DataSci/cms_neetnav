import React from 'react';

        interface AuthLayoutProps {
          children: React.ReactNode;
        }

        export function AuthLayout({ children }: AuthLayoutProps) {
          return (
            <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
              <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                {children}
              </div>
              <div className="hidden bg-muted lg:block">
                <img
                  src="https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1974&auto=format&fit=crop"
                  alt="Image of a library"
                  className="h-full w-full object-cover dark:brightness-[0.3]"
                />
              </div>
            </div>
          );
        }
