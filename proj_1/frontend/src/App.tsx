import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/protectedRoutes';
import PublicRoute from './components/publicRoutes';
import SelectRole from './pages/SelectRole';
import Navbar from './components/navbar';
import Account from './pages/Account';
import { useAppData } from './context/AppContext';
import Restaurant from './pages/Restaurant';

const App = () => {
  const { user } = useAppData()

  if (user && user.role === "seller") {
    return <Restaurant />
  }
  return (
    <>
      {/* Kích hoạt cơ chế định tuyến phía client bằng BrowserRouter */}
      <BrowserRouter>
        {/* Navbar hiển thị chung ở mọi trang */}
        <Navbar />
        <Routes>

          <Route element={<PublicRoute />}>
            {/* Chỉ cho phép truy cập vào trang Login khi chưa đăng nhập */}
            <Route path='/login' element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            {/* Chỉ cho phép truy cập vào trang Home khi đã đăng nhập */}
            <Route path='/' element={<Home />} />
            <Route path='/select-role' element={<SelectRole />} />
            <Route path='/account' element={<Account />} />
          </Route>

        </Routes>
        {/* Toaster hiển thị các thông báo (Toast notifications) */}
        <Toaster />
      </BrowserRouter>
    </>
  )

}

export default App;