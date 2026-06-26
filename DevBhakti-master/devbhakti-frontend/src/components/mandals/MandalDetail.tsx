"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Calendar,
  Heart,
  Video,
  IndianRupee,
  Share2,
  Phone,
  Mail,
  Users,
  Award,
  Building2,
  Sparkles,
  Gift,
  ArrowLeft,
  Clock,
  CheckCircle,
  ExternalLink,

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { API_URL } from "@/config/apiConfig";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalized } from "@/utils/localization";
import { stripHtml } from "@/utils/textUtils";

export function MandalDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [mandal, setMandal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'events' | 'gallery'>('about');
  const { language, t } = useLanguage();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (slug) {
      loadMandal();
    }
  }, [slug]);

  const loadMandal = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/mandals/${slug}`);
      const data = await response.json();
      if (data.success) {
        setMandal(data.data);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load mandal",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading mandal:", error);
      toast({
        title: "Error",
        description: "Failed to load mandal details",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const getFullImageUrl = (path: string) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith('http')) return path;
    return `${API_URL.replace('/api', '')}${path}`;
  };

  const handleDonate = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please select or enter a valid donation amount",
        variant: "destructive",
      });
      return;
    }

    setIsDonating(true);
    try {
      const response = await fetch(`${API_URL}/public/donations/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandalId: mandal.id,
          amount,
          donorName: isAnonymous ? "Anonymous" : donorName,
          donorEmail,
          donorPhone,
          message: donationMessage,
          anonymous: isAnonymous,
        }),
      });
      const data = await response.json();
      if (data.success && data.data.orderId) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amount * 100,
          currency: "INR",
          name: mandal.name?.en || "Mandal",
          description: `Donation to ${mandal.name?.en || "Mandal"}`,
          order_id: data.data.orderId,
          handler: function (response: any) {
            toast({
              title: "Donation Successful! 🙏",
              description: "Thank you for your generous contribution.",
            });
            setShowDonateModal(false);
            loadMandal();
          },
          prefill: {
            name: donorName,
            email: donorEmail,
            contact: donorPhone,
          },
          theme: {
            color: "#8B5CF6",
          },
        };
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to initiate payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Donation error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setIsDonating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!mandal) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-serif text-foreground mb-2">Mandal Not Found</h2>
          <p className="text-muted-foreground mb-4">The mandal you're looking for doesn't exist.</p>
         
        </div>
        <Footer />
      </div>
    );
  }

  const name = getLocalized(mandal, 'name') || "Mandal";
  const description = getLocalized(mandal, 'description') || "";
  const donationAmounts = [500, 1000, 2500, 5000, 10000];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-24">
        <Button
          variant="ghost"
          className="mb-4 gap-2 hover:bg-primary/10"
          onClick={() => router.push("/mandals")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mandals
        </Button>
      </div>

      {/* Modern Hero Section */}
      <section className="relative overflow-hidden rounded-2xl mx-4 md:mx-8">
        {/* Background Image with Parallax Effect */}
        <div className="relative h-[400px] md:h-[500px] lg:h-[550px] overflow-hidden">
          <img
            src={getFullImageUrl(mandal.bannerImages?.[0] || mandal.image)}
            alt={name}
            className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
            onError={(e) => {
              (e.target as any).src = "https://via.placeholder.com/1200x600?text=Mandal+Banner";
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          
          {/* Live Badge - Top */}
          {mandal.isLive && (
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-red-500 text-white animate-pulse px-4 py-2 text-sm shadow-lg shadow-red-500/30">
                <span className="relative flex h-3 w-3 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                LIVE NOW
              </Badge>
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
            <div className="container mx-auto">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-primary/80 text-white border-none backdrop-blur-sm px-3 py-1">
                  {mandal.mandalType || "Mandal"}
                </Badge>
                {mandal.presiding_deity && (
                  <Badge variant="outline" className="border-white/30 text-white backdrop-blur-sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {mandal.presiding_deity}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-serif mb-2">
                {name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {[mandal.city, mandal.state].filter(Boolean).join(", ")}
                </span>
                {mandal.festivals && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {mandal.festivals.split(",").slice(0, 2).join(", ")}
                  </span>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 mt-5">
                <Button
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/30 text-white px-8 py-6 text-base gap-2"
                  onClick={() => setShowDonateModal(true)}
                >
                  <Gift className="w-5 h-5" />
                  Donate Now
                </Button>

                {mandal.isLive && mandal.liveUrl && (
                  <Button
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white px-8 py-6 text-base gap-2"
                    onClick={() => window.open(mandal.liveUrl, "_blank")}
                  >
                    <Video className="w-5 h-5 text-red-400" />
                    Watch Live Darshan
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white px-6 py-6 text-base gap-2"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: name,
                        text: description,
                        url: window.location.href,
                      });
                    }
                  }}
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </Button>

                <Button
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white px-6 py-6 text-base gap-2"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  {isLiked ? "Liked" : "Like"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      {/* <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow border-primary/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                ₹{mandal.totalDonations?.toLocaleString() || "0"}
              </div>
              <p className="text-sm text-muted-foreground">Total Donations</p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow border-primary/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {mandal.totalEvents || "0"}
              </div>
              <p className="text-sm text-muted-foreground">Total Events</p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow border-primary/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {mandal.totalDonors || "0"}
              </div>
              <p className="text-sm text-muted-foreground">Total Donors</p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow border-primary/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {mandal.totalStaff || "0"}
              </div>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </CardContent>
          </Card>
        </div>
      </section> */}

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger value="about" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  About
                </TabsTrigger>
                <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Events
                </TabsTrigger>
                <TabsTrigger value="gallery" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Gallery
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4 mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      About Mandal
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {description || "No description available."}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {mandal.presiding_deity && (
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Presiding Deity
                          </h4>
                          <p className="text-lg font-medium mt-1">{mandal.presiding_deity}</p>
                        </div>
                      )}
                      
                      {mandal.festivals && (
                        <div className="p-4 bg-secondary/5 rounded-lg">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-secondary" />
                            Festivals
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {mandal.festivals.split(",").map((festival: string, i: number) => (
                              <Badge key={i} variant="secondary">
                                {festival.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Upcoming Events
                    </h2>
                    {mandal.events && mandal.events.length > 0 ? (
                      <div className="space-y-4">
                        {mandal.events.map((event: any) => (
                          <div key={event.id} className="p-4 border rounded-lg hover:border-primary transition-colors hover:shadow-md">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{event.title}</h3>
                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(event.startDate).toLocaleDateString()}
                                  </span>
                                  {event.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {event.location}
                                    </span>
                                  )}
                                  {event.status && (
                                    <Badge variant={event.status === "UPCOMING" ? "default" : "secondary"}>
                                      {event.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="gap-1">
                                Register
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No upcoming events</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      Gallery
                    </h2>
                    {mandal.bannerImages && mandal.bannerImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {mandal.bannerImages.map((image: string, index: number) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden border group cursor-pointer">
                            <img
                              src={getFullImageUrl(image)}
                              alt={`${name} - ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as any).src = "https://via.placeholder.com/300x300?text=Photo";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No images available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - 1/3 */}
          <div className="space-y-6">
            {/* Donation Card */}
            <Card className="sticky top-24 shadow-lg border-primary/10">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">Support This Mandal</h3>
                  <p className="text-sm text-muted-foreground">Your contribution matters</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {donationAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      className="w-full"
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount("");
                      }}
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>
                <div className="mb-4">
                  <input
                    type="number"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/30"
                  onClick={() => setShowDonateModal(true)}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Donate Now
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  💚 100% of donations go to the mandal
                </p>
              </CardContent>
            </Card>

            {/* Live Darshan Card */}
            {mandal.isLive && mandal.liveUrl && (
              <Card className="border-red-500/20 shadow-lg shadow-red-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="relative">
                      <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    </div>
                    <h3 className="font-bold text-red-500">Live Darshan</h3>
                    <Badge className="bg-red-500 text-white ml-auto animate-pulse">LIVE</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Watch the live stream of this mandal's activities
                  </p>
                  <Button
                    className="w-full bg-red-500 hover:bg-red-600 text-white gap-2"
                    onClick={() => window.open(mandal.liveUrl, "_blank")}
                  >
                    <Video className="w-4 h-4" />
                    Watch Now
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-3 text-sm">
                  {mandal.contactNumber && (
                    <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${mandal.contactNumber}`} className="hover:text-primary">
                        {mandal.contactNumber}
                      </a>
                    </div>
                  )}
                  {mandal.email && (
                    <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${mandal.email}`} className="hover:text-primary">
                        {mandal.email}
                      </a>
                    </div>
                  )}
                  {mandal.presidentName && (
                    <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>President: <span className="font-medium">{mandal.presidentName}</span></span>
                    </div>
                  )}
                  {mandal.address && (
                    <div className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span>{mandal.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mandal Type Info */}
            {mandal.mandalType && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Mandal Type
                  </h3>
                  <Badge className="text-lg py-1 px-3">{mandal.mandalType}</Badge>
                  {mandal.registrationNumber && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Reg. No: {mandal.registrationNumber}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <Footer />

      {/* Donation Modal */}
      <Dialog open={showDonateModal} onOpenChange={setShowDonateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <span className="text-3xl block mb-2">🙏</span>
              Donate to {name}
            </DialogTitle>
            <DialogDescription className="text-center">
              Support this mandal's activities and events
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Select Amount (₹)</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {donationAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? "default" : "outline"}
                    className="w-full"
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount("");
                    }}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
              <div className="mt-2">
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Your Details</label>
              <div className="space-y-2 mt-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isAnonymous}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  placeholder="Message (Optional)"
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => {
                  setIsAnonymous(e.target.checked);
                  if (e.target.checked) setDonorName("");
                }}
              />
              <label htmlFor="anonymous" className="text-sm">Donate Anonymously</label>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              onClick={handleDonate}
              disabled={isDonating}
            >
              {isDonating ? "Processing..." : `Donate ₹${selectedAmount || customAmount || "..."}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}