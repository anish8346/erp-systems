import React, { useState } from 'react';
import { 
  ArrowLeft, CheckCircle, Truck, XCircle, Package, User as UserIcon, 
  MapPin, Clock, MessageSquare, Edit3, Save, TrendingDown, History 
} from 'lucide-react';
import { Button, Card, Badge } from '../../components/UI';
import type { SalesOrder, SalesOrderLine, SalesOrderComment } from '../../types';

interface SalesDetailProps {
  currentOrder: SalesOrder;
  onBack: () => void;
  onConfirm: (id: string) => void;
  onDeliver: (order: SalesOrder) => void;
  onCancel: (id: string) => void;
  onStartNegotiation: (id: string) => void;
  onAddComment: (id: string, text: string) => void;
  onUpdatePrice: (id: string, lineId: string, price: number) => void;
}

const SalesDetail = ({ 
  currentOrder, 
  onBack, 
  onConfirm, 
  onDeliver, 
  onCancel,
  onStartNegotiation,
  onAddComment,
  onUpdatePrice
}: SalesDetailProps) => {
  const [view, setView] = useState<'detail' | 'negotiation'>(
    currentOrder.status === 'NEGOTIATION' ? 'negotiation' : 'detail'
  );
  const [newComment, setNewComment] = useState('');
  const [editingPriceLineId, setEditingPriceLineId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const handleAddComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;
      onAddComment(currentOrder.id, newComment);
      setNewComment('');
  };

  const handleUpdatePrice = (lineId: string) => {
      onUpdatePrice(currentOrder.id, lineId, tempPrice);
      setEditingPriceLineId(null);
  };

  if (view === 'negotiation') {
      return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('detail')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-luxury-brown" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-luxury-brown">Negotiate Order</h2>
                        <p className="text-warm-taupe text-sm font-medium">Bargaining for ORD-{currentOrder.id.slice(0,8).toUpperCase()} with {currentOrder.customerName}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="danger" onClick={() => onCancel(currentOrder.id)}>Cancel Order</Button>
                    <Button onClick={() => { onConfirm(currentOrder.id); onBack(); }}>Confirm & Close</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                      <Card title="Product Pricing" subtitle="Adjust sales prices based on bargaining">
                          <div className="space-y-4">
                              {currentOrder.orderLines.map((line) => (
                                  <div key={line.id} className="flex flex-col md:flex-row items-center gap-4 p-4 bg-faded-white rounded-xl border border-soft-cream">
                                      <div className="flex-1">
                                          <p className="font-bold text-gray-800">{line.product?.name}</p>
                                          <p className="text-xs text-warm-taupe font-medium">Qty: {line.quantity}</p>
                                      </div>
                                      
                                      <div className="flex items-center gap-6">
                                          <div className="text-right">
                                              <p className="text-[10px] font-bold text-gray-500 uppercase">Original Price</p>
                                              <p className="text-sm font-bold text-gray-400 line-through">₹{line.initialPrice.toLocaleString()}</p>
                                          </div>
                                          
                                          <div className="w-32">
                                              <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Negotiated Price</p>
                                              {editingPriceLineId === line.id ? (
                                                  <div className="flex gap-1">
                                                      <input 
                                                        type="number"
                                                        className="w-full px-2 py-1 border-2 border-orange-500 rounded text-sm font-bold outline-none"
                                                        value={tempPrice}
                                                        onChange={(e) => setTempPrice(Number(e.target.value))}
                                                        autoFocus
                                                      />
                                                      <button onClick={() => handleUpdatePrice(line.id)} className="p-1 bg-emerald-500 text-white rounded">
                                                          <Save className="w-4 h-4" />
                                                      </button>
                                                  </div>
                                              ) : (
                                                  <div 
                                                    className="flex items-center justify-between px-3 py-1.5 bg-white border border-soft-cream rounded-lg cursor-pointer hover:border-orange-500 group transition-all"
                                                    onClick={() => { setEditingPriceLineId(line.id); setTempPrice(line.price); }}
                                                  >
                                                      <span className="text-sm font-bold text-luxury-brown">₹{line.price.toLocaleString()}</span>
                                                      <Edit3 className="w-3 h-3 text-warm-taupe group-hover:text-orange-500" />
                                                  </div>
                                              )}
                                          </div>

                                          <div className="text-right min-w-[80px]">
                                              <p className="text-[10px] font-bold text-rose-600 uppercase">Discount</p>
                                              <p className="text-sm font-bold text-rose-600">
                                                  -₹{((line.initialPrice - line.price) * line.quantity).toLocaleString()}
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          
                          <div className="mt-6 pt-6 border-t flex justify-between items-center">
                              <div>
                                  <p className="text-xs text-warm-taupe font-bold uppercase">Current Total</p>
                                  <p className="text-2xl font-black text-luxury-brown">₹{currentOrder.totalAmount.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-xs text-rose-600 font-bold uppercase">Total Reduction</p>
                                  <p className="text-lg font-bold text-rose-600">
                                      -₹{currentOrder.orderLines.reduce((acc, l) => acc + (l.initialPrice - l.price) * l.quantity, 0).toLocaleString()}
                                  </p>
                              </div>
                          </div>
                      </Card>
                  </div>

                  <div className="space-y-6">
                      <Card title="Negotiation Log" subtitle="History of bargaining rounds">
                          <div className="overflow-y-auto space-y-4 mb-4 max-h-[400px] pr-2 custom-scrollbar min-h-[200px]">
                              {currentOrder.comments?.map((comment) => (
                                  <div key={comment.id} className="bg-faded-white p-3 rounded-xl border border-soft-cream">
                                      <div className="flex justify-between items-center mb-1">
                                          <span className="text-[10px] font-bold text-luxury-brown">{comment.user?.name}</span>
                                          <span className="text-[10px] text-warm-taupe">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                      <p className="text-xs text-gray-700 leading-relaxed font-medium">{comment.text}</p>
                                  </div>
                              ))}
                              {(!currentOrder.comments || currentOrder.comments.length === 0) && (
                                  <div className="text-center py-10">
                                      <History className="w-8 h-8 text-soft-cream mx-auto mb-2" />
                                      <p className="text-[10px] text-warm-taupe font-bold uppercase">No comments yet</p>
                                  </div>
                              )}
                          </div>

                          <form onSubmit={handleAddComment} className="mt-auto pt-4 border-t border-soft-cream">
                              <textarea 
                                className="w-full px-4 py-2 text-sm border border-soft-cream rounded-xl focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-faded-white resize-none h-24 font-medium"
                                placeholder="Log customer offer or notes..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                required
                              />
                              <Button type="submit" className="w-full mt-2" size="sm">
                                  Post Comment
                              </Button>
                          </form>
                      </Card>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to list
        </Button>
        <div className="flex gap-3">
           {(currentOrder.status === 'DRAFT' || currentOrder.status === 'NEGOTIATION') && (
             <>
               <Button variant="danger" onClick={() => onCancel(currentOrder.id)}>
                 <XCircle className="w-4 h-4 mr-2" /> Cancel
               </Button>
               <Button variant="orange" onClick={() => { 
                   if (currentOrder.status === 'DRAFT') onStartNegotiation(currentOrder.id);
                   setView('negotiation');
               }}>
                 <TrendingDown className="w-4 h-4 mr-2" /> Bargain
               </Button>
               <Button onClick={() => onConfirm(currentOrder.id)}>
                 <CheckCircle className="w-4 h-4 mr-2" /> Confirm Order
               </Button>
             </>
           )}
           {(currentOrder.status === 'CONFIRMED' || currentOrder.status === 'PARTIALLY_DELIVERED') && (
             <>
               <Button variant="danger" onClick={() => onCancel(currentOrder.id)}>
                 <XCircle className="w-4 h-4 mr-2" /> Cancel Order
               </Button>
               <Button variant="primary" onClick={() => onDeliver(currentOrder)}>
                 <Truck className="w-4 h-4 mr-2" /> Deliver Items
               </Button>
             </>
           )}
        </div>
      </div>

      <Card title={`Order ${currentOrder.id.slice(0,8).toUpperCase()}`} subtitle={`Status: ${currentOrder.status}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Customer</label>
              <p className="text-lg font-bold text-luxury-brown">{currentOrder.customerName}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Delivery Address
              </label>
              <p className="text-sm font-medium text-luxury-brown">{currentOrder.customerAddress || 'No address provided'}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3" /> Sales Person
              </label>
              <p className="text-sm font-medium text-luxury-brown">{currentOrder.salesPerson?.name || 'Unassigned'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Order Date
              </label>
              <p className="text-sm font-medium text-luxury-brown">{new Date(currentOrder.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Total Amount</label>
              <p className="text-2xl font-black text-luxury-brown">₹{currentOrder.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h4 className="font-bold text-luxury-brown mb-4 border-b pb-2 flex items-center gap-2">
            <Package className="w-4 h-4" /> Ordered Products
          </h4>
          <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                  <tr className="text-left text-[10px] font-bold text-warm-taupe uppercase tracking-widest border-b">
                    <th className="pb-3">Product</th>
                    <th className="pb-3 text-center">Ordered</th>
                    <th className="pb-3 text-center">Delivered</th>
                    <th className="pb-3 text-center">Price</th>
                    <th className="pb-3 text-right">Subtotal</th>
                    <th className="pb-3 text-center">Availability</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 text-sm">
                  {currentOrder.orderLines.map(line => {
                    const freeToUse = (line.product?.qtyOnHand || 0) - (line.product?.qtyReserved || 0);
                    const isAvailable = freeToUse >= (line.quantity - line.deliveredQty);
                    return (
                      <tr key={line.id} className="group">
                        <td className="py-4">
                          <p className="font-bold text-luxury-brown">{line.product?.name}</p>
                        </td>
                        <td className="py-4 text-center font-semibold">{line.quantity}</td>
                        <td className="py-4 text-center font-semibold text-blue-600">{line.deliveredQty}</td>
                        <td className="py-4 text-center font-medium text-gray-500">₹{line.price.toLocaleString()}</td>
                        <td className="py-4 text-right font-bold text-luxury-brown">₹{(line.quantity * line.price).toLocaleString()}</td>
                        <td className="py-4 text-center">
                          {isAvailable ? (
                            <Badge variant="success">Available</Badge>
                          ) : (
                            <Badge variant="warning">Shortage: {Math.abs(freeToUse - (line.quantity - line.deliveredQty))}</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
               </tbody>
             </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SalesDetail;
