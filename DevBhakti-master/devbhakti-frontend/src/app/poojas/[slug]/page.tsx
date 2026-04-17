import React from "react";
import { poojas } from "@/data/poojas";
import PoojaDetailClient from "./PoojaDetailClient";

export function generateStaticParams() {
    return poojas.map((pooja) => ({
        slug: pooja.id, // Or use slug if available in static data
    }));
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

const PoojaDetailPage = async ({ params }: PageProps) => {
    const { slug } = await params;
    return <PoojaDetailClient id={slug} />;
};

export default PoojaDetailPage;
