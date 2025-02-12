import React, { useState, useEffect, ChangeEvent, FormEvent, useContext } from 'react';
import axios from 'axios';
import { FaShoppingCart } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { CartContext, Trainer } from '../contexts/CartContext';

interface SessionFormData {
  date: string;
  type: string;
  trainer: string;
  startTime: string;
  endTime: string;
}

const Home: React.FC = () => {
  const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [formData, setFormData] = useState<SessionFormData>({
    date: '',
    type: '',
    trainer: '',
    startTime: '',
    endTime: '',
  });

  const cartContext = useContext(CartContext);
  if (!cartContext) {
    throw new Error('CartContext is not provided');
  }
  const { cartSessions, addToCart } = cartContext;

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined in your environment variables.');
    }
    axios
      .get(`${backendUrl}/trainers`)
      .then((response) => {
        console.log('Fetched trainers:', response.data);
        setTrainers(response.data);
      })
      .catch((error) => {
        console.error('Error fetching trainers:', error);
      });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validate that all session fields are filled
    if (
      !formData.date ||
      !formData.type ||
      !formData.trainer ||
      !formData.startTime ||
      !formData.endTime
    ) {
      alert('Please fill in all session details.');
      return;
    }
    console.log('Session added to cart:', formData);
    alert('Session added to cart!');
    // Add the session to cart with a unique id (using Date.now() as a simple id)
    addToCart({ ...formData, id: Date.now() });
    setFormData({
      date: '',
      type: '',
      trainer: '',
      startTime: '',
      endTime: '',
    });
  };

  return (
    <div className="bg-slate-400 flex flex-col h-screen">
      {/* Header with title and cart icon */}
      <header className="flex-[0.1] flex justify-between items-center p-4 bg-slate-50">
        <h2 className="text-3xl font-extrabold">
          Book Sessions with our trainers
        </h2>
        <div
          className="relative cursor-pointer"
          onClick={() => router.push('/cart')}
        >
          <FaShoppingCart className="text-4xl" />
          {cartSessions.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-[9px] font-bold text-white bg-red-600 rounded-full">
              {cartSessions.length}
            </span>
          )}
        </div>
      </header>
      {/* Main content with the session form */}
      <div className="bg-white flex-[0.5] flex items-center justify-center">
        <div className="w-96">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 border rounded shadow-lg mt-6">
            <h2 className="text-2xl font-bold mb-4 text-[#050f13]">Session Details</h2>
            <div className="mb-2">
              <label htmlFor="date" className="block text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#007BA7]"
              />
            </div>
            <div className="mb-2 flex gap-4">
              <div className="w-1/2">
                <label htmlFor="type" className="block text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none"
                >
                  <option value="">Select Type</option>
                  <option value="FITNESS">Fitness</option>
                  <option value="PADEL">Padel</option>
                  <option value="TENNIS">Tennis</option>
                </select>
              </div>
              <div className="w-1/2">
                <label htmlFor="trainer" className="block text-gray-700 mb-1">
                  Trainer *
                </label>
                <select
                  name="trainer"
                  value={formData.trainer}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none"
                >
                  <option value="">Select Trainer</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-2 flex gap-4">
              <div className="w-1/2">
                <label htmlFor="startTime" className="block text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  min="06:00"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="endTime" className="block text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  max="20:00"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none"
                />
              </div>
            </div>
            <button className="w-full mt-4 bg-slate-100 text-black py-2 px-4 rounded hover:bg-slate-400 font-bold">
              Add to Cart
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
