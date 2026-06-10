import { redirect } from "next/navigation";
import { API_URL } from "@/config/apiConfig";

type Props = { params: { id: string } };

const INVALID_QR_IDS = new Set(["", "undefined", "null"]);

export default async function QrRedirectPage({ params }: Props) {
  const safeId = params.id?.toString().trim();
  if (!safeId || INVALID_QR_IDS.has(safeId.toLowerCase())) {
    return redirect("/");
  }

  try {
    const response = await fetch(`${API_URL}/temples/${safeId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      // return redirect("/");
      return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
          <h2>QR Error: API Failed</h2>
          <p>Tried to fetch: {`${API_URL}/temples/${params.id}`}</p>
          <p>Status: {response.status}</p>
          <p>Please take a screenshot of this and send it to me!</p>
        </div>
      );
    }

    const json = await response.json();
    const temple = json?.data;
    if (!temple) {
      // return redirect("/");
      return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
          <h2>QR Error: No Temple Data</h2>
          <p>Response JSON: {JSON.stringify(json)}</p>
        </div>
      );
    }

    if (temple.urlType === "subdomain" && temple.subdomain) {
      return redirect(`https://${temple.subdomain}.devbhakti.com`);
    }

    const slug = temple.slug || temple.id;
    return redirect(`/temples/${slug}`);
  } catch (error: any) {
    console.error("QR redirect failed", error);
    // return redirect("/");
    return (
      <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <h2>QR Error: Exception Caught</h2>
        <p>API_URL used: {API_URL}</p>
        <p>Error message: {error?.message || String(error)}</p>
      </div>
    );
  }
}
