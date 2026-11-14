// lib/products.js
// Shared by app/product/[slug]/page.jsx (server render) and app/api/products/[id]/route.js (GET).
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';

export function getFilter(id) {
  return mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
}

export async function getProductData(idOrSlug) {
  await dbConnect();

  // .lean() returns plain objects: much faster than full Mongoose documents
  const product = await Product.findOne({ ...getFilter(idOrSlug), isActive: true })
    .populate('category', 'name slug sizes type sizeChart')
    .lean();

  if (!product) return null;

  // Reviews and related products load in parallel instead of one after the other
  const [reviews, related] = await Promise.all([
    Review.find({ product: product._id, isApproved: true }).sort({ createdAt: -1 }).lean(),
    product.category?._id
      ? Product.find({
          category: product.category._id,
          _id: { $ne: product._id },
          isActive: true,
        })
          // sleeveOptions/zipOptions are needed so ProductCard can show "Choose options"
          .select('name slug basePrice variants rating sleeveOptions zipOptions')
          .limit(8)
          .lean()
      : [],
  ]);

  // Plain JSON only: ObjectIds and Dates can't cross the server -> client boundary
  return JSON.parse(JSON.stringify({ product, reviews, related }));
}

// Add these indexes in your schemas for fast lookups:
//   ProductSchema.index({ slug: 1 }, { unique: true });
//   ProductSchema.index({ category: 1, isActive: 1 });
//   ReviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });