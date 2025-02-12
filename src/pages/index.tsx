import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useContext,
} from "react";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";
import { useRouter } from "next/router";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CartContext, Trainer, SessionFormData } from "../contexts/CartContext";

interface Session {
  id: string;
  date: string;
  type: string;
  trainer: string;
  startTime: string;
  endTime: string;
}

const localizer = momentLocalizer(moment);

const Home: React.FC = () => {
  const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [formData, setFormData] = useState<SessionFormData>({
    date: "",
    type: "",
    trainer: "",
    startTime: "",
    endTime: "",
  });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<unknown[]>([]);

  // Access the CartContext
  const cartContext = useContext(CartContext);
  if (!cartContext) {
    throw new Error("CartContext is not provided");
  }
  const { cartSessions, addSession } = cartContext;

  // Fetch trainers for the form
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error(
        "NEXT_PUBLIC_BACKEND_URL is not defined in your environment variables."
      );
    }
    axios
      .get(`${backendUrl}/trainers`)
      .then((response) => {
        console.log("Fetched trainers:", response.data);
        setTrainers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching trainers:", error);
      });
  }, []);

  // Fetch sessions for the calendar
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
    }
    axios
      .get(`${backendUrl}/sessions`)
      .then((response) => {
        console.log("Fetched sessions:", response.data);
        setSessions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching sessions:", error);
      });
  }, []);

  // Convert sessions to events for react-big-calendar
  useEffect(() => {
    const convertedEvents = sessions.map((session) => ({
      title: `${session.type} with ${session.trainer}`,
      start: new Date(`${session.date}T${session.startTime}`),
      end: new Date(`${session.date}T${session.endTime}`),
      allDay: false,
    }));
    setEvents(convertedEvents);
  }, [sessions]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      alert("Please fill in all session details.");
      return;
    }
    // Add the session to the cart using context
    addSession(formData);
    console.log("Session added to cart:", formData);
    alert("Session added to cart!");
  };

  return (
    <div className="flex flex-col bg-white min-h-screen overflow-auto">
      {/* Header */}
      <header className="relative flex items-center justify-center p-4 bg-slate-400">
        <h2 className="text-3xl font-extrabold text-white text-center">
          Book Sessions with our trainers
        </h2>
        <div
          className="absolute right-4 cursor-pointer"
          onClick={() => router.push("/cart")}
        >
          <FaShoppingCart className="text-4xl" />
          {cartSessions.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-[9px] font-bold text-white bg-red-600 rounded-full">
              {cartSessions.length}
            </span>
          )}
        </div>
      </header>

      {/* Session Form */}
      <div className="flex-[0.4] flex items-center justify-center">
        <div className="w-96">
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto p-6 border rounded shadow-lg mt-6 bg-white"
          >
            <h2 className="text-2xl font-bold mb-4 text-black">
              Session Details
            </h2>
            <div className="mb-2">
              <label htmlFor="date" className="block text-black mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:border-[#007BA7]"
              />
            </div>
            <div className="mb-2 flex gap-4">
              <div className="w-1/2">
                <label htmlFor="type" className="block text-black mb-1">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none"
                >
                  <option value="">Select Type</option>
                  <option value="FITNESS">Fitness</option>
                  <option value="PADEL">Padel</option>
                  <option value="TENNIS">Tennis</option>
                </select>
              </div>
              <div className="w-1/2">
                <label htmlFor="trainer" className="block text-black mb-1">
                  Trainer *
                </label>
                <select
                  name="trainer"
                  value={formData.trainer}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none"
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
                <label htmlFor="startTime" className="block text-black mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  min="06:00"
                  className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="endTime" className="block text-black mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  max="20:00"
                  className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none"
                />
              </div>
            </div>
            <button className="w-full mt-4 bg-slate-100 text-black py-2 px-4 rounded hover:bg-slate-400 font-bold">
              Add to Cart
            </button>
          </form>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 bg-white overflow-auto p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
};

export default Home;
