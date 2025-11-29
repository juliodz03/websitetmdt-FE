import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import { useAuthStore } from '../../store/useStore';
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '../../lib/utils';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    perPage: 20,
    status: '',
    from: '',
    to: ''
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchOrders();
  }, [user, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getOrders(filters);
      setOrders(res.data.orders || []);
      setPagination(res.data.pagination || {});
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleViewDetails = async (orderId) => {
    try {
      const res = await adminAPI.getOrderDetails(orderId);
      setOrderDetails(res.data.order);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Vui lòng chọn trạng thái');
      return;
    }

    try {
      await adminAPI.updateOrderStatus(selectedOrder._id, {
        status: newStatus,
        note: statusNote
      });

      toast.success('Cập nhật trạng thái thành công');
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      setStatusNote('');
      fetchOrders();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <Layout title="Quản lý đơn hàng - Admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Quản lý đơn hàng</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Trạng thái</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="shipping">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Từ ngày</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Đến ngày</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ page: 1, perPage: 20, status: '', from: '', to: '' })}
                className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Đang tải...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có đơn hàng nào</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Mã đơn</th>
                      <th className="text-left py-3 px-4 font-semibold">Khách hàng</th>
                      <th className="text-left py-3 px-4 font-semibold">Ngày đặt</th>
                      <th className="text-left py-3 px-4 font-semibold">Tổng tiền</th>
                      <th className="text-left py-3 px-4 font-semibold">Trạng thái</th>
                      <th className="text-left py-3 px-4 font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Link href={`/orders/${order._id}`} className="text-primary-600 hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{order.user?.fullName}</p>
                            <p className="text-xs text-gray-500">{order.user?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{formatDate(order.createdAt)}</td>
                        <td className="py-3 px-4 font-semibold">{formatCurrency(order.totalAmount)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.currentStatus)}`}>
                            {getStatusText(order.currentStatus)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(order._id)}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              Chi tiết
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setNewStatus(order.currentStatus);
                                setShowStatusModal(true);
                              }}
                              className="text-sm text-primary-600 hover:text-primary-700"
                            >
                              Cập nhật
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="p-4">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Cập nhật trạng thái đơn hàng</h2>
              <p className="text-sm text-gray-600 mb-4">
                Đơn hàng: {selectedOrder?.orderNumber}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Trạng thái mới</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="shipping">Đang giao</option>
                    <option value="delivered">Đã giao</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ghi chú (tùy chọn)</label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                    placeholder="Thêm ghi chú về cập nhật này..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                    setNewStatus('');
                    setStatusNote('');
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showDetailsModal && orderDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Chi tiết đơn hàng #{orderDetails.orderNumber}</h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setOrderDetails(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
                    <p><strong>Tên:</strong> {orderDetails.user?.fullName}</p>
                    <p><strong>Email:</strong> {orderDetails.user?.email}</p>
                    <p><strong>SĐT:</strong> {orderDetails.user?.phone || 'N/A'}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Địa chỉ giao hàng</h3>
                    <p>{orderDetails.shippingAddress.fullName}</p>
                    <p>{orderDetails.shippingAddress.phone}</p>
                    <p>{orderDetails.shippingAddress.address}</p>
                    <p>{orderDetails.shippingAddress.ward}, {orderDetails.shippingAddress.district}</p>
                    <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.province}</p>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="font-semibold mb-3">Sản phẩm</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-4">Sản phẩm</th>
                          <th className="text-right py-2 px-4">Đơn giá</th>
                          <th className="text-center py-2 px-4">Số lượng</th>
                          <th className="text-right py-2 px-4">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.items.map((item, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                {item.variantName && (
                                  <p className="text-sm text-gray-500">{item.variantName}</p>
                                )}
                              </div>
                            </td>
                            <td className="text-right py-3 px-4">{formatCurrency(item.price)}</td>
                            <td className="text-center py-3 px-4">{item.quantity}</td>
                            <td className="text-right py-3 px-4 font-semibold">
                              {formatCurrency(item.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(orderDetails.subtotalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>{formatCurrency(orderDetails.shippingFee)}</span>
                  </div>
                  {orderDetails.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(orderDetails.discountAmount)}</span>
                    </div>
                  )}
                  {orderDetails.pointsUsed > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Điểm thưởng sử dụng ({orderDetails.pointsUsed} điểm):</span>
                      <span>-{formatCurrency(orderDetails.pointsDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-primary-600">{formatCurrency(orderDetails.totalAmount)}</span>
                  </div>
                </div>

                {/* Order Status & Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Trạng thái đơn hàng</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(orderDetails.currentStatus)}`}>
                      {getStatusText(orderDetails.currentStatus)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Thanh toán</h3>
                    <p><strong>Phương thức:</strong> {orderDetails.paymentMethod === 'cod' ? 'COD' : 'Online'}</p>
                    <p>
                      <strong>Trạng thái:</strong>{' '}
                      <span className={orderDetails.isPaid ? 'text-green-600' : 'text-red-600'}>
                        {orderDetails.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Status History */}
                {orderDetails.statusHistory && orderDetails.statusHistory.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Lịch sử cập nhật</h3>
                    <div className="border rounded-lg p-4 space-y-2">
                      {orderDetails.statusHistory.map((history, idx) => (
                        <div key={idx} className="text-sm">
                          <span className={`font-medium ${getStatusColor(history.status).replace('bg-', 'text-')}`}>
                            {getStatusText(history.status)}
                          </span>
                          <span className="text-gray-500 ml-2">{formatDate(history.time)}</span>
                          {history.note && <p className="text-gray-600 mt-1">{history.note}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t px-6 py-4">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedOrder(orderDetails);
                    setNewStatus(orderDetails.currentStatus);
                    setShowStatusModal(true);
                  }}
                  className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Cập nhật trạng thái
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
