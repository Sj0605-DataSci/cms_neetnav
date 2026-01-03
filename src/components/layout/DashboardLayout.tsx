import React from 'react';
        import { Link } from 'react-router-dom';
        import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
        import { Button } from '@/components/ui/button';
        import {
          DropdownMenu,
          DropdownMenuContent,
          DropdownMenuItem,
          DropdownMenuLabel,
          DropdownMenuSeparator,
          DropdownMenuTrigger,
        } from '@/components/ui/dropdown-menu';
        import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
        import { Menu, GraduationCap } from 'lucide-react';
        import { useAuth } from '@/hooks/useAuth';
        import { UserRole } from '@/contexts/AuthContext';
        import { ThemeToggle } from '../ThemeToggle';

        const getNavLinks = (role: UserRole) => {
            switch(role) {
                case 'admin':
                    return [{ to: '/admin', label: 'Dashboard' }];
                case 'mentor':
                    return [{ to: '/mentor', label: 'My Students' }];
                case 'student':
                    return [{ to: '/student', label: 'My Page' }];
                default:
                    return [];
            }
        }

        export function DashboardLayout({ children }: { children: React.ReactNode }) {
          const { user, logout } = useAuth();
          const navLinks = user ? getNavLinks(user.role) : [];

          return (
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
              <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                  <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link to="/" className="flex items-center gap-2 font-semibold">
                      <GraduationCap className="h-6 w-6" />
                      <span className="">Counseling System</span>
                    </Link>
                  </div>
                  <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                      {navLinks.map(link => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col">
                      <nav className="grid gap-2 text-lg font-medium">
                        <Link to="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                          <GraduationCap className="h-6 w-6" />
                          <span>Counseling System</span>
                        </Link>
                        {navLinks.map(link => (
                          <Link
                            key={link.to}
                            to={link.to}
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </nav>
                    </SheetContent>
                  </Sheet>
                  <div className="w-full flex-1" />
                  <ThemeToggle />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="rounded-full">
                        <Avatar>
                            <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.name} />
                            <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuItem>Support</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
              </div>
            </div>
          );
        }
