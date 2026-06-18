"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useLanguage } from "@/context/LanguageContext"
import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import MandalRegistrationForm from "@/components/mandal/MandalRegistrationForm"
import Image from "next/image"
import heroTempleImage from "@/assets/hero-temple.jpg"
import Logo from "@/components/icons/Logo"
import FloatingRegisterButton from "@/components/landing/FloatingRegisterButton"

export default function RegisterMandalPage() {
    const { t } = useLanguage()
    const [showRegistrationModal, setShowRegistrationModal] = useState(false)
    const heroRef = useRef(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
    const y = useTransform(scrollYProgress, [0, 1], [0, 300])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col overflow-x-hidden">
            <Navbar variant="temple" />
            
            <main className="flex-grow relative z-10">
                <section ref={heroRef} className="relative w-full min-h-screen sm:min-h-[950px] overflow-hidden flex items-center justify-center">
                    <motion.div
                        style={{ y, opacity }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={heroTempleImage}
                            alt="Sacred mandal background"
                            fill
                            priority
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
                    </motion.div>

                    <div className="relative z-10 max-w-5xl mx-auto px-4 text-center mt-20">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="text-center"
                        >
                            <div className="flex justify-center mb-6">
                                <Logo size="xl" className="h-48 md:h-56 lg:h-64 w-auto pointer-events-none" />
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-extrabold tracking-wide mb-8 text-foreground">
                                <span className="text-[#88542B]">{t("registerMandal.page_title")}</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-black max-w-3xl mx-auto mb-12 leading-relaxed font-light font-sans">
                                {t("registerMandal.page_subtitle")}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Button
                                    size="lg"
                                    onClick={() => setShowRegistrationModal(true)}
                                    className="h-14 px-9 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm rounded-full font-bold transition-all transform hover:scale-105"
                                >
                                    {t("registerMandal.page_title")}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <FloatingRegisterButton 
                onClick={() => setShowRegistrationModal(true)} 
                label={t("registerMandal.page_title")}
            />

            {/* Registration Modal */}
            <AnimatePresence>
                {showRegistrationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRegistrationModal(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-4xl z-10"
                        >
                            <MandalRegistrationForm onClose={() => setShowRegistrationModal(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    )
}
