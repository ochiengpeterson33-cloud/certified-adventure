import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, Users, Search, Mail, Phone, 
  Clock, CheckCircle2, XCircle, Plus, X, Trash2, AlertTriangle, Check
} from 'lucide-react';

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

  // Deletion states
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
    setActionError(null);
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
      showToast('Booking added successfully!');
      refetch();
    } catch (err: any) {
      console.error("Error adding booking:", err);
      setActionError(err?.message || "Failed to add booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setActionError(null);
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      showToast(`Booking marked as ${status}.`);
      refetch();
    } catch (err: any) {
      console.error("Error updating status:", err);
      setActionError(err?.message || "Failed to update status");
    }
  };

  // Delete single booking
  const handleConfirmSingleDelete = async () => {
    if (!bookingToDelete) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingToDelete.id);
      if (error) throw error;
      
      setSelectedIds(prev => prev.filter(id => id !== bookingToDelete.id));
      showToast(`Booking for ${bookingToDelete.first_name} ${bookingToDelete.last_name} deleted successfully.`);
      setBookingToDelete(null);
      refetch();
    } catch (err: any) {
      console.error("Error deleting booking:", err);
      setActionError(err?.message || "Failed to delete booking. Please check database permissions.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete bookings
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      const count = selectedIds.length;
      const { error } = await supabase.from('bookings').delete().in('id', selectedIds);
      if (error) throw error;
      
      setSelectedIds([]);
      setIsBulkDeleting(false);
      showToast(`${count} booking${count > 1 ? 's' : ''} deleted successfully.`);
      refetch();
    } catch (err: any) {
      console.error("Error bulk deleting bookings:", err);
      setActionError(err?.message || "Failed to delete selected bookings. Please check database permissions.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBookings = bookings?.filter(b => 
    `${b.first_name} ${b.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase()) ||
    b.phone?.toLowerCase().includes(search.toLowerCase()) ||
    b.notes?.toLowerCase().includes(search.toLowerCase())
  );

  const allVisibleSelected = filteredBookings && filteredBookings.length > 0 && filteredBookings.every(b => selectedIds.includes(b.id));

  const toggleSelectAll = () => {
    if (!filteredBookings) return;
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredBookings.map(b => b.id));
      setSelectedIds(prev => prev.filter(id => !visibleIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...filteredBookings.map(b => b.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (isLoading) return <div className="p-8 font-medium text-gray-500">Loading bookings...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading bookings.</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-['Poppins']">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#08121B] text-white px-5 py-3 rounded-xl shadow-2xl border border-[#E67A3A]/40 flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 text-[#E67A3A]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Global Error Banner if any */}
      {actionError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-sm font-medium">{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-700 p-1">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bookings Manager</h1>
          <p className="text-gray-500 mt-1 text-sm">View, manage, update, and delete customer inquiries and reservations.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <button 
              onClick={() => setIsBulkDeleting(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center gap-2 text-sm shadow-sm"
            >
              <Trash2 size={16} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
          <button 
            onClick={() => setIsAddingBooking(true)}
            className="px-4 py-2 bg-[#E67A3A] text-white rounded-lg font-bold hover:bg-[#c9662d] transition-colors flex items-center gap-2 text-sm shadow-sm"
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
                placeholder="Search name, email, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#E67A3A] outline-none w-full sm:w-72 bg-white"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors ${
                  filter === f 
                    ? 'bg-[#E67A3A] text-white shadow-sm' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Items Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-orange-50 border-b border-orange-200 px-4 sm:px-6 py-2.5 flex items-center justify-between flex-wrap gap-2 text-sm">
            <div className="flex items-center gap-2 text-orange-950 font-medium text-xs sm:text-sm">
              <span className="w-5 h-5 rounded-full bg-[#E67A3A] text-white text-xs flex items-center justify-center font-bold">
                {selectedIds.length}
              </span>
              <span>{selectedIds.length} booking{selectedIds.length > 1 ? 's' : ''} selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 font-semibold bg-white border border-gray-300 rounded-lg transition-colors"
              >
                Deselect All
              </button>
              <button
                onClick={() => setIsBulkDeleting(true)}
                className="px-3 py-1 text-xs text-white font-bold bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 size={13} />
                <span>Delete ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-gray-500 min-w-[700px]">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="pl-4 pr-2 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={Boolean(allVisibleSelected)}
                    onChange={toggleSelectAll}
                    aria-label="Select all bookings"
                    className="w-4 h-4 rounded text-[#E67A3A] focus:ring-[#E67A3A] border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-4 font-bold">Customer Details</th>
                <th className="px-6 py-4 font-bold">Trip Info</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-500 font-medium">No bookings found</p>
                  </td>
                </tr>
              ) : (
                filteredBookings?.map((booking) => {
                  const isChecked = selectedIds.includes(booking.id);
                  return (
                    <tr 
                      key={booking.id} 
                      className={`border-b border-gray-100 transition-colors ${isChecked ? 'bg-orange-50/40' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <td className="pl-4 pr-2 py-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(booking.id)}
                          aria-label={`Select booking for ${booking.first_name} ${booking.last_name}`}
                          className="w-4 h-4 rounded text-[#E67A3A] focus:ring-[#E67A3A] border-gray-300 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4">
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
                          <div className="mt-2 text-xs text-gray-600 max-w-xs truncate bg-gray-100 p-2 rounded-md" title={booking.notes}>
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
                        <div className="flex justify-end items-center gap-1.5">
                          {booking.status !== 'confirmed' && (
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Confirm Booking"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          {booking.status !== 'cancelled' && (
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel Booking"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          {booking.status !== 'pending' && (
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, 'pending')}
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Mark as Pending"
                            >
                              <Clock size={18} />
                            </button>
                          )}
                          
                          {/* Delete Button */}
                          <div className="h-4 w-px bg-gray-200 mx-1" />
                          <button 
                            onClick={() => setBookingToDelete(booking)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Booking"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Single Confirmation Modal */}
      {bookingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Booking</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Are you sure you want to delete the booking for{' '}
              <strong className="text-gray-900">{bookingToDelete.first_name} {bookingToDelete.last_name}</strong>?
            </p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-600 mb-6 space-y-1">
              <div><strong>Email:</strong> {bookingToDelete.email}</div>
              <div><strong>Date:</strong> {new Date(bookingToDelete.date).toLocaleDateString()}</div>
              <div><strong>Guests:</strong> {bookingToDelete.guests}</div>
              {bookingToDelete.notes && (
                <div className="truncate"><strong>Details:</strong> {bookingToDelete.notes}</div>
              )}
            </div>
            <p className="text-xs text-red-500 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBookingToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 text-sm shadow-sm flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete {selectedIds.length} Bookings</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Are you sure you want to permanently delete the <strong className="text-gray-900">{selectedIds.length}</strong> selected bookings?
            </p>
            <p className="text-xs text-red-500 text-center mb-6">This action cannot be undone and will remove all selected booking records from the system.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsBulkDeleting(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 text-sm shadow-sm flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete Selected</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Booking Modal */}
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
