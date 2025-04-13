import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { login, register, logout } from "../store/authSlice";
import {
  fetchEntries,
  addEntry,
  updateEntry,
  deleteEntry,
} from "../store/entriesSlice";
import "./SelfConfidenceTracker.css";
import LoginModal from "./LoginModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface FloatingEntry {
  id: number;
  text: string;
  timestamp: string;
  x: number;
  y: number;
  visible: boolean;
}

export default function SelfConfidenceTracker() {
  const [entry, setEntry] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [floatingEntries, setFloatingEntries] = useState<FloatingEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [entryToDeleteText, setEntryToDeleteText] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const {
    isLoggedIn,
    username,
    email,
    loading: authLoading,
    error: authError,
  } = useSelector((state: RootState) => state.auth);
  const { entries, loading: entriesLoading } = useSelector(
    (state: RootState) => state.entries
  );

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchEntries());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (entries.length === 0) return;

    const showRandomEntry = () => {
      const randomEntry = entries[Math.floor(Math.random() * entries.length)];
      const x = Math.random() * (window.innerWidth - 300);
      const y = Math.random() * (window.innerHeight - 100);

      const newFloatingEntry: FloatingEntry = {
        id: Date.now(),
        text: randomEntry.content,
        timestamp: formatDate(randomEntry.createdAt),
        x,
        y,
        visible: false,
      };

      setFloatingEntries((prev) => [...prev, newFloatingEntry]);

      setTimeout(() => {
        setFloatingEntries((prev) =>
          prev.map((entry) =>
            entry.id === newFloatingEntry.id
              ? { ...entry, visible: true }
              : entry
          )
        );
      }, 100);

      setTimeout(() => {
        setFloatingEntries((prev) =>
          prev.filter((entry) => entry.id !== newFloatingEntry.id)
        );
      }, 10000);
    };

    const interval = setInterval(showRandomEntry, 3000);
    return () => clearInterval(interval);
  }, [entries]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return "Invalid date";
    }
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Intl.DateTimeFormat("nl-NL", options).format(date);
  };

  const handleAddEntry = () => {
    if (!entry.trim()) return;
    dispatch(addEntry(entry));
    setEntry("");
  };

  const handleDeleteClick = (entryId: string, entryText: string) => {
    setEntryToDelete(entryId);
    setEntryToDeleteText(entryText);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (entryToDelete) {
      dispatch(deleteEntry(entryToDelete));
      setIsDeleteModalOpen(false);
      setEntryToDelete(null);
      setEntryToDeleteText("");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setEntryToDelete(null);
    setEntryToDeleteText("");
  };

  const handleEditEntry = (index: number) => {
    setEditingIndex(index);
    setEditText(entries[index].content);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editText.trim()) return;
    const entryToUpdate = entries[editingIndex];
    dispatch(updateEntry({ id: entryToUpdate._id, text: editText }));
    setEditingIndex(null);
    setEditText("");
  };

  const handleLogin = (email: string, password: string) => {
    dispatch(login({ email, password }));
  };

  const handleRegister = (
    username: string,
    email: string,
    password: string
  ) => {
    dispatch(register({ username, email, password }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Logging in...</p>
      </div>
    );
  }

  if (entriesLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading entries...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {!isLoggedIn ? (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="title">Wat heb je goed gedaan?</h2>
          <p className="login-message">
            Log in om je positieve momenten te delen en te bekijken.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="button">
            Log In
          </button>
        </motion.div>
      ) : (
        <>
          <div className="floating-entries">
            {floatingEntries.map((floatingEntry) => (
              <div
                key={floatingEntry.id}
                className={`floating-entry ${
                  floatingEntry.visible ? "visible" : ""
                }`}
                style={{
                  left: floatingEntry.x,
                  top: floatingEntry.y,
                }}
              >
                <div className="floating-entry-text">{floatingEntry.text}</div>
                <div className="floating-entry-timestamp">
                  {floatingEntry.timestamp}
                </div>
              </div>
            ))}
          </div>
          <motion.div
            className="card"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="greeting">
              Hey,{" "}
              <span
                className="username-display"
                onClick={() => setIsModalOpen(true)}
              >
                {isLoggedIn ? username || "anoniempje" : "anoniempje"}
              </span>
            </h3>
            <h2 className="title">Wat heb je goed gedaan?</h2>
            <input
              type="text"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Typ hier iets positiefs..."
              className="input"
            />
            <button onClick={handleAddEntry} className="button">
              Toevoegen
            </button>
          </motion.div>

          <div className="entries-container">
            {entries.map((entry, index) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="entry"
              >
                <div className="entry-content">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="input"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                    />
                  ) : (
                    <>
                      <span className="entry-text">{entry.content}</span>
                      <span className="entry-timestamp">
                        {formatDate(entry.createdAt)}
                      </span>
                    </>
                  )}
                </div>
                <div className="entry-buttons">
                  {editingIndex === index ? (
                    <button
                      onClick={handleSaveEdit}
                      className="edit-button"
                      title="Save"
                    >
                      <svg
                        className="icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditEntry(index)}
                      className="edit-button"
                      title="Edit"
                    >
                      <svg
                        className="icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClick(entry._id, entry.content)}
                    className="delete-button"
                    title="Delete"
                  >
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
        currentUsername={username || undefined}
        currentEmail={email || undefined}
        error={authError}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        entryText={entryToDeleteText}
      />
    </div>
  );
}
