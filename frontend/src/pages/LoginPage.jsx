import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };


  return (
    <div className='min-h-screen grid lg:grid-cols-2'>
      {/* Left side */}
      <div className='flex flex-col justify-center items-center p-6 sm:p-12'>
        <div className='w-full max-w-md space-y-8'>
          {/* LOGO */}
          <div className='text-center mb-8'>
            <div className='flex flex-col items-center gap-2 group'>
              <div className='size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                <MessageSquare className='size-6 text-primary' />
              </div>
              <h1 className='text-2xl font-bold mt-2'>Login</h1>
              <p className='text-base-content/60'>Get started with your free account</p>
            </div>
          </div>
          {/* FORM */}
          <form onSubmit={handleSubmit} className='space-y-6'>

            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Email</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <Mail className='size-5 text-base-content opacity-40' />
                </div>
                <input type="email" className='input input-bordered w-full pl-10' placeholder='you@example.com' value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>

            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Password</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <Lock className='size-5 text-base-content/40' />
                </div>
                <input type={showPassword ? "text" : "password"} className='input input-bordered w-full pl-10' placeholder='.......' value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                <button type='button' className='absolute inset-y-0 right-0 pr-3 flex items-center' onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <Eye className='size-5 text-base-content/40' /> : <EyeOff className='size-5 text-base-content/40' />}
                </button>
              </div>
            </div>
            <button type='submit' className='btn btn-primary w-full' disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className='size-5 animate-spin' />
                  Loading...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* Right side */}
      <div className='hidden lg:flex bg-base-200 justify-center items-center'>
        <div className='space-y-6 w-full]'>
          <div className="w-full h-[800px] overflow-hidden rounded-xl">
            <img
              src="chat.png"
              alt="Chat illustration"
              className="w-full h-full object-cover"
            />
          </div>
          <div className='space-y-2'>
            <h1 className='w-full text-center text-3xl font-bold font-sans'>
              Welcome to Our Community
            </h1>
            <p className='w-full text-center text-lg text-gray-600'>
              A place where conversations flow, friendships grow, and staying connected feels effortless.
            </p>
          </div>
        </div>
      </div>


    </div>
  )
}

export default LoginPage