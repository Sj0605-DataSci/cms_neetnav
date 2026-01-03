import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileCheck } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import {
  DocumentMetadata,
  MentorProfile,
  StudentProfile,
} from '@/types/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<StudentProfile[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<DocumentMetadata[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // Document verification modal state
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'approved' | 'rejected' | 're-upload'>('approved');
  const [verificationRemarks, setVerificationRemarks] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [mentorsData, studentsData, unassignedData, docsData] = await Promise.all([
        apiFetch<MentorProfile[]>('/admin/mentors'),
        apiFetch<StudentProfile[]>('/admin/students'),
        apiFetch<StudentProfile[]>('/admin/students/unassigned'),
        apiFetch<DocumentMetadata[]>('/admin/documents/pending'),
      ]);

      setMentors(mentorsData);
      setStudents(studentsData);
      setUnassignedStudents(unassignedData);
      setPendingDocuments(docsData);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load admin data.');
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const verifyMentor = async (mentorId: string, verified: boolean) => {
    try {
      await apiFetch('/admin/mentors/' + mentorId + '/verify', {
        method: 'POST',
        body: JSON.stringify({ verified }),
      });
      setMessage(`Mentor ${verified ? 'verified' : 'unverified'} successfully.`);
      await loadData();
    } catch (error) {
      console.error(error);
      setMessage('Failed to verify mentor.');
    }
  };

  const assignStudentToMentor = async (studentId: string, mentorId: string) => {
    try {
      await apiFetch('/admin/assignments/override', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, mentor_id: mentorId }),
      });
      setMessage('Student assigned to mentor successfully.');
      await loadData();
    } catch (error) {
      console.error(error);
      setMessage('Failed to assign student to mentor.');
    }
  };

  const verifyDocument = async () => {
    if (!selectedDocument) return;

    try {
      await apiFetch('/admin/documents/verify', {
        method: 'POST',
        body: JSON.stringify({
          document_id: selectedDocument.id,
          status: verificationStatus,
          remarks: verificationRemarks,
        }),
      });
      setMessage(`Document ${verificationStatus} successfully.`);
      setSelectedDocument(null);
      setVerificationRemarks('');
      await loadData();
    } catch (error) {
      console.error(error);
      setMessage('Failed to verify document.');
    }
  };

  const getMentorName = (mentorId: string) => {
    const mentor = mentors.find(m => m.user_id === mentorId);
    return mentor?.personal_info?.name || mentorId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/admin/verify')} className="gap-2">
            <FileCheck className="h-4 w-4" />
            Document Verification
          </Button>
          <Badge variant="outline">{mentors.length} Mentors</Badge>
          <Badge variant="outline">{students.length} Students</Badge>
          <Badge variant="outline">{unassignedStudents.length} Unassigned</Badge>
          <Badge variant="outline">{pendingDocuments.length} Pending Docs</Badge>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
          {message}
        </div>
      )}

      <Tabs defaultValue="mentors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mentors">Mentor Management</TabsTrigger>
          <TabsTrigger value="students">Student Management</TabsTrigger>
          <TabsTrigger value="assignments">Student Assignment</TabsTrigger>
          <TabsTrigger value="documents">Document Verification</TabsTrigger>
        </TabsList>

        {/* Mentor Management Tab */}
        <TabsContent value="mentors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mentor Management</CardTitle>
              <CardDescription>Verify mentor profiles and documents.</CardDescription>
            </CardHeader>
            <CardContent>
              {mentors.length === 0 ? (
                <p className="text-muted-foreground">No mentors found.</p>
              ) : (
                <div className="space-y-4">
                  {mentors.map((mentor) => (
                    <div key={mentor.user_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">{mentor.personal_info?.name || mentor.user_id}</h4>
                          <p className="text-sm text-muted-foreground">
                            Capacity: {mentor.assigned_students}/{mentor.capacity}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={mentor.documents_verified ? "default" : "secondary"}>
                            {mentor.documents_verified ? 'Verified' : 'Pending'}
                          </Badge>
                          <Button
                            size="sm"
                            variant={mentor.documents_verified ? "outline" : "default"}
                            onClick={() => void verifyMentor(mentor.user_id, !mentor.documents_verified)}
                          >
                            {mentor.documents_verified ? 'Unverify' : 'Verify'}
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2 text-sm">
                        <p>Email: {mentor.personal_info?.email || 'N/A'}</p>
                        <p>Father: {mentor.personal_info?.father_name || 'N/A'}</p>
                        <p>Mother: {mentor.personal_info?.mother_name || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Management Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>Verify student profiles and documents.</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-muted-foreground">No students found.</p>
              ) : (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">{student.name || student.email || student.id}</h4>
                          <p className="text-sm text-muted-foreground">
                            Mentor: {student.mentor_id ? getMentorName(student.mentor_id) : 'Unassigned'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/admin/verify/students/${student.id}`)}
                          >
                            View Documents
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2 text-sm">
                        <p>Email: {student.email || 'N/A'}</p>
                        <p>NEET Rank: {student.neet_rank || 'N/A'}</p>
                        <p>Category: {student.neet_category || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Assignment Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Assignment</CardTitle>
              <CardDescription>Assign unassigned students to mentors.</CardDescription>
            </CardHeader>
            <CardContent>
              {unassignedStudents.length === 0 ? (
                <p className="text-muted-foreground">No unassigned students.</p>
              ) : (
                <div className="space-y-4">
                  {unassignedStudents.map((student) => (
                    <div key={student.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">{student.name || student.email || student.id}</h4>
                          <p className="text-sm text-muted-foreground">
                            NEET Rank: {student.neet_rank || 'N/A'}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Label>Assign to:</Label>
                          <Select onValueChange={(mentorId) => void assignStudentToMentor(student.id, mentorId)}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select mentor" />
                            </SelectTrigger>
                            <SelectContent>
                              {mentors.filter(m => m.assigned_students < m.capacity).map((mentor) => (
                                <SelectItem key={mentor.user_id} value={mentor.user_id}>
                                  {mentor.personal_info?.name || mentor.user_id} ({mentor.assigned_students}/{mentor.capacity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Verification Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Verification</CardTitle>
              <CardDescription>Review and verify pending documents.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingDocuments.length === 0 ? (
                <p className="text-muted-foreground">No pending documents.</p>
              ) : (
                <div className="space-y-4">
                  {pendingDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">{doc.document_code} - {doc.document_type}</h4>
                          <p className="text-sm text-muted-foreground">
                            Owner: {doc.owner_name || doc.owner_id} ({doc.owner_role})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setSelectedDocument(doc)}
                        >
                          Review Document
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Verification Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Verify Document</CardTitle>
              <CardDescription>{selectedDocument.document_code} - {selectedDocument.document_type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={verificationStatus} onValueChange={(value: 'approved' | 'rejected' | 're-upload') => setVerificationStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">✓ Approve (Success)</SelectItem>
                    <SelectItem value="rejected">✗ Reject (Failed)</SelectItem>
                    <SelectItem value="re-upload">🧊 Freeze (Re-upload Required)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={verificationRemarks}
                  onChange={(e) => setVerificationRemarks(e.target.value)}
                  placeholder="Add any remarks..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={verifyDocument} className="flex-1">
                  Submit Verification
                </Button>
                <Button variant="outline" onClick={() => setSelectedDocument(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
