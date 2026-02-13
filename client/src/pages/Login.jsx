import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import bgImage from '../assets/3.png';
import logo from '../assets/1.png';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user)); // Store user info
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen flex-row">
            {/* Left Side - Image */}
            <div className="hidden lg:block w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url(${bgImage})` }}>
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute bottom-10 left-10 text-white z-10">
                    <h1 className="text-4xl font-bold mb-2">Welcome to Flow Estate</h1>
                    <p className="text-lg opacity-90">Manage your real estate business efficiently.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white w-full lg:w-1/2">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img src={logo} alt="Flow Estate" className="mx-auto h-16 w-auto mb-6" />
                    <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={onSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6 pl-2"
                                    value={email}
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                    Password
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6 pl-2"
                                    value={password}
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-brand-blue px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue transition-colors duration-200"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    try {
                                        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
                                            token: credentialResponse.credential,
                                        });
                                        localStorage.setItem('token', res.data.token);
                                        localStorage.setItem('user', JSON.stringify(res.data.user)); // Store user info
                                        navigate('/dashboard');
                                    } catch (err) {
                                        console.error("Google Login Error:", err);
                                        setError(err.response?.data?.message || err.message || 'Google Login failed');
                                    }
                                }}
                                onError={() => {
                                    console.error("Google Login Failed (onError callback)");
                                    setError('Google Login Failed (onError callback)');
                                }}
                                useOneTap
                                type="standard"
                                theme="outline"
                                size="large"
                                width="300" // Ensure checking CSS for width
                            />
                        </div>

                        <p className="mt-10 text-center text-sm text-gray-500">
                            Not a member?{' '}
                            <a href="/register" className="font-semibold leading-6 text-brand-blue hover:text-blue-500">
                                Register now
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
