import { motion } from "framer-motion";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entryText: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  entryText,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="modal-title">Entry verwijderen</h3>
        <p className="modal-text">
          Weet je zeker dat je deze entry wilt verwijderen?
        </p>
        <div className="modal-entry-preview">"{entryText}"</div>
        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onClose}>
            Annuleren
          </button>
          <button className="modal-button confirm" onClick={onConfirm}>
            Verwijderen
          </button>
        </div>
      </motion.div>
    </div>
  );
}
