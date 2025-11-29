import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { orderAPI } from '../lib/api';
import { useAuthStore } from '../store/useStore';
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '../lib/utils';
import { Package, ChevronRight } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function Orders() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, router.query.page]);

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getOrders({
        page: router.query.page || 1,
        limit: 10
      });
      setOrders(res.data.orders || []);
      setPagination(res.data.pagination || {});
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    router.push(`/orders?page=${page}`);
  };

  return (
    <Layout title="Đơn hàng của tôi - TechStore">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Bạn chưa có đơn hàng nào</p>
            <Link href="/products">
              <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700">
                Bắt đầu mua sắm
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order._id} href={`/orders/${order._id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <p className="font-bold text-lg">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.currentStatus)}`}>
                          {getStatusText(order.currentStatus)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Sản phẩm:</p>
                          {order.items.slice(0, 2).map((item, idx) => (
                            <p key={idx} className="text-sm">
                              {item.productName} x{item.quantity}
                            </p>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-gray-500">
                              và {order.items.length - 2} sản phẩm khác
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-start md:items-end">
                          <p className="text-sm text-gray-500 mb-1">Tổng tiền:</p>
                          <p className="text-xl font-bold text-primary-600">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-gray-500">
                          Giao đến: {order.shippingAddress.city}, {order.shippingAddress.province}
                        </p>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
