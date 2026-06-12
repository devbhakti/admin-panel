import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { API_URL } from "@/config/apiConfig";

type Props = { params: Promise<{ id: string }> };

const INVALID_QR_IDS = new Set(["", "undefined", "null"]);

export default async function QrRedirectPage({ params }: Props) {
  const { id } = await params;
  const safeId = id?.toString().trim();
  console.log(`[QR] Request for id: "${safeId}", API_URL: ${API_URL}`);

  if (!safeId || INVALID_QR_IDS.has(safeId.toLowerCase())) {
    console.log(`[QR] Invalid ID, redirecting to /`);
    return redirect("/");
  }

  try {
    const fetchUrl = `${API_URL}/temples/${safeId}`;
    console.log(`[QR] Fetching: ${fetchUrl}`);
    const response = await fetch(fetchUrl, {
      cache: "no-store",
    });
    console.log(`[QR] API response status: ${response.status}`);

    // if (!response.ok) {
    //   // return redirect("/");
    //   return (
    //     <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
    //       <h2>QR Error: API Failed</h2>
    //       <p>Tried to fetch: {`${API_URL}/temples/${params.id}`}</p>
    //       <p>Status: {response.status}</p>
    //       <p>Please take a screenshot of this and send it to me!</p>
    //     </div>
    //   );
    // }
if (!response.ok) {
  console.log(`[QR] API Failed - Status: ${response.status}. Falling back to /temples/${safeId}`);
  return redirect(`/temples/${safeId}`);
}
    const json = await response.json();
    const temple = json?.data;
    console.log(`[QR] Temple found: ${temple ? temple.id : 'NULL'}, urlType: ${temple?.urlType}`);
    // if (!temple) {
    //   // return redirect("/");
    //   return (
    //     <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
    //       <h2>QR Error: No Temple Data</h2>
    //       <p>Response JSON: {JSON.stringify(json)}</p>
    //     </div>
    //   );
    // }
if (!temple) {
  console.log(`[QR] No temple data, JSON: ${JSON.stringify(json)}. Falling back to /temples/${safeId}`);
  return redirect(`/temples/${safeId}`);
}
    if (temple.urlType === "subdomain" && temple.subdomain) {
      const headersList = await headers();
      const host = headersList.get("host") || "devbhakti.in";
      const hostname = host.split(":")[0];
      const port = host.split(":")[1] ? `:${host.split(":")[1]}` : "";

      // Check if hostname is an IP address (e.g. 72.61.237.172)
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

      if (isIpAddress) {
        // IP addresses don't support subdomains, fallback to path-based URL
        const slug = temple.slug || temple.id;
        return redirect(`/temples/${slug}`);
      }

      const isLocal = hostname === 'localhost' || 
                      hostname === '127.0.0.1' || 
                      hostname.endsWith('.lvh.me') || 
                      hostname.endsWith('.localhost');

      if (isLocal) {
        return redirect(`http://${temple.subdomain}.lvh.me${port}`);
      }

      // Production base domain extraction
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
      return redirect(`https://${temple.subdomain}.${baseDomain}${port}`);
    }

    const slug = temple.slug || temple.id;
    console.log(`[QR] Redirecting to /temples/${slug}`);
    return redirect(`/temples/${slug}`);
   } catch (error: any) {
  console.error("QR redirect failed", error);
  console.log(`[QR] Catch error. Falling back to /temples/${safeId}`);
  return redirect(`/temples/${safeId}`);
}
  //catch (error: any) {
  //   console.error("QR redirect failed", error);
  //   // return redirect("/");
  //   return (
  //     <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
  //       <h2>QR Error: Exception Caught</h2>
  //       <p>API_URL used: {API_URL}</p>
  //       <p>Error message: {error?.message || String(error)}</p>
  //     </div>
  //   );
  // }
  
}
