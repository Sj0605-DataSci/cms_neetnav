import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DocumentVerificationSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Document Verification</h1>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          ← Back to Admin Dashboard
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/verify/mentors')}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Verify Mentor Documents</CardTitle>
            <CardDescription>
              Review and verify documents submitted by mentors (10th, 12th, graduation certificates)
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full">Select Mentors</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/verify/students')}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Verify Student Documents</CardTitle>
            <CardDescription>
              Review and verify documents submitted by students (certificates, admit cards, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full">Select Students</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentVerificationSelector;
