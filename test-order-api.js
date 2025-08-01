// Test rapide de l'API de commande
const testOrderData = {
  customerInfo: {
    email: "test@example.com",
    first_name: "Test",
    last_name: "User",
    phone: "+24166871309"
  },
  deliveryInfo: {
    address: "Libreville, Gabon",
    city: "Libreville",
    district: "Test",
    additionalInfo: "",
    location: { lat: 0.4077972, lng: 9.440283299999999 },
    option: "standard",
    time: "asap"
  },
  paymentInfo: {
    method: "cash"
  },
  items: [
    {
      id: "b6400265-5d74-4f8a-9e6b-f7e0eaf40ea6", // Cîroc Vodka (product)
      name: "Cîroc Vodka Blue 70cl",
      quantity: 1,
      price: 50000
    },
    {
      id: "21f393ac-c9cf-4cae-a230-77b3fa85bb00", // Avocado Colada (cocktail_maison)
      name: "Avocado Colada",
      quantity: 1,
      price: 4500
    }
  ],
  totalAmount: 56000,
  subtotal: 54500,
  deliveryCost: 1500,
  discount: 0
};

console.log("Test data prepared:", JSON.stringify(testOrderData, null, 2));
console.log("\nTo test, send POST request to /api/orders with this data");
