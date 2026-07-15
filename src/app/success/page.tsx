"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiCheckCircle, FiArrowRight, FiActivity } from "react-icons/fi";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("No valid payment session ID found.");
      setLoading(false);
      return;
    }

    const processOrder = async () => {
      const token = localStorage.getItem("token");
      try {
        // 1. Fetch checkout details from stripe backend endpoint
        const stripeRes = await fetch(`/api/checkout-session/${sessionId}`);
        if (!stripeRes.ok) {
          throw new Error("Failed to verify Stripe checkout session details");
        }
        const session = await stripeRes.json();

        if (session.payment_status === "paid") {
          // Parse metadata fields
          const metadata = session.metadata || {};
          const items = JSON.parse(metadata.itemsJson || "[]");
          const userEmail = metadata.userEmail;
          const shippingCharge = Number(metadata.shippingCharge || 15);
          const appliedPromo = metadata.appliedPromo || null;
          const discount = Number(metadata.discount || 0);

          // Calculate Grand Total
          const subtotal = items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0);
          const totalAmount = Math.max(0, subtotal + shippingCharge - discount);

          // 2. Submit order to backend database
          const orderRes = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              items,
              total: totalAmount,
              shippingCharge,
              appliedPromo,
              discount
            })
          });

          if (orderRes.ok) {
            const orderData = await orderRes.json();
            setOrderId(orderData.orderId);

            // 3. Clear cart from localStorage and trigger event update
            localStorage.setItem("cart", "[]");
            window.dispatchEvent(new Event("cartUpdated"));
          } else {
            const errData = await orderRes.json();
            throw new Error(errData.message || "Failed to create order record.");
          }
        } else {
          throw new Error("Payment was not completed successfully.");
        }
      } catch (err: any) {
        console.error("Order processing error:", err);
        setError(err.message || "Failed to finalize order purchase.");
      } finally {
        setLoading(false);
      }
    };

    processOrder();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-sage/15 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-fadeIn">
        {loading ? (
          <div className="py-12 space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-forest border-t-transparent mx-auto" />
            <p className="text-sm font-bold text-forest-dark">Finalizing your purchase and verifying payment...</p>
          </div>
        ) : error ? (
          <div className="py-6 space-y-4">
            <div className="text-rose text-5xl flex justify-center">⚠️</div>
            <h2 className="text-base font-black text-forest-dark uppercase tracking-wider">Verification Error</h2>
            <p className="text-xs text-rose font-bold bg-rose/5 border border-rose/10 p-3 rounded-xl">{error}</p>
            <div className="pt-4">
              <Link href="/cart" className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-forest-dark transition cursor-pointer">
                Return to Cart
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-emerald-500 text-6xl flex justify-center animate-bounce">
              <FiCheckCircle />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-forest-dark uppercase tracking-widest">Payment Success!</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Thank you for your purchase. Your order was successfully validated and logged.
              </p>
            </div>

            {orderId && (
              <div className="bg-sage/5 border border-sage/10 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID Record</span>
                <p className="text-xs font-mono font-extrabold text-forest-dark">#{orderId}</p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-forest px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-forest-dark transition cursor-pointer"
              >
                Go to Dashboard <FiActivity />
              </Link>
              <Link
                href="/explore"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-sage/20 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-forest hover:bg-sage/5 transition cursor-pointer"
              >
                Keep Exploring <FiArrowRight />
              </Link>
            </div>
          </div>
        )}
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-sage/15 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-forest border-t-transparent mx-auto" />
          <p className="text-sm font-bold text-forest-dark">Loading checkout verification details...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
