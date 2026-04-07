"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import {
  Truck,
  Shield,
  Package,
  ArrowRight,
  Search,
  Star,
  ShoppingCart,
  Heart,
  Filter,
} from "lucide-react";

import CartDrawer from "@/components/marketplace/CartDrawer";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { fetchPublicProducts, fetchRatingsSettings } from "@/api/publicController";
import { fetchActiveCategoriesAdmin } from "@/api/adminController";
import { fetchUserFavorites, addFavorite, removeFavorite } from "@/api/userController";
import { BASE_URL } from "@/config/apiConfig";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalized } from "@/utils/localization";

interface Product {
  id: string;
  name?: string;
  name_en?: string;
  name_hi?: string;
  name_mr?: string;
  description?: string;
  description_en?: string;
  description_hi?: string;
  description_mr?: string;
  category?: string;
  category_en?: string;
  status: string;
  image: string | null;
  templeId?: string | null;
  categoryId?: string | null;
  highlights?: string | null;
  longDescription?: string | null;
  shippingInfo?: string | null;
  origin?: string | null;
  rating?: number | null;
  sellerId?: string | null;
  temple?: {
    name?: string;
    name_en?: string;
  } | null;
  seller?: {
    name: string;
  } | null;
  variants: Array<{
    id: string;
    name?: string;
    name_en?: string;
    name_hi?: string;
    name_mr?: string;
    price: number;
    stock: number;
  }>;
}

interface Category {
  id: string;
  name?: string;
  name_en?: string;
  name_hi?: string;
  name_mr?: string;
  description?: string | null;
  description_en?: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: {
    products: number;
  };
}

export default function MarketplaceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const { cartItems, addToCart: addToCartGlobal, updateQuantity, removeFromCart } = useCart();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRatings, setShowRatings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const productsPerPage = 10;

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCategories();
    loadProducts(1);
    loadFavorites();
    loadRatingsSettings();
  }, [searchQuery, selectedCategory, showAllProducts]);

  const loadRatingsSettings = async () => {
    try {
      const data = await fetchRatingsSettings();
      if (data && data.settings) {
        setShowRatings(data.settings.product.home);
      }
    } catch (error) {
      console.error("Error loading ratings settings:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchActiveCategoriesAdmin();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await fetchUserFavorites();
      if (res.success && res.data) {
        const productIds = res.data
          .filter((f: any) => f.productId)
          .map((f: any) => f.productId);
        setFavorites(productIds);
      }
    } catch (error) {
      console.error("Error loading favorites", error);
    }
  };

  const loadProducts = async (page = 1, limit = showAllProducts ? undefined : productsPerPage) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {
        search: searchQuery || undefined,
        page: showAllProducts ? undefined : page,
        limit,
      };

      if (selectedCategory !== "All") {
        const category = categories.find(c => c.id === selectedCategory);
        if (category) {
          params.category = getLocalized(category, 'name', 'en');
        }
      }

      const response = await fetchPublicProducts(params);
      setProducts(response.products || response);
      setTotalProducts(response.total || response.length || 0);
      
      if (!showAllProducts) {
        const totalPagesCount = Math.ceil((response.total || response.length || 0) / productsPerPage);
        setTotalPages(totalPagesCount);
      } else {
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error("Error loading products:", err);
      setError(err.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesPrice = product.variants.some(v =>
      v.price >= priceRange[0] && v.price <= priceRange[1]
    );
    return matchesPrice;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadProducts(page);
  };

  const handleShowAllToggle = () => {
    setShowAllProducts(!showAllProducts);
    setCurrentPage(1);
  };

  const getLevenshteinDistance = (a: string, b: string): number => {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const suggestion = React.useMemo(() => {
    if (searchQuery.length < 2 || filteredProducts.length > 0) return null;
    let minDistance = Infinity;
    let bestMatch = "";
    products.forEach(product => {
      const productName = (getLocalized(product, 'name', language) || "");
      const distance = getLevenshteinDistance(searchQuery.toLowerCase(), productName.toLowerCase());
      if (distance < minDistance && distance < 4) {
        minDistance = distance;
        bestMatch = productName;
      }
    });
    return bestMatch;
  }, [searchQuery, filteredProducts, products]);

  const toggleFavorite = async (id: string) => {
    const isFav = favorites.includes(id);
    setFavorites((prev) => isFav ? prev.filter((f) => f !== id) : [...prev, id]);
    try {
            if (isFav) {
                await removeFavorite({ productId: id });
                toast({ title: t('marketplace.cart.removed'), variant: "destructive" });
            } else {
                await addFavorite({ productId: id });
                toast({ title: t('marketplace.cart.added'), variant: "success" });
            }
        } catch (error) {
            setFavorites((prev) => isFav ? [...prev, id] : prev.filter((f) => f !== id));
            toast({ title: t('marketplace.cart.failed'), variant: "destructive" });
        }
  };

  const addToCart = (product: Product) => {
    const variant = product.variants[0];
    if (!variant) return;
    addToCartGlobal({
      productId: product.id,
      variantId: variant.id,
      name: getLocalized(product, 'name', language),
      variantName: getLocalized(variant, 'name', language),
      price: variant.price,
        image: product.image || "",
        quantity: 1,
        templeId: product.templeId,
    });
    toast({ 
        title: t('marketplace.cart.added'), 
        description: `${getLocalized(product, 'name', language)} ${t('marketplace.cart.added')}`,
        variant: "success"
    });
    setCartOpen(true);
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString()}`;

  const getPriceRange = (product: Product) => {
    if (product.variants.length === 0) return formatPrice(0);
    const prices = product.variants.map(v => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative min-h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/sacred_marketplace_hero_bg.png" alt="Sacred Marketplace" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        </div>
        <div className="container mx-auto px-4 pt-28 pb-12 relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-foreground mb-6">
            {t('marketplace.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-slate-800 mb-10">
            {t('marketplace.subtitle')}
          </motion.p>
          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-[#794A05]/10">
              <Search className="absolute left-5 h-5 w-5 text-[#794A05]/50" />
              <input 
                type="text" 
                placeholder={t('marketplace.search_placeholder')} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-14 pr-32 py-5 text-lg outline-none bg-transparent" 
              />
              <Button className="absolute right-2 h-12 px-8 rounded-xl bg-[#794A05] text-white font-bold">
                {t('marketplace.explore')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 space-y-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Filter className="h-4 w-4" /> 
                    {t('marketplace.filters')}
                </h3>
                <div className="space-y-1.5">
                  <button 
                    onClick={() => setSelectedCategory("All")} 
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${selectedCategory === "All" ? "bg-[#794A05] text-white" : "text-slate-600 hover:bg-[#794A05]/5"}`}
                  >
                    {t('marketplace.all_products')}
                  </button>
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${selectedCategory === cat.id ? "bg-[#794A05] text-white" : "text-slate-600 hover:bg-[#794A05]/5"}`}>{getLocalized(cat, 'name', language)}</button>
                  ))}
                  {totalProducts > 10 && (
                    <div className="pt-3 border-t border-border/50">
                      <button
                        onClick={handleShowAllToggle}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${showAllProducts ? "bg-[#794A05] text-white" : "text-slate-600 hover:bg-[#794A05]/5"}`}
                      >
                        {showAllProducts ? t('marketplace.show_paginated') : t('marketplace.show_all_products')}
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 text-foreground">
              <div>
                <p>
                  {t('marketplace.showing')} 
                  <span className="font-semibold">{showAllProducts ? totalProducts : filteredProducts.length}</span> 
                  {t('marketplace.products')}
                  {!showAllProducts && totalPages > 1 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      {t('marketplace.page_info', { current: currentPage, total: totalPages })}
                    </span>
                  )}
                </p>
              </div>
              <Button variant="outline" className="gap-2" onClick={() => setCartOpen(true)}>
                <ShoppingCart className="h-4 w-4" /> 
                {t('navbar.my_cart')} ({cartItems.length})
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden border-border/50 hover:shadow-xl transition-all duration-300">
                  <Link href={`/marketplace/product/${product.id}`}>
                    <div className="relative aspect-[5/4] overflow-hidden bg-muted">
                      {product.image ? <img src={`${BASE_URL}${product.image}`} alt={getLocalized(product, 'name', language)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-muted-foreground" /></div>}
                      <Button variant="secondary" size="icon" className="absolute top-3 right-3 rounded-full transition-opacity" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id); }}><Heart className={`h-4 w-4 ${favorites.includes(product.id) ? "fill-red-500 text-red-500" : ""}`} /></Button>
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-[#2a1b01] mb-1 line-clamp-1 truncate block"><Link href={`/marketplace/product/${product.id}`}>{getLocalized(product, 'name', language)}</Link></h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-bold text-[#794A05]">{getPriceRange(product)}</span>
                      <Button size="sm" onClick={() => addToCart(product)} className="bg-[#794A05] text-white rounded-full">
                        {t('marketplace.add_to_cart')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {!showAllProducts && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2"
                >
                  {t('marketplace.previous')}
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-10 h-10 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2"
                >
                  {t('marketplace.next')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} items={cartItems} onUpdateQuantity={updateQuantity} onRemoveItem={removeFromCart} onCheckout={() => { setCartOpen(false); router.push("/marketplace/checkout"); }} />
    </div>
  );
}
