// src/app/qr/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_URL } from "@/config/apiConfig";

const INVALID_QR_IDS = new Set(["", "undefined", "null"]);

// App configuration
const APP_CONFIG = {
  scheme: 'devbhakti://',
  androidPackage: 'com.devbhakti.app',
  iosBundleId: 'com.devbhakti.app',
  deepLinkPath: 'temples',
};

export default function QrRedirectPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [templeData, setTempleData] = useState<any>(null);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    const id = params.id?.toString().trim();
    
    if (!id || INVALID_QR_IDS.has(id.toLowerCase())) {
      console.log('[QR] Invalid ID, redirecting to /');
      window.location.href = '/';
      return;
    }

    const fetchTempleAndRedirect = async () => {
      try {
        const fetchUrl = `${API_URL}/temples/${id}`;
        console.log(`[QR] Fetching: ${fetchUrl}`);
        
        const response = await fetch(fetchUrl, { cache: "no-store" });
        
        if (!response.ok) {
          console.log(`[QR] API Failed - Status: ${response.status}`);
          window.location.href = `/temples/${id}`;
          return;
        }
        
        const json = await response.json();
        const temple = json?.data;
        
        if (!temple) {
          console.log('[QR] No temple data found');
          window.location.href = `/temples/${id}`;
          return;
        }
        
        setTempleData(temple);
        setLoading(false);
        
        // Build web URL
        const webUrl = buildWebUrl(temple);
        
        // Try to open app
        attemptAppRedirect(webUrl, temple);
        
      } catch (error: any) {
        console.error('QR redirect failed', error);
        window.location.href = `/temples/${id}`;
      }
    };

    fetchTempleAndRedirect();
  }, [params.id]);

  const buildWebUrl = (temple: any): string => {
    if (temple.urlType === "subdomain" && temple.subdomain) {
      const host = window.location.host;
      const hostname = host.split(':')[0];
      const port = host.includes(':') ? `:${host.split(':')[1]}` : '';
      
      const isLocal = hostname === 'localhost' || 
                      hostname === '127.0.0.1' || 
                      hostname.endsWith('.lvh.me') || 
                      hostname.endsWith('.localhost');
      
      if (isLocal) {
        return `http://${temple.subdomain}.lvh.me${port}`;
      } else {
        let baseDomain = "devbhakti.in";
        if (hostname.endsWith("devbhakti.in")) {
          baseDomain = "devbhakti.in";
        } else if (hostname.endsWith("devbhakti.com")) {
          baseDomain = "devbhakti.com";
        } else {
          const parts = hostname.split('.');
          if (parts.length >= 2) {
            baseDomain = parts.slice(-2).join('.');
          }
        }
        return `https://${temple.subdomain}.${baseDomain}${port}`;
      }
    } else {
      const slug = temple.slug || temple.id;
      return `${window.location.origin}/temples/${slug}`;
    }
  };

  const attemptAppRedirect = (webUrl: string, temple: any) => {
    if (redirectAttempted) return;
    setRedirectAttempted(true);

    const slug = temple.slug || temple.id;
    
    // App deep link: devbhakti://temples/[slug]
    const appDeepLink = `${APP_CONFIG.scheme}${APP_CONFIG.deepLinkPath}/${slug}`;
    const androidIntent = `intent://${APP_CONFIG.deepLinkPath}/${slug}#Intent;package=${APP_CONFIG.androidPackage};scheme=devbhakti;end`;

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isMobile = isAndroid || isIOS;

    // Desktop users → web directly
    if (!isMobile) {
      console.log('[QR] Desktop user, redirecting to web');
      window.location.href = webUrl;
      return;
    }

    console.log(`[QR] Mobile user, attempting to open app: ${appDeepLink}`);
    
    let appOpened = false;
    let fallbackTimer: NodeJS.Timeout;

    // Try to open app
    const tryOpenApp = () => {
      if (isIOS) {
        // iOS: Try iframe first
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = appDeepLink;
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          window.location.href = appDeepLink;
        }, 100);
        
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
        
      } else if (isAndroid) {
        // Android: Try intent first
        const intentLink = document.createElement('a');
        intentLink.href = androidIntent;
        intentLink.style.display = 'none';
        document.body.appendChild(intentLink);
        intentLink.click();
        
        setTimeout(() => {
          window.location.href = appDeepLink;
        }, 300);
        
        setTimeout(() => {
          if (document.body.contains(intentLink)) {
            document.body.removeChild(intentLink);
          }
        }, 2000);
      } else {
        window.location.href = appDeepLink;
      }
    };

    // Detect if app opened (browser goes to background)
    const visibilityHandler = () => {
      if (document.hidden) {
        appOpened = true;
        clearTimeout(fallbackTimer);
        document.removeEventListener('visibilitychange', visibilityHandler);
        console.log('[QR] App opened successfully');
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    const blurHandler = () => {
      setTimeout(() => {
        if (document.hidden) {
          appOpened = true;
          clearTimeout(fallbackTimer);
          window.removeEventListener('blur', blurHandler);
          console.log('[QR] App opened successfully (blur)');
        }
      }, 500);
    };
    window.addEventListener('blur', blurHandler);

    // Try to open app
    tryOpenApp();

    // Fallback: If app doesn't open in 3 seconds, go to web
    const fallbackDelay = isAndroid ? 4000 : 3000;
    fallbackTimer = setTimeout(() => {
      if (!appOpened) {
        console.log('[QR] App did not open, redirecting to web');
        window.location.href = webUrl;
      }
    }, fallbackDelay);
  };

  const handleManualFallback = () => {
    if (templeData) {
      const webUrl = buildWebUrl(templeData);
      window.location.href = webUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center p-8 max-w-md bg-white rounded-2xl shadow-xl border border-orange-100">
          <div className="animate-pulse">
            <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Loading Temple...</h2>
          <p className="mt-2 text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  const templeName = templeData?.name?.en || templeData?.name || 'Temple';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="text-center p-8 max-w-md bg-white rounded-2xl shadow-xl border border-orange-100">
        <div className="animate-pulse">
          <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800">
          Opening {templeName}
        </h2>
        
        <p className="mt-2 text-gray-600">
          Redirecting to DevBhakti app...
        </p>
        
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          
          <button
            onClick={handleManualFallback}
            className="mt-4 text-orange-600 hover:text-orange-700 underline text-sm font-medium"
          >
            If the app doesn't open, click here to view on web
          </button>
        </div>
      </div>
    </div>
  );
}