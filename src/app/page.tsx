"use client";

import { Heart, Shield, MapPin, Sparkles, MessageCircle, PawPrint } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/i18n/LanguageProvider";

export default function Home() {
  const dict = useTranslation()

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/20 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full absolute top-0 z-50 p-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
          <PawPrint className="text-primary w-8 h-8" />
          <span className="text-gradient">PetMatch</span>
        </div>
        <div className="flex gap-2 md:gap-4 items-center">
          <Link href="/auth/login" className="px-4 md:px-6 py-2 text-sm md:text-base rounded-full font-medium transition-colors hover:bg-white/5 whitespace-nowrap">
            {dict.common.login}
          </Link>
          <Link href="/auth/signup" className="px-4 md:px-6 py-2 text-sm md:text-base rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-[0_0_20px_rgba(230,57,70,0.4)] transition-all whitespace-nowrap">
            {dict.common.signup}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border border-white/10 text-sm font-medium text-white/80">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>{dict.landing.subtitle}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            {dict.landing.titlePart1} <span className="text-gradient">{dict.landing.titleGradient}</span><br />
            {dict.landing.titlePart2}
          </h1>

          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl leading-relaxed">
            {dict.landing.description}
          </p>

          <Link href="/auth/signup" className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(230,57,70,0.5)] transition-all flex items-center gap-2">
            {dict.landing.cta} <Heart className="w-5 h-5 fill-current" />
          </Link>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full"
        >
          {[
            {
              icon: MapPin,
              title: dict.landing.features.local.title,
              description: dict.landing.features.local.desc,
              color: "text-blue-400"
            },
            {
              icon: MessageCircle,
              title: dict.landing.features.chat.title,
              description: dict.landing.features.chat.desc,
              color: "text-green-400"
            },
            {
              icon: Shield,
              title: dict.landing.features.safe.title,
              description: dict.landing.features.safe.desc,
              color: "text-purple-400"
            }
          ].map((feature, i) => (
            <div key={i} className="glass p-6 rounded-3xl flex flex-col items-center text-center hover:bg-white/10 transition-colors cursor-default">
              <div className={`p-4 rounded-2xl bg-white/5 mb-4 ${feature.color}`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/50 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
