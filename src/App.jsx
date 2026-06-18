// src/App.jsx
import { ToastProvider } from "./components/common/Toast";
import { ThemeProvider } from "./context/ThemeContext";
import './i18n';
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
      <ToastProvider />
    </ThemeProvider>
  );
}

export default App;