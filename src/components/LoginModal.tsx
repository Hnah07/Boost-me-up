import { useState } from "react";
import "./LoginModal.css";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, email: string, password: string) => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  currentUsername?: string;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onLogout,
  isLoggedIn,
  currentUsername,
}: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      onRegister(username, email, password);
    } else {
      onLogin(username, password);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        {isLoggedIn ? (
          <div className="logged-in-content">
            <h2>Hey, {currentUsername}!</h2>
            <button onClick={onLogout} className="logout-button">
              Uitloggen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2>{isRegistering ? "Registreren" : "Inloggen"}</h2>
            <input
              type="text"
              placeholder="Gebruikersnaam"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {isRegistering && (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            )}
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
