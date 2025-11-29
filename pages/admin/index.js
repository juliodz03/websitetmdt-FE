import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import { useAuthStore } from '../../store/useStore';
import { formatCurrency } from '../../lib/utils';
import {
  TrendingUp, DollarSign, Package, Users, ShoppingCart, BarChart3
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchStats();
  }, [user, dateRange]);

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats({ range: dateRange });
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <Layout title="Admin Dashboard - TechStore">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="week">7 ngày qua</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/products">
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
              <Package className="h-8 w-8 text-primary-600 mb-2" />
              <p className="text-sm text-gray-600">Quản lý</p>
              <p className="font-semibold">Sản phẩm</p>
            </div>
          </Link>
          <Link href="/admin/orders">
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
              <ShoppingCart className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Quản lý</p>
              <p className="font-semibold">Đơn hàng</p>
            </div>
          </Link>
          <Link href="/admin/users">
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Quản lý</p>
              <p className="font-semibold">Khách hàng</p>
            </div>
          </Link>
          <Link href="/admin/discounts">
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
              <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
              <p className="text-sm text-gray-600">Quản lý</p>
              <p className="font-semibold">Mã giảm giá</p>
            </div>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Doanh thu</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatCurrency(stats?.totalRevenue || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stats?.totalOrders || 0} đơn hàng</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-primary-600 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Lợi nhuận (ước tính)</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats?.totalProfit || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">30% doanh thu</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-green-600 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Khách hàng</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">+{stats?.newUsers || 0} mới</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-600 opacity-20" />
                </div>
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Trạng thái đơn hàng</h2>
                <div className="space-y-3">
                  {stats?.statusBreakdown && Object.entries(stats.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-gray-700 capitalize">{status}</span>
                      <span className="font-semibold">{count} đơn</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Sản phẩm bán chạy</h2>
                <div className="space-y-3">
                  {stats?.bestSellers?.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.quantity} đã bán</p>
                      </div>
                      <p className="text-sm font-semibold text-primary-600 ml-4">
                        {formatCurrency(item.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Đơn hàng gần đây</h2>
                <Link href="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm">
                  Xem tất cả →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Mã đơn</th>
                      <th className="text-left py-3 px-4">Khách hàng</th>
                      <th className="text-left py-3 px-4">Tổng tiền</th>
                      <th className="text-left py-3 px-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentOrders?.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Link href={`/orders/${order._id}`} className="text-primary-600 hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4">{order.user?.fullName}</td>
                        <td className="py-3 px-4 font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.currentStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.currentStatus === 'shipping' ? 'bg-blue-100 text-blue-700' :
                            order.currentStatus === 'confirmed' ? 'bg-purple-100 text-purple-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.currentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
