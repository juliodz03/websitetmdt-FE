import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import { useAuthStore } from '../../store/useStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';
import { Tag, Plus } from 'lucide-react';

export default function AdminDiscounts() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    valueType: 'percent',
    value: 0,
    usageLimit: 10
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchDiscounts();
  }, [user]);

  const fetchDiscounts = async () => {
    try {
      const res = await adminAPI.getDiscounts();
      setDiscounts(res.data.discounts || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();

    if (!/^[A-Z0-9]{5}$/.test(formData.code)) {
      toast.error('Mã phải gồm 5 ký tự chữ in hoa hoặc số');
      return;
    }

    if (formData.usageLimit > 10) {
      toast.error('Số lần sử dụng tối đa là 10');
      return;
    }

    try {
      await adminAPI.createDiscount(formData);
      toast.success('Tạo mã giảm giá thành công');
      setShowModal(false);
      setFormData({
        code: '',
        valueType: 'percent',
        value: 0,
        usageLimit: 10
      });
      fetchDiscounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo mã giảm giá');
    }
  };

  const handleToggleDiscount = async (id) => {
    try {
      await adminAPI.toggleDiscount(id);
      toast.success('Cập nhật trạng thái thành công');
      fetchDiscounts();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <Layout title="Quản lý mã giảm giá - Admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Quản lý mã giảm giá</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" />
            Tạo mã mới
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            Đang tải...
          </div>
        ) : discounts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Chưa có mã giảm giá nào</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Tạo mã đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discounts.map((discount) => (
              <div key={discount._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-2xl font-bold text-primary-600 font-mono">
                        {discount.code}
                      </span>
                      {!discount.isActive && (
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                          Tắt
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {discount.valueType === 'percent' 
                        ? `Giảm ${discount.value}%` 
                        : `Giảm ${formatCurrency(discount.value)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleDiscount(discount._id)}
                    className={`px-3 py-1 rounded text-sm ${
                      discount.isActive 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {discount.isActive ? 'Hoạt động' : 'Tắt'}
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đã dùng:</span>
                    <span className="font-medium">
                      {discount.usedCount} / {discount.usageLimit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Còn lại:</span>
                    <span className="font-medium text-green-600">
                      {discount.usageLimit - discount.usedCount}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Tạo: {formatDate(discount.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Discount Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Tạo mã giảm giá mới</h2>
              
              <form onSubmit={handleCreateDiscount}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mã giảm giá (5 ký tự)
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                      placeholder="ABCD1"
                      maxLength={5}
                      pattern="[A-Z0-9]{5}"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Chỉ chữ in hoa (A-Z) và số (0-9)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Loại giảm giá</label>
                    <select
                      value={formData.valueType}
                      onChange={(e) => setFormData({ ...formData, valueType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="percent">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định (VND)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Giá trị {formData.valueType === 'percent' ? '(%)' : '(VND)'}
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="0"
                      max={formData.valueType === 'percent' ? '100' : undefined}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Số lần sử dụng tối đa (1-10)
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                      max="10"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Tạo mã
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
