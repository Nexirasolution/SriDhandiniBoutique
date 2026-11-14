import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/apiAuth';
import { getFilter, getProductData } from '@/lib/products';

export async function GET(req, { params }) {
  // Same data function the product page uses (one place to maintain)
  const data = await getProductData(params.id);
  if (!data) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}

export const PUT = requireAdmin(async (req, { params }) => {
  await dbConnect();
  const body = await req.json();

  const current = await Product.findOne(getFilter(params.id)).select('_id category sku');
  if (!current) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // SKU is auto-managed and permanently locked after creation.
  delete body.sku;

  if (body.variants?.length) {
    body.basePrice = Math.min(...body.variants.map((v) => v.price));
  }

  const product = await Product.findOneAndUpdate(getFilter(params.id), body, { new: true });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // The product page is cached for up to 60s; this makes admin edits show up immediately
  revalidatePath(`/product/${product.slug}`);

  return NextResponse.json({ product });
});

export const DELETE = requireAdmin(async (req, { params }) => {
  await dbConnect();
  const deleted = await Product.findOneAndDelete(getFilter(params.id));
  if (deleted?.slug) revalidatePath(`/product/${deleted.slug}`);
  return NextResponse.json({ success: true });
});