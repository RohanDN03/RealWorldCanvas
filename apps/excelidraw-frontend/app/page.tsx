"use client";

import { Pencil, Share2, Sparkles, Users2, Github, ArrowRight, Zap, Shield, Palette, MousePointer2, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-neutral-950/80 sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-xl shadow-lg shadow-purple-500/25">
                <Pencil className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                DrawTogether
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-neutral-400 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-neutral-400 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-neutral-400 hover:text-white transition-colors">Testimonials</a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/signin">
                <button className="text-neutral-300 hover:text-white transition-colors font-medium">
                  Sign in
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8 backdrop-blur-sm transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-neutral-300">Now with real-time collaboration</span>
              <ArrowRight className="h-4 w-4 text-neutral-400" />
            </div>

            {/* Headline */}
            <h1 className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Where Ideas Come to
              <span className="block mt-2 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Life Together
              </span>
            </h1>

            {/* Subheadline */}
            <p className={`text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Create stunning diagrams, wireframes, and sketches with your team in real-time. 
              No complex tools, just pure creativity.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link href="/signup">
                <button className="group flex items-center gap-2 bg-white text-neutral-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-2xl hover:shadow-white/20 hover:scale-105">
                  Start Drawing — It&apos;s Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="flex items-center gap-2 text-neutral-300 hover:text-white px-8 py-4 rounded-xl font-medium transition-colors border border-white/10 hover:border-white/20 hover:bg-white/5">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 text-neutral-400 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex -space-x-3">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-neutral-950 flex items-center justify-center text-xs font-bold text-white">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-white font-semibold">2,500+</span> teams already drawing together
              </div>
            </div>
          </div>

          {/* Hero Image/Preview */}
          <div className={`mt-20 relative transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-2xl border border-white/10 p-2 backdrop-blur-sm">
              <div className="bg-neutral-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                      <MousePointer2 className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-pink-500/20 flex items-center justify-center">
                      <Pencil className="h-8 w-8 text-pink-400" />
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                      <Share2 className="h-8 w-8 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-neutral-500 text-lg">Interactive Canvas Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to
              <span className="text-purple-400"> create together</span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Powerful features that make collaboration effortless and creation enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users2,
                title: "Real-time Collaboration",
                description: "See your teammates' cursors and edits as they happen. Work together seamlessly.",
                color: "purple"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Built for speed. No lag, no waiting. Your ideas flow as fast as you think.",
                color: "yellow"
              },
              {
                icon: Shield,
                title: "Secure by Default",
                description: "Your data is encrypted and protected. Share with confidence.",
                color: "green"
              },
              {
                icon: Palette,
                title: "Beautiful Tools",
                description: "Professional drawing tools that are intuitive and delightful to use.",
                color: "pink"
              },
              {
                icon: Share2,
                title: "Easy Sharing",
                description: "Share your work with a simple link. No accounts required for viewers.",
                color: "blue"
              },
              {
                icon: Sparkles,
                title: "Smart Shapes",
                description: "Intelligent shape recognition turns rough sketches into perfect diagrams.",
                color: "orange"
              }
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.07]">
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-32 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Start for free, upgrade when you need more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-neutral-400 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {["3 active canvases", "Basic shapes & tools", "Share with link", "7-day history"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <Check className="h-5 w-5 text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <button className="w-full py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition">
                  Get Started
                </button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-purple-500/20 to-pink-500/20 border border-purple-500/30 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-6">$12<span className="text-lg text-neutral-400 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {["Unlimited canvases", "All tools & shapes", "Team collaboration", "30-day history", "Export to PNG/SVG", "Priority support"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-200">
                    <Check className="h-5 w-5 text-purple-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition shadow-lg shadow-purple-500/25">
                  Start Free Trial
                </button>
              </Link>
            </div>

            {/* Team Plan */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold mb-2">Team</h3>
              <div className="text-4xl font-bold mb-6">$29<span className="text-lg text-neutral-400 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {["Everything in Pro", "Unlimited team members", "Admin controls", "SSO integration", "Unlimited history", "Custom branding"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-300">
                    <Check className="h-5 w-5 text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <button className="w-full py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition">
                  Contact Sales
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-12 md:p-20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to bring your ideas to life?
              </h2>
              <p className="text-white/80 text-lg mb-10">
                Join thousands of teams who are already creating amazing things together.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <button className="group flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-2xl hover:scale-105">
                    Start Creating Now
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                <Pencil className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold">DrawTogether</span>
            </div>
            <p className="text-neutral-500 text-sm">
              © 2024 DrawTogether. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;