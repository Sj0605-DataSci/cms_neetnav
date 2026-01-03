import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/utils';
import {
  DocumentMetadata,
  DocumentUploadStatus,
  RequiredDocument,
  StudentProfile,
  StudentProfileUpdate,
} from '@/types/api';

const StudentDashboard = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);
  const [uploadStatus, setUploadStatus] = useState<DocumentUploadStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Profile form state
  const [formData, setFormData] = useState<StudentProfileUpdate>({});
  const [copyPermanentAddress, setCopyPermanentAddress] = useState(false);

  // Upload state
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadData = async () => {
    try {
      const [student, docs, required, status] = await Promise.all([
        apiFetch<StudentProfile>('/students/me/profile'),
        apiFetch<DocumentMetadata[]>('/students/me/documents'),
        apiFetch<RequiredDocument[]>('/students/me/required-documents'),
        apiFetch<DocumentUploadStatus>('/students/me/upload-status'),
      ]);

      setProfile(student);
      setDocuments(docs);
      setRequiredDocuments(required);
      setUploadStatus(status);

      // Initialize form data from profile
      setFormData({
        name: student.name,
        father_name: student.father_name,
        father_mobile: student.father_mobile,
        mother_name: student.mother_name,
        mother_mobile: student.mother_mobile,
        neet_roll_no: student.neet_roll_no,
        neet_rank: student.neet_rank,
        neet_marks: student.neet_marks,
        application_no: student.application_no,
        dob: student.dob,
        gender: student.gender,
        neet_mobile: student.neet_mobile,
        whatsapp_no: student.whatsapp_no,
        email: student.email,
        permanent_address: student.permanent_address,
        correspondence_address: student.correspondence_address,
        bms_counselling_opted: student.bms_counselling_opted,
        bhs_counselling_opted: student.bhs_counselling_opted,
        max_budget: student.max_budget,
        minority: student.minority,
        minority_type: student.minority_type,
        nri_quota: student.nri_quota,
        special_quotas: student.special_quotas,
        domicile_state: student.domicile_state,
        single_child: student.single_child,
        stayed_in_state_since: student.stayed_in_state_since,
        tenth_school_details: student.tenth_school_details,
        twelfth_school_details: student.twelfth_school_details,
        gap_year: student.gap_year,
        neet_category: student.neet_category,
      });
    } catch (error) {
      console.error(error);
      setMessage('Unable to load profile data.');
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Fields that should trigger immediate server updates (dynamic questions)
  const dynamicFields = new Set([
    'neet_category', 'minority', 'minority_type', 'nri_quota',
    'special_quotas', 'single_child', 'gap_year'
  ]);

  const handleProfileFieldChange = async (field: keyof StudentProfileUpdate, value: any) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);

    // Only update server for dynamic fields that affect document requirements
    if (!dynamicFields.has(field)) return;

    try {
      await apiFetch<StudentProfile>('/students/me/profile', {
        method: 'PUT',
        body: JSON.stringify({ [field]: value }),
      });

      // Refresh required documents and status only for dynamic changes
      const [required, status] = await Promise.all([
        apiFetch<RequiredDocument[]>('/students/me/required-documents'),
        apiFetch<DocumentUploadStatus>('/students/me/upload-status'),
      ]);

      setRequiredDocuments(required);
      setUploadStatus(status);
      setMessage(`Profile updated - ${required.length} documents now required.`);
    } catch (error) {
      console.error(error);
      setMessage('Failed to update profile.');
    }
  };

  // Save complete profile when user clicks save
  const handleCompleteProfileSave = async () => {
    // Validation: Check if required basic fields are filled
    const requiredFields = ['name', 'neet_roll_no', 'neet_category'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof StudentProfileUpdate]);

    if (missingFields.length > 0) {
      setMessage(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    // Confirmation dialog
    const confirmSave = window.confirm(
      'Are you sure you want to save your complete profile? This will make your information visible to counselors and cannot be easily undone.'
    );

    if (!confirmSave) return;

    try {
      await apiFetch<StudentProfile>('/students/me/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      await loadData(); // Refresh all data
      setMessage('Complete profile saved successfully! Your information is now available to counselors.');
    } catch (error) {
      console.error(error);
      setMessage('Failed to save complete profile.');
    }
  };

  const handleUpload = async (docCode: string, file: File) => {
    setUploadingDoc(docCode);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('document_type', docCode);
      formDataUpload.append('file', file);

      await apiFetch('/students/me/documents', {
        method: 'POST',
        body: formDataUpload,
      });

      // Refresh all data
      await loadData();
      setMessage(`Document "${docCode}" uploaded successfully.`);

      // Clear file input
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
    const uploadRecord = uploadStatus?.documents.find(d => d.doc_code === docCode);
    return uploadRecord?.status ?? 'NOT_UPLOADED';
  };

  const handleReuploadClick = (docCode: string) => {
    fileInputRefs.current[docCode]?.click();
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field: 'permanent_address' | 'correspondence_address', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field as keyof StudentProfileUpdate as 'permanent_address'] as Record<string, string>, raw: value },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        {uploadStatus && (
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Document Progress: {uploadStatus.uploaded}/{uploadStatus.total_required}
            </div>
            <Progress
              value={(uploadStatus.uploaded / uploadStatus.total_required) * 100}
              className="w-32 mt-1"
            />
          </div>
        )}
      </div>

      {profile && (
        <p className="text-sm text-muted-foreground">
          Logged in as <span className="font-semibold">{profile.name || profile.user_id}</span>
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
            <CardTitle>Personal & Academic Details</CardTitle>
            <CardDescription>Fill in your information to unlock required documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="neet_roll_no">NEET Roll No</Label>
                  <Input
                    id="neet_roll_no"
                    value={formData.neet_roll_no || ''}
                    onChange={(e) => updateFormData('neet_roll_no', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="neet_rank">NEET Rank</Label>
                  <Input
                    id="neet_rank"
                    type="number"
                    value={formData.neet_rank || ''}
                    onChange={(e) => updateFormData('neet_rank', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <Label htmlFor="neet_marks">NEET Marks</Label>
                  <Input
                    id="neet_marks"
                    value={formData.neet_marks || ''}
                    onChange={(e) => updateFormData('neet_marks', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="application_no">Application No</Label>
                  <Input
                    id="application_no"
                    value={formData.application_no || ''}
                    onChange={(e) => updateFormData('application_no', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="neet_mobile">NEET Registered Phone No</Label>
                  <Input
                    id="neet_mobile"
                    value={formData.neet_mobile || ''}
                    onChange={(e) => updateFormData('neet_mobile', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp_no">Alternate WhatsApp No</Label>
                  <Input
                    id="whatsapp_no"
                    value={formData.whatsapp_no || ''}
                    onChange={(e) => updateFormData('whatsapp_no', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.email || ''}
                    onChange={(e) => updateFormData('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => updateFormData('dob', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender || ''}
                    onValueChange={(value) => handleProfileFieldChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="neet_category">NEET Category</Label>
                  <Select
                    value={formData.neet_category || ''}
                    onValueChange={(value) => handleProfileFieldChange('neet_category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GEN">General</SelectItem>
                      <SelectItem value="OBC">OBC</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="ST">ST</SelectItem>
                      <SelectItem value="EWS">EWS</SelectItem>
                    </SelectContent>
                  </Select>
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
                    value={formData.father_name || ''}
                    onChange={(e) => updateFormData('father_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="father_mobile">Father Mobile</Label>
                  <Input
                    id="father_mobile"
                    value={formData.father_mobile || ''}
                    onChange={(e) => updateFormData('father_mobile', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="mother_name">Mother Name</Label>
                  <Input
                    id="mother_name"
                    value={formData.mother_name || ''}
                    onChange={(e) => updateFormData('mother_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="mother_mobile">Mother Mobile</Label>
                  <Input
                    id="mother_mobile"
                    value={formData.mother_mobile || ''}
                    onChange={(e) => updateFormData('mother_mobile', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Addresses</h3>
              <div className="space-y-4">
                <Label htmlFor="permanent_address">Permanent Address</Label>
                <Textarea
                  id="permanent_address"
                  value={formData.permanent_address?.raw || ''}
                  onChange={(e) => updateAddress('permanent_address', e.target.value)}
                  placeholder="Street, city, district, pin code"
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="copy_address"
                    checked={copyPermanentAddress}
                    onCheckedChange={(checked: boolean) => {
                      setCopyPermanentAddress(checked);
                      if (checked) {
                        updateAddress('correspondence_address', formData.permanent_address?.raw || '');
                      }
                    }}
                  />
                  <Label htmlFor="copy_address">Copy permanent address to correspondence</Label>
                </div>
                <Label htmlFor="correspondence_address">Correspondence Address</Label>
                <Textarea
                  id="correspondence_address"
                  value={formData.correspondence_address?.raw || ''}
                  onChange={(e) => updateAddress('correspondence_address', e.target.value)}
                  placeholder="Street, city, district, pin code"
                />
              </div>
            </div>

            {/* Quotas and Special Categories */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quotas & Special Categories</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="minority"
                    checked={formData.minority || false}
                    onCheckedChange={(checked: boolean) => handleProfileFieldChange('minority', checked)}
                  />
                  <Label htmlFor="minority">Minority (Jain/Muslim/Christian)</Label>
                </div>

                {formData.minority && (
                  <div>
                    <Label htmlFor="minority_type">Minority Type</Label>
                    <Select
                      value={formData.minority_type || ''}
                      onValueChange={(value) => handleProfileFieldChange('minority_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select minority type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jain">Jain</SelectItem>
                        <SelectItem value="muslim">Muslim</SelectItem>
                        <SelectItem value="christian">Christian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nri_quota"
                    checked={formData.nri_quota || false}
                    onCheckedChange={(checked: boolean) => handleProfileFieldChange('nri_quota', checked)}
                  />
                  <Label htmlFor="nri_quota">NRI Quota</Label>
                </div>

                <div className="space-y-2">
                  <Label>Special Quotas</Label>
                  <div className="grid gap-2 md:grid-cols-2">
                    {['PH', 'FF', 'DEFENCE'].map((quota) => (
                      <div key={quota} className="flex items-center space-x-2">
                        <Checkbox
                          id={`quota_${quota}`}
                          checked={(formData.special_quotas || []).includes(quota)}
                          onCheckedChange={(checked: boolean) => {
                            const current = formData.special_quotas || [];
                            const updated = checked
                              ? [...current, quota]
                              : current.filter(q => q !== quota);
                            handleProfileFieldChange('special_quotas', updated);
                          }}
                        />
                        <Label htmlFor={`quota_${quota}`}>
                          {quota === 'PH' ? 'Physically Handicapped' :
                           quota === 'FF' ? 'Freedom Fighter' : 'Defence'}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="single_child"
                    checked={formData.single_child || false}
                    onCheckedChange={(checked: boolean) => handleProfileFieldChange('single_child', checked)}
                  />
                  <Label htmlFor="single_child">Single Child</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gap_year"
                    checked={formData.gap_year || false}
                    onCheckedChange={(checked: boolean) => handleProfileFieldChange('gap_year', checked)}
                  />
                  <Label htmlFor="gap_year">Gap Year</Label>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-sm font-semibold">Are you willing to opt for BAMS/BHMS counselling?</Label>
                  <div className="flex gap-4">
                    <Button
                      size="sm"
                      variant={formData.bms_counselling_opted ? 'default' : 'outline'}
                      onClick={() => handleProfileFieldChange('bms_counselling_opted', true)}
                    >
                      Yes
                    </Button>
                    <Button
                      size="sm"
                      variant={!formData.bms_counselling_opted ? 'default' : 'outline'}
                      onClick={() => handleProfileFieldChange('bms_counselling_opted', false)}
                    >
                      No
                    </Button>
                  </div>
                  <Label className="text-sm font-semibold">What is your budget for fee per year?</Label>
                  <Input
                    value={formData.max_budget || ''}
                    onChange={(e) => updateFormData('max_budget', e.target.value)}
                    placeholder="e.g., 3 lakhs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={handleCompleteProfileSave} className="w-full" variant="default">
                Save & Submit Profile
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                ⚠️ Validates required fields and requires confirmation. Your profile will be visible to counselors after saving.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Upload required documents based on your profile information.
              {uploadStatus && (
                <span className="block mt-2 font-medium">
                  Progress: {uploadStatus.uploaded} of {uploadStatus.total_required} documents uploaded
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredDocuments.length === 0 ? (
              <p className="text-muted-foreground">Fill out your profile to see required documents.</p>
            ) : (
              <div className="space-y-4">
                {requiredDocuments.map((reqDoc) => {
                  const status = getDocumentStatus(reqDoc.doc_code);
                  const isUploading = uploadingDoc === reqDoc.doc_code;

                  return (
                    <div key={reqDoc.doc_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{reqDoc.doc_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {reqDoc.category} • {reqDoc.mandatory ? 'Required' : 'Optional'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm px-2 py-1 rounded ${
                            status === 'approved' ? 'bg-green-100 text-green-800' :
                            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {status === 'NOT_UPLOADED' ? (
                        <div className="flex gap-2">
                          <input
                            ref={(el) => { fileInputRefs.current[reqDoc.doc_code] = el; }}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="flex-1 text-sm"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                void handleUpload(reqDoc.doc_code, file);
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
                          <span className="text-sm text-emerald-700">You've uploaded this document.</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReuploadClick(reqDoc.doc_code)}
                          >
                            Re-upload
                          </Button>
                          <input
                            ref={(el) => { fileInputRefs.current[reqDoc.doc_code] = el; }}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                void handleUpload(reqDoc.doc_code, file);
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload History */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Upload History</h4>
              <div className="space-y-2">
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center text-sm border-b pb-2">
                      <span>{doc.document_type}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
