"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Truck, Package, Clock, Globe, ShieldCheck, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import shippingImage from "@/assets/temple-somnath.jpg";

export default function ShippingPolicyPage() {
    const { t, tRaw } = useLanguage();
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const clauses = [
        {
            title: "1. Order Processing",
            content: "Orders for physical goods are processed once payment is confirmed. Processing time may vary based on:",
            points: [
                "Product type",
                "Vendor/temple dispatch timelines",
                "Seasonal or festival demand surges"
            ],
            extra: "All timelines provided at checkout are indicative and not guaranteed."
        },
        {
            title: "2. Delivery",
            content: "DevBhakti may facilitate shipping through third-party logistics partners, vendor dispatch, or temple dispatch. DevBhakti is not responsible for delays caused by:",
            points: [
                "Courier disruptions",
                "Incorrect address or contact details provided by the user",
                "Weather, natural events, or force majeure",
                "Regional logistical constraints"
            ]
        },
        {
            title: "3. Shipping Charges",
            content: "Shipping charges, if applicable, will be displayed at checkout and are based on:",
            points: [
                "Delivery location",
                "Weight and size of products",
                "Third-party logistics pricing"
            ],
            extra: "Additional shipping charges may apply for re-delivery in the event of failed delivery due to user errors."
        },
        {
            title: "4. No Returns & No Exchanges",
            content: "Due to the religious, customized, and perishable nature of devotional products (including prasad and ritual items):",
            points: [
                "All sales are final",
                "Products cannot be returned or exchanged once ordered"
            ],
            highlight: true
        },
        {
            title: "5. Damaged or Incorrect Items",
            content: "If a product is damaged in transit or is incorrect:",
            points: [
                "The user must notify us at support@devbhakti.in within 48 hours of delivery",
                "Users should provide photographic evidence",
                "DevBhakti will coordinate with the shipping partner/vendor for verification"
            ],
            extra: "Replacement or resolution is at DevBhakti’s discretion following verification."
        },
        {
            title: "6. Limitation of Liability",
            content: "DevBhakti’s liability for delivery issues is limited to:",
            points: [
                "The transaction value paid for the item"
            ],
            secondaryContent: "DevBhakti shall not be liable for:",
            secondaryPoints: [
                "Indirect or consequential loss",
                "Emotional or sentimental claims",
                "Any incidental expenses arising from delivery issues"
            ]
        },
        {
            title: "7. Force Majeure",
            content: "DevBhakti shall not be liable for delays or failures in delivery resulting from events or causes beyond reasonable control, including but not limited to:",
            points: [
                "Natural disasters",
                "Government restrictions or lockdowns",
                "Courier company strikes",
                "Pandemic or epidemic conditions",
                "Acts of God"
            ],
            extra: "In such cases, delivery timelines may be extended without liability."
        },
        {
            title: "8. Legal Jurisdiction",
            content: "This policy is governed by Indian law, and any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.",
            icon: MapPin
        }
    ];

    const localizedClauses = tRaw('shipping_policy.clauses') || [];
    const clausesMap = clauses.map((c, idx) => ({
        ...c,
        ...localizedClauses[idx]
    }));

    return (
        // FIX 1: 'wordBreak' ko 'break-word' kar diya hai taaki long words break hon.
        <main className="min-h-screen bg-background overflow-x-hidden" style={{ wordBreak: 'break-word' }}>
            <Navbar />

            {/* Hero Header */}
            <section className="relative min-h-[480px] flex items-center justify-center overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0">
                    <Image
                        src={shippingImage}
                        alt="Shipping Policy"
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 pt-28 pb-12 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="inline-flex p-3 sm:p-4 bg-primary/10 backdrop-blur-md rounded-xl sm:rounded-2xl text-primary mb-6 border border-primary/20">
                            <Truck className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-4 text-foreground leading-tight">
                            {t('shipping_policy.title')}
                        </h1>
                        <p className="text-sm font-bold text-primary mb-8 uppercase tracking-widest">
                            {t('shipping_policy.effective_date')}
                        </p>
                        <div className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
                            <p>
                                {t('shipping_policy.intro')}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Clauses Section */}
            <section className="py-16 sm:py-20 container mx-auto px-4 sm:px-6">
                <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                    {clausesMap.map((clause, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className={`p-6 sm:p-8 lg:p-10 rounded-xl sm:rounded-[2.5rem] border shadow-soft transition-all overflow-hidden ${clause.highlight
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-white border-border hover:shadow-warm'
                                }`}
                        >
                            <h3 className={`text-lg sm:text-xl lg:text-2xl font-serif font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 ${clause.highlight ? 'text-primary' : 'text-foreground'} break-words leading-snug py-1`}>
                                {clause.icon && <clause.icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />}
                                <span className="break-words">{clause.title}</span>
                            </h3>

                            <p className="text-base sm:text-lg text-foreground/80 leading-relaxed mb-3 sm:mb-4 break-words">{clause.content}</p>

                            {clause.points && (
                                <ul className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                                    {clause.points.map((point, pIdx) => (
                                        <li key={pIdx} className="flex items-start gap-2 sm:gap-3 text-foreground/80">
                                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/60 mt-1.5 sm:mt-2 flex-shrink-0" />
                                            <span className="text-sm sm:text-base break-words leading-tight">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {clause.secondaryContent && (
                                <>
                                    <p className="text-base sm:text-lg text-foreground/80 leading-relaxed mb-3 sm:mb-4 mt-4 sm:mt-6 break-words">{clause.secondaryContent || clause.secondary_content}</p>
                                    {(clause.secondaryPoints || clause.secondary_points) && (
                                        <ul className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                                            {(clause.secondaryPoints || clause.secondary_points).map((point: string, pIdx: number) => (
                                                <li key={pIdx} className="flex items-start gap-2 sm:gap-3 text-foreground/80">
                                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/60 mt-1.5 sm:mt-2 flex-shrink-0" />
                                                    <span className="text-sm sm:text-base break-words leading-tight">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )}

                            {clause.extra && (
                                <p className="text-sm sm:text-base text-muted-foreground italic border-l-2 sm:border-l-4 border-secondary/30 pl-3 sm:pl-4 py-1 mt-3 sm:mt-4 break-words leading-tight">
                                    {clause.extra}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}