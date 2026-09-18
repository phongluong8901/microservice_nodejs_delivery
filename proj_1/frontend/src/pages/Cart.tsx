import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import { restaurantService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import { BiMinus, BiPlus } from "react-icons/bi";
import { TbTrash } from "react-icons/tb";

const Cart = () => {
    // Lấy dữ liệu giỏ hàng, tổng tiền, tổng số lượng và hàm fetchCart từ AppContext toàn cục
    const { cart, subTotal, quantity, fetchCart } = useAppData();
    const navigate = useNavigate()  // Hook điều hướng trang của React Router DOM

    // State lưu ID của món ăn đang được xử lý tăng/giảm số lượng
    const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
    // State quản lý trạng thái loading khi đang thực hiện xóa sạch
    const [clearingCart, setClearingCart] = useState(false);

    // Nếu giỏ hàng trống hoặc không tồn tại
    if (!cart || cart.length === 0) {
        return <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-gray-500 text-lg">Your cart is empty</p>
        </div>
    }

    // Lấy thông tin nhà hàng từ sản phẩm đầu tiên trong giỏ hàng
    const restaurant = cart[0].restaurantId as IRestaurant;

    // Tính phí vận chuyển: Miễn phí (0) nếu subTotal từ 250 trở lên, ngược lại tính phí 49
    const deliveryFee = subTotal < 250 ? 49 : 0;

    // Phí nền tảng cố định
    const platformFee = 7;

    // Tổng tiền thanh toán cuối cùng (Grand Total)
    const grandTotal = subTotal + deliveryFee + platformFee;

    // Hàm xử lý tăng số lượng sản phẩm trong giỏ hàng
    const increaseQty = async (itemId: string) => {
        try {
            setLoadingItemId(itemId);   // Bật trạng thái loading cho item cụ thể này

            // Gửi request PUT lên server để tăng số lượng món ăn
            await axios.put(`${restaurantService}/api/cart/inc`,
                { itemId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

            // Làm mới lại dữ liệu giỏ hàng sau khi tăng thành công
            await fetchCart();
        } catch (error) {
            toast.error("something went wrong")
        } finally {
            // Tắt trạng thái loading dù thành công hay thất bại
            setLoadingItemId(null)
        }
    }

    // Hàm xử lý giảm số lượng sản phẩm trong giỏ hàng
    const decreaseQty = async (itemId: string) => {
        try {
            setLoadingItemId(itemId);
            await axios.put(`${restaurantService}/api/cart/dec`,
                { itemId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

            await fetchCart();
        } catch (error) {
            toast.error("something went wrong")
        } finally {
            setLoadingItemId(null)
        }
    }

    // Hàm xử lý xóa toàn bộ giỏ hàng
    const clearCart = async () => {
        const confirm = window.confirm("Are you sure you want to clear the cart?")
        if (!confirm) return;

        try {
            setClearingCart(true);
            await axios.delete(`${restaurantService}/api/cart/clear`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

            await fetchCart();
        } catch (error) {
            toast.error("something went wrong")
        } finally {
            setClearingCart(false);
        }
    }

    // Hàm chuyển hướng người dùng sang trang thanh toán
    const checkout = () => {
        navigate("/checkout");
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
            {/* Hiển thị thông tin tên và địa chỉ nhà hàng */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
                <h2 className="text-xl font-semibold">
                    {restaurant.name}
                </h2>
                <p className="text-sm text-gray-500">
                    {restaurant.autoLocation.formattedAddress}
                </p>
            </div>

            {/* Danh sách các món ăn có trong giỏ hàng */}
            <div className="space-y-4">
                {cart.map((cartItem: ICart) => {
                    const item = cartItem.itemId as IMenuItem;
                    const isLoading = loadingItemId === item._id;
                    return <div
                        key={item._id}
                        className="flex items-center gap-4 rounded-xl bg-white p-4">
                        {/* Hình ảnh món ăn */}
                        <img
                            src={item.image}
                            alt=""
                            className="h-20 w-20 rounded object-cover" />

                        {/* Tên và giá tiền từng món */}
                        <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.price}</p>
                        </div>

                        {/* Các nút tăng/giảm số lượng */}
                        <div className="flex items-center gap-3">
                            {/* Nút giảm số lượng */}
                            <button
                                className="rounded-full border p-2 hover:bg-gray-100 disabled:opacity-50"
                                disabled={isLoading}
                                onClick={() => decreaseQty(item._id)}>
                                {isLoading
                                    ? (<VscLoading size={16} className="animate-spin" />)
                                    : (<BiMinus size={16} />)}
                            </button>

                            {/* Hiển thị số lượng hiện tại */}
                            <span className="font-medium">{cartItem.quantity}</span>

                            {/* Nút tăng số lượng */}
                            <button
                                className="rounded-full border p-2 hover:bg-gray-100 disabled:opacity-50"
                                disabled={isLoading}
                                onClick={() => increaseQty(item._id)}>
                                {isLoading
                                    ? (<VscLoading size={16} className="animate-spin" />)
                                    : (<BiPlus size={16} />)}
                            </button>
                        </div>

                        {/* Tổng tiền của riêng món này */}
                        <p className="w-20 text-right font-medium">
                            ${item.price * cartItem.quantity}
                        </p>
                    </div>
                })}
            </div>

            {/* Phần tổng kết hóa đơn và các nút hành động */}
            <div className="rounded-xl bg-white p-4 shadow space-y-3">
                {/* Tổng số lượng món */}
                <div className="flex justify-between text-sm">
                    <span>Total Items</span>
                    <span>{quantity}</span>
                </div>

                {/* Tiền tạm tính (Subtotal) */}
                <div className="flex justify-between text-sm">
                    <span>SubTotal</span>
                    <span>${subTotal}</span>
                </div>

                {/* Phí giao hàng */}
                <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? "Free" : `${deliveryFee}`}</span>
                </div>

                {/* Phí nền tảng */}
                <div className="flex justify-between text-sm">
                    <span>Platform Fee</span>
                    <span>${platformFee}</span>
                </div>

                {/* Gợi ý mua thêm để được miễn phí ship */}
                {
                    subTotal < 250 && <p className="text-sm text-gray-500">
                        Add item worth ${250 - subTotal} more to get Free delivery
                    </p>
                }

                {/* Tổng tiền cuối cùng (Grand Total) */}
                <div className="flex justify-between text-base font-semibold border-t pt-2">
                    <span>Grand Total</span>
                    <span>${grandTotal}</span>
                </div>

                {/* Nút bấm tiến hành thanh toán */}
                <button
                    onClick={checkout}
                    disabled={!restaurant.isOpen}
                    className={`mt-3 w-full rounded-lg bg-[#E23774] py-3 text-sm font-semibold text-white hover:bg-red-800 ${!restaurant.isOpen ? "opacity-50" : ""
                        }`}>
                    {!restaurant.isOpen ? "Restaurant is Closed" : "Proceed to Checkout"}
                </button>

                {/* Nút bấm xóa toàn bộ giỏ hàng */}
                <button
                    onClick={clearCart}
                    disabled={clearingCart}
                    className="mt-3 w-full rounded-lg bg-[#232222] py-3 text-sm font-semibold text-white hover:bg-gray-500 flex items-center gap-2 justify-center">
                    Clear Cart <TbTrash size={16} />
                </button>
            </div>
        </div>
    );
}

export default Cart;