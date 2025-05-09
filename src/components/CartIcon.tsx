'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CartIcon: React.FC = () => {
  const { getCartItemsCount } = useAppContext();
  const itemCount = getCartItemsCount();

  return (
    <Link href="/cart" className="relative">
      <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-gray-900" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#f5a623] text-xs font-bold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
