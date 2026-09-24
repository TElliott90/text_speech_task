import { useState } from "react";
import FileUploader from "../components/FileUploader";

export default function FileUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  return (
    <main className="upload-page">
      <section className="upload-card" aria-labelledby="upload-heading">
        <h2 id="upload-heading">Upload a file</h2>

        <p className="upload-description">
          The file could be a report, article, or any other text document you
          want to convert to speech.
        </p>

        <FileUploader
          onFileSelect={(file, validationError) => {
            setSelectedFile(file);
            setError(validationError);
          }}
        />

        <p id="file-types" className="file-types">
          TXT, PDF, DOC or DOCX
        </p>

        <div className="file-status" aria-live="polite" aria-atomic="true">
          {error ? (
            <p className="file-error">{error}</p>
          ) : (
            <p className="file-name">
              {selectedFile ? selectedFile.name : "No file selected"}
            </p>
          )}
        </div>

        <button className="send-button" type="button" disabled={!selectedFile}>
          Convert
        </button>
      </section>
    </main>
  );
}
