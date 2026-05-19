import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const SHIPPING_FEE = 8;
  const FREE_SHIPPING_THRESHOLD = 2000;

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, selectedSize, quantity = 1) => {
    setLoading(true);
    
    const existingItemIndex = cartItems.findIndex(
      item => item.productId === product._id && item.size === selectedSize.size
    );

    if (existingItemIndex !== -1) {
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += quantity;
      setCartItems(updatedCart);
    } else {
      const newItem = {
        id: Date.now(),
        productId: product._id,
        name: product.name,
        size: selectedSize.size,
        price: selectedSize.price,
        quantity: quantity,
        image: product.mainImage,
        slug: product.slug,
        maxStock: selectedSize.stock
      };
      setCartItems([...cartItems, newItem]);
    }
    
    setLoading(false);
    setCartOpen(true);
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        const maxQuantity = item.maxStock;
        const validQuantity = Math.min(newQuantity, maxQuantity);
        return { ...item, quantity: validQuantity };
      }
      return item;
    });
    
    setCartItems(updatedCart);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingFee = () => {
    const subtotal = getCartSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  };

  const getCartTotal = () => {
    return getCartSubtotal() + getShippingFee();
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  const value = {
    cartItems,
    cartOpen,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartSubtotal,
    getShippingFee,
    getCartTotal,
    getCartCount,
    toggleCart,
    setCartOpen,
    SHIPPING_FEE,
    FREE_SHIPPING_THRESHOLD,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};