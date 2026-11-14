// app/product/[slug]/page.jsx  (Server Component: no 'use client')
import { notFound } from 'next/navigation';
import ProductClient from './ProductClient'; // your current page file, renamed
import { getProductData } from '@/lib/products'; // see note below

// Rebuild this page in the background at most every 60s.
// First visitor after that gets the cached page instantly; the next one gets fresh data.
export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getProductData(slug);
  if (!data?.product) return {};
  return {
    title: data.product.name,
    description: data.product.description?.slice(0, 150),
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const data = await getProductData(slug);
  if (!data?.product) notFound();

  // key={slug}: navigating between products (e.g. from "You may also like")
  // resets the selected size/colour/qty instead of keeping the old product's state.
  return <ProductClient key={slug} initialData={data} />;
}