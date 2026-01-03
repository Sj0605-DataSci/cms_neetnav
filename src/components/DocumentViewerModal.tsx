import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, FileText, Image as ImageIcon, File, XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/utils';
import { DocumentMetadata } from '@/types/api';

interface DocumentViewerModalProps {
  document: DocumentMetadata | null;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentViewerModal = ({ document, isOpen, onClose }: DocumentViewerModalProps) => {
  const [loading, setLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [availableFormats, setAvailableFormats] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  useEffect(() => {
    if (document && isOpen) {
      setLoading(true);
      setUrlError(null);

      // Fetch both signed URL and download options
      Promise.all([
        apiFetch<{ url: string }>(`/admin/documents/${document.id}/url`),
        apiFetch<any>(`/admin/documents/${document.id}/download-options`)
      ])
        .then(([urlResponse, optionsResponse]) => {
          setSignedUrl(urlResponse.url);
          setAvailableFormats(optionsResponse.available_formats || []);
          setAvailableSizes(optionsResponse.available_sizes || []);
          // Set defaults
          if (optionsResponse.available_formats?.length > 0) {
            setSelectedFormat(optionsResponse.available_formats[0]);
          }
          if (optionsResponse.available_sizes?.length > 0) {
            setSelectedSize(optionsResponse.available_sizes[0]);
          }
        })
        .catch((error: unknown) => {
          console.error('Failed to load document:', error);
          setUrlError('Failed to load document. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Reset state when modal closes
      setSignedUrl(null);
      setUrlError(null);
      setSelectedFormat('');
      setSelectedSize('');
      setAvailableFormats([]);
      setAvailableSizes([]);
    }
  }, [document, isOpen]);

  if (!isOpen || !document) return null;

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getFileType = (filename: string) => {
    const ext = getFileExtension(filename);
    if (['pdf'].includes(ext)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
    return 'other';
  };

  const getFileIcon = (filename: string) => {
    const type = getFileType(filename);
    switch (type) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-600" />;
      case 'image':
        return <ImageIcon className="h-8 w-8 text-green-600" />;
      default:
        return <File className="h-8 w-8 text-gray-600" />;
    }
  };

  const handleDownload = () => {
    if (!signedUrl) return;

    // For now, just download using the signed URL
    const link = window.document.createElement('a');
    link.href = signedUrl;
    link.download = `${document.document_code}_${document.owner_id}.${getFileExtension(signedUrl.split('/').pop() || '')}`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleDownloadWithFormat = () => {
    if (!signedUrl) return;

    // For now, download the original file with custom filename based on format/size selection
    // In the future, this could trigger server-side format conversion
    const extension = selectedFormat.toLowerCase();
    const sizeSuffix = selectedSize.toLowerCase()
      .replace(' ', '_')
      .replace('(', '')
      .replace(')', '')
      .replace('-', '_')
      .split('_')[0]; // Get first part (small, medium, large, original)

    const link = window.document.createElement('a');
    link.href = signedUrl;
    link.download = `${document.document_code}_${document.owner_id}_${sizeSuffix}.${extension}`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const renderDocumentContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading document...</p>
          </div>
        </div>
      );
    }

    if (urlError) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <XCircle className="h-12 w-12 text-red-600 mb-4" />
          <p className="text-red-600 mb-4">{urlError}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      );
    }

    if (!signedUrl) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p>No document URL available</p>
          </div>
        </div>
      );
    }

    const fileType = getFileType(document.storage_path);

    switch (fileType) {
      case 'pdf':
        return (
          <iframe
            src={signedUrl}
            className="w-full h-96 border rounded"
            title={`${document.document_code} - ${document.document_type}`}
          />
        );

      case 'image':
        return (
          <div className="flex justify-center">
            <img
              src={signedUrl}
              alt={`${document.document_code} - ${document.document_type}`}
              className="max-w-full max-h-96 object-contain rounded border"
            />
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            {getFileIcon(document.storage_path)}
            <p className="mt-4 text-lg font-medium">{document.document_type}</p>
            <p className="text-sm text-muted-foreground mb-4">
              File type: {getFileExtension(document.storage_path).toUpperCase()}
            </p>
            <p className="text-sm text-muted-foreground">
              This file type cannot be previewed in the browser.
              Please download to view.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getFileIcon(document.storage_path)}
              {document.document_code} - {document.document_type}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Uploaded: {new Date(document.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload()}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-gray-50 p-4 min-h-[400px]">
            {renderDocumentContent()}
          </div>

          {/* Document Info Footer */}
          <div className="bg-gray-100 px-4 py-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span><strong>Status:</strong> {document.status.toUpperCase()}</span>
                {document.verified_at && (
                  <span><strong>Verified:</strong> {new Date(document.verified_at).toLocaleDateString()}</span>
                )}
                {document.verifier_id && (
                  <span><strong>Verified by:</strong> {document.verifier_id}</span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Format:</Label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="text-xs p-1 border rounded"
                  >
                    {availableFormats.map((format: string) => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Size:</Label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="text-xs p-1 border rounded"
                  >
                    {availableSizes.map((size: string) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadWithFormat()}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            {document.remarks && (
              <div className="mt-2 p-2 bg-white rounded text-sm">
                <strong>Remarks:</strong> {document.remarks}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentViewerModal;
