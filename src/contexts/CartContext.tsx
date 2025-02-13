// contexts/CartContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

export interface SessionFormData {
  date: string;
  type: string;
  trainer: string;
  startTime: string;
  endTime: string;
}

export interface Trainer {
  id: string;
  name: string;
}

interface CartContextProps {
  cartSessions: SessionFormData[];
  addSession: (session: SessionFormData) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartSessions, setCartSessions] = useState<SessionFormData[]>([]);

  const addSession = (session: SessionFormData) => {
    setCartSessions((prev) => [...prev, session]);
  };

  const clearCart = () => {
    setCartSessions([]);
  };

  return (
    <CartContext.Provider value={{ cartSessions, addSession, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
