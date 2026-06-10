import { redirect } from "next/navigation";
import { API_URL } from "@/config/apiConfig";

type Props = { params: { id: string } };

export default async function QrRedirectPage({ params }: Props) {
  try {
    const response = await fetch(`${API_URL}/temples/${params.id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return redirect("/");
    }

    const json = await response.json();
    const temple = json?.data;
    if (!temple) {
      return redirect("/");
    }

    if (temple.urlType === "subdomain" && temple.subdomain) {
      return redirect(`https://${temple.subdomain}.devbhakti.com`);
    }

    const slug = temple.slug || temple.id;
    return redirect(`/temples/${slug}`);
  } catch (error) {
    console.error("QR redirect failed", error);
    return redirect("/");
  }
}
