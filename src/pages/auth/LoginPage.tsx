import { Link, useNavigate } from 'react-router-dom';
        import { Button } from '@/components/ui/button';
        import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
        import { Input } from '@/components/ui/input';
        import { Label } from '@/components/ui/label';
        import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
        import { AuthLayout } from '@/components/layout/AuthLayout';
        import { useAuth } from '@/hooks/useAuth';
        import { UserRole } from '@/contexts/AuthContext';
        import { useForm, Controller } from 'react-hook-form';

        export default function LoginPage() {
          const { login } = useAuth();
          const navigate = useNavigate();
          const { control, handleSubmit, formState: { errors } } = useForm({
            defaultValues: {
              email: '',
              password: '',
              role: 'student' as UserRole,
            }
          });

          const onSubmit = (data: { email: string; password: string; role: UserRole }) => {
            login(data.email, data.password, data.role);
            navigate('/');
          };

          return (
            <AuthLayout>
              <div className="mx-auto grid w-[350px] gap-6">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold">Counseling Management System</h1>
                    <p className="text-balance text-muted-foreground">
                        Login to your account
                    </p>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your email below to login to your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Controller
                          name="email"
                          control={control}
                          rules={{ required: 'Email is required' }}
                          render={({ field }) => <Input id="email" type="email" placeholder="m@example.com" {...field} />}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center">
                          <Label htmlFor="password">Password</Label>
                        </div>
                        <Controller
                          name="password"
                          control={control}
                          rules={{ required: 'Password is required' }}
                          render={({ field }) => <Input id="password" type="password" {...field} />}
                        />
                         {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="mentor">Mentor</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                                </Select>
                            )}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Login
                      </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                      Don&apos;t have an account?{' '}
                      <Link to="/register" className="underline">
                        Sign up
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AuthLayout>
          );
        }
