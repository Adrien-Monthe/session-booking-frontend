import { CartContext, SessionData } from '@/contexts/CartContext';
import React, { useContext, useState, ChangeEvent, FormEvent } from 'react';

interface ClientDetails {
  name: string;
  email: string;
  phone: string;
}

const CartPage: React.FC = () => {
  const cartContext = useContext(CartContext);
  if (!cartContext) {
    throw new Error("CartContext is not provided");
  }
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    name: '',
    email: '',
    phone: '',
  });
  const [message, setMessage] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientDetails.name || !clientDetails.email || !clientDetails.phone) {
      setMessage('Please fill in all client details.');
      return;
    }
    setMessage('Booking confirmed successfully!');
    
  };

  const calculateSessionCost = (session: SessionData): number => {
    const [startH, startM, startS] = session.startTime.split(':').map(Number);
    const [endH, endM, endS] = session.endTime.split(':').map(Number);
    const startDate = new Date(0, 0, 0, startH, startM, startS);
    const endDate = new Date(0, 0, 0, endH, endM, endS);
    let diff = (endDate.getTime() - startDate.getTime()) / 60000;
    if (diff < 0) diff += 24 * 60;
    // If trainer is stored as an object, extract the price; otherwise, default to 0.
    let trainerPrice = 0;
    if (typeof session.trainer === 'object' && session.trainer !== null) {
      trainerPrice = parseFloat(session.trainer.pricePerHour);
    }
    return trainerPrice * (diff / 60);
  };

  const totalPrice = cartSessions.reduce(
    (acc: number, session: SessionData) => acc + calculateSessionCost(session),
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-center my-8">Confirm Your Booking</h1>
      
      {/* Cart Sessions Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Sessions</h2>
        {cartSessions.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border">Type</th>
                <th className="py-2 px-4 border">Trainer</th>
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">Time</th>
                <th className="py-2 px-4 border">Cost</th>
              </tr>
            </thead>
            <tbody>
              {cartSessions.map((session) => (
                <tr key={session.id}>
                  <td className="py-2 px-4 border">{session.type}</td>
                  <td className="py-2 px-4 border">
                    {typeof session.trainer === 'object' ? session.trainer.name : session.trainer}
                  </td>
                  <td className="py-2 px-4 border">{session.date}</td>
                  <td className="py-2 px-4 border">
                    {session.startTime} - {session.endTime}
                  </td>
                  <td className="py-2 px-4 border">
                    ${calculateSessionCost(session).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-2 px-4 border" colSpan={4}>
                  Total
                </td>
                <td className="py-2 px-4 border">
                  ${totalPrice.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
      
      {/* Client Details Form */}
      <div className="p-4 border rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Enter Your Details</h2>
        {message && <p className="mb-4 text-green-600">{message}</p>}
        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={clientDetails.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={clientDetails.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">
              Phone:
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={clientDetails.phone}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 font-bold"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default CartPage;
