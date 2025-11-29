import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { authAPI, userAPI } from '../lib/api';
import { useAuthStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { User, Award, MapPin, Lock } from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('info');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: ''
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Address form
  const [addressForm, setAddressForm] = useState({
    label: '',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    country: 'Vietnam'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile');
      return;
    }

    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || ''
      });
    }
  }, [isAuthenticated, user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      toast.error('Không thể cập nhật thông tin');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Đổi mật khẩu thành công');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await userAPI.addAddress(addressForm);
      toast.success('Thêm địa chỉ thành công');
      setAddressForm({
        label: '',
        fullName: '',
        phone: '',
        street: '',
        city: '',
        province: '',
        country: 'Vietnam'
      });
      // Reload user data
      const res = await authAPI.getMe();
      updateUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (error) {
      toast.error('Không thể thêm địa chỉ');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;

    try {
      await userAPI.deleteAddress(id);
      toast.success('Xóa địa chỉ thành công');
      const res = await authAPI.getMe();
      updateUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (error) {
      toast.error('Không thể xóa địa chỉ');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Layout title="Tài khoản của tôi - TechStore">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Tài khoản của tôi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                  activeTab === 'info' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                }`}
              >
                <User className="mr-3 h-5 w-5" />
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center mt-2 ${
                  activeTab === 'addresses' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                }`}
              >
                <MapPin className="mr-3 h-5 w-5" />
                Địa chỉ giao hàng
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center mt-2 ${
                  activeTab === 'password' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                }`}
              >
                <Lock className="mr-3 h-5 w-5" />
                Đổi mật khẩu
              </button>
              <button
                onClick={() => setActiveTab('points')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center mt-2 ${
                  activeTab === 'points' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                }`}
              >
                <Award className="mr-3 h-5 w-5" />
                Điểm thưởng
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Personal Info */}
            {activeTab === 'info' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-6">Thông tin cá nhân</h2>
                <form onSubmit={handleUpdateProfile}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Họ và tên</label>
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-6">Địa chỉ giao hàng</h2>

                {/* Current Addresses */}
                <div className="space-y-4 mb-6">
                  {user?.addresses?.map((addr) => (
                    <div key={addr._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">{addr.label || 'Địa chỉ'}</span>
                          {addr.isDefault && (
                            <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          Xóa
                        </button>
                      </div>
                      <p className="text-sm text-gray-700">
                        {addr.fullName || user.fullName}<br />
                        {addr.phone}<br />
                        {addr.street}<br />
                        {addr.city}, {addr.province}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add New Address */}
                <div className="border-t pt-6">
                  <h3 className="font-bold mb-4">Thêm địa chỉ mới</h3>
                  <form onSubmit={handleAddAddress}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nhãn (Nhà, Văn phòng...)</label>
                        <input
                          type="text"
                          value={addressForm.label}
                          onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                        <input
                          type="text"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Thành phố</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Tỉnh/Thành</label>
                        <input
                          type="text"
                          value={addressForm.province}
                          onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                    >
                      Thêm địa chỉ
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Change Password */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-6">Đổi mật khẩu</h2>
                <form onSubmit={handleChangePassword}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Mật khẩu mới</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                    >
                      Đổi mật khẩu
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Loyalty Points */}
            {activeTab === 'points' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-6">Điểm thưởng</h2>
                <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg p-8 mb-6">
                  <p className="text-lg mb-2">Điểm hiện có</p>
                  <p className="text-5xl font-bold">{user?.loyaltyPoints || 0}</p>
                  <p className="text-sm mt-2 opacity-90">
                    = {formatCurrency(user?.loyaltyPoints || 0)} VND
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary-500 pl-4">
                    <p className="font-medium">Cách tích điểm</p>
                    <p className="text-sm text-gray-600">Bạn nhận được 10% giá trị đơn hàng thành điểm thưởng</p>
                  </div>
                  <div className="border-l-4 border-primary-500 pl-4">
                    <p className="font-medium">Cách sử dụng</p>
                    <p className="text-sm text-gray-600">Sử dụng điểm để giảm giá đơn hàng tiếp theo (1 điểm = 1 VND)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
