import Link from 'next/link';
import { Facebook, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">TechStore</h3>
            <p className="text-sm mb-4">
              Cửa hàng công nghệ hàng đầu Việt Nam với các sản phẩm chất lượng cao.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white">
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-white">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Danh mục</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=Laptops" className="hover:text-white">
                  Laptops
                </Link>
              </li>
              <li>
                <Link href="/products?category=Monitors" className="hover:text-white">
                  Monitors
                </Link>
              </li>
              <li>
                <Link href="/products?category=Accessories" className="hover:text-white">
                  Phụ kiện
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white">
                  Đổi trả hàng
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} TechStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
