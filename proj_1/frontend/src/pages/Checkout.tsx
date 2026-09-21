import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { restaurantService, utilsService } from "../main";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader } from "react-icons/bi";

interface Address {
    _id: string;
    formattedAddress: string;
    mobile: number;
}

const Checkout = () => {
    const { cart, subTotal, quantity } = useAppData();

    const [addresses, setAddresses] = useState<Address[]>([]);

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
        null
    );

    const [loadingAddress, setLoadingAddress] = useState(true);

    const [loadingRazopay, setLoadingRazopay] = useState(false);
    const [loadingStripe, setLoadingStripe] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!cart || cart.length === 0) {
                setLoadingAddress(false);
                return;
            }

            try {
                const { data } = await axios.get(`${restaurantService}/api/address/all`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                });

                setAddresses(data.addresses || []);
            } catch (error) {
                console.log(error);
            } finally {
                setLoadingAddress(false);
            }
        }
        fetchAddresses();
    }, [cart]);

    const navigate = useNavigate()

    if (!cart || cart.length === 0) {
        return <div className="flex min-h-[60vh]  item-center justify-center">
            <p className="text-gray-500 text-lg">Your cart is empty</p>
        </div>
    }

    const restaurant = cart[0].restaurantId as IRestaurant;

    const deliveryFee = subTotal < 250 ? 49 : 0;

    const platformFee = 7;

    const gradTotal = subTotal + deliveryFee + platformFee;

    const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
        if (!selectedAddressId) return null;

        setCreatingOrder(true);

        try {
            const { data } = await axios.post(`${restaurantService}/api/oder/new`, {
                paymentMethod,
                addressId: selectedAddressId,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
            });

            return data;
        } catch (error) {
            toast.error("Failed to create Order");
        } finally {
            setCreatingOrder(false);
        }
    };

    const payWithRazorpay = async () => {
        try {
            setLoadingRazopay(true);

            const order = await createOrder("razorpay");
            if (!order) return;

            const { orderId, amount } = order;

            const { data } = await axios.post(`${utilsService}/api/payment/create`, {
                orderId
            });

            const { razorpayOrderId, key } = data;

            const option = {
                key,
                amount: amount * 100,
                currency: "INR",
                name: "Tomato",
                description: "Food Order Payment",
                ordr_Id: razorpayOrderId,
                handler: async (response: any) => {
                    try {
                        await axios.post(`${utilsService}/api/payment/verify`, {
                            razorpay_order_id: response.razorpay_order,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId,
                        });

                        toast.success("Payment successffull");
                        navigate("/paymentsuccess/" + response.razorpay_payment_id);

                    } catch (error) {
                        toast.error("Payment verification failed");
                    }
                },
                theme: {
                    "color": "#E23744"
                }

            }

            const razorpay = new (window as any).Razorpay(option)
            razorpay.open();

        } catch (error) {
            console.log(error);
            toast.error("Payment Failed please refresh page");
        } finally {
            setLoadingRazopay(false);
        }
    };

    const payWithStripe = async () => {
        try {
            setLoadingStripe(true);
            const order = await createOrder("stripe");
            if (!order) return;

            console.log("Stripe checkout", order);
        } catch (error) {
            console.log(error);
            toast.error("payment failed");
        } finally {
            setLoadingStripe(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
            <h1 className="text-2xl font-bold">Checkout</h1>

            <div className="rounded-xl bgw-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold">{restaurant.name}</h2>
                <p className="text-sm text-gray-500">
                    {
                        restaurant.autoLocation.formattedAddress
                    }
                </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
                <h3 className="font-semibold">Delivery Address</h3>

                {loadingAddress ? (
                    <p className="text-sm text-gray-500">Loading address... </p>
                ) : !Array.isArray(addresses) || addresses.length === 0 ? (
                    <p className="text-sm text-gray-500">No address found. Please add one</p>
                ) : (
                    addresses.map((add) => (
                        <label
                            key={add._id}
                            className={`flex gap-3 rounded-lg border p-3 cursor-pointer transition ${selectedAddressId === add._id ? "border-[#E23744] bg-red-50/50" : "hover:border-gray-400"
                                }`}
                        >
                            <input
                                type="radio"
                                name="deliveryAddress"
                                checked={selectedAddressId === add._id}
                                onChange={() => setSelectedAddressId(add._id)}
                            />
                            <div>
                                <p className="text-sm font-medium">{add.formattedAddress}</p>
                                <p className="text-sm text-gray-500">Phone: {add.mobile}</p>
                            </div>
                        </label>
                    ))
                )}
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
                <h3 className="font-semibold">Order Summary</h3>

                {/* Danh sách sản phẩm trong giỏ hàng */}
                <div className="space-y-2">
                    {cart.map((cartItem: ICart) => {
                        const item = cartItem.itemId as IMenuItem;

                        return (
                            <div className="flex justify-between text-sm" key={cartItem._id}>
                                <span>
                                    {item.name} x {cartItem.quantity}
                                </span>
                                <span>
                                    ${item.price * cartItem.quantity}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <hr />

                {/* Phần tổng kết giá tiền */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Items ({quantity})</span>
                        <span>${subTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Delivery Fee</span>
                        <span>${deliveryFee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Platform Fee</span>
                        <span>${platformFee}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-base">
                        <span>Total</span>
                        <span>${gradTotal}</span>
                    </div>
                </div>
            </div>
            <div className="rounde-xl bg-white p-4 shadow-sm space-y-3">
                <h3 className="font-semibold">Payment Method</h3>

                <button disabled={!selectedAddressId || loadingRazopay || creatingOrder}
                    onClick={payWithRazorpay}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2D7FF9] py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                    {loadingRazopay || creatingOrder ? (<BiLoader size={18}
                        className="animate-spin" />)
                        : (<BiCreditCard size={18} />)}
                    Pay With Razorpay
                </button>

                <button disabled={!selectedAddressId || loadingStripe || creatingOrder}
                    onClick={payWithStripe}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                    {loadingStripe || creatingOrder ? (<BiLoader size={18}
                        className="animate-spin" />)
                        : (<BiCreditCard size={18} />)}
                    Pay With Stripe
                </button>
            </div>
        </div>
    );
}

export default Checkout;