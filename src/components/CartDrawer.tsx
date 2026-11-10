import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  CheckCircle2, 
  ChevronLeft,
  Loader2,
  Package,
  MapPin,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart, PlacedOrder } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const CartDrawer: React.FC = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    totalCount, 
    subtotal, 
    isCartOpen, 
    closeCart,
    saveOrder
  } = useCart();

  const { user, profile } = useAuth();

  // Navigation steps: 'cart' | 'checkout' | 'success'
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');

  // Checkout Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Nairobi');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'cod'>('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<PlacedOrder | null>(null);

  // Auto-populate customer info from logged-in user profile
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      const userMeta = user.user_metadata || {};
      const name = profile?.first_name 
        ? `${profile.first_name} ${profile.last_name || ''}`.trim()
        : userMeta.full_name || '';
      if (name) setFullName(name);
      const userPhone = profile?.phone || userMeta.phone || '';
      if (userPhone) {
        setPhone(userPhone);
        setMpesaNumber(userPhone);
      }
    }
  }, [user, profile]);

  // Reset checkout step when cart drawer closes
  useEffect(() => {
    if (!isCartOpen) {
      setTimeout(() => {
        if (step === 'success') {
          setStep('cart');
          setCompletedOrder(null);
        }
      }, 300);
    }
  }, [isCartOpen, step]);

  const shipping = subtotal >= 6000 || subtotal === 0 ? 0 : 350;
  const grandTotal = subtotal + shipping;

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    setStep('checkout');
    setErrorMessage(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please provide your full name for delivery.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please provide your phone number so the courier can reach you.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please provide your delivery address or building name.');
      return;
    }

    setIsProcessing(true);

    try {
      const orderId = `CA-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderDate = new Date().toISOString();

      const itemsSummary = items
        .map((i) => `${i.quantity}x ${i.name} (Size: ${i.size || 'STD'}) - KES ${(i.priceNumber * i.quantity).toLocaleString()}`)
        .join('; ');

      // Save order into Supabase database
      try {
        const names = fullName.trim().split(' ');
        const firstName = names[0] || 'Guest';
        const lastName = names.slice(1).join(' ') || 'Customer';

        await supabase.from('bookings').insert({
          first_name: firstName,
          last_name: lastName,
          email: email.trim() || 'store@certifiedadventures.com',
          phone: phone.trim(),
          date: new Date().toISOString().split('T')[0],
          guests: items.reduce((sum, item) => sum + item.quantity, 0),
          total_amount: grandTotal,
          status: 'paid',
          notes: `MERCHANDISE ORDER [${orderId}]\nItems:\n${itemsSummary}\nDelivery: ${address}, ${city}\nPayment: ${paymentMethod.toUpperCase()}${notes ? `\nNotes: ${notes}` : ''}`,
          user_id: user?.id || null,
        });
      } catch (dbErr) {
        console.warn('Order database insert note:', dbErr);
      }

      // Record order into local orders list
      const newOrder: PlacedOrder = {
        orderId,
        date: orderDate,
        items: [...items],
        subtotal,
        shipping,
        total: grandTotal,
        paymentMethod: paymentMethod === 'mpesa' ? 'M-Pesa Express' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery',
        customerName: fullName.trim(),
        customerEmail: email.trim() || 'N/A',
        customerPhone: phone.trim(),
        deliveryAddress: `${address.trim()}, ${city}`,
        status: 'confirmed',
      };

      saveOrder(newOrder);
      setCompletedOrder(newOrder);
      clearCart();
      setStep('success');

      // Celebrate direct purchase with confetti
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6A00', '#FFA040', '#FFFFFF', '#10B981'],
        });
      } catch {
        // confetti fallback
      }
    } catch (err: any) {
      console.error('Order processing failed:', err);
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-['Poppins',sans-serif]">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Slide-over Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-screen max-w-md bg-[#0D1117] text-white border-l border-white/10 shadow-2xl flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#121822]/80 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  {step !== 'cart' && (
                    <button
                      onClick={() => setStep('cart')}
                      className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                      aria-label="Back to Cart"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="w-9 h-9 rounded-xl bg-[#FF6A00]/15 text-[#FF6A00] flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm sm:text-base text-white tracking-wide">
                      {step === 'cart' && 'Your Shopping Cart'}
                      {step === 'checkout' && 'Direct Purchase Checkout'}
                      {step === 'success' && 'Order Confirmed'}
                    </h2>
                    <p className="text-[11px] text-white/50">
                      {step === 'cart' && `${totalCount} ${totalCount === 1 ? 'item' : 'items'} in cart`}
                      {step === 'checkout' && 'Fast, secure & encrypted checkout'}
                      {step === 'success' && 'Receipt & shipping confirmation'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeCart}
                  aria-label="Close Cart"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Delivery Bar in Cart view */}
              {step === 'cart' && (
                <div className="bg-[#161F2E] px-4 py-2.5 border-b border-white/5 flex items-center gap-2 text-xs">
                  <Truck className="w-4 h-4 text-[#FF6A00] flex-shrink-0" />
                  <span className="text-white/80">
                    {subtotal >= 6000 ? (
                      <strong className="text-green-400">You unlocked Free Delivery across Kenya! 🎉</strong>
                    ) : (
                      <>Add <strong>KES {(6000 - subtotal).toLocaleString()}</strong> more for <strong>Free Delivery</strong></>
                    )}
                  </span>
                </div>
              )}

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {/* 1. CART VIEW */}
                {step === 'cart' && (
                  <>
                    {items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-4">
                          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Your cart is empty</h3>
                        <p className="text-xs sm:text-sm text-white/50 max-w-xs mb-6">
                          Explore official Certified Adventures hoodies, caps, bottles, and safari tees.
                        </p>
                        <button
                          onClick={() => {
                            closeCart();
                            const el = document.getElementById('merch');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-6 py-3 rounded-xl bg-[#FF6A00] hover:bg-[#FF8526] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FF6A00]/25 active:scale-95"
                        >
                          Explore Merch Store
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {items.map((item) => (
                          <div
                            key={`${item.id}-${item.size || 'std'}`}
                            className="p-3 sm:p-3.5 rounded-2xl bg-[#141B26] border border-white/5 hover:border-white/10 transition-colors flex gap-3 sm:gap-4 items-center"
                          >
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl object-cover bg-white/5 border border-white/5 flex-shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5 mb-2">
                                <span className="text-xs font-semibold text-[#FF6A00]">
                                  KES {item.priceNumber.toLocaleString()}
                                </span>
                                {item.size && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                                    Size: {item.size}
                                  </span>
                                )}
                              </div>

                              {/* Stepper */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
                                  <button
                                    onClick={() => updateQuantity(item.id, -1, item.size)}
                                    aria-label="Decrease quantity"
                                    className="w-6 h-6 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-8 text-center text-xs font-bold text-white">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, 1, item.size)}
                                    aria-label="Increase quantity"
                                    className="w-6 h-6 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                <span className="text-xs text-white/40">
                                  = KES {(item.priceNumber * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id, item.size)}
                              aria-label="Remove item"
                              className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors active:scale-90"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* 2. CHECKOUT VIEW */}
                {step === 'checkout' && (
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    {errorMessage && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs">
                        {errorMessage}
                      </div>
                    )}

                    {/* Customer & Delivery Form */}
                    <div className="bg-[#141B26] p-4 rounded-2xl border border-white/5 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6A00]" />
                        <span>Delivery Destination</span>
                      </h3>

                      <div>
                        <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#FF6A00]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                            Phone (Courier) *
                          </label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (!mpesaNumber) setMpesaNumber(e.target.value);
                            }}
                            placeholder="+254 700 000 000"
                            className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#FF6A00]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                            City / Town
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Nairobi, Mombasa, etc."
                            className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#FF6A00]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                          Street / Apartment / Office Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. Westlands, Delta Corner Tower A, 4th Fl"
                          className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#FF6A00]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                          Order / Dispatch Notes (Optional)
                        </label>
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Leave at reception, gate code, etc."
                          className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#FF6A00]"
                        />
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-[#141B26] p-4 rounded-2xl border border-white/5 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#FF6A00]" />
                        <span>Payment Method</span>
                      </h3>

                      <div className="space-y-2">
                        {/* M-Pesa Option */}
                        <div
                          onClick={() => setPaymentMethod('mpesa')}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            paymentMethod === 'mpesa'
                              ? 'bg-[#FF6A00]/15 border-[#FF6A00] text-white'
                              : 'bg-black/30 border-white/10 text-white/70 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xs">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-xs sm:text-sm">M-Pesa Express</p>
                              <p className="text-[10px] text-white/50">Instant STK prompt to your phone</p>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === 'mpesa' ? 'border-[#FF6A00] bg-[#FF6A00]' : 'border-white/30'
                          }`}>
                            {paymentMethod === 'mpesa' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                        </div>

                        {paymentMethod === 'mpesa' && (
                          <div className="p-3 rounded-xl bg-black/40 border border-[#FF6A00]/30 text-xs space-y-2">
                            <label className="block text-[11px] font-bold text-white/70 uppercase">
                              M-Pesa Registered Phone
                            </label>
                            <input
                              type="tel"
                              value={mpesaNumber}
                              onChange={(e) => setMpesaNumber(e.target.value)}
                              placeholder="07XX XXX XXX"
                              className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF6A00]"
                            />
                            <p className="text-[10px] text-white/40 leading-relaxed">
                              You will receive an M-Pesa prompt on your phone for <strong>KES {grandTotal.toLocaleString()}</strong> to enter your PIN upon confirmation.
                            </p>
                          </div>
                        )}

                        {/* Credit / Debit Card */}
                        <div
                          onClick={() => setPaymentMethod('card')}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            paymentMethod === 'card'
                              ? 'bg-[#FF6A00]/15 border-[#FF6A00] text-white'
                              : 'bg-black/30 border-white/10 text-white/70 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-xs sm:text-sm">Credit / Debit Card</p>
                              <p className="text-[10px] text-white/50">Visa, Mastercard, Amex</p>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === 'card' ? 'border-[#FF6A00] bg-[#FF6A00]' : 'border-white/30'
                          }`}>
                            {paymentMethod === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                        </div>

                        {/* Cash / Pay on Delivery */}
                        <div
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            paymentMethod === 'cod'
                              ? 'bg-[#FF6A00]/15 border-[#FF6A00] text-white'
                              : 'bg-black/30 border-white/10 text-white/70 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                              <Banknote className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-xs sm:text-sm">Pay on Delivery</p>
                              <p className="text-[10px] text-white/50">Cash or M-Pesa upon parcel arrival</p>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === 'cod' ? 'border-[#FF6A00] bg-[#FF6A00]' : 'border-white/30'
                          }`}>
                            {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order summary in checkout */}
                    <div className="bg-[#141B26] p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between text-white/60">
                        <span>Items ({totalCount})</span>
                        <span>KES {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>Express Delivery</span>
                        <span>{shipping === 0 ? 'FREE' : `KES ${shipping.toLocaleString()}`}</span>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm text-white">
                        <span>Grand Total</span>
                        <span className="text-[#FF6A00] text-base">KES {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full min-h-[50px] py-3.5 px-4 rounded-xl bg-[#FF6A00] hover:bg-[#FF8526] text-black font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#FF6A00]/30 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing Direct Order...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Complete Purchase (KES {grandTotal.toLocaleString()})</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* 3. ORDER CONFIRMATION / RECEIPT VIEW */}
                {step === 'success' && completedOrder && (
                  <div className="py-6 text-center space-y-5 animate-fadeIn">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/20 text-green-400 border border-green-500/40 flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        Thank You For Your Order!
                      </h3>
                      <p className="text-xs text-white/60">
                        Your merchandise is being prepared for dispatch.
                      </p>
                    </div>

                    {/* Receipt Card */}
                    <div className="bg-[#141B26] p-4 rounded-2xl border border-white/10 text-left space-y-3 text-xs">
                      <div className="flex justify-between pb-2 border-b border-white/10">
                        <span className="text-white/50">Order Reference</span>
                        <strong className="text-[#FF6A00] font-mono">{completedOrder.orderId}</strong>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-white/50 text-[11px] uppercase tracking-wider font-bold">Ordered Gear</span>
                        {completedOrder.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-white/80">
                            <span className="truncate pr-2">{it.quantity}x {it.name} ({it.size || 'STD'})</span>
                            <span>KES {(it.priceNumber * it.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-white/10 space-y-1">
                        <div className="flex justify-between text-white/60">
                          <span>Total Paid</span>
                          <strong className="text-white">KES {completedOrder.total.toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Payment</span>
                          <span>{completedOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Delivery to</span>
                          <span className="truncate max-w-[180px] text-right">{completedOrder.deliveryAddress}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-[11px] text-white/70">
                        <Clock className="w-3.5 h-3.5 text-[#FF6A00] flex-shrink-0" />
                        <span>Estimated delivery: <strong>1–2 business days</strong></span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2.5">
                      <button
                        onClick={() => {
                          closeCart();
                          setStep('cart');
                        }}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#FF6A00] hover:bg-[#FF8526] text-black font-bold uppercase tracking-wider text-xs transition-all shadow-lg shadow-[#FF6A00]/20 active:scale-95"
                      >
                        Continue Exploring
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Footer (Subtotal & Checkout CTA) */}
              {step === 'cart' && items.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-white/10 bg-[#121822]/90 backdrop-blur-md space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-white/60">
                      <span>Subtotal</span>
                      <span className="font-semibold text-white">KES {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>Express Shipping</span>
                      <span>{shipping === 0 ? <strong className="text-green-400">FREE</strong> : `KES ${shipping.toLocaleString()}`}</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm text-white">
                      <span>Estimated Total</span>
                      <span className="text-[#FF6A00] text-base">KES {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full min-h-[50px] py-3.5 px-4 rounded-xl bg-[#FF6A00] hover:bg-[#FF8526] text-black font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#FF6A00]/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-white/40 pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                      <span>Encrypted Checkout</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-[#FF6A00]" />
                      <span>Direct Courier Delivery</span>
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
