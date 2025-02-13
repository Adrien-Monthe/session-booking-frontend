import React, { useState, useContext, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartContext, SessionFormData } from '@/contexts/CartContext';

interface Trainer {
  id: number;
  name: string;
  identifier: string;
  pricePerHour: number;
}

const Cart: React.FC = () => {
  const router = useRouter();
  const cartContext = useContext(CartContext);
  if (!cartContext) {
    throw new Error('CartContext is not provided');
  }
  const { cartSessions, clearCart } = cartContext;

  // Redirect to home if the cart is empty.
  useEffect(() => {
    if (cartSessions.length === 0) {
      router.push('/');
    }
  }, [cartSessions, router]);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    termsAccepted: false,
  });
  const [trainerMap, setTrainerMap] = useState<{ [key: string]: Trainer }>({});

  // Fetch trainer details for each unique trainer id in the cart.
  useEffect(() => {
    async function fetchTrainers() {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined');
      }
      const uniqueTrainerIds = Array.from(new Set(cartSessions.map(session => session.trainer)));
      const newTrainerMap: { [key: string]: Trainer } = {};

      await Promise.all(
        uniqueTrainerIds.map(async (id) => {
          try {
            const res = await axios.get(`${backendUrl}/trainers/${id}`);
            newTrainerMap[id] = res.data;
          } catch (error) {
            console.error(`Error fetching trainer with id ${id}`, error);
          }
        })
      );
      setTrainerMap(newTrainerMap);
    }
    if (cartSessions.length > 0) {
      fetchTrainers();
    }
  }, [cartSessions]);

  const handleUserDataChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userData.name || !userData.email || !userData.phoneNumber) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!userData.termsAccepted) {
      toast.error('Please accept the terms and conditions.');
      return;
    }

    // Build the booking payload according to CreateBookingDto.
    const bookingPayload = {
      clientName: userData.name,
      clientEmail: userData.email,
      clientPhone: userData.phoneNumber,
      sessions: cartSessions.map(session => ({
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        trainerId: Number(session.trainer),
        type: session.type.toLowerCase(),
      })),
      termsAccepted: userData.termsAccepted,
    };

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined');
      }
      await axios.post(`${backendUrl}/bookings`, bookingPayload);
      toast.success('Booking completed successfully!');
      // Clear the cart after successful booking.
      clearCart();
      router.push('/');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('There was an error creating your booking. Please try again.');
    }
  };

  // Calculate total price for the sessions.
  const totalPrice = cartSessions.reduce((acc, session) => {
    const trainer = trainerMap[session.trainer];
    if (trainer) {
      const start = moment(`${session.date}T${session.startTime}`);
      const end = moment(`${session.date}T${session.endTime}`);
      const diffInMinutes = end.diff(start, 'minutes');
      const diffInHours = diffInMinutes / 60;
      return acc + diffInHours * trainer.pricePerHour;
    }
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center mb-6">Your Cart</h1>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Column: Sessions Table */}
        <div className="md:w-2/3 overflow-auto">
          {cartSessions.length === 0 ? (
            <p className="text-center">Your cart is empty.</p>
          ) : (
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Type</th>
                  <th className="py-2 px-4 border-b">Trainer</th>
                  <th className="py-2 px-4 border-b">Start Time</th>
                  <th className="py-2 px-4 border-b">End Time</th>
                  <th className="py-2 px-4 border-b">Price</th>
                </tr>
              </thead>
              <tbody>
                {cartSessions.map((session: SessionFormData, index: number) => {
                  const trainer = trainerMap[session.trainer];
                  let sessionPrice = 0;
                  if (trainer) {
                    const start = moment(`${session.date}T${session.startTime}`);
                    const end = moment(`${session.date}T${session.endTime}`);
                    const diffInMinutes = end.diff(start, 'minutes');
                    const diffInHours = diffInMinutes / 60;
                    sessionPrice = diffInHours * trainer.pricePerHour;
                  }
                  return (
                    <tr key={index} className="text-center">
                      <td className="py-2 px-4 border-b">{session.date}</td>
                      <td className="py-2 px-4 border-b">{session.type}</td>
                      <td className="py-2 px-4 border-b">{trainer ? trainer.name : session.trainer}</td>
                      <td className="py-2 px-4 border-b">{session.startTime}</td>
                      <td className="py-2 px-4 border-b">{session.endTime}</td>
                      <td className="py-2 px-4 border-b">
                        {trainer ? `$${sessionPrice.toFixed(2)}` : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-bold">
                  <td colSpan={5} className="py-2 px-4 text-right border-t">
                    Total Price:
                  </td>
                  <td className="py-2 px-4 border-t">
                    ${totalPrice.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Right Column: User Information Form */}
        <div className="md:w-1/3 bg-white p-6 rounded shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Enter Your Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-black mb-1">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={userData.name}
                onChange={handleUserDataChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-black mb-1">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={userData.email}
                onChange={handleUserDataChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-black mb-1">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={userData.phoneNumber}
                onChange={handleUserDataChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="termsAccepted"
                id="termsAccepted"
                checked={userData.termsAccepted}
                onChange={handleUserDataChange}
                className="mr-2"
              />
              <label htmlFor="termsAccepted" className="text-black">
                I accept the terms and conditions
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 font-bold"
            >
              Submit Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cart;
