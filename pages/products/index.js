import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import { productAPI } from '../../lib/api';
import { Filter, X } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category: router.query.category || '',
    brand: router.query.brand || '',
    minPrice: router.query.minPrice || '',
    maxPrice: router.query.maxPrice || '',
    rating: router.query.rating || '',
    sort: router.query.sort || 'createdAt_desc',
    page: router.query.page || 1,
    q: router.query.q || '',
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    setFilters({
      category: router.query.category || '',
      brand: router.query.brand || '',
      minPrice: router.query.minPrice || '',
      maxPrice: router.query.maxPrice || '',
      rating: router.query.rating || '',
      sort: router.query.sort || 'createdAt_desc',
      page: router.query.page || 1,
      q: router.query.q || '',
    });
  }, [router.query]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await productAPI.getCategories();
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await productAPI.getBrands();
      setBrands(res.data.brands || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });

      const res = await productAPI.getProducts(params);
      setProducts(res.data.products || []);
      setPagination(res.data.pagination || {});
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (key, value) => {
    // Only reset page to 1 if we're changing filters (not page itself)
    const newFilters = key === 'page' 
      ? { ...filters, [key]: value }
      : { ...filters, [key]: value, page: 1 };
    
    const query = {};
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k]) query[k] = newFilters[k];
    });

    router.push({ pathname: '/products', query }, undefined, { shallow: true });
  };

  const clearFilters = () => {
    router.push('/products', undefined, { shallow: true });
  };

  const handlePageChange = (page) => {
    updateFilters('page', page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout title="Sản phẩm - TechStore">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {filters.category ? filters.category : 'Tất cả sản phẩm'}
          </h1>
          
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="md:hidden flex items-center space-x-2 px-4 py-2 border rounded-lg"
          >
            <Filter className="h-5 w-5" />
            <span>Lọc</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`${filterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Bộ lọc</h2>
                <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700">
                  Xóa lọc
                </button>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Sắp xếp</label>
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilters('sort', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="createdAt_desc">Mới nhất</option>
                  <option value="name_asc">Tên A-Z</option>
                  <option value="name_desc">Tên Z-A</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="rating_desc">Đánh giá cao</option>
                </select>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Danh mục</label>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat}
                        onChange={() => updateFilters('category', cat)}
                        className="mr-2"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Thương hiệu</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="radio"
                        name="brand"
                        checked={filters.brand === brand}
                        onChange={() => updateFilters('brand', brand)}
                        className="mr-2"
                      />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Khoảng giá (VND)</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={filters.minPrice}
                    onChange={(e) => updateFilters('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilters('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Đánh giá</label>
                <div className="space-y-2">
                  {[5, 4, 3].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === String(rating)}
                        onChange={() => updateFilters('rating', String(rating))}
                        className="mr-2"
                      />
                      <span className="text-sm">{rating}★ trở lên</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-96 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Tìm thấy {pagination.total} sản phẩm
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
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
        </div>
      </div>
    </Layout>
  );
}
