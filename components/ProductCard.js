import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function ProductCard({ product }) {
  const minPrice = Math.min(...product.variants.map(v => v.price));
  const maxPrice = Math.max(...product.variants.map(v => v.price));

  return (
    <Link href={`/products/${product._id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img
            src={product.images?.[0]?.url || '/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {product.isFeatured && (
            <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
              Nổi bật
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Brand */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.brand}
          </p>

          {/* Title */}
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 h-12">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              ({product.totalRatings})
            </span>
          </div>

          {/* Price */}
          <div className="mb-3">
            {minPrice === maxPrice ? (
              <p className="text-lg font-bold text-primary-600">
                {formatCurrency(minPrice)}
              </p>
            ) : (
              <p className="text-lg font-bold text-primary-600">
                {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
              </p>
            )}
          </div>

          {/* Sold Count */}
          {product.soldCount > 0 && (
            <p className="text-xs text-gray-500">
              Đã bán: {product.soldCount}
            </p>
          )}
        </div>

        {/* Hover Action */}
        <div className="px-4 pb-4">
          <button className="w-full bg-primary-600 text-white py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Xem chi tiết</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
