import { useRef } from "react";
import type { ChangeEvent } from "react";

type FileUploaderProps = {
  onFileSelect: (file: File | null, error: string) => void;
};

export default function FileUploader({ onFileSelect }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate the extension even when the file picker allows other file types.
    // Browser MIME types can be empty or inconsistent for document files.
    if (!/\.(txt|pdf|doc|docx)$/i.test(file.name)) {
      onFileSelect(null, "Please choose a TXT, PDF, DOC, or DOCX file.");
    } else {
      onFileSelect(file, "");
    }

    // Allow selecting the same file again.
    event.target.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf,.doc,.docx"
        hidden
        onChange={handleChange}
      />
      <button
        className="upload-button"
        type="button"
        aria-label="Choose a file"
        aria-describedby="file-types"
        onClick={() => inputRef.current?.click()}
      >
        {inputRef.current?.files[0] ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 16V3m-5 5 5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" />
          </svg>
        )}
      </button>
    </>
  );
}
