
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * CARAMELO v3 - ENTRY POINT
 * Inicialização do núcleo da aplicação com React 19.
 */

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Failure: Root element not found.");
  throw new Error("Could not find root element to mount the Caramelo v3 engine.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("%c CARAMELO v3 %c Sistema Inicializado com Sucesso ", 
  "color: white; background: #f59e0b; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;", 
  "color: #f59e0b; background: #111827; font-weight: bold; padding: 4px 8px; border-radius: 0 4px 4px 0;");
