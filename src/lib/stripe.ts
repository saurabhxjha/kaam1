// Razorpay utility functions
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

export const createRazorpayOrder = async (
  amount: number,
  currency: string = 'INR',
  userId: string,
  userEmail: string
) => {
  try {
    const response = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency,
        userId,
        userEmail,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    const orderData = await response.json();
    return orderData;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const openRazorpayCheckout = async (
  orderId: string,
  amount: number,
  userEmail: string,
  userName: string,
  userPhone: string = ''
) => {
  const razorpayLoaded = await loadRazorpay();
  
  if (!razorpayLoaded) {
    throw new Error('Razorpay SDK failed to load');
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_DNOOOsu0jOhrwh',
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    name: 'JodKaam',
    description: 'JodKaam Pro Subscription',
    order_id: orderId,
    prefill: {
      name: userName,
      email: userEmail,
      contact: userPhone,
    },
    theme: {
      color: '#3B82F6',
    },
    handler: function (response: any) {
      // Payment successful
      window.location.href = `/?payment=success&payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`;
    },
    modal: {
      ondismiss: function () {
        // Payment cancelled
        window.location.href = '/?payment=cancelled';
      },
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
