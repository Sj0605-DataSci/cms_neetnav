import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/utils';
import {
  DocumentMetadata,
  MentorProfile,
  MentorProfileUpdate,
  StudentProfile,
} from '@/types/api';

const MentorDashboard = () => {
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // Profile form state
  const [formData, setFormData] = useState<MentorProfileUpdate>({});

  // Upload state
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadData = useCallback(async () => {
    try {
      const [mentor, docs, studentsData] = await Promise.all([
        apiFetch<MentorProfile>('/mentors/me/profile'),
        apiFetch<DocumentMetadata[]>('/mentors/me/documents'),
        apiFetch<StudentProfile[]>('/mentors/me/students'),
      ]);

      setProfile(mentor);
      setDocuments(docs);
      setStudents(studentsData);

      // Initialize form data from profile
      setFormData({
        personal_info: {
          name: mentor.personal_info?.name || '',
          father_name: mentor.personal_info?.father_name || '',
          mother_name: mentor.personal_info?.mother_name || '',
          father_mobile: mentor.personal_info?.father_mobile || '',
          mother_mobile: mentor.personal_info?.mother_mobile || '',
          email: mentor.personal_info?.email || '',
        },
        academic_info: mentor.academic_info || {},
        capacity: mentor.capacity || 0,
      });
    } catch (error) {
      console.error(error);
      setMessage('Unable to load mentor data.');
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: MentorProfileUpdate) => ({ ...prev, [field]: value }));
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setFormData((prev: MentorProfileUpdate) => ({
      ...prev,
      personal_info: {
        ...prev.personal_info,
        [field]: value,
      },
    }));
  };

  const handleProfileSave = async () => {
    try {
      await apiFetch<MentorProfile>('/mentors/me/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      await loadData();
      setMessage('Profile saved successfully.');
    } catch (error) {
      console.error(error);
      setMessage('Failed to save profile.');
    }
  };

  const handleUpload = async (docCode: string, file: File) => {
    setUploadingDoc(docCode);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('document_type', docCode);
      formDataUpload.append('file', file);

      await apiFetch('/mentors/me/documents', {
        method: 'POST',
        body: formDataUpload,
      });

      await loadData();
      setMessage(`Document "${docCode}" uploaded successfully.`);

      if (fileInputRefs.current[docCode]) {
        fileInputRefs.current[docCode].value = '';
      }
    } catch (error) {
      console.error(error);
      setMessage(`Failed to upload document "${docCode}".`);
    } finally {
      setUploadingDoc(null);
    }
  };

  const getDocumentStatus = (docCode: string) => {
    const uploadedDoc = documents.find(doc => doc.document_code === docCode);
    if (uploadedDoc) {
      return uploadedDoc.status;
    }
    return 'NOT_UPLOADED';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
        {profile && (
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Students: {profile.assigned_students}/{profile.capacity}
            </div>
          </div>
        )}
      </div>

      {profile && (
        <p className="text-sm text-muted-foreground">
          Welcome, {profile.personal_info?.name || profile.user_id}
        </p>
      )}

      {message && (
        <div className={`p-3 rounded ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Complete your profile to get verified as a mentor.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="mentor_name">Full Name</Label>
                  <Input
                    id="mentor_name"
                    value={formData.personal_info?.name || ''}
                    onChange={(e) => updatePersonalInfo('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="mentor_email">Email</Label>
                  <Input
                    id="mentor_email"
                    type="email"
                    value={formData.personal_info?.email || ''}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Parent Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="father_name">Father Name</Label>
                  <Input
                    id="father_name"
                    value={formData.personal_info?.father_name || ''}
                    onChange={(e) => updatePersonalInfo('father_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="father_mobile">Father Mobile</Label>
                  <Input
                    id="father_mobile"
                    value={formData.personal_info?.father_mobile || ''}
                    onChange={(e) => updatePersonalInfo('father_mobile', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="mother_name">Mother Name</Label>
                  <Input
                    id="mother_name"
                    value={formData.personal_info?.mother_name || ''}
                    onChange={(e) => updatePersonalInfo('mother_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="mother_mobile">Mother Mobile</Label>
                  <Input
                    id="mother_mobile"
                    value={formData.personal_info?.mother_mobile || ''}
                    onChange={(e) => updatePersonalInfo('mother_mobile', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Mentor Capacity</h3>
              <div>
                <Label htmlFor="capacity">Maximum Students</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => updateFormData('capacity', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={handleProfileSave} className="w-full">
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Upload your educational documents for verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { code: 'TENTH_CERT', name: '10th Certificate', mandatory: true },
              { code: 'TWELFTH_CERT', name: '12th Certificate', mandatory: true },
              { code: 'GRAD_CERT', name: 'Graduation Certificate', mandatory: true },
            ].map((docType) => {
              const status = getDocumentStatus(docType.code);
              const isUploading = uploadingDoc === docType.code;

              return (
                <div key={docType.code} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{docType.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {docType.mandatory ? 'Required' : 'Optional'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      status === 'success' ? 'bg-green-100 text-green-800' :
                      status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      status === 're-upload' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {status === 'NOT_UPLOADED' ? (
                    <div className="flex gap-2">
                      <input
                        ref={(el) => { fileInputRefs.current[docType.code] = el; }}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="flex-1 text-sm"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            void handleUpload(docType.code, file);
                          }
                        }}
                        disabled={isUploading}
                      />
                      {isUploading && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          Uploading...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-emerald-700">Document uploaded</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.current[docType.code]?.click()}
                      >
                        Re-upload
                      </Button>
                      <input
                        ref={(el) => { fileInputRefs.current[docType.code] = el; }}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            void handleUpload(docType.code, file);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Assigned Students */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Students</CardTitle>
          <CardDescription>Students allocated to you for document verification.</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-muted-foreground">No students assigned yet.</p>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{student.name || student.email || 'Student'}</h4>
                      <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Documents
                    </Button>
                  </div>

                  {/* Student Documents - Placeholder for now */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Documents:</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {/* This would be populated with actual student documents */}
                      <div className="text-sm text-muted-foreground">Student documents will appear here</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorDashboard;
