import { useRouter } from 'next/router';
import { useCartStore, useUIStore } from '../store/useStore';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { cartAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function CartSidebar() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, setCart } = useCartStore();
  const { cartOpen, closeCart } = useUIStore();

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await cartAPI.updateCart({
        productId: item.product._id,
        variantId: item.variantId,
        quantity: newQuantity,
      });

      setCart(response.data.cart);
      toast.success('Cập nhật giỏ hàng thành công');
    } catch (error) {
      toast.error('Không thể cập nhật giỏ hàng');
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      const response = await cartAPI.updateCart({
        productId: item.product._id,
        variantId: item.variantId,
        quantity: 0,
      });

      setCart(response.data.cart);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  if (!cartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Giỏ hàng ({cart.items.length})
          </h2>
          <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Giỏ hàng trống</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={`${item.product._id}-${item.variantId}`} className="flex gap-4 border-b pb-4">
                  <img
                    src={item.product.images?.[0]?.url || '/placeholder.png'}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.product.name}</h3>
                    <p className="text-xs text-gray-500">
                      {item.product.variants?.find(v => v._id === item.variantId)?.name}
                    </p>
                    <p className="text-sm font-bold text-primary-600 mt-1">
                      {formatCurrency(item.price)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded">
                        <button
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng cộng:</span>
              <span className="text-primary-600">{formatCurrency(cart.totalAmount)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Thanh toán
            </button>

            <button
              onClick={closeCart}
              className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </>
  );
}
