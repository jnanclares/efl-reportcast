// Helper functions for localStorage-based authentication

import { supabase } from './supabaseClient';

const USERS_KEY = 'users';

// Get all users from localStorage
export function getUsers() {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

// Save all users to localStorage
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Register a new user with Supabase Auth and update profile data if possible
export async function registerUser({ firstName, lastName, email, password }) {
  // Sign up with email and password
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    return { success: false, message: error.message };
  }
  // If user is null, confirmation email was sent
  if (!user) {
    // Save first and last name in pending_profiles
    const { error: pendingError } = await supabase.from('pending_profiles').upsert({
      email,
      first_name: firstName,
      last_name: lastName
    });
    if (pendingError) {
      return { success: false, message: pendingError.message };
    }
    return { success: true, message: 'Registration successful. Please check your email to confirm your account.' };
  }
  // If user exists, update the profile with first and last name
  const { error: profileError } = await supabase.from('profiles').update({
    first_name: firstName,
    last_name: lastName
  }).eq('id', user.id);
  if (profileError) {
    return { success: false, message: profileError.message };
  }
  return { success: true };
}

// Login user with Supabase Auth
export async function loginUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true, user: data.user };
}

// Update user profile (first_name, last_name) by user id
export async function updateUserProfile(userId, firstName, lastName) {
  const { error } = await supabase.from('profiles').update({
    first_name: firstName,
    last_name: lastName
  }).eq('id', userId);
  return !error;
}

// Get logged-in user (from Supabase session)
export function getLoggedInUser() {
  const session = supabase.auth.getSession();
  if (session && session.user) {
    return session.user;
  }
  return null;
}

// Fetch user profile from 'profiles' table by user id
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .eq('id', userId)
    .single();
  if (error) {
    return null;
  }
  return data;
}

// Logout
export async function logoutUser() {
  await supabase.auth.signOut();
} 