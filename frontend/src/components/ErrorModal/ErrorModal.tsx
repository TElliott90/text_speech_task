import { useEffect, useId, useRef } from "react";
import "./ErrorModal.css";

export default function ErrorModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="error-modal"
      role="alertdialog"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="error-modal-content">
        <h2 id={titleId}>Something went wrong</h2>
        <p id={messageId}>{message}</p>
        <button
          className="error-modal-close"
          type="button"
          autoFocus
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
