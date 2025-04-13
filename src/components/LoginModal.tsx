import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import "./LoginModal.css";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
  onRegister: (username: string, email: string, password: string) => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  currentUsername?: string;
  currentEmail?: string;
  error?: string | null;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onLogout,
  isLoggedIn,
  currentUsername,
  currentEmail,
  error,
}: LoginModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { entries } = useSelector((state: RootState) => state.entries);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (isRegistering) {
      if (!username.trim() || !email.trim() || !password.trim()) {
        setFormError("Vul alle velden in");
        return;
      }
      onRegister(username, email, password);
    } else {
      if (!email.trim() || !password.trim()) {
        setFormError("Vul alle velden in");
        return;
      }
      onLogin(email, password);
    }
  };

  const getTodayEntries = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= today;
    }).length;
  };

  const getThisWeekEntries = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Aanpassen wanneer het zondag is
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= monday;
    }).length;
  };

  return (
    <div className={`modal-overlay ${isOpen ? "open" : ""}`}>
      <div className="modal-content">
        <button onClick={onClose} className="close-button">
          Sluiten
        </button>

        {isLoggedIn ? (
          <>
            <h2 className="modal-title">Profiel</h2>
            <div className="profile-info">
              <p>Gebruikersnaam: {currentUsername}</p>
              <p>Email: {currentEmail}</p>
            </div>
            <div className="stats-container">
              <h3>Statistieken</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Totaal entries</span>
                  <span className="stat-value">{entries.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Vandaag</span>
                  <span className="stat-value">{getTodayEntries()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Deze week</span>
                  <span className="stat-value">{getThisWeekEntries()}</span>
                </div>
              </div>
            </div>
            <button onClick={onLogout} className="button">
              Uitloggen
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2>{isRegistering ? "Registreren" : "Inloggen"}</h2>
            {(error || formError) && (
              <div className="error-message">{error || formError}</div>
            )}
            {isRegistering && (
              <input
                type="text"
                placeholder="Gebruikersnaam"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">
              {isRegistering ? "Registreren" : "Inloggen"}
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="switch-mode-button"
            >
              {isRegistering
                ? "Al een account? Inloggen"
                : "Nog geen account? Registreren"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
