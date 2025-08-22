import React, { useEffect, useState } from 'react';
import { APP_CONFIG } from '../../config/constants';

const ConfigDebugger = () => {
  const [configStatus, setConfigStatus] = useState({});
  const [googleStatus, setGoogleStatus] = useState({});

  useEffect(() => {
    // Verificar configuración
    const checkConfig = () => {
      const status = {
        googleClientId: !!APP_CONFIG.GOOGLE_CLIENT_ID,
        apiUrl: !!APP_CONFIG.API_URL,
        appUrl: !!APP_CONFIG.APP_URL,
        googleClientIdValue: APP_CONFIG.GOOGLE_CLIENT_ID || 'NO CONFIGURADO',
        apiUrlValue: APP_CONFIG.API_URL || 'NO CONFIGURADO',
        appUrlValue: APP_CONFIG.APP_URL || 'NO CONFIGURADO',
      };
      setConfigStatus(status);
    };

    // Verificar estado de Google
    const checkGoogle = () => {
      const status = {
        googleLoaded: !!window.google,
        googleAccounts: !!(window.google && window.google.accounts),
        googleAccountsId: !!(window.google && window.google.accounts && window.google.accounts.id),
      };
      setGoogleStatus(status);
    };

    checkConfig();
    checkGoogle();

    // Verificar Google cada segundo hasta que esté cargado
    const interval = setInterval(() => {
      checkGoogle();
      if (window.google && window.google.accounts) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // No mostrar en producción
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="text-lg font-bold mb-3">🔧 Debug de Configuración</h3>
      
      <div className="space-y-2">
        <h4 className="font-semibold text-blue-300">Variables de Entorno:</h4>
        <div className="text-sm space-y-1">
          <div className={`flex justify-between ${configStatus.googleClientId ? 'text-green-400' : 'text-red-400'}`}>
            <span>GOOGLE_CLIENT_ID:</span>
            <span>{configStatus.googleClientId ? '✅' : '❌'}</span>
          </div>
          <div className="text-xs text-gray-400 break-all">
            {configStatus.googleClientIdValue}
          </div>
          
          <div className={`flex justify-between ${configStatus.apiUrl ? 'text-green-400' : 'text-red-400'}`}>
            <span>API_URL:</span>
            <span>{configStatus.apiUrl ? '✅' : '❌'}</span>
          </div>
          <div className="text-xs text-gray-400 break-all">
            {configStatus.apiUrlValue}
          </div>
          
          <div className={`flex justify-between ${configStatus.appUrl ? 'text-green-400' : 'text-red-400'}`}>
            <span>APP_URL:</span>
            <span>{configStatus.appUrl ? '✅' : '❌'}</span>
          </div>
          <div className="text-xs text-gray-400 break-all">
            {configStatus.appUrlValue}
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-3">
        <h4 className="font-semibold text-blue-300">Estado de Google:</h4>
        <div className="text-sm space-y-1">
          <div className={`flex justify-between ${googleStatus.googleLoaded ? 'text-green-400' : 'text-yellow-400'}`}>
            <span>Google SDK:</span>
            <span>{googleStatus.googleLoaded ? '✅' : '⏳'}</span>
          </div>
          <div className={`flex justify-between ${googleStatus.googleAccounts ? 'text-green-400' : 'text-yellow-400'}`}>
            <span>Google Accounts:</span>
            <span>{googleStatus.googleAccounts ? '✅' : '⏳'}</span>
          </div>
          <div className={`flex justify-between ${googleStatus.googleAccountsId ? 'text-green-400' : 'text-yellow-400'}`}>
            <span>Google ID:</span>
            <span>{googleStatus.googleAccountsId ? '✅' : '⏳'}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400">
        <p>Este debug solo se muestra en desarrollo</p>
        <p>Para ocultar: NODE_ENV=production</p>
      </div>
    </div>
  );
};

export default ConfigDebugger;
