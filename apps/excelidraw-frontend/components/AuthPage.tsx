"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { HTTP_BACKEND } from "@/config";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            if (isSignin) {
                const resp = await fetch(`${HTTP_BACKEND}/signin`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: email, password })
                });
                if (!resp.ok) {
                    const body = await resp.json().catch(() => ({}));
                    alert(body.message || "Sign in failed");
                    setLoading(false);
                    return;
                }
                const data = await resp.json();
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    window.location.href = "/dashboard";
                } else {
                    alert("No token returned from server");
                }
            } else {
                const resp = await fetch(`${HTTP_BACKEND}/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: email, password, name })
                });
                if (!resp.ok) {
                    const body = await resp.json().catch(() => ({}));
                    alert(body.message || "Sign up failed");
                    setLoading(false);
                    return;
                }
                // Signup succeeded. Auto sign-in and redirect to dashboard
                try {
                    const signinResp = await fetch(`${HTTP_BACKEND}/signin`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username: email, password })
                    });
                    if (!signinResp.ok) {
                        const b = await signinResp.json().catch(() => ({}));
                        alert(b.message || "Auto signin failed after signup");
                        setLoading(false);
                        return;
                    }
                    const signinData = await signinResp.json();
                    const token = signinData.token;
                    if (!token) {
                        alert("Signin did not return a token");
                        setLoading(false);
                        return;
                    }
                    localStorage.setItem("token", token);
                    window.location.href = "/dashboard";
                } catch (e) {
                    console.error(e);
                    alert("Signup succeeded but auto-signin failed. Please sign in manually.");
                    window.location.href = "/signin";
                }
            }
        } catch (e) {
            console.error(e);
            alert("Network error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500" />
                
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                            <Pencil className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold">DrawTogether</span>
                    </Link>
                    
                    {/* Main Content */}
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold mb-6">
                            {isSignin 
                                ? "Welcome back, creator!" 
                                : "Start your creative journey"}
                        </h1>
                        <p className="text-white/80 text-lg leading-relaxed">
                            {isSignin 
                                ? "We've missed you! Sign in to continue collaborating with your team and bring your ideas to life."
                                : "Join thousands of teams who use DrawTogether to brainstorm, design, and create amazing things together."}
                        </p>
                        
                        {/* Features */}
                        <div className="mt-12 space-y-4">
                            {[
                                "Real-time collaboration",
                                "Unlimited canvases",
                                "Export to PNG & SVG"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                        <Sparkles className="w-3 h-3" />
                                    </div>
                                    <span className="text-white/90">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <p className="text-white/60 text-sm">
                        © 2024 DrawTogether. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-xl">
                            <Pencil className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">DrawTogether</span>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {isSignin ? "Sign in" : "Create account"}
                        </h2>
                        <p className="text-neutral-400">
                            {isSignin 
                                ? "Enter your credentials to access your account" 
                                : "Fill in your details to get started"}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isSignin && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-neutral-900 text-white rounded-xl pl-12 pr-4 py-3.5 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors placeholder:text-neutral-600"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-neutral-900 text-white rounded-xl pl-12 pr-4 py-3.5 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors placeholder:text-neutral-600"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-neutral-300">
                                    Password
                                </label>
                                {isSignin && (
                                    <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                        Forgot password?
                                    </a>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-neutral-900 text-white rounded-xl pl-12 pr-12 py-3.5 border border-neutral-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors placeholder:text-neutral-600"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isSignin ? "Sign in" : "Create account"}
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-8 text-center text-neutral-400">
                        {isSignin ? (
                            <>
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                                    Sign up for free
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <Link href="/signin" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                                    Sign in
                                </Link>
                            </>
                        )}
                    </p>

                    {/* Terms */}
                    {!isSignin && (
                        <p className="mt-6 text-center text-neutral-500 text-sm">
                            By creating an account, you agree to our{" "}
                            <a href="#" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</a>
                            {" "}and{" "}
                            <a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}