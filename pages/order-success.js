import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { orderAPI } from '../lib/api';
import { CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

export default function OrderSuccess() {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await orderAPI.getOrder(orderId);
      setOrder(res.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Đang tải...">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="animate-pulse">Đang tải...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Đặt hàng thành công - TechStore">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-600">
            Cảm ơn bạn đã đặt hàng. Chúng tôi đã gửi email xác nhận đơn hàng cho bạn.
          </p>
        </div>

        {order && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-bold mb-2">Mã đơn hàng: {order.orderNumber}</h2>
              <p className="text-sm text-gray-600">Ngày đặt: {formatDate(order.createdAt)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Thông tin giao hàng</h3>
                <p className="text-sm text-gray-700">
                  {order.shippingAddress.fullName}<br />
                  {order.shippingAddress.phone}<br />
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.province}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sản phẩm</h3>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.productName} - {item.variantName} x{item.quantity}</span>
                      <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}
                  {order.pointsDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Điểm thưởng:</span>
                      <span>-{formatCurrency(order.pointsDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thuế:</span>
                    <span>{formatCurrency(order.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span>{formatCurrency(order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary-600 pt-2 border-t">
                    <span>Tổng cộng:</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>

                {order.pointsEarned > 0 && (
                  <p className="text-sm text-green-600 mt-4">
                    🎉 Bạn đã nhận được {order.pointsEarned} điểm thưởng!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/orders" className="flex-1">
            <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700">
              Xem đơn hàng
            </button>
          </Link>
          <Link href="/products" className="flex-1">
            <button className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50">
              Tiếp tục mua sắm
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
