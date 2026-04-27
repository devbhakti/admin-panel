"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mail, Phone, MapPin, MessageSquare, Clock, Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { submitContactForm } from "@/api/publicController";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import contactImage from "@/assets/temple-somnath.jpg";

export default function ContactClient() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        subject: "",
        message: ""
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const missingFields: string[] = [];

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
            missingFields.push(t('contact.form.name'));
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
            missingFields.push(t('contact.form.email'));
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = "Invalid email format";
            missingFields.push(t('contact.form.email') + " (Invalid)");
        }
        if (!formData.mobile.trim()) {
            newErrors.mobile = "Mobile number is required";
            missingFields.push("Mobile Number");
        } else if (formData.mobile.length !== 10) {
            newErrors.mobile = "Mobile number must be exactly 10 digits";
            missingFields.push("Mobile Number (10 digits)");
        }
        if (!formData.subject.trim()) {
            newErrors.subject = "Subject is required";
            missingFields.push(t('contact.form.subject'));
        }
        if (!formData.message.trim()) {
            newErrors.message = "Message is required";
            missingFields.push(t('contact.form.message'));
        }

        setErrors(newErrors);
        return { valid: Object.keys(newErrors).length === 0, missingFields };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Specific logic for mobile number: only digits and max 10 characters
        if (name === "mobile") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: digitsOnly }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { valid, missingFields } = validate();
        if (!valid) {
            toast({
                description: `Please fill required fields: ${missingFields.join(", ")}`,
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await submitContactForm(formData);
            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message || "Thank you! Your message has been sent.",
                    variant: "success"
                });
                setFormData({
                    name: "",
                    email: "",
                    mobile: "",
                    subject: "",
                    message: ""
                });
            } else {
                toast({
                    description: result.error || "Failed to send message. Please try again.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Header */}
            <section className="relative min-h-[480px] flex items-center justify-center overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0">
                    <Image
                        src={contactImage}
                        alt="Contact DevBhakti"
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
                </div>

                <div className="container mx-auto px-4 pt-28 pb-12 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mb-6"
                    >
                        <div className="p-4 bg-primary/10 backdrop-blur-md rounded-2xl">
                            <MessageSquare className="w-12 h-12 text-primary" />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-6 text-foreground leading-tight"
                    >
                        {t('contact.title')}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed space-y-4"
                    >
                        <p>
                            {t('contact.subtitle.p1')}<br />
                            <span className="font-bold text-foreground">{t('contact.subtitle.company')}</span><br />
                            {t('contact.subtitle.p2')}
                        </p>
                        <p>
                            {t('contact.subtitle.p3')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Grid */}
            <section className="py-20 container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-card p-10 rounded-[2.5rem] border border-border/50 shadow-soft text-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold mb-2 text-foreground">{t('contact.cards.support.title')}</h3>
                        <p className="text-lg font-bold text-primary mb-4">support@devbhakti.in</p>
                        <p className="text-muted-foreground">{t('contact.cards.support.description')}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-card p-10 rounded-[2.5rem] border border-border/50 shadow-soft text-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold mb-2 text-foreground">{t('contact.cards.grievance.title')}</h3>
                        <p className="text-lg font-bold text-primary mb-2">{t('contact.cards.grievance.name')}</p>
                        <p className="text-sm font-medium text-muted-foreground mb-4">grievance.officer@devbhakti.in</p>
                        <p className="text-xs text-muted-foreground italic">{t('contact.cards.grievance.rules')}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-card p-10 rounded-[2.5rem] border border-border/50 shadow-soft text-center md:col-span-2 lg:col-span-1"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                            <Send className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold mb-2 text-foreground">{t('contact.cards.partnerships.title')}</h3>
                        <p className="text-lg font-bold text-primary mb-4">sales@devbhakti.in</p>
                        <p className="text-muted-foreground">{t('contact.cards.partnerships.description')}</p>
                    </motion.div>
                </div>  

                {/* Inquiry Form */}
                <motion.div
                    {...fadeIn}
                    className="max-w-4xl mx-auto bg-white p-6 sm:p-8 lg:p-12 rounded-[2rem] sm:rounded-[3rem] border border-border shadow-elevated overflow-hidden"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-serif font-bold mb-4 text-primary">{t('contact.form.title')}</h2>
                        <p className="text-lg text-muted-foreground">{t('contact.form.subtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                            <div className="space-y-1 sm:space-y-2">
                                <label className="text-xs sm:text-sm font-semibold text-foreground/70 ml-1 break-words leading-tight">{t('contact.form.name')}</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t('contact.form.placeholder_name')} 
                                    className={`w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl lg:rounded-2xl bg-secondary/5 border ${errors.name ? 'border-red-500' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs sm:text-sm lg:text-base overflow-hidden`} 
                                />
                                {errors.name && <p className="text-xs text-red-500 ml-1 break-words leading-tight">{errors.name}</p>}
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                                <label className="text-xs sm:text-sm font-semibold text-foreground/70 ml-1 break-words leading-tight">{t('contact.form.email')}</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t('contact.form.placeholder_email')} 
                                    className={`w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl lg:rounded-2xl bg-secondary/5 border ${errors.email ? 'border-red-500' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs sm:text-sm lg:text-base overflow-hidden`} 
                                />
                                {errors.email && <p className="text-xs text-red-500 ml-1 break-words leading-tight">{errors.email}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                            <div className="space-y-1 sm:space-y-2">
                                <label className="text-xs sm:text-sm font-semibold text-foreground/70 ml-1 break-words leading-tight">{t('contact.form.mobile')}</label>
                                <input 
                                    type="tel" 
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    maxLength={10}
                                    placeholder={t('contact.form.placeholder_mobile')} 
                                    className={`w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl lg:rounded-2xl bg-secondary/5 border ${errors.mobile ? 'border-red-500' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs sm:text-sm lg:text-base overflow-hidden`} 
                                />
                                {errors.mobile && <p className="text-xs text-red-500 ml-1 break-words leading-tight">{errors.mobile}</p>}
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                                <label className="text-xs sm:text-sm font-semibold text-foreground/70 ml-1 break-words leading-tight">{t('contact.form.subject')}</label>
                                <input 
                                    type="text" 
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder={t('contact.form.placeholder_subject')} 
                                    className={`w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl lg:rounded-2xl bg-secondary/5 border ${errors.subject ? 'border-red-500' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs sm:text-sm lg:text-base overflow-hidden`} 
                                />
                                {errors.subject && <p className="text-xs text-red-500 ml-1 break-words leading-tight">{errors.subject}</p>}
                            </div>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                            <label className="text-xs sm:text-sm font-semibold text-foreground/70 ml-1 break-words leading-tight">{t('contact.form.message')}</label>
                            <textarea 
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={5} 
                                placeholder={t('contact.form.placeholder_message')} 
                                className={`w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl lg:rounded-2xl bg-secondary/5 border ${errors.message ? 'border-red-500' : 'border-border'} focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-xs sm:text-sm lg:text-base overflow-hidden`}
                            ></textarea>
                            {errors.message && <p className="text-xs text-red-500 ml-1 break-words leading-tight">{errors.message}</p>}
                        </div>
                        <button 
                            disabled={isSubmitting}
                            className="w-full bg-primary text-white py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold text-xs sm:text-sm lg:text-base hover:shadow-glow transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-70 break-words leading-tight"
                        >
                            {isSubmitting ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 animate-spin" /> : <Send className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
                            <span className="break-words">{isSubmitting ? "Sending..." : t('contact.form.submit')}</span>
                        </button>
                    </form>
                </motion.div>
            </section>

            <Footer />
        </main>
    );
}
