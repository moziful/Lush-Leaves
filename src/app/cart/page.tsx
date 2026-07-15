"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiTrash2, FiShoppingBag, FiTag, FiCheckCircle } from "react-icons/fi";
import Button from "@/components/Button";

interface CartItem {
  plantId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState(15);
  const [checkoutDisabled, setCheckoutDisabled] = useState(false);

  useEffect(() => {
    // Load cart
    const loadedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(loadedCart);

    // Fetch shipping feature flags & checkout configurations
    const fetchConfigs = async () => {
      try {
        const res = await fetch("/api/admin/config");
        if (res.ok) {
          const config = await res.json();
          if (config.freeShippingPromo) {
            setShippingCost(0);
          } else if (typeof config.shippingCharge !== "undefined") {
            setShippingCost(Number(config.shippingCharge));
          }
          if (config.checkoutEnabled === false) {
            setCheckoutDisabled(true);
          }
        }
      } catch (err) {
        console.error("Failed to load configs", err);
      }
    };

    fetchConfigs();
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQuantity = (plantId: string, amount: number) => {
    const updated = cart.map((item) => {
      if (item.plantId === plantId) {
        const nextQty = item.quantity + amount;
        return { ...item, quantity: nextQty < 1 ? 1 : nextQty };
      }
      return item;
    });
    saveCart(updated);
  };

  const removeItem = (plantId: string) => {
    const updated = cart.filter((item) => item.plantId !== plantId);
    saveCart(updated);
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please sign in to apply coupon codes.");
      return;
    }

    try {
      const res = await fetch(`/api/promo/validate?code=${encodeURIComponent(promoCode.trim())}`);
      if (res.ok) {
        const coupon = await res.json();
        setDiscount(coupon.discount);
        setAppliedPromo(coupon.code);
        setSuccess(`Applied! $${coupon.discount.toFixed(2)} savings have been applied.`);
      } else {
        const errData = await res.json().catch(() => null);
        setError(errData?.message || "Invalid or expired promo code.");
      }
    } catch {
      setError("Failed to apply promo code.");
    }
  };

  const handleCheckout = async () => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login?redirect=/cart");
      return;
    }

    if (checkoutDisabled) {
      setError("We are not accepting checkout orders right now. Check back soon!");
      return;
    }

    setCheckoutLoading(true);
    try {
      const origin = window.location.origin;

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          shippingCharge: shippingCost,
          appliedPromo: appliedPromo || null,
          discount: discount,
          origin
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("Stripe URL not returned from server");
        }
      } else {
        const errData = await res.json().catch(() => null);
        setError(errData?.message || "Failed to initialize Stripe checkout.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal + shippingCost - discount);

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title */}
        <div className="border-b border-sage/15 pb-6">
          <h1 className="text-3xl font-black tracking-tight text-forest-dark flex items-center gap-2">
            <FiShoppingBag className="text-forest h-7 w-7" /> Shopping Cart
          </h1>
          <p className="text-sm text-forest-dark/50 font-medium">Manage your botanical selections and proceed to checkout.</p>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-2xl border border-sage/15 bg-white py-20 px-4 text-center space-y-4 shadow-sm animate-fadeIn">
            <p className="text-base font-bold text-forest-dark/70">Your cart is empty.</p>
            <Link href="/explore" className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-5 py-2.5 text-xs font-bold text-white cursor-pointer">
              Explore Plants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fadeIn">
            {/* Items Column */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.plantId} className="bg-white p-4.5 rounded-2xl border border-sage/15 shadow-sm flex items-center gap-4 hover:border-forest/20 transition-all">
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-sage/15 bg-sage/5 shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-forest-dark truncate">{item.title}</h3>
                    <p className="text-xs text-forest font-bold pt-1">${item.price.toFixed(2)} each</p>
                  </div>
                  {/* Quantity Actions */}
                  <div className="flex items-center gap-2 border border-sage/15 rounded-lg px-2 py-1 bg-sage/5">
                    <button
                      onClick={() => updateQuantity(item.plantId, -1)}
                      className="text-forest hover:bg-forest/10 px-1.5 rounded text-xs font-black cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-forest-dark min-w-[20px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.plantId, 1)}
                      className="text-forest hover:bg-forest/10 px-1.5 rounded text-xs font-black cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  {/* Total price for item */}
                  <p className="text-sm font-black text-forest-dark shrink-0 min-w-[60px] text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  {/* Delete Item */}
                  <button
                    onClick={() => removeItem(item.plantId)}
                    className="rounded-lg p-2 text-slate-400 hover:text-rose hover:bg-rose/5 transition cursor-pointer"
                  >
                    <FiTrash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Checkout Column */}
            <div className="space-y-6">
              {/* Promo Code Card */}
              <div className="bg-white border border-sage/15 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-forest-dark/40">Apply Promo Code</h3>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-forest/5 border border-forest/10 p-3 rounded-xl">
                    <div>
                      <p className="text-xs font-black text-forest-dark">{appliedPromo} Applied</p>
                      <p className="text-[10px] text-forest font-bold">-${discount.toFixed(2)} OFF savings active</p>
                    </div>
                    <button
                      onClick={() => {
                        setDiscount(0);
                        setAppliedPromo("");
                        setPromoCode("");
                        setSuccess("");
                        setError("");
                      }}
                      className="rounded-lg bg-rose/10 border border-rose/20 text-rose px-3 py-1.5 text-[10px] font-black uppercase hover:bg-rose hover:text-white cursor-pointer transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SPRING10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 rounded-xl border border-sage/20 px-3.5 py-2.5 text-xs font-bold text-forest-dark outline-none focus:border-forest"
                    />
                    <Button type="submit" variant="primary" className="py-2.5 text-xs font-black uppercase tracking-widest px-4">
                      Apply
                    </Button>
                  </form>
                )}
                {error && <p className="text-xs text-rose font-bold">{error}</p>}
                {success && <p className="text-xs text-forest font-bold flex items-center gap-1"><FiCheckCircle /> {success}</p>}
              </div>

              {/* Order Summary Card */}
              <div className="bg-white border border-sage/15 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-forest-dark/40">Order Summary</h3>
                <div className="space-y-2 border-b border-sage/10 pb-4 text-xs font-bold text-forest-dark">
                  <div className="flex justify-between">
                    <span className="text-forest-dark/65">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest-dark/65">Estimated Shipping</span>
                    <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-forest">
                      <span>Promo Discount ({appliedPromo})</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-sm font-black text-forest-dark pt-1">
                  <span>Grand Total</span>
                  <span className="text-base text-forest">${total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  variant="primary"
                  className="w-full py-3.5 text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2"
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
