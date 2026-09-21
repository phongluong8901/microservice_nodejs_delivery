import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppProvider } from './context/AppContext.tsx'
import 'leaflet/dist/leaflet.css'

export const authService = 'http://localhost:5000';
export const restaurantService = 'http://localhost:5001';
export const utilsService = 'http://localhost:5002';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Bọc GoogleOAuthProvider để cung cấp Client ID cho các component con sử dụng tính năng đăng nhập Google */}
    <GoogleOAuthProvider clientId="864105802830-puntur3i4pr0gojbo0a8d7ltmar3ekk4.apps.googleusercontent.com">
      {/* Bọc AppProvider để chia sẻ state chung (như thông tin user, token, giỏ hàng,...) khắp ứng dụng */}
      <AppProvider>
        <App />
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
