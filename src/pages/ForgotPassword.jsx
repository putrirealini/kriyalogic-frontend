import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { forgotPassword, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await forgotPassword(email);
    setMessage(result.message);
    setIsSuccess(result.success);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="p-4 bg-[#F5F5F5F5]/90 w-full min-h-screen flex justify-center items-center relative">
      <img src="/vector-2.png" alt="logo" className='hidden md:block absolute bottom-0 right-0 w-full h-full z-0' />
      <div className='py-10 px-6 md:px-12 rounded-lg bg-white shadow-md relative z-10 w-full max-w-md md:max-w-none md:w-auto mx-4 md:mx-0'>
        <h2 className='font-bold text-2xl text-primary mb-10 text-center md:text-left'>Change Password</h2>

        {message && (
          <div className={`p-3 rounded mb-4 text-sm ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className='flex flex-col gap-4 w-full md:w-96'>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Enter your email' 
            className='w-full border border-primary p-2 rounded-md outline-none' 
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className='bg-primary text-white px-4 py-2 rounded-md font-bold w-full cursor-pointer hover:bg-primary/80 transition-all disabled:bg-gray-400'
          >
            {loading ? 'Sending...' : 'Send Change Password Link'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
