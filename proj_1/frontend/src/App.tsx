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
import RestaurantPage from './pages/RestaurantPage';
import Cart from './pages/Cart';
import AddAddressPage from './pages/Address';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderPage from './pages/OrderPage';
import RiderDashboard from './pages/RiderDashboard';

const App = () => {
  const { user, loading } = useAppData()

  if (loading) {
    return <h1 className='text-2xl font-bold text-red-500 text-center mt-56'>Loading...</h1>
  }

  // Seller routes
  if (user && user.role === "seller") {
    return <Restaurant />
  }

  // Rider routes
  if (user && user.role === "rider") {
    return <RiderDashboard />
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
            {/* <Route path='/restaurant' element={<Restaurant />} /> */}
            <Route path='/paymentsuccess/:paymentId' element={<PaymentSuccess />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/order/:id' element={<OrderPage />} />
            <Route path='/ordersuccess' element={<OrderSuccess />} />
            <Route path='/addresses' element={<AddAddressPage />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/restaurant/:id' element={<RestaurantPage />} />
            <Route path='/cart' element={<Cart />} />
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