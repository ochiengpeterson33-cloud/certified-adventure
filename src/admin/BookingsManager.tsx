import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, MapPin, Search, Filter, Mail, Phone, Clock, CheckCircle2, XCircle, Plus, X } from 'lucide-react';

interface Booking {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
  created_at: string;
}

export function BookingsManager() {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [newBooking, setNewBooking] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    guests: 1,
    notes: '',
    status: 'confirmed'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);


  const { data: bookings, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', filter],
    queryFn: async () => {
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Booking[];
    }
  });

  
  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('bookings').insert([newBooking]);
      if (error) throw error;
      setIsAddingBooking(false);
      setNewBooking({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        guests: 1,
        notes: '',
        status: 'confirmed'
      });
      refetch();
    } catch (error) {
      console.error("Error adding booking:", error);
      alert("Failed to add booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const filteredBookings = bookings?.filter(b => 
    `${b.first_name} ${b.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (isLoading) return <div className="p-8">Loading bookings...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading bookings.</div>;

    return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Manager</h1>
          <p className="text-gray-500 mt-1">View and manage customer inquiries and reservations.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAddingBooking(true)}
            className="px-4 py-2 bg-[#E67A3A] text-white rounded-lg font-bold hover:bg-[#c9662d] transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Add Booking</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#E67A3A] outline-none w-full sm:w-64 bg-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f 
                    ? 'bg-[#E67A3A] text-white' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="overflow-x-auto w-full"><table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Customer Details</th>
                <th className="px-6 py-4 font-bold">Trip Info</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-gray-500 font-medium">No bookings found</p>
                  </td>
                </tr>
              ) : (
                filteredBookings?.map((booking) => (
                  <tr key={booking.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 mb-1">{booking.first_name} {booking.last_name}</div>
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400"/> {booking.email}</div>
                        <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400"/> {booking.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 font-medium text-gray-900">
                          <Calendar className="w-4 h-4 text-[#E67A3A]"/> 
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-gray-400"/> 
                          {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                        </div>
                      </div>
                      {booking.notes && (
                        <div className="mt-2 text-xs text-gray-500 max-w-xs truncate bg-gray-100 p-2 rounded-md" title={booking.notes}>
                          {booking.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[11px] uppercase font-bold rounded-full border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-2 uppercase font-medium">
                        Requested: {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {booking.status !== 'confirmed' && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors tooltip"
                            title="Confirm Booking"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip"
                            title="Cancel Booking"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        {booking.status !== 'pending' && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'pending')}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors tooltip"
                            title="Mark as Pending"
                          >
                            <Clock size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table></div>
        </div>
      </div>

      {isAddingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Add New Booking</h2>
              <button onClick={() => setIsAddingBooking(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddBooking} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
                  <input required type="text" value={newBooking.first_name} onChange={e => setNewBooking({...newBooking, first_name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
                  <input required type="text" value={newBooking.last_name} onChange={e => setNewBooking({...newBooking, last_name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input required type="email" value={newBooking.email} onChange={e => setNewBooking({...newBooking, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                  <input required type="tel" value={newBooking.phone} onChange={e => setNewBooking({...newBooking, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                  <input required type="date" value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Guests</label>
                  <input required type="number" min="1" value={newBooking.guests} onChange={e => setNewBooking({...newBooking, guests: parseInt(e.target.value) || 1})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                <textarea value={newBooking.notes} onChange={e => setNewBooking({...newBooking, notes: e.target.value})} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none" placeholder="Any special requests or package details..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                <select value={newBooking.status} onChange={e => setNewBooking({...newBooking, status: e.target.value as any})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E67A3A] outline-none">
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsAddingBooking(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#E67A3A] text-white rounded-lg font-bold hover:bg-[#c9662d] transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
