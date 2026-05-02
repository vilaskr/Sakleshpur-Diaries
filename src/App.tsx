import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

// Public Pages
import Home from './pages/Home';
import Places from './pages/Places';
import PlaceDetail from './pages/PlaceDetail';
import Stays from './pages/Stays';
import FoodSpots from './pages/FoodSpots';
import Itineraries from './pages/Itineraries';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import CollectionManager from './pages/admin/CollectionManager';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="places" element={<Places />} />
            <Route path="places/:id" element={<PlaceDetail />} />
            <Route path="stays" element={<Stays />} />
            <Route path="food-spots" element={<FoodSpots />} />
            <Route path="itineraries" element={<Itineraries />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin App */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path=":collection" element={<CollectionManager />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
