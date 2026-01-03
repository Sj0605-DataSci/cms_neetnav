import { Link, useNavigate } from 'react-router-dom';
        import { Button } from '@/components/ui/button';
        import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
        import { Input } from '@/components/ui/input';
        import { AuthLayout } from '@/components/layout/AuthLayout';
        import { useForm } from 'react-hook-form';
        import { zodResolver } from '@hookform/resolvers/zod';
        import * as z from 'zod';
        import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
        import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
        import { toast } from 'sonner';

        const formSchema = z.object({
            // Personal
            firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
            lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
            email: z.string().email({ message: 'Please enter a valid email.' }),
            password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
            // Academic
            college: z.string().min(2, { message: 'College name is required.' }),
            degree: z.string().min(2, { message: 'Degree is required.' }),
            graduationYear: z.coerce.number().min(1980).max(2030),
        });

        export default function RegisterPage() {
            const navigate = useNavigate();

            const form = useForm<z.infer<typeof formSchema>>({
                resolver: zodResolver(formSchema),
                defaultValues: {
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    college: '',
                    degree: '',
                    graduationYear: new Date().getFullYear(),
                },
            });

            function onSubmit(values: z.infer<typeof formSchema>) {
                console.log(values);
                toast.success("Registration Successful!", {
                    description: "Redirecting you to the login page.",
                });
                setTimeout(() => navigate('/login'), 2000);
            }

            return (
                <AuthLayout>
                    <Card className="mx-auto w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-xl">Sign Up</CardTitle>
                            <CardDescription>Enter your information to create an account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)}>
                                    <Tabs defaultValue="personal" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="personal">Personal</TabsTrigger>
                                            <TabsTrigger value="academic">Academic</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="personal" className="space-y-4 pt-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>First Name</FormLabel>
                                                        <FormControl><Input placeholder="John" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Last Name</FormLabel>
                                                        <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                            <FormField control={form.control} name="email" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl><Input placeholder="m@example.com" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="password" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl><Input type="password" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </TabsContent>
                                        <TabsContent value="academic" className="space-y-4 pt-4">
                                            <FormField control={form.control} name="college" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>College/University</FormLabel>
                                                    <FormControl><Input placeholder="State University" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="degree" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Degree</FormLabel>
                                                    <FormControl><Input placeholder="B.Sc. in Computer Science" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                             <FormField control={form.control} name="graduationYear" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Graduation Year</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </TabsContent>
                                    </Tabs>
                                    <Button type="submit" className="w-full mt-6">
                                        Create an account
                                    </Button>
                                </form>
                            </Form>
                            <div className="mt-4 text-center text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="underline">
                                    Sign in
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </AuthLayout>
            );
        }
