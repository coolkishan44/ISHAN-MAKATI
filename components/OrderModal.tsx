import React from 'react';
import { OrderData } from '../types';
import { X, ShoppingBag, Edit2, MessageCircle } from 'lucide-react';

interface OrderModalProps {
  order: OrderData;
  onClose: () => void;
  onConfirm: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ order, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#C62828] p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <ShoppingBag size={20} />
            <h2 className="font-bold text-lg">Order Summary</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 overflow-y-auto">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-700">
            <div className="text-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
               <h3 className="font-bold text-gray-800 dark:text-gray-100">ATUL BAKERY</h3>
               <p className="text-xs text-gray-500">ESTIMATE</p>
            </div>

            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex space-x-2">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{item.quantity}x</span>
                    <span className="text-gray-800 dark:text-gray-200">{item.itemName}</span>
                  </div>
                  <span className="font-mono text-gray-600 dark:text-gray-400">₹{item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-gray-300 dark:border-gray-600 mt-4 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
              <span className="font-bold text-xl text-[#C62828]">₹{order.totalAmount}</span>
            </div>
          </div>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Review your items before sending to WhatsApp.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-900">
          <button 
            onClick={onClose}
            className="flex items-center justify-center py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Edit2 size={16} className="mr-2" />
            Edit Order
          </button>
          
          <button 
            onClick={onConfirm}
            className="flex items-center justify-center py-3 px-4 rounded-xl bg-[#25D366] text-white font-bold hover:brightness-105 shadow-lg hover:shadow-xl transition"
          >
            <MessageCircle size={18} className="mr-2" />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
