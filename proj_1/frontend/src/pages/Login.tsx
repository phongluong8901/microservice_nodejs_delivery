import axios from "axios";
import { useState } from "react";
import { authService } from "../main";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google'
import { FcGoogle } from 'react-icons/fc'

const Login = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const responseGoogle = async (authResult: any) => {
        setLoading(true)
        try {
            const result = await axios.post(`${authService}/api/auth/login`, {
                code: authResult["code"],
            });
            localStorage.setItem("token", result.data.token);
            toast.success(result.data.mesasge);
            setLoading(false);
            navigate("/");
        } catch (error) {
            console.log(error);
            toast.error("Problem while login");
            setLoading(false);
        }
    }

    const googleLogin = useGoogleLogin({
        onSuccess: responseGoogle,
        onError: responseGoogle,
        flow: "auth-code",
    })

    return <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm space-y-6">
            <h1 className="text-center text-3xl font-bold text-[#E23774]">
                Tomato
            </h1>
            <p className="text-center text-sm text-gray-500">Login or Signup to continue</p>

            <button onClick={googleLogin} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3">
                <FcGoogle size={20} />
                {loading ? "Siging in ..." : "Sign in with Google"}
            </button>

            <p className="text-center text-xs text-gray-500">
                By continuing, you agree with our {" "}
                <a href="#" className="text-[#E23774]">Terms of Service</a> and{" "}
                <a href="#" className="text-[#E23774]"> Privacy Policy</a>
            </p>
        </div>
    </div>
};

export default Login;