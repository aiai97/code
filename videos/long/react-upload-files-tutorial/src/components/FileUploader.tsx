import axios from 'axios';
import { ChangeEvent, useState } from 'react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type UploadedFile = { id: string; name: string };

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState('');

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  }

  async function handleFileUpload() {
    if (!file) return;

    setStatus('uploading');
    setUploadProgress(0);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/upload-api/', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setUploadedFiles((files) => [
        ...files,
        { id: `${Date.now()}-${Math.random()}`, name: file.name },
      ]);
      setStatus('success');
      setUploadProgress(100);
    } catch (error) {
      setStatus('error');
      setUploadProgress(0);
      setUploadError(
        axios.isAxiosError(error)
          ? error.response?.status
            ? `Server returned HTTP ${error.response.status}.`
            : error.message
          : 'An unexpected error occurred.',
      );
    }
  }

  return (
    <div className="space-y-2">
      <input type="file" onChange={handleFileChange} />

      {file && (
        <div className="mb-4 text-sm">
          <p>File name: {file.name}</p>
          <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
          <p>Type: {file.type}</p>
        </div>
      )}

      {status === 'uploading' && (
        <div className="space-y-2">
          <div className="h-2.5 w-full rounded-full bg-gray-200">
            <div
              className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">{uploadProgress}% uploaded</p>
        </div>
      )}

      {file && status !== 'uploading' && (
        <button onClick={handleFileUpload}>Upload</button>
      )}

      {status === 'success' && (
        <p className="text-sm text-green-600">File uploaded successfully!</p>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-600" role="alert">
          Upload failed. {uploadError} Please try again.
        </p>
      )}

      <section className="mt-6 space-y-2" aria-live="polite">
        <h2 className="text-base font-semibold">Uploaded files</h2>
        {uploadedFiles.length === 0 ? (
          <p className="text-sm text-gray-600">No files uploaded yet.</p>
        ) : (
          <ul className="list-inside list-disc space-y-1 text-sm">
            {uploadedFiles.map((uploadedFile) => (
              <li key={uploadedFile.id}>
                <a
                  className="text-blue-600 underline"
                  href={`/upload-api/files/${encodeURIComponent(uploadedFile.name)}`}
                >
                  {uploadedFile.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
