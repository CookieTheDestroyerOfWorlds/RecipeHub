'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerSchema, type RegisterInput } from '@recipehub/shared';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error?.message ?? 'Registration failed');
      return;
    }
    login(json.data.user);
    router.push('/');
    router.refresh();
  };

  const usernameReg = register('username');
  const emailReg = register('email');
  const passwordReg = register('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Username</label>
        <input
          autoComplete="username"
          placeholder="e.g. chefmario"
          className={`input ${errors.username ? 'border-red-500' : ''}`}
          name={usernameReg.name}
          ref={usernameReg.ref}
          onChange={usernameReg.onChange}
          onBlur={usernameReg.onBlur}
        />
        {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
      </div>
      <div>
        <label className="label">Email</label>
        <input
          type="email"
          autoComplete="email"
          className={`input ${errors.email ? 'border-red-500' : ''}`}
          name={emailReg.name}
          ref={emailReg.ref}
          onChange={emailReg.onChange}
          onBlur={emailReg.onBlur}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label className="label">Password</label>
        <input
          type="password"
          autoComplete="new-password"
          className={`input ${errors.password ? 'border-red-500' : ''}`}
          name={passwordReg.name}
          ref={passwordReg.ref}
          onChange={passwordReg.onChange}
          onBlur={passwordReg.onBlur}
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      <Button type="submit" loading={isSubmitting} className="w-full">
        Create account
      </Button>
    </form>
  );
}
