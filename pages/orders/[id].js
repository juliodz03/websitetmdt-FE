import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { orderAPI } from '../../lib/api';
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '../../lib/utils';
import { Package, Truck, CheckCircle } from 'lucide-react';

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await orderAPI.getOrder(id);
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
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="bg-gray-200 h-8 w-1/3 rounded" />
            <div className="bg-gray-200 h-64 rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout title="Không tìm thấy đơn hàng">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy đơn hàng</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Đơn hàng ${order.orderNumber} - TechStore`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Đơn hàng #{order.orderNumber}</h1>
          <p className="text-gray-600">Đặt ngày {formatDate(order.createdAt)}</p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.currentStatus)}`}>
            {getStatusText(order.currentStatus)}
          </span>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Trạng thái đơn hàng</h2>
          <div className="space-y-4">
            {order.statusHistory.slice().reverse().map((status, idx) => (
              <div key={idx} className="flex items-start">
                <div className="flex-shrink-0">
                  {status.status === 'delivered' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : status.status === 'shipping' ? (
                    <Truck className="h-6 w-6 text-blue-500" />
                  ) : (
                    <Package className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="ml-4">
                  <p className="font-medium">{getStatusText(status.status)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(status.time).toLocaleString('vi-VN')}
                  </p>
                  {status.note && (
                    <p className="text-sm text-gray-600 mt-1">{status.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Thông tin giao hàng</h2>
          <div className="text-gray-700">
            <p className="font-medium">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Sản phẩm</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 pb-4 border-b last:border-0">
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-500">{item.variantName}</p>
                  <p className="text-sm text-gray-500">SKU: {item.variantSku}</p>
                  <p className="text-sm mt-1">
                    {formatCurrency(item.price)} x {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Tổng đơn hàng</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá{order.discountCode && ` (${order.discountCode})`}:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}

            {order.pointsDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Điểm thưởng ({order.pointsUsed} điểm):</span>
                <span>-{formatCurrency(order.pointsDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">Thuế VAT:</span>
              <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Phí vận chuyển:</span>
              <span className="font-medium">
                {order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}
              </span>
            </div>

            <div className="flex justify-between text-lg font-bold text-primary-600 pt-2 border-t">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>

            {order.pointsEarned > 0 && (
              <div className="flex justify-between text-sm text-green-600 pt-2 border-t">
                <span>Điểm thưởng đã nhận:</span>
                <span>+{order.pointsEarned} điểm</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phương thức thanh toán:</span>
              <span className="font-medium">
                {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Trạng thái thanh toán:</span>
              <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
