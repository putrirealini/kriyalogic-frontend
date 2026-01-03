import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, loading } = useAuth();
  const { resettoken } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setMessage('Please fill in all fields');
      setIsSuccess(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsSuccess(false);
      return;
    }

    const result = await resetPassword(resettoken, password);
    setMessage(result.message);
    setIsSuccess(result.success);

    if (result.success) {
      toast.success(result.message);
      setTimeout(() => {
        navigate('/login'); // Changed to login for better flow
      }, 2000);
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
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter new password' 
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

          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder='Confirm new password' 
              className='w-full border border-primary p-2 rounded-md outline-none pr-10' 
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className='bg-primary text-white px-4 py-2 rounded-md font-bold w-full cursor-pointer hover:bg-primary/80 transition-all disabled:bg-gray-400'
          >
            {loading ? 'Changing...' : 'Change Password'}
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

export default ResetPassword;
