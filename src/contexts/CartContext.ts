// contexts/CartContext.tsx
import React, { createContext, useState, ReactNode, FC } from 'react';

export interface Trainer {
  id: number;
  name: string;
  identifier: string;
  pricePerHour: string;
}

export interface SessionData {
  id: number;
  date: string;
  type: string;
  trainer: Trainer | string;
  startTime: string;
  endTime: string;
}

export interface CartContextType {
  cartSessions: SessionData[];
  addToCart: (session: SessionData) => void;
  clearCart: () => void;
}

export interface CartProviderProps {
  children: ReactNode;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: FC<CartProviderProps> = ({ children }) => {
  const [cartSessions, setCartSessions] = useState<SessionData[]>([]);

  const addToCart = (session: SessionData) => {
    setCartSessions((prev) => [...prev, session]);
  };

  const clearCart = () => {
    setCartSessions([]);
  };

  return (
    <CartContext.Provider value={{ cartSessions, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
