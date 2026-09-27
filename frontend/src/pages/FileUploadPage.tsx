import { useEffect, useRef, useState } from "react";
import FileUploader from "../components/FileUploader";
import ErrorModal from "../components/ErrorModal/ErrorModal";

export default function FileUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audioBlob || !audio) return;

    const url = URL.createObjectURL(audioBlob);
    audio.src = url;
    return () => {
      audio.removeAttribute("src");
      audio.load();
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  async function handleConvertClick() {
    if (!selectedFile) {
      setError("No document selected");
      return;
    }

    setIsLoading(true);
    setError("");
    setAudioBlob(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch(
        import.meta.env.VITE_API_ENDPOINT + "/documents/convert-to-speech",
        { method: "POST", body: formData },
      );

      if (!response.ok) {
        const message = `Conversion failed (HTTP ${response.status}). Please try again.`;
        throw Error(message);
      }

      const blob = await response.blob();

      if (blob.type.split(";")[0] !== "audio/mpeg" || blob.size === 0) {
        throw new Error("The server did not return a valid MP3 audio file.");
      }
      setAudioBlob(blob);
      downloadAudio(blob, selectedFile.name);
    } catch (error) {
      setError(
        error instanceof Error && error.message
          ? error.message
          : "Unable to convert the document. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function downloadAudio(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Audio - ${filename.replace(/\.[^.]+$/, "") || "output"}.mp3`;
    document.body.appendChild(a);
    try {
      a.click();
    } finally {
      a.remove();
      // Give the browser time to begin reading the download before cleanup.
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
    setSelectedFile(null);
  }

  return (
    <main className="upload-page">
      <section className="upload-card">
        <h2 id="upload-heading">Upload a file</h2>

        <p className="upload-description">
          The file could be a report, article, or any other text document you
          want to convert to speech.
        </p>

        <FileUploader
          isLoading={isLoading}
          onFileSelect={(file, validationError) => {
            setAudioBlob(null);
            setSelectedFile(file);
            setError(validationError);
          }}
        />

        <p id="file-types" className="file-types">
          TXT, PDF, DOC or DOCX
        </p>

        <div className="file-status">
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
          disabled={!selectedFile || !!error || isLoading}
          onClick={handleConvertClick}
        >
          {isLoading ? "Converting…" : "Convert"}
        </button>

        {error && <ErrorModal message={error} onClose={() => setError("")} />}
      </section>
    </main>
  );
}
