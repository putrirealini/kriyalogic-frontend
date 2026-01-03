import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, error } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await login(email, password);
        setIsLoading(false);
        if (success) {
            toast.success('Login successful!');
            navigate('/dashboard');
        } else {
            toast.error(error || 'Login failed');
        }
    };

    return (
        <div className="p-4 bg-[#F5F5F5F5]/90 w-full min-h-screen flex justify-center items-center relative">
            <img src="/vector-1.png" alt="logo" className='hidden md:block absolute bottom-0 right-0 w-full h-full z-10' />
            <img src="/vector-2.png" alt="logo" className='hidden md:block absolute bottom-0 right-20 w-full h-full z-0' />
            <div className='flex flex-col md:flex-row gap-10 relative z-20 items-center justify-center w-full'>
                <div className='p-4 md:p-20 flex flex-col items-center md:items-start'>
                    <h2 className='font-medium text-lg text-primary md:text-2xl mb-2 text-center md:text-left'>Hi, Welcome Back</h2>
                    <h2 className='font-extrabold text-3xl text-primary md:text-4xl mb-10 text-center md:text-left'>KriyaLogic!</h2>
                    <img src="/logo.png" alt="logo" className='w-32 h-32 md:w-72 md:h-72 mb-10' />
                </div>
                <div className='p-6 md:p-10 bg-white rounded-md w-full max-w-md md:w-auto shadow-lg md:shadow-none'>
                    <h2 className='font-bold text-2xl text-primary mb-10 text-center md:text-left'>Log In</h2>

                    {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className='flex flex-col gap-4 w-full md:w-96'>
                        <div className='flex flex-col gap-2 mb-4'>
                            <label htmlFor="email" className='font-medium text-primary'>Email</label>
                            <input 
                                type="email" 
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='Enter your email' 
                                className='w-full border border-primary p-2 rounded-md outline-none' 
                                required
                            />
                        </div>
                        <div className='flex flex-col gap-2 mb-4'>
                            <label htmlFor="password" className='font-medium text-primary'>Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='Enter your password' 
                                    className='w-full border border-primary p-2 rounded-md outline-none pr-10' 
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className='flex flex-row items-center gap-2 justify-between'>
                            <div className='flex flex-row items-center gap-2'>
                                <input type="checkbox" id="remember" className='w-4 h-4 border border-primary rounded-md outline-none' />
                                <label htmlFor="remember" className='font-medium text-primary'>Remember me</label>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className='bg-primary text-white px-4 py-2 rounded-md font-bold w-full cursor-pointer hover:bg-primary/80 transition-all disabled:bg-gray-400'
                        >
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    <p className='font-normal text-center text-primary mt-10'>Change your password ? <a href="/forgot-password" className='text-primary font-semibold'>Click Here!</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
