import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: string;
  priceNumber: number;
  image_url: string;
  quantity: number;
  size?: string;
}

export interface PlacedOrder {
  orderId: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  status: 'confirmed' | 'dispatched' | 'delivered';
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: {
    id: string;
    name: string;
    price: string;
    image_url: string;
    size?: string;
  }, quantity?: number) => void;
  removeFromCart: (id: string, size?: string) => void;
  updateQuantity: (id: string, delta: number, size?: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  orders: PlacedOrder[];
  saveOrder: (order: PlacedOrder) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const parsePrice = (priceStr: string | number): number => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const isDollars = typeof priceStr === 'string' && priceStr.includes('$');
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  // Convert any legacy dollar amounts to KES (1 USD = ~130 KES)
  if (isDollars) return Math.round(parsed * 130);
  return Math.round(parsed);
};

export const formatKES = (amount: number): string => {
  return `KES ${Math.round(amount).toLocaleString()}`;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('certified_adventures_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<PlacedOrder[]>(() => {
    try {
      const savedOrders = localStorage.getItem('certified_recent_orders');
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('certified_adventures_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('certified_recent_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  const addToCart = (
    item: { id: string; name: string; price: string; image_url: string; size?: string },
    quantity = 1
  ) => {
    const itemSize = item.size || 'Standard';
    const priceNum = parsePrice(item.price);

    setItems((prevItems) => {
      const existingIdx = prevItems.findIndex(
        (i) => i.id === item.id && (i.size || 'Standard') === itemSize
      );

      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prevItems,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          priceNumber: priceNum > 0 ? priceNum : 3500,
          image_url: item.image_url,
          quantity: Math.max(1, quantity),
          size: itemSize,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id: string, size?: string) => {
    const itemSize = size || 'Standard';
    setItems((prev) => prev.filter((i) => !(i.id === id && (i.size || 'Standard') === itemSize)));
  };

  const updateQuantity = (id: string, delta: number, size?: string) => {
    const itemSize = size || 'Standard';
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id && (i.size || 'Standard') === itemSize) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const saveOrder = (newOrder: PlacedOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.priceNumber * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        orders,
        saveOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
