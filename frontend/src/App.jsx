import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnalyticsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
