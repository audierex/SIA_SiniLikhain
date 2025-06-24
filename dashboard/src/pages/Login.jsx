import React, { useState } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import loginImg from '../images/login.jpg';

const logo = '/circular-logo.png';

function GoogleLoginButton() {
  const { loginWithRedirect, isLoading } = useAuth0();
  return (
    <button
      className="w-full flex items-center justify-center bg-white border border-black hover:bg-gray-100 text-black font-semibold py-2 rounded-xl shadow-md transition-colors duration-200 mb-2 mt-2 text-lg tracking-wide gap-2"
      style={{ fontFamily: 'Poppins, Verdana, monospace' }}
      onClick={() => loginWithRedirect({ connection: 'google-oauth2' })}
      disabled={isLoading}
    >
      <svg width="24" height="24" viewBox="0 0 48 48" className="mr-2" style={{ display: 'inline' }}>
        <g>
          <path fill="#4285F4" d="M24 9.5c3.54 0 6.36 1.22 8.3 2.98l6.18-6.18C34.64 2.7 29.74 0 24 0 14.82 0 6.88 5.8 2.88 14.1l7.2 5.6C12.18 13.18 17.62 9.5 24 9.5z"/>
          <path fill="#34A853" d="M46.1 24.5c0-1.64-.14-3.22-.4-4.74H24v9.04h12.4c-.54 2.92-2.18 5.4-4.66 7.08l7.2 5.6C43.12 37.2 46.1 31.4 46.1 24.5z"/>
          <path fill="#FBBC05" d="M10.08 28.7c-1.08-3.22-1.08-6.68 0-9.9l-7.2-5.6C.98 17.38 0 20.6 0 24c0 3.4.98 6.62 2.88 9.8l7.2-5.6z"/>
          <path fill="#EA4335" d="M24 48c6.48 0 11.92-2.14 15.9-5.8l-7.2-5.6c-2.02 1.36-4.6 2.16-8.7 2.16-6.38 0-11.82-3.68-14.92-9.1l-7.2 5.6C6.88 42.2 14.82 48 24 48z"/>
        </g>
      </svg>
      Sign in with Google
    </button>
  );
}

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleLogin = async () => {
    let currentErrors = {};

    if (!credentials.username.trim()) {
      currentErrors.username = "Username is required";
    }
    if (!credentials.password.trim()) {
      currentErrors.password = "Password is required";
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return; 
    }

    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    try {
      const response = await axios.post("http://localhost:5000/users/login", credentials);
      const user = response.data.user;
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      console.log('Logged in user:', user);
      const roleRoutes = {
        admin: "/admin",
        artisan: "/Artisan",
        buyer: "/home",
      };
      const route = roleRoutes[user.role];
      if (route) {
        navigate(route);
      } else {
        setLoginError("Unknown user role. Please contact support.");
        navigate("/");
      }
      setLoginError("");
    } catch (error) {
      setLoginError("Invalid username or password.");
      setErrors({ username: true, password: true });
    }
  };

  return (
    <Auth0Provider
      domain="YOUR_AUTH0_DOMAIN"
      clientId="YOUR_AUTH0_CLIENT_ID"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <div
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url(${loginImg})`,
          fontFamily: 'Poppins, Verdana, monospace',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />
        <div className="absolute top-6 left-6 cursor-pointer z-20" onClick={() => navigate("/")}> 
          <img src={logo} alt="SiniLikhain Logo" className="w-20 h-20 rounded-full shadow-lg border-2 border-black hover:scale-105 transition-transform duration-200 bg-white" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full max-w-md bg-white/90 shadow-2xl p-10 rounded-3xl m-4 backdrop-blur-md border border-black" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)', fontFamily: 'Poppins, Verdana, monospace' }}>
          <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-black drop-shadow-lg leading-tight" style={{ fontFamily: 'Poppins, Verdana, monospace', color: '#111' }}>
              Welcome to SiniLikhain
            </h1>
            <p className="text-base md:text-lg mt-2 font-medium text-black" style={{ fontFamily: 'Source Code Pro, monospace', color: '#222' }}>
              Artisan-made. Culture-inspired.
            </p>
            <p className="mt-4 text-base md:text-base font-normal text-black" style={{ fontFamily: 'Poppins, Verdana, monospace', color: '#333' }}>
              Please log in to your account to continue.
            </p>
          </div>
          {loginError && (
            <div className="w-full mb-4">
              <p className="text-black text-center text-sm font-semibold bg-white border border-black rounded-md py-2 px-3" style={{ fontFamily: 'Poppins, Verdana, monospace' }}>{loginError}</p>
            </div>
          )}
          <div className="w-full mb-4 relative">
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className={`w-full px-4 py-4 text-base text-black border ${errors.username ? 'border-black' : 'border-black'} rounded-md focus:outline-none focus:ring-2 ${errors.username ? 'focus:ring-black' : 'focus:ring-black'} transition-all duration-300 bg-white peer shadow-sm`}
              style={{ fontFamily: 'Poppins, Verdana, monospace', fontWeight: 400 }}
              autoComplete="off"
              required
            />
            <label
              htmlFor="username"
              className={`absolute left-4 ${credentials.username ? '-top-3 text-xs text-black translate-y-0' : 'top-1/2 -translate-y-1/2 text-gray-500'} px-1 transition-all duration-300 pointer-events-none
                peer-focus:-top-3 peer-focus:text-xs peer-focus:text-black peer-focus:translate-y-0 peer-focus:top-1
                peer-hover:-top-3 peer-hover:text-xs peer-hover:text-black peer-hover:translate-y-0 peer-hover:top-1`}
              style={{ fontFamily: 'Poppins, Verdana, monospace', fontWeight: 400, background: 'none' }}
            >
              Enter Username
            </label>
            {errors.username && <p className="text-black text-xs mt-1 font-bold" style={{ fontFamily: 'Poppins, Verdana, monospace' }}>{errors.username}</p>}
          </div>
          <div className="h-4"></div>
          <div className="w-full mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className={`w-full px-4 py-4 text-base text-black rounded-md focus:outline-none focus:ring-2 transition-all duration-300 bg-white peer shadow-sm`}
              style={{ fontFamily: 'Poppins, Verdana, monospace', fontWeight: 400, border: 'none', boxShadow: 'none' }}
              autoComplete="off"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="white" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.05 10.05 0 0112 19c-5.523 0-10-7-10-7a21.77 21.77 0 015.06-5.94M22.54 12.42A21.77 21.77 0 0012 5c-1.657 0-3.22.403-4.575 1.125M3 3l18 18" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="white" /></svg>
              )}
            </button>
            <label
              htmlFor="password"
              className={`absolute left-4 ${credentials.password ? '-top-3 text-xs text-black translate-y-0' : 'top-1/2 -translate-y-1/2 text-gray-500'} px-1 transition-all duration-300 pointer-events-none
                peer-focus:-top-3 peer-focus:text-xs peer-focus:text-black peer-focus:translate-y-0 peer-focus:top-1
                peer-hover:-top-3 peer-hover:text-xs peer-hover:text-black peer-hover:translate-y-0 peer-hover:top-1`}
              style={{ fontFamily: 'Poppins, Verdana, monospace', fontWeight: 400, background: 'none' }}
            >
              Enter Password
            </label>
            {errors.password && <p className="text-black text-xs mt-1 font-bold" style={{ fontFamily: 'Poppins, Verdana, monospace' }}>{errors.password}</p>}
          </div>
          <div className="w-full flex items-center mb-4">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="mr-2 accent-black h-4 w-4 rounded focus:ring-black border-black"
            />
            <label htmlFor="rememberMe" className="text-sm text-black select-none" style={{ fontFamily: 'Poppins, Verdana, monospace' }}>
              Remember me
            </label>
          </div>
          <button
            className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-2 rounded-xl shadow-md transition-colors duration-200 mb-2 mt-2 text-lg tracking-wide"
            style={{ fontFamily: 'Poppins, Verdana, monospace' }}
            onClick={handleLogin}
          >
            Login
          </button>
          <GoogleLoginButton />
          <p className="text-center text-black mt-4 text-sm" style={{ fontFamily: 'Poppins, Verdana, monospace' }}>
            Don't have an account?{' '}
            <span
              onClick={() => navigate("/register")}
              className="text-black underline cursor-pointer font-semibold"
              style={{ fontFamily: 'Poppins, Verdana, monospace' }}
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </Auth0Provider>
  );
}

export default Login;