import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface GoogleAuthButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  onCredential: (idToken: string) => void;
  onError?: (errorMessage: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const GoogleAuthButtonComponent: React.FC<GoogleAuthButtonProps> = ({
  text = 'continue_with',
  onCredential,
  onError,
  disabled = false,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gisLoaded, setGisLoaded] = useState<boolean>(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';

  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  });

  const initializedClientIdRef = useRef<string | null>(null);
  const renderedTextRef = useRef<string | null>(null);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setGisLoaded(true);
      return;
    }

    const checkGis = () => {
      if (window.google?.accounts?.id) {
        setGisLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGis()) return;

    let script = document.querySelector(
      'script[src*="accounts.google.com/gsi/client"]'
    ) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client?hl=en';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const interval = setInterval(() => {
      if (checkGis()) {
        clearInterval(interval);
      }
    }, 150);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 7000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!gisLoaded || !clientId || !containerRef.current) {
      return;
    }

    try {
      if (initializedClientIdRef.current !== clientId) {
        window.google?.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              onCredentialRef.current(response.credential);
            } else {
              onErrorRef.current?.('Google returned an empty credential. Please try again.');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        initializedClientIdRef.current = clientId;
      }

      const shouldRender =
        !containerRef.current.hasChildNodes() || renderedTextRef.current !== text;

      if (shouldRender) {
        containerRef.current.innerHTML = '';
        window.google?.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: text,
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 380,
          locale: 'en',
        });
        renderedTextRef.current = text;
      }
    } catch (err: any) {
      console.error('Error initializing Google GIS button:', err);
      onErrorRef.current?.(err?.message || 'Failed to initialize Google Sign-In');
    }
  }, [gisLoaded, clientId, text]);

  const handleFallbackClick = () => {
    if (!clientId) {
      onErrorRef.current?.(
        'Google OAuth Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your frontend .env file.'
      );
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      onErrorRef.current?.('Google Identity Services is still loading. Please wait a moment and try again.');
    }
  };

  const buttonLabel =
    text === 'signin_with'
      ? 'Sign in with Google'
      : text === 'signup_with'
      ? 'Sign up with Google'
      : 'Continue with Google';

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {clientId ? (
        <div
          ref={containerRef}
          style={{
            minHeight: '44px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: disabled || isLoading ? 'none' : 'auto',
            opacity: disabled || isLoading ? 0.6 : 1,
          }}
        />
      ) : (
        <button
          type="button"
          onClick={handleFallbackClick}
          disabled={disabled || isLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.65rem 1rem',
            backgroundColor: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '6px',
            color: '#3c4043',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 2px rgba(60, 64, 67, 0.08)',
            transition: 'background-color 0.2s, box-shadow 0.2s, border-color 0.2s',
            opacity: disabled || isLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled && !isLoading) {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#c6c9cc';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !isLoading) {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#dadce0';
            }
          }}
        >
          <GoogleIcon size={20} />
          <span>{isLoading ? 'Connecting with Google...' : buttonLabel}</span>
        </button>
      )}
    </div>
  );
};

export const GoogleAuthButton = React.memo(GoogleAuthButtonComponent);