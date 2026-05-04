import { createRoot } from "react-dom/client";
import App from '@/app/App.jsx';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import '@/shared/styles/index.css';

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
