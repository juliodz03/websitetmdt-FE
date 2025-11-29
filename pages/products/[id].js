import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { productAPI, cartAPI } from '../../lib/api';
import { useCartStore, useAuthStore } from '../../store/useStore';
import { formatCurrency } from '../../lib/utils';
import { Star, ShoppingCart, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSocket } from '../../lib/socket';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { setCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Review form
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', comment: '' });
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setReviewForm(prev => ({
        ...prev,
        name: user.fullName,
        email: user.email
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Socket listeners for real-time updates
    const socket = getSocket();

    socket.on('newComment', (data) => {
      if (data.productId === id) {
        setReviews(prev => [data.review, ...prev]);
        setProduct(prev => ({ ...prev, totalReviews: prev.totalReviews + 1 }));
      }
    });

    socket.on('newRating', (data) => {
      if (data.productId === id) {
        setProduct(prev => ({
          ...prev,
          averageRating: data.averageRating,
          totalRatings: data.totalRatings
        }));
      }
    });

    return () => {
      socket.off('newComment');
      socket.off('newRating');
    };
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await productAPI.getProduct(id);
      setProduct(res.data.product);
      setReviews(res.data.reviews || []);
      if (res.data.product.variants?.length > 0) {
        setSelectedVariant(res.data.product.variants[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Vui lòng chọn phiên bản sản phẩm');
      return;
    }

    try {
      const res = await cartAPI.updateCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity: quantity
      });

      setCart(res.data.cart);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!reviewForm.name || !reviewForm.email || !reviewForm.comment) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await productAPI.addReview(id, reviewForm);
      toast.success('Đánh giá của bạn đã được gửi');
      setReviewForm({ name: '', email: '', comment: '' });
    } catch (error) {
      toast.error('Không thể gửi đánh giá');
    }
  };

  const handleSubmitRating = async (rating) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }

    try {
      await productAPI.addRating(id, rating);
      setUserRating(rating);
      toast.success('Cảm ơn đánh giá của bạn!');
    } catch (error) {
      toast.error('Không thể gửi đánh giá');
    }
  };

  if (loading) {
    return (
      <Layout title="Đang tải...">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-96 rounded-lg" />
              <div className="space-y-4">
                <div className="bg-gray-200 h-8 w-3/4 rounded" />
                <div className="bg-gray-200 h-4 w-1/2 rounded" />
                <div className="bg-gray-200 h-32 rounded" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout title="Không tìm thấy sản phẩm">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${product.name} - TechStore`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images?.[activeImage]?.url || '/placeholder.png'}
                alt={product.name}
                className="w-full h-96 object-contain"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`border-2 rounded-lg overflow-hidden ${
                    activeImage === idx ? 'border-primary-600' : 'border-gray-200'
                  }`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <p className="text-sm text-gray-500 uppercase mb-2">{product.brand}</p>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.averageRating.toFixed(1)} ({product.totalRatings} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              {selectedVariant && (
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(selectedVariant.price)}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Mô tả:</h3>
              <p className="text-gray-700 whitespace-pre-line">{product.shortDescription}</p>
            </div>

            {/* Variant Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Chọn phiên bản:</h3>
              <div className="grid grid-cols-1 gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-3 border-2 rounded-lg text-left ${
                      selectedVariant?._id === variant._id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{variant.name}</p>
                        <p className="text-sm text-gray-500">
                          Kho: {variant.inventory} sản phẩm
                        </p>
                      </div>
                      <p className="font-bold text-primary-600">
                        {formatCurrency(variant.price)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Số lượng:</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-x py-2"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.inventory === 0}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Thêm vào giỏ hàng</span>
            </button>
          </div>
        </div>

        {/* Rating Section */}
        {isAuthenticated && (
          <div className="mb-12 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Đánh giá sản phẩm</h2>
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">Đánh giá của bạn:</span>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleSubmitRating(rating)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      rating <= userRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Đánh giá từ khách hàng</h2>

          {/* Review Form */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" />
              Viết đánh giá
            </h3>
            <form onSubmit={handleSubmitReview}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Họ tên"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={reviewForm.email}
                  onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <textarea
                placeholder="Nội dung đánh giá..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                Gửi đánh giá
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Chưa có đánh giá nào</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{review.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    {review.isGuest && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">Khách</span>
                    )}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
