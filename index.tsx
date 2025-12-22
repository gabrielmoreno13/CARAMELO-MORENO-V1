import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
<body class="bg-caramel-50 text-gray-800 antialiased transition-colors duration-300">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
