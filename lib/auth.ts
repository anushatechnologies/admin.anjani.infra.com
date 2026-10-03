'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@anjaniinfra.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@anjani2026';
const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'anjani_infra_admin_secure_key_2026';

function signSession(email: string): string {
  const timestamp = Date.now();
  const raw = `${email}:${timestamp}`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(raw).digest('hex');
  return `session_${Buffer.from(raw).toString('base64')}_${signature}`;
}

function verifySession(token: string): { valid: boolean; email?: string } {
  try {
    if (!token || !token.startsWith('session_')) return { valid: false };
    const parts = token.split('_');
    if (parts.length < 3) return { valid: false };

    const raw = Buffer.from(parts[1], 'base64').toString('utf8');
    const signature = parts[2];

    const expected = crypto.createHmac('sha256', SECRET_KEY).update(raw).digest('hex');
    if (expected !== signature) return { valid: false };

    const [email, timeStr] = raw.split(':');
    const timestamp = parseInt(timeStr, 10);
    // 7 days expiration
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      return { valid: false };
    }

    return { valid: true, email };
  } catch {
    return { valid: false };
  }
}

export async function loginAdminServerAction(formData: { email: string; password: string }) {
  try {
    const email = (formData.email || '').trim().toLowerCase();
    const password = formData.password || '';

    if (!email || !password) {
      return { success: false, message: 'Please enter both email and password' };
    }

    let isValid = false;
    let userName = 'Administrator';

    // 1. Check against Environment / Default credentials
    const targetEmail = ADMIN_EMAIL.trim().toLowerCase();
    if ((email === targetEmail || email === 'admin') && password === ADMIN_PASSWORD) {
      isValid = true;
      userName = 'Super Administrator';
    }

    // 2. Fallback check against Supabase admin_users table if available
    if (!isValid) {
      try {
        const { data: dbUser, error } = await supabaseAdmin
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .single();

        if (!error && dbUser && dbUser.password_hash === password) {
          isValid = true;
          userName = dbUser.full_name || 'Administrator';
        }
      } catch (e) {
        // ignore db error and rely on env credentials
      }
    }

    if (!isValid) {
      return { success: false, message: 'Incorrect email or password. Please try again.' };
    }

    // Generate signed session token
    const token = signSession(email);

    // Set secure HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set('anjani_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return {
      success: true,
      user: {
        email,
        name: userName,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || 'Login failed' };
  }
}

export async function logoutAdminServerAction() {
  try {
    const cookieStore = cookies();
    cookieStore.delete('anjani_admin_session');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getAdminSessionServerAction() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('anjani_admin_session')?.value;
    if (!token) return { isAuthenticated: false };

    const { valid, email } = verifySession(token);
    if (!valid || !email) return { isAuthenticated: false };

    return {
      isAuthenticated: true,
      user: {
        email,
        name: 'Administrator',
      },
    };
  } catch {
    return { isAuthenticated: false };
  }
}
