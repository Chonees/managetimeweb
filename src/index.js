import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Añadir manejador global de errores
const ErrorFallback = ({ error }) => {
  console.error('Error en la aplicación:', error);
  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      backgroundColor: '#ffcccc', 
      border: '1px solid red',
      borderRadius: '5px' 
    }}>
      <h2>Ha ocurrido un error en la aplicación</h2>
      <p>Por favor, recarga la página e intenta nuevamente.</p>
      <details>
        <summary>Detalles del error (para desarrolladores)</summary>
        <pre>{error.message}</pre>
        <pre>{error.stack}</pre>
      </details>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));

// Imprimir información de entorno para depuración
console.log('Variables de entorno disponibles:', {
  API_URL: process.env.REACT_APP_API_URL,
  NODE_ENV: process.env.NODE_ENV
});

try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('Renderizado inicial completado');
} catch (error) {
  console.error('Error durante el renderizado inicial:', error);
  root.render(<ErrorFallback error={error} />);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
