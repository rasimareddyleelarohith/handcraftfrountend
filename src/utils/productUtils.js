import { products as sampleProducts } from '../data/products';

export const fallbackProductImage = sampleProducts[0]?.image || '';

export const normalizeProduct = (product = {}) => ({
  ...product,
  id: product.id,
  name: product.name || product.productname || '',
  productname: product.productname || product.name || '',
  category: product.category || '',
  artisan: product.artisan || 'Your Artisan Studio',
  stock: Number(product.stock ?? product.quantity ?? 0),
  quantity: Number(product.quantity ?? product.stock ?? 0),
  price: Number(product.price ?? 0),
  image: product.image || fallbackProductImage,
  description: product.description || '',
  culturalNotes: product.culturalNotes || 'Updated by artisan dashboard',
  rating: Number(product.rating ?? 0)
});
