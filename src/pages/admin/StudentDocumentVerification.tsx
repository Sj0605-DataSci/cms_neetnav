import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Eye, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { StudentProfile, DocumentMetadata } from '@/types/api';
import DocumentViewerModal from '@/components/DocumentViewerModal';

const StudentDocumentVerification = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [studentDocuments, setStudentDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Document verification modal state
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'approved' | 'rejected'>('approved');
  const [verificationRemarks, setVerificationRemarks] = useState('');

  // Document viewer modal state
  const [viewerDocument, setViewerDocument] = useState<DocumentMetadata | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      const data = await apiFetch<StudentProfile[]>('/admin/students');
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load students.');
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const selectStudent = async (student: StudentProfile) => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      const documents = await apiFetch<DocumentMetadata[]>(`/admin/students/${student.id}/documents`);
      setStudentDocuments(documents);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load student documents.');
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = (document: DocumentMetadata) => {
    setViewerDocument(document);
    setViewerOpen(true);
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

      // Refresh documents
      if (selectedStudent) {
        const documents = await apiFetch<DocumentMetadata[]>(`/admin/students/${selectedStudent.id}/documents`);
        setStudentDocuments(documents);
      }

      setSelectedDocument(null);
      setVerificationRemarks('');
    } catch (error) {
      console.error(error);
      setMessage('Failed to verify document.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
      case 'freeze':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'freeze':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Verify Student Documents</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/verify')}>
            ← Back to Selection
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Admin Dashboard
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Student Selection Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Select Student</CardTitle>
            <CardDescription>Search and select a student to verify their documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedStudent?.id === student.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => void selectStudent(student)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {student.name?.charAt(0) || student.id.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name || 'Unnamed Student'}</p>
                        <p className="text-sm text-muted-foreground">{student.email || student.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={student.documents_verified ? "default" : "secondary"}>
                        {student.documents_verified ? 'Verified' : 'Pending'}
                      </Badge>
                      {student.mentor_id && (
                        <Badge variant="outline" className="text-xs">
                          Assigned
                        </Badge>
                      )}
                    </div>
                  </div>
                  {student.neet_rank && (
                    <p className="text-sm text-muted-foreground mt-1">
                      NEET Rank: {student.neet_rank}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Verification Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Document Verification</CardTitle>
            <CardDescription>
              {selectedStudent
                ? `Review documents for ${selectedStudent.name || 'Selected Student'}`
                : 'Select a student to view their documents'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedStudent ? (
              <div className="text-center text-muted-foreground py-8">
                Select a student from the left panel to view their documents
              </div>
            ) : loading ? (
              <div className="text-center py-8">Loading documents...</div>
            ) : studentDocuments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No documents found for this student
              </div>
            ) : (
              <div className="space-y-4">
                {studentDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(doc.status)}
                        <div>
                          <h4 className="font-medium">{doc.document_code} - {doc.document_type}</h4>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status.toUpperCase()}
                      </Badge>
                    </div>

                    {doc.remarks && (
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Remarks:</strong> {doc.remarks}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewDocument(doc)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Document
                      </Button>
                      {(doc.status === 'pending') && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedDocument(doc)}
                        >
                          Verify Document
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                <label className="text-sm font-medium">Status</label>
                <select
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value as 'approved' | 'rejected')}
                  className="w-full mt-1 p-2 border rounded"
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Remarks (Optional)</label>
                <textarea
                  value={verificationRemarks}
                  onChange={(e) => setVerificationRemarks(e.target.value)}
                  placeholder="Add any remarks..."
                  className="w-full mt-1 p-2 border rounded"
                  rows={3}
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
      <DocumentViewerModal
        document={viewerDocument}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
};

export default StudentDocumentVerification;
