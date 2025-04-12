import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./SelfConfidenceTracker.css";
import LoginModal from "./LoginModal";

interface Entry {
  text: string;
  timestamp: string;
}

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
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [floatingEntries, setFloatingEntries] = useState<FloatingEntry[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem("entries") || "[]");
    setEntries(savedEntries);
  }, []);

  useEffect(() => {
    if (entries.length === 0) return;

    const showRandomEntry = () => {
      const randomEntry = entries[Math.floor(Math.random() * entries.length)];
      const x = Math.random() * (window.innerWidth - 300);
      const y = Math.random() * (window.innerHeight - 100);

      console.log("Creating floating entry:", randomEntry); // Debug log

      const newFloatingEntry: FloatingEntry = {
        id: Date.now(),
        text: randomEntry.text,
        timestamp: randomEntry.timestamp,
        x,
        y,
        visible: false,
      };

      setFloatingEntries((prev) => [...prev, newFloatingEntry]);

      // Make the entry visible after a small delay
      setTimeout(() => {
        setFloatingEntries((prev) =>
          prev.map((entry) =>
            entry.id === newFloatingEntry.id
              ? { ...entry, visible: true }
              : entry
          )
        );
      }, 100);

      // Remove the entry after 10 seconds
      setTimeout(() => {
        setFloatingEntries((prev) =>
          prev.filter((entry) => entry.id !== newFloatingEntry.id)
        );
      }, 10000);
    };

    // Show a new entry every 3 seconds
    const interval = setInterval(showRandomEntry, 3000);

    return () => clearInterval(interval);
  }, [entries]);

  const formatDate = (date: Date) => {
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
    const newEntry: Entry = {
      text: entry,
      timestamp: formatDate(new Date()),
    };
    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
    localStorage.setItem("entries", JSON.stringify(newEntries));
    setEntry("");
  };

  const handleDeleteEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    localStorage.setItem("entries", JSON.stringify(newEntries));
  };

  const handleEditEntry = (index: number) => {
    const actualIndex = entries.length - 1 - index;
    setEditingIndex(actualIndex);
    setEditText(entries[actualIndex].text);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editText.trim()) return;

    const newEntries = [...entries];
    newEntries[editingIndex] = {
      ...newEntries[editingIndex],
      text: editText,
    };
    setEntries(newEntries);
    localStorage.setItem("entries", JSON.stringify(newEntries));
    setEditingIndex(null);
    setEditText("");
  };

  const handleLogin = (username: string, password: string) => {
    // TODO: Implement actual login logic when backend is ready
    setIsLoggedIn(true);
    setUsername(username);
    setIsModalOpen(false);
  };

  const handleRegister = (
    username: string,
    email: string,
    password: string
  ) => {
    // TODO: Implement actual registration logic when backend is ready
    setIsLoggedIn(true);
    setUsername(username);
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setIsModalOpen(false);
  };

  return (
    <div className="container">
      <div className="floating-entries">
        {floatingEntries.map((floatingEntry) => {
          console.log("Rendering floating entry:", floatingEntry); // Debug log
          return (
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
          );
        })}
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
            {isLoggedIn ? username : "gast"}
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

      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
        currentUsername={username}
      />

      <div className="entries-container">
        {[...entries].reverse().map((entry, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="entry"
          >
            <div className="entry-content">
              {editingIndex === entries.length - 1 - index ? (
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
                  <span className="entry-text">{entry.text}</span>
                  <span className="entry-timestamp">{entry.timestamp}</span>
                </>
              )}
            </div>
            <div className="entry-buttons">
              {editingIndex === entries.length - 1 - index ? (
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
                onClick={() => handleDeleteEntry(index)}
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
    </div>
  );
}
