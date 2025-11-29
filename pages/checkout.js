import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { checkoutAPI, discountAPI, userAPI } from '../lib/api';
import { useCartStore, useAuthStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';
import { CreditCard, Truck, Tag, Award } from 'lucide-react';

export default function Checkout() {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Shipping Info
  const [shippingForm, setShippingForm] = useState({
    fullName: user?.fullName || '',
    phone: '',
    street: '',
    city: '',
    province: '',
    country: 'Vietnam',
  });

  // Guest Info (for non-authenticated users)
  const [guestEmail, setGuestEmail] = useState('');

  // Payment & Discount
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [discountCode, setDiscountCode] = useState('');
  const [discountData, setDiscountData] = useState(null);
  const [pointsToUse, setPointsToUse] = useState(0);

  // Preview data
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (cart.items.length === 0) {
      router.push('/products');
    }
  }, [cart]);

  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultAddress = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setShippingForm({
        fullName: defaultAddress.fullName || user.fullName,
        phone: defaultAddress.phone || '',
        street: defaultAddress.street || '',
        city: defaultAddress.city || '',
        province: defaultAddress.province || '',
        country: defaultAddress.country || 'Vietnam',
      });
    }
  }, [user]);

  useEffect(() => {
    if (cart.items.length > 0) {
      fetchPreview();
    }
  }, [cart, discountCode, pointsToUse]);

  const fetchPreview = async () => {
    try {
      const res = await checkoutAPI.preview({
        cartItems: cart.items.map(item => ({
          productId: item.product._id,
          variantId: item.variantId,
          quantity: item.quantity
        })),
        discountCode,
        pointsToUse
      });
      setPreview(res.data.preview);
      if (res.data.preview.discountValid) {
        setDiscountData(res.data.preview);
      }
    } catch (error) {
      console.error('Error fetching preview:', error);
    }
  };

  const handleValidateDiscount = async () => {
    if (!discountCode) return;

    try {
      const res = await discountAPI.validate(discountCode, {
        subtotal: cart.totalAmount
      });

      if (res.data.valid) {
        toast.success('Mã giảm giá hợp lệ!');
        setDiscountData(res.data.discount);
      } else {
        toast.error(res.data.message);
        setDiscountData(null);
      }
    } catch (error) {
      toast.error('Mã giảm giá không hợp lệ');
      setDiscountData(null);
    }
  };

  const handleSubmitOrder = async () => {
    // Validate shipping info
    if (!shippingForm.fullName || !shippingForm.phone || !shippingForm.street || 
        !shippingForm.city || !shippingForm.province) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    // Validate guest email if not authenticated
    if (!isAuthenticated && !guestEmail) {
      toast.error('Vui lòng nhập email');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        cartItems: cart.items.map(item => ({
          productId: item.product._id,
          variantId: item.variantId,
          quantity: item.quantity
        })),
        shippingAddress: shippingForm,
        paymentMethod,
      };

      // Only add optional fields if they have values
      if (discountData && discountCode) {
        orderData.discountCode = discountCode;
      }
      
      if (pointsToUse > 0) {
        orderData.pointsToUse = pointsToUse;
      }

      // Add guest info only if not authenticated
      if (!isAuthenticated && guestEmail) {
        orderData.guestInfo = {
          email: guestEmail,
          fullName: shippingForm.fullName,
          phone: shippingForm.phone
        };
      }

      console.log('Sending checkout data:', orderData);
      console.log('isAuthenticated:', isAuthenticated);
      console.log('Token in localStorage:', localStorage.getItem('token'));

      const res = await checkoutAPI.checkout(orderData);

      // If guest, save token
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      toast.success('Đặt hàng thành công!');
      clearCart();
      router.push(`/order-success?orderId=${res.data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <Layout title="Thanh toán - TechStore">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s <= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`w-24 h-1 ${s < step ? 'bg-primary-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Info */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Truck className="mr-2 h-6 w-6 text-primary-600" />
                  Thông tin giao hàng
                </h2>

                {!isAuthenticated && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="your@email.com"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Chúng tôi sẽ tạo tài khoản cho bạn để theo dõi đơn hàng
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Họ và tên *</label>
                    <input
                      type="text"
                      value={shippingForm.fullName}
                      onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Số điện thoại *</label>
                    <input
                      type="tel"
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Địa chỉ *</label>
                    <input
                      type="text"
                      value={shippingForm.street}
                      onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Thành phố *</label>
                    <input
                      type="text"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tỉnh/Thành *</label>
                    <input
                      type="text"
                      value={shippingForm.province}
                      onChange={(e) => setShippingForm({ ...shippingForm, province: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="mt-6 w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700"
                >
                  Tiếp tục
                </button>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <CreditCard className="mr-2 h-6 w-6 text-primary-600" />
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">Chuyển khoản ngân hàng</p>
                      <p className="text-sm text-gray-500">Chuyển khoản trực tiếp</p>
                    </div>
                  </label>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700"
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Xác nhận đơn hàng</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Thông tin giao hàng</h3>
                    <p className="text-sm text-gray-700">
                      {shippingForm.fullName}<br />
                      {shippingForm.phone}<br />
                      {shippingForm.street}<br />
                      {shippingForm.city}, {shippingForm.province}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Phương thức thanh toán</h3>
                    <p className="text-sm text-gray-700">
                      {paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Đơn hàng của bạn</h2>

              {/* Products */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={`${item.product._id}-${item.variantId}`} className="flex gap-3">
                    <img
                      src={item.product.images?.[0]?.url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                      <p className="text-sm font-bold text-primary-600">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="mb-4 pb-4 border-b">
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Nhập mã"
                  />
                  <button
                    onClick={handleValidateDiscount}
                    className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                  >
                    Áp dụng
                  </button>
                </div>
                {discountData && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Giảm {formatCurrency(preview?.discountAmount || 0)}
                  </p>
                )}
              </div>

              {/* Loyalty Points */}
              {isAuthenticated && user && user.loyaltyPoints > 0 && (
                <div className="mb-4 pb-4 border-b">
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <Award className="mr-2 h-4 w-4" />
                    Điểm thưởng (Có: {user.loyaltyPoints})
                  </label>
                  <input
                    type="number"
                    value={pointsToUse}
                    onChange={(e) => setPointsToUse(Math.min(parseInt(e.target.value) || 0, user.loyaltyPoints))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Nhập số điểm"
                    max={user.loyaltyPoints}
                  />
                </div>
              )}

              {/* Summary */}
              {preview && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{formatCurrency(preview.subtotal)}</span>
                  </div>
                  
                  {preview.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(preview.discountAmount)}</span>
                    </div>
                  )}

                  {preview.pointsDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Điểm thưởng:</span>
                      <span>-{formatCurrency(preview.pointsDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Thuế VAT:</span>
                    <span className="font-medium">{formatCurrency(preview.taxAmount)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">
                      {preview.shippingFee === 0 ? 'Miễn phí' : formatCurrency(preview.shippingFee)}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-primary-600 pt-2 border-t">
                    <span>Tổng cộng:</span>
                    <span>{formatCurrency(preview.totalAmount)}</span>
                  </div>

                  {preview.pointsEarned > 0 && (
                    <p className="text-xs text-gray-600">
                      Bạn sẽ nhận được {preview.pointsEarned} điểm thưởng
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
