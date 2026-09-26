import { useState } from "react";
import FileUploader from "../components/FileUploader";

export default function FileUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function handleConvertClick() {
    const formData = new FormData();
    if (!selectedFile) {
      setError("No document selected");
      return;
    }

    formData.append("file", selectedFile);

    fetch(import.meta.env.VITE_API_ENDPOINT + "/documents/convert-to-speech", {
      method: "POST",
      body: formData,
    })
      .then((response) => console.log("Response:", response))
      .catch((error) => {
        console.error("Error:", error);
        alert("Error: " + error.message);
      });
  }

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

        <button
          className="send-button"
          type="button"
          disabled={!selectedFile}
          onClick={handleConvertClick}
        >
          Convert
        </button>
      </section>
    </main>
  );
}
