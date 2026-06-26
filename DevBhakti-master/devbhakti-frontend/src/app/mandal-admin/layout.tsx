"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    CreditCard,
    Heart,
    X,
    Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "@/assets/logo2.png";
import { cn } from "@/lib/utils";
import { clearAllTokens } from "@/lib/auth-utils";

const sidebarItems = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/mandal-admin",
    },
    {
        label: "Events",
        icon: Calendar,
        href: "/mandal-admin/events",
    },
    {
        label: "Donations",
        icon: Heart,
        href: "#",
        subItems: [
            { label: "💳 Online Donations", href: "/mandal-admin/donations?type=online" },
            { label: "📝 Offline Donations", href: "/mandal-admin/donations?type=offline" },
        ]
    },
    {
        label: "Earnings & Settlement",
        icon: CreditCard,
        href: "/mandal-admin/finance",
    },
    {
        label: "Profile & Live",
        icon: Settings,
        href: "/mandal-admin/profile",
    },
];

export default function MandalAdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setMobileDrawerOpen(false);
    }, [pathname]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (pathname === "/mandal-admin/login") {
            if (token && storedUser) {
                try {
                    const u = JSON.parse(storedUser);
                    if (u.role === "MANDAL") {
                        router.push("/mandal-admin");
                        setIsAuthenticated(true);
                        setUser(u);
                        return;
                    }
                } catch (e) {
                    console.error("Auth error", e);
                }
            }
            setIsAuthenticated(false);
            return;
        }

        if (!token || !storedUser) {
            setIsAuthenticated(false);
            router.push("/mandal-admin/login");
            return;
        }

        try {
            const u = JSON.parse(storedUser);
            if (u.role !== "MANDAL") {
                setIsAuthenticated(false);
                router.push("/mandal-admin/login");
                return;
            }
            setUser(u);
            setIsAuthenticated(true);
        } catch (e) {
            setIsAuthenticated(false);
            router.push("/mandal-admin/login");
        }
    }, [pathname, router]);

    const handleSignOut = () => {
        clearAllTokens();
        router.push("/mandal-admin/login");
    };

    if (pathname === "/mandal-admin/login") {
        return <>{children}</>;
    }

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-[#FDFCF6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-primary font-serif font-medium animate-pulse">Entering Mandal Portal...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated && pathname !== "/mandal-admin/login") {
        return null;
    }

    const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
        <div className="flex flex-col h-full bg-[#1e293b] text-white">
            {/* Logo */}
            <div className="flex items-center gap-3 h-16 md:h-20 px-4 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm shrink-0">
                {(sidebarOpen || isMobile) ? (
                    <div className="flex items-center gap-3 w-full">
                        <div className="bg-white h-10 w-10 md:h-12 md:w-12 rounded-xl shadow-md shrink-0 overflow-hidden flex items-center justify-center">
                            <div className="relative h-10 w-10 md:h-12 md:w-12">
                                <Image src={logo} alt="Logo" fill className="object-contain" priority />
                            </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[12px] font-black text-amber-400 uppercase tracking-wider leading-none">
                                Mandal Admin
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 truncate mt-1">
                                {user?.name || "Sacred Mandal"}
                            </span>
                        </div>
                        {isMobile && (
                            <button
                                onClick={() => setMobileDrawerOpen(false)}
                                className="ml-auto p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white h-12 w-12 rounded-xl shadow-md mx-auto overflow-hidden flex items-center justify-center mt-1">
                        <div className="relative h-12 w-12">
                            <Image src={logo} alt="Logo" fill className="object-contain" priority />
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const subItemActive = hasSubItems && item.subItems.some(sub => pathname === sub.href || pathname?.startsWith(sub.href + "/"));
                    const [openMenu, setOpenMenu] = React.useState(false);
                    
                    if (hasSubItems) {
                        return (
                            <div key={item.label}>
                                <button
                                    onClick={() => setOpenMenu(!openMenu)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                        subItemActive
                                            ? "bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5 flex-shrink-0", subItemActive ? "text-white" : "text-slate-400")} />
                                    {(sidebarOpen || isMobile) && (
                                        <>
                                            <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                                            <ChevronRight className={cn("w-4 h-4 transition-transform", openMenu && "rotate-90")} />
                                        </>
                                    )}
                                </button>
                                {(openMenu || subItemActive) && (sidebarOpen || isMobile) && (
                                    <div className="mt-1 ml-8 space-y-1">
                                        {item.subItems?.map((subItem) => {
                                            const subIsActive = pathname === subItem.href || pathname?.startsWith(subItem.href + "/");
                                            return (
                                                <Link
                                                    key={subItem.label}
                                                    href={subItem.href}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left",
                                                        subIsActive
                                                            ? "bg-amber-400/20 text-amber-300 font-semibold"
                                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                                    )}
                                                >
                                                    {subItem.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-slate-400")} />
                            {(sidebarOpen || isMobile) && (
                                <span className="font-medium text-sm">{item.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="p-3 border-t border-slate-700 shrink-0">
                <div className={cn("flex items-center gap-3 p-2", (sidebarOpen || isMobile) ? "" : "justify-center")}>
                    <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold text-sm shrink-0 border border-slate-600">
                        {(user?.name || "M").charAt(0)}
                    </div>
                    {(sidebarOpen || isMobile) && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.name || "Mandal Admin"}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                                {user?.phone || user?.email || ""}
                            </p>
                        </div>
                    )}
                </div>
                <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full mt-2 text-slate-300 hover:bg-slate-800 hover:text-white justify-start"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    {(sidebarOpen || isMobile) && <span>Sign Out</span>}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:flex flex-col transition-all duration-300",
                    sidebarOpen ? "md:w-64" : "md:w-20"
                )}
            >
                <SidebarContent isMobile={false} />
            </aside>

            {/* Mobile Drawer */}
            {mobileDrawerOpen && (
                <div
                    className="fixed inset-0 z-50 md:hidden animate-fade-in"
                    onClick={() => setMobileDrawerOpen(false)}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <aside
                        className="absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SidebarContent isMobile={true} />
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <div
                className={cn(
                    "flex-1 transition-all duration-300 min-w-0",
                    sidebarOpen ? "md:ml-64" : "md:ml-20"
                )}
            >
                {/* Header */}
                <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 w-full">
                    <div className="flex items-center gap-2 text-sm text-slate-500 min-w-0 flex-1">
                        <button
                            onClick={() => setMobileDrawerOpen(true)}
                            className="p-2 rounded-md hover:bg-slate-100 text-slate-700 md:hidden"
                            title="Open Menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-md hover:bg-slate-100 text-slate-700 hidden md:block"
                            title="Toggle Sidebar"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1 font-medium min-w-0">
                            <span className="text-slate-800 text-base font-semibold truncate capitalize">
                                {pathname?.split("/").filter(Boolean).slice(1).join(" / ") || "Dashboard"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild className="text-xs h-9">
                            <Link href="/mandals" target="_blank">View Site</Link>
                        </Button>
                    </div>
                </header>

                {/* Main Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
