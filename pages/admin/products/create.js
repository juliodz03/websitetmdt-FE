import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { adminAPI, productAPI } from '../../../lib/api';
import { useAuthStore } from '../../../store/useStore';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateProduct() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    shortDescription: '',
    description: '',
    images: [''],
    variants: [
      {
        name: '',
        sku: '',
        price: 0,
        stock: 0,
        ram: '',
        storage: ''
      }
    ],
    features: [''],
    tags: '',
    isActive: true,
    isFeatured: false
  });

  useState(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchCategories();
    fetchBrands();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const res = await productAPI.getCategories();
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await productAPI.getBrands();
      setBrands(res.data.brands || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.name || !formData.category || !formData.brand) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        setLoading(false);
        return;
      }

      if (formData.variants.length === 0) {
        toast.error('Vui lòng thêm ít nhất 1 biến thể');
        setLoading(false);
        return;
      }

      // Process data
      const productData = {
        ...formData,
        images: formData.images.filter(img => img.trim()),
        features: formData.features.filter(f => f.trim()),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        variants: formData.variants.map(v => ({
          ...v,
          price: Number(v.price),
          stock: Number(v.stock)
        }))
      };

      await adminAPI.createProduct(productData);
      toast.success('Tạo sản phẩm thành công');
      router.push('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    setFormData({
      ...formData,
      images: [...formData.images, '']
    });
  };

  const updateImage = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { name: '', sku: '', price: 0, stock: 0, ram: '', storage: '' }
      ]
    });
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <Layout title="Thêm sản phẩm - Admin">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại
        </button>

        <h1 className="text-3xl font-bold mb-8">Thêm sản phẩm mới</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên sản phẩm *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Danh mục *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    list="categories"
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                  <datalist id="categories">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Thương hiệu *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    list="brands"
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                  <datalist id="brands">
                    {brands.map(brand => (
                      <option key={brand} value={brand} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả ngắn</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Mô tả ngắn gọn về sản phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả chi tiết</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="4"
                  placeholder="Mô tả chi tiết về sản phẩm"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Hình ảnh</h2>
              <button
                type="button"
                onClick={addImage}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Thêm ảnh
              </button>
            </div>

            <div className="space-y-3">
              {formData.images.map((img, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={img}
                    onChange={(e) => updateImage(index, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg"
                    placeholder="URL hình ảnh"
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Biến thể sản phẩm</h2>
              <button
                type="button"
                onClick={addVariant}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Thêm biến thể
              </button>
            </div>

            <div className="space-y-6">
              {formData.variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Biến thể {index + 1}</h3>
                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tên biến thể</label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="VD: 8GB/256GB"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">SKU</label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Mã SKU"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">RAM</label>
                      <input
                        type="text"
                        value={variant.ram}
                        onChange={(e) => updateVariant(index, 'ram', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="VD: 8GB"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Storage</label>
                      <input
                        type="text"
                        value={variant.storage}
                        onChange={(e) => updateVariant(index, 'storage', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="VD: 256GB SSD"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Giá (VNĐ) *</label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Tồn kho *</label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tính năng nổi bật</h2>
              <button
                type="button"
                onClick={addFeature}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Thêm tính năng
              </button>
            </div>

            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg"
                    placeholder="Tính năng"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags & Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Khác</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tags (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="laptop, gaming, high-performance"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Kích hoạt sản phẩm</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Sản phẩm nổi bật</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
