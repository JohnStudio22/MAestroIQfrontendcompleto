import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch } from '../redux/hooks/reduxHooks';
import { registerWithGoogle } from '../redux/slices/authSlice';
import { addNotification } from '../redux/slices/uiSlice';
import { APP_CONFIG, MESSAGES } from '../config/constants';

export const useGoogleAuth = () => {
  const dispatch = useAppDispatch();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);

  // Verificar si Google OAuth está cargado
  useEffect(() => {
    const checkGoogleLoaded = () => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        setIsGoogleLoaded(true);
      } else {
        setTimeout(checkGoogleLoaded, 1000);
      }
    };

    checkGoogleLoaded();
  }, []);

  // Inicializar Google OAuth2 cuando esté disponible
  useEffect(() => {
    if (isGoogleLoaded && APP_CONFIG.GOOGLE_CLIENT_ID) {
      try {
        // Inicializar el cliente OAuth2 para popup
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: APP_CONFIG.GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: handleGoogleResponse,
        });
        setTokenClient(client);
      } catch (error) {
        console.error('Error al inicializar Google OAuth:', error);
      }
    }
  }, [isGoogleLoaded]);

  // Manejar la respuesta de Google
  const handleGoogleResponse = useCallback(async (tokenResponse) => {
    if (!tokenResponse || !tokenResponse.access_token) {
      dispatch(addNotification({
        message: 'No se recibió el token de acceso de Google',
        type: 'error'
      }));
      return;
    }

    setIsLoading(true);
    
    try {
      // Obtener información del usuario usando el access token
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`
        }
      });

      if (!userInfoResponse.ok) {
        throw new Error('Error al obtener información del usuario');
      }

      const userInfo = await userInfoResponse.json();
      
      // Enviar los datos al backend
      const resultAction = await dispatch(registerWithGoogle({
        access_token: tokenResponse.access_token,
        user_info: {
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
          google_id: userInfo.sub,
        }
      }));
      
      if (registerWithGoogle.fulfilled.match(resultAction)) {
        dispatch(addNotification({
          message: MESSAGES.SUCCESS.GOOGLE_AUTH,
          type: 'success'
        }));
      } else {
        dispatch(addNotification({
          message: resultAction.payload?.message || 'Error al registrar con Google',
          type: 'error'
        }));
      }
    } catch (error) {
      console.error('Error en autenticación con Google:', error);
      dispatch(addNotification({
        message: 'Error al procesar la autenticación con Google',
        type: 'error'
      }));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Función para abrir el popup de Google OAuth
  const signInWithGoogle = useCallback(() => {
    if (!isGoogleLoaded) {
      dispatch(addNotification({
        message: MESSAGES.ERROR.GOOGLE_OAUTH_ERROR,
        type: 'error'
      }));
      return;
    }

    if (!APP_CONFIG.GOOGLE_CLIENT_ID) {
      dispatch(addNotification({
        message: 'Google OAuth no está configurado',
        type: 'error'
      }));
      return;
    }

    if (!tokenClient) {
      dispatch(addNotification({
        message: 'Cliente de Google no está inicializado',
        type: 'error'
      }));
      return;
    }

    try {
      // Solicitar token - esto abrirá el popup de Google
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (error) {
      console.error('Error al abrir popup de Google:', error);
      dispatch(addNotification({
        message: 'Error al abrir la ventana de Google',
        type: 'error'
      }));
    }
  }, [isGoogleLoaded, tokenClient, dispatch]);

  return {
    isGoogleLoaded,
    isLoading,
    signInWithGoogle,
  };
};

export default useGoogleAuth; 