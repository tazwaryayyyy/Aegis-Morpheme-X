'use client'

import React from "react"
import { SplineScene } from "./components/ui/splite"
import { Card } from "./components/ui/card"
import { Spotlight } from "./components/ui/spotlight"
import { SpotlightHover } from "./components/ui/spotlight-hover"
import { ShaderAnimation } from "./components/ui/shader-animation"
import { ButtonColorful } from "./components/ui/button-colorful"
import { Button } from "./components/ui/button"


export default function ComponentShowcase() {
  return (
    <div className="container mx-auto py-20 px-6 space-y-20 bg-[#050508] min-h-screen text-white">
      <section className="text-center space-y-4">
        <h1 className="text-5xl font-bold font-display italic">ΛMX Component Showcase</h1>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Experimental UI library for the AegisMorpheme-X Protocol. 
          Integrating 3D runtime, custom shaders, and interactive lighting effects.
        </p>
      </section>

      {/* Spline & Spotlight basic demo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-mono uppercase tracking-widest text-[#00E5FF]">3D & Static Spotlight</h2>
        <Card className="w-full h-[600px] bg-black/[0.96] relative overflow-hidden border-[#ffffff10]">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="cyan"
          />
          
          <div className="flex h-full flex-col md:flex-row">
            {/* Left content */}
            <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
              <h3 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
                Interactive 3D
              </h3>
              <p className="mt-4 text-neutral-300 max-w-lg">
                Bring your UI to life with beautiful 3D scenes. Create immersive experiences 
                that capture attention and enhance your design.
              </p>
              <div className="mt-8">
                <ButtonColorful label="Launch Protocol" />
              </div>
            </div>

            {/* Right content */}
            <div className="flex-1 relative min-h-[300px]">
              <SplineScene 
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </Card>
      </section>

      {/* Interactive Spotlight Hover */}
      <section className="space-y-6">
        <h2 className="text-2xl font-mono uppercase tracking-widest text-[#FF6200]">Interactive Hover Spotlight</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 bg-zinc-900 border-[#ffffff10] relative overflow-hidden group">
            <SpotlightHover className="from-cyan-500/20 via-cyan-500/10 to-transparent" />
            <h4 className="text-xl font-bold mb-4 relative z-10">Meta-Sentinel Monitoring</h4>
            <p className="text-neutral-400 relative z-10">
              Hover over this card to see the context-aware spotlight effect. 
              Powered by framer-motion and spring physics for smooth tracking.
            </p>
          </Card>
          <Card className="p-8 bg-zinc-900 border-[#ffffff10] relative overflow-hidden group">
            <SpotlightHover className="from-orange-500/20 via-orange-500/10 to-transparent" />
            <h4 className="text-xl font-bold mb-4 relative z-10">Anomaly Detection</h4>
            <p className="text-neutral-400 relative z-10">
              Each component handles its own parent positioning and overflow management, 
              making them easy to drop into any layout.
            </p>
          </Card>
        </div>
      </section>

      {/* Shader Animation */}
      <section className="space-y-6">
        <h2 className="text-2xl font-mono uppercase tracking-widest text-[#C8FF00]">Three.js Shader Animation</h2>
        <div className="relative flex h-[650px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-[#ffffff10] bg-black">
          <ShaderAnimation/>
          <span className="absolute pointer-events-none z-10 text-center text-5xl md:text-7xl leading-none font-semibold tracking-tighter whitespace-pre-wrap text-white mix-blend-difference">
            Shader Animation
          </span>
        </div>
      </section>

      {/* Buttons Demo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-mono uppercase tracking-widest text-white">Interactive Elements</h2>
        <div className="flex flex-wrap gap-6 items-center">
          <ButtonColorful />
          <Button variant="outline" className="border-[#ffffff20] text-white hover:bg-white/10">Standard Outline</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="destructive">Emergency Shutdown</Button>
        </div>
      </section>
    </div>
  )
}
