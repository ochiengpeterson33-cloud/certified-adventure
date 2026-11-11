import React from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';

export function Dashboard() {
  const { data: counts, isLoading } = useQuery({
    queryKey: ['admin-dashboard-counts'],
    queryFn: async () => {
      // If we don't have a valid connection, return dummy stats
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
         return { hero: 0, packages: 0, bookings: 0 };
      }
      
      const [heroRes, pkgRes, bkgRes] = await Promise.all([
        supabase.from('hero_slides').select('*', { count: 'exact', head: true }),
        supabase.from('packages').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true })
      ]);
      return {
        hero: heroRes.count || 0,
        packages: pkgRes.count || 0,
        bookings: bkgRes.count || 0,
      };
    }
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Welcome to the Certified Adventures Admin Panel.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium text-xs sm:text-sm">Active Hero Slides</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-[#08121B]">{isLoading ? '...' : counts?.hero}</p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium text-xs sm:text-sm">Total Packages</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-[#08121B]">{isLoading ? '...' : counts?.packages}</p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-1">
          <h3 className="text-gray-500 font-medium text-xs sm:text-sm">Total Bookings</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-[#E67A3A]">{isLoading ? '...' : counts?.bookings}</p>
        </div>
      </div>
    </div>
  );
}
