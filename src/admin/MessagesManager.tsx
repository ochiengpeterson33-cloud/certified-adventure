import React from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Mail, Trash2, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}

export function MessagesManager() {
  const { data: messages, isLoading, error, refetch } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Message[];
    }
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  if (isLoading) return <div className="p-8">Loading messages...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading messages.</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">Manage contact form submissions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="overflow-x-auto w-full"><table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold">Message</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages?.map((msg) => (
                <tr key={msg.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 mb-1">{msg.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail className="w-3.5 h-3.5" /> {msg.email}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 uppercase font-medium">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 mb-1">{msg.subject}</div>
                    <div className="text-xs text-gray-600 max-w-xs">{msg.message}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[11px] uppercase font-bold rounded-full border ${
                      msg.status === 'new' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                      msg.status === 'replied' ? 'bg-green-100 text-green-800 border-green-200' : 
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {msg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {msg.status === 'new' && (
                        <button 
                          onClick={() => handleUpdateStatus(msg.id, 'read')}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                          title="Mark as Read"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(msg.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {messages?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}
