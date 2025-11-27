

"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle waitlist submission
    console.log("Email submitted:", email);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-black">
                <Image alt='jensi icon logo' src={'/jensi.svg'} width={150} height={100} unoptimized></Image>
              </span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-12">
              
            </div>

            {/* CTA Button */}
            <Link href="home">  
            <button className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all font-medium shadow-lg hover:shadow-xl hover:shadow-[#1a7faf]/20">
              See Assessment
            </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-6xl md:text-7xl font-bold text-black leading-tight">
                Karim's<br />
                Full Stack<br />
                Assessment.
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Jensi's AI turns conversations across inboxes, chats and meetings into tasks, assigns owners and updates timelines automatically — so your projects always stay on track without manual chasing.
              </p>
              <Link href="home">  
                <button className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg shadow-lg">
                  See Assessment
                </button>
              </Link>
            </div>

            {/* Right Content - Mock Dashboard */}
            <div className="relative">
              {/* Browser Window Frame */}
              <div className="bg-linear-to-br from-[#1a7faf] to-[#409dc4] rounded-3xl p-8 shadow-2xl transform rotate-3">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform -rotate-3">
                  {/* Browser Header */}
                  <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#1a7faf] rounded"></div>
                        <span className="text-sm font-semibold text-gray-700">jensi</span>
                      </div>
                    </div>
                    <div className="w-6"></div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-sm font-semibold text-gray-900">Try Jensi for free.</h3>
                      <p className="text-xs text-gray-600">Unlimited users, free forever.</p>
                    </div>

                    {/* Google Sign In Button */}
                    <button className="w-full border border-gray-300 rounded-lg py-3 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-gray-500">or</span>
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email address</label>
                        <input
                          type="email"
                          placeholder="jensi@example.com"
                          className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7faf] focus:border-transparent"
                        />
                      </div>

                      <button className="w-full bg-[#1a7faf] text-white rounded-lg py-3 px-4 font-medium hover:bg-[#409dc4] transition-colors">
                        Register
                      </button>

                      <div className="text-center">
                        <button className="text-xs text-[#1a7faf] hover:underline">
                          Register here
                        </button>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        Already have an account?{" "}
                        <button className="text-[#1a7faf] hover:underline font-medium">Login</button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Circle Element */}
              <div className="absolute -left-15 bottom-1 -translate-y-1/2 w-32 h-32 bg-linear-to-br from-[#1a7faf] to-[#409dc4] rounded-full flex items-center justify-center shadow-xl">
                <div className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
