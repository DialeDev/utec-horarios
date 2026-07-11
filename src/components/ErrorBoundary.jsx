import { Component } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-md text-center">
            <div className="text-5xl mb-4"><FiAlertCircle className="inline-block text-red-400" size={56} /></div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Algo salió mal</h2>
            <p className="text-sm text-slate-500 mb-4">
              Ocurrió un error inesperado. Recargá la página o intentá de nuevo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
