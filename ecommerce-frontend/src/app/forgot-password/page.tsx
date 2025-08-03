"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { authAPI } from "@/components/services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      toast.success("If an account with that email exists, a reset link has been sent.");
      setSent(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent">
      <div className="w-full max-w-md bg-white/80 rounded-lg shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Forgot Password</h2>
        {sent ? (
          <div className="text-green-600 text-center font-semibold">Check your email for a reset link.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-white font-bold rounded hover:bg-primary-dark transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 