import { useCallback, useState, type FormEvent } from 'react';
import { nameFromEmail, type Session } from '../utils/session.ts';
import { GoogleButton } from './GoogleButton.tsx';
import './AuthForm.css';

type AuthFormProps = {
  onLogin: (session: Session) => void;
};

// Mesmo formulário do Painel de Candidaturas: entrar ou criar conta
export function AuthForm({ onLogin }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState('');
  const handleError = useCallback((message: string) => setError(message), []);

  const isRegister = mode === 'register';

  // O botão só fica ativo quando os campos obrigatórios estão preenchidos
  const canSubmit =
    email.trim() !== '' &&
    password.length >= 8 &&
    (!isRegister || name.trim() !== '');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    onLogin({
      email: cleanEmail,
      name: name.trim() || nameFromEmail(cleanEmail),
    });
  }

  // Troca entre "entrar" e "criar conta"
  function toggleMode() {
    setMode(isRegister ? 'login' : 'register');
    setShowHelp(false);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>{isRegister ? 'Criar conta' : 'Entrar'}</h1>

      {/* Google primeiro, depois a linha "ou" e o formulário normal */}
      <GoogleButton onLogin={onLogin} onError={handleError} />

      {isRegister && (
        <label>
          Nome
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Como você quer ser chamada"
            autoComplete="name"
            required
          />
        </label>
      )}

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@empresa.com"
          autoComplete="email"
          required
        />
      </label>

      {/* Senha com o "Esqueceu a senha?" logo abaixo, à direita */}
      <div className="password-field">
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isRegister ? 'Mínimo de 8 caracteres' : 'Sua senha'}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={8}
            required
          />
        </label>

        {!isRegister && (
          <button
            type="button"
            className="forgot-password"
            onClick={() => setShowHelp(!showHelp)}
            aria-expanded={showHelp}
          >
            Esqueceu a senha?
          </button>
        )}
      </div>

      {!isRegister && showHelp && (
        <p className="auth-help">
          Fale com quem administra o Radar no seu time para criar uma senha
          nova.
        </p>
      )}

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="auth-submit" disabled={!canSubmit}>
        {isRegister ? 'Criar conta' : 'Continuar'}
      </button>

      <button type="button" className="auth-switch" onClick={toggleMode}>
        {isRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
        <strong>{isRegister ? 'Entrar' : 'Criar conta'}</strong>
      </button>

      <p className="auth-proto">
        Protótipo: a senha ainda não é conferida. O login de verdade chega com o
        banco de dados.
      </p>
    </form>
  );
}
