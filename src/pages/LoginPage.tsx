import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { GOOGLE_CLIENT_ID } from '../config/env';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle, login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    if (isRegister) {
      const result = await register(email, password, name || undefined);
      setIsLoading(false);
      if (result.ok) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed.');
      }
      return;
    }

    const result = await login(email, password);
    setIsLoading(false);
    if (result.ok) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  const handleGoogleCredentialResponse = (response: any) => {
    if (!response?.credential) {
      setError('Google login failed.');
      return;
    }

    const success = loginWithGoogle(response.credential);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Google login failed.');
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    const renderButton = () => {
      const googleAccounts = (window as any).google?.accounts?.id;
      if (!googleAccounts) {
        return;
      }

      googleAccounts.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
      });
      googleAccounts.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'filled_blue',
          size: 'large',
          width: '100%',
          text: 'signup_with',
        }
      );
    };

    if ((window as any).google?.accounts?.id) {
      renderButton();
    } else {
      const interval = window.setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          renderButton();
          window.clearInterval(interval);
        }
      }, 250);
      return () => window.clearInterval(interval);
    }
  }, [GOOGLE_CLIENT_ID]);

  return (
    <div className="login-container">
      <div className="login-illustration">
        <div className="illustration-content">
          <svg className="illustration-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.1)" />
            <path d="M70 120 Q100 140 130 120" stroke="white" strokeWidth="3" fill="none" />
            <circle cx="80" cy="80" r="6" fill="white" />
            <circle cx="120" cy="80" r="6" fill="white" />
          </svg>
        </div>
      </div>

      <div className="login-form-wrapper">
        <div className="login-form-container">
          <div className="login-header">
            <h1>{isRegister ? 'Create account' : 'Welcome back'}</h1>
            <p>{isRegister ? 'Register to get started' : 'Sign in to continue'}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {isRegister && (
              <div className="form-group">
                <label htmlFor="name"></label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="form-input"
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email"></label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email Address"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password"></label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="form-input"
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (isRegister ? 'Creating...' : 'Logging in...') : isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            {!isRegister && (
              <a href="#" className="forgot-password">
                Forgot Password
              </a>
            )}
            <button
              className="link-button"
              onClick={() => {
                setIsRegister((s) => !s);
                setError('');
              }}
            >
              {isRegister ? 'Have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>

          <div className="divider">
            <span>Or</span>
          </div>

          <div id="google-signin-button" className="google-button-wrapper"></div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
