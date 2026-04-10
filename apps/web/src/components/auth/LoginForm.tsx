'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSchema, type LoginInput } from '@recipehub/shared';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error?.message ?? 'Login failed');
      return;
    }
    login(json.data.user);
    const redirect = searchParams.get('redirect') ?? '/';
    router.push(redirect);
    router.refresh();
  };

  const emailReg = register('email');
  const passwordReg = register('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          autoComplete="current-password"
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
        Log in
      </Button>
    </form>
  );
}
