import React, { Suspense } from "react";
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
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PoojaDetailClient id={slug} />
        </Suspense>
    );
};

export default PoojaDetailPage;
