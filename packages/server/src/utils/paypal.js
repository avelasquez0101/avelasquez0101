const paypal = require('@paypal/checkout-server-sdk');

function getEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.warn('PayPal credentials not set, using mock mode');
    return null;
  }

  return process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

async function createOrder(amount, currency = 'USD', description = 'ChGaming Purchase') {
  const environment = getEnvironment();
  if (!environment) {
    return { id: 'mock-order-' + Date.now(), status: 'CREATED' };
  }

  const client = new paypal.core.PayPalHttpClient(environment);
  
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toFixed(2)
      },
      description: description
    }]
  });

  try {
    const response = await client.execute(request);
    return {
      id: response.result.id,
      status: response.result.status,
      links: response.result.links
    };
  } catch (error) {
    console.error('PayPal create order error:', error);
    throw error;
  }
}

async function captureOrder(orderId) {
  const environment = getEnvironment();
  if (!environment) {
    return { 
      id: orderId, 
      status: 'COMPLETED',
      purchase_units: [{
        payments: {
          captures: [{
            id: 'mock-capture-' + Date.now(),
            status: 'COMPLETED',
            amount: { currency_code: 'USD', value: '0.00' }
          }]
        }
      }]
    };
  }

  const client = new paypal.core.PayPalHttpClient(environment);
  
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const response = await client.execute(request);
    return response.result;
  } catch (error) {
    console.error('PayPal capture order error:', error);
    throw error;
  }
}

module.exports = {
  createOrder,
  captureOrder,
  getEnvironment
};
