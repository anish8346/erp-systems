// frontend/src/pages/Sales.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, ShieldCheck } from 'lucide-react';
import { Button, ConfirmDialog } from '../components/UI';
import type { SalesOrder, Product, SalesOrderLine, User, PaginationMeta } from '../types';
import axios from 'axios';

// Sub-components
import SalesList from './sales/SalesList';
import SalesDetail from './sales/SalesDetail';
import SalesForm from './sales/SalesForm';
import DeliveryModal from './sales/DeliveryModal';

const Sales = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 20, totalPages: 0, totalItems: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [deliverQtys, setDeliverQtys] = useState<Record<string, number>>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [currentOrder, setCurrentOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(false);

  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerAddress: '',
    salesPersonId: '',
    productId: '',
    quantity: 1,
    customerId: undefined as string | undefined,
    taxRate: 0,
  });

  const [errorAlert, setErrorAlert] = useState<{title: string, message: string} | null>(null);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const salesParams: any = { page, limit: 20 };
      if (searchTerm) salesParams.searchTerm = searchTerm;
      if (statusFilter !== 'all') salesParams.status = statusFilter;
      if (startDate) salesParams.startDate = startDate;
      if (endDate) salesParams.endDate = endDate;

      const [ordersRes, productsRes, usersRes] = await Promise.all([
        api.get('/sales', { params: salesParams }),
        api.get('/products'),
        api.get('/config/users'),
      ]);
      
      const ordersData = ordersRes.data?.orders || [];
      const paginationData = ordersRes.data?.pagination || { page: 1, limit: 20, totalPages: 1, totalItems: ordersData.length };

      setOrders(ordersData);
      setPagination(paginationData);
      
      const prodData = productsRes.data?.products || (Array.isArray(productsRes.data) ? productsRes.data : []);
      setProducts(prodData);
      
      const userData = usersRes.data?.users || (Array.isArray(usersRes.data) ? usersRes.data : []);
      setUsers(userData);
    } catch (err) {
      console.error("Fetch sales data failed", err);
      setErrorAlert({ title: "Connection Error", message: "Failed to load sales data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter, startDate, endDate]);

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const product = products.find(p => p.id === newOrder.productId);
      if (!product) return;
      await api.post('/sales', {
        customerName: newOrder.customerName,
        customerAddress: newOrder.customerAddress,
        customerId: newOrder.customerId,
        salesPersonId: newOrder.salesPersonId,
        taxRate: newOrder.taxRate || 0,
        orderLines: [{
          productId: newOrder.productId,
          quantity: newOrder.quantity,
          price: product.salesPrice,
        }]
      });
      setShowModal(false);
      setNewOrder({ customerName: '', customerAddress: '', salesPersonId: '', productId: '', quantity: 1, customerId: undefined, taxRate: 0 });
      fetchData(1);
    } catch (err: unknown) {
      let errorMsg = "Failed to create sales order";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      setErrorAlert({ title: "Order Creation Failed", message: errorMsg });
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.post(`/sales/${id}/confirm`);
      fetchData(pagination.page);
      refreshCurrentOrder(id);
    } catch (err: unknown) {
      let errorMsg = "Confirmation failed. Check logs for shortages.";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      setErrorAlert({ title: "Action Failed", message: errorMsg });
    }
  };

  const handleCancel = async () => {
    if (!orderToCancel) return;
    try {
      await api.post(`/sales/${orderToCancel}/cancel`);
      fetchData(pagination.page);
      refreshCurrentOrder(orderToCancel);
    } catch (err: unknown) {
      let errorMsg = "Cancellation failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      setErrorAlert({ title: "Action Failed", message: errorMsg });
    }
  };

  const refreshCurrentOrder = async (id: string) => {
    try {
        const res = await api.get('/sales', { params: { searchTerm: id } });
        const found = res.data.orders.find((o: SalesOrder) => o.id === id);
        if (found) setCurrentOrder(found);
    } catch (err) {
        console.error("Refresh order failed", err);
    }
  };

  const openDeliverModal = (order: SalesOrder) => {
    setSelectedOrder(order);
    const initialQtys: Record<string, number> = {};
    order.orderLines.forEach(line => {
      initialQtys[line.id] = line.quantity - (line.deliveredQty || 0);
    });
    setDeliverQtys(initialQtys);
    setShowDeliverModal(true);
  };

  const handleDeliverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const items = Object.keys(deliverQtys).map(lineId => ({
      lineId,
      quantity: Number(deliverQtys[lineId])
    })).filter(i => i.quantity > 0);

    try {
      await api.post(`/sales/${selectedOrder.id}/deliver`, { items });
      setShowDeliverModal(false);
      fetchData(pagination.page);
      refreshCurrentOrder(selectedOrder.id);
    } catch (err: unknown) {
      let errorMsg = "Delivery failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      setErrorAlert({ title: "Action Failed", message: errorMsg });
    }
  };

  const openDetail = (order: SalesOrder) => {
    setCurrentOrder(order);
    setView('detail');
  };

  const handleStartNegotiation = async (id: string) => {
    try {
      await api.post(`/sales/${id}/negotiate`);
      fetchData(pagination.page);
      refreshCurrentOrder(id);
    } catch (err: any) {
      setErrorAlert({ title: "Negotiation Failed", message: err.response?.data?.error || "Failed to start bargaining" });
    }
  };

  const handleAddComment = async (id: string, text: string) => {
    try {
      const res = await api.post(`/sales/${id}/comment`, { text });
      setCurrentOrder(res.data);
    } catch (err: any) {
      alert("Failed to add comment");
    }
  };

  const handleUpdatePrice = async (id: string, lineId: string, price: number) => {
    try {
      const res = await api.patch(`/sales/${id}/line/${lineId}`, { price });
      setCurrentOrder(res.data);
    } catch (err: any) {
      alert("Failed to update price");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {view === 'list' ? (
        <>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">Sales Orders</h2>
              <p className="text-gray-500 text-sm mt-1 font-medium">Track customer demand, fulfillment, and revenue growth.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transaction Secure</span>
              </div>
              <Button onClick={() => setShowModal(true)} variant="primary" className="shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> New Sales Order
              </Button>
            </div>
          </div>

          <SalesList 
            orders={orders}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            onOpenDetail={openDetail}
            pagination={pagination}
            onPageChange={handlePageChange}
            onReset={handleReset}
            loading={loading}
          />
        </>
      ) : currentOrder && (
        <SalesDetail 
          currentOrder={currentOrder}
          onBack={() => setView('list')}
          onConfirm={handleConfirm}
          onDeliver={openDeliverModal}
          onCancel={(id) => { setOrderToCancel(id); setShowCancelConfirm(true); }}
          onStartNegotiation={handleStartNegotiation}
          onAddComment={handleAddComment}
          onUpdatePrice={handleUpdatePrice}
        />
      )}

      <SalesForm 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        newOrder={newOrder}
        setNewOrder={setNewOrder}
        products={products}
        users={users}
      />

      <DeliveryModal 
        isOpen={showDeliverModal}
        onClose={() => setShowDeliverModal(false)}
        onSubmit={handleDeliverSubmit}
        selectedOrder={selectedOrder}
        deliverQtys={deliverQtys}
        setDeliverQtys={setDeliverQtys}
      />

      <ConfirmDialog 
        isOpen={showCancelConfirm}
        onClose={() => { setShowCancelConfirm(false); setOrderToCancel(null); }}
        onConfirm={handleCancel}
        title="Cancel Sales Order"
        description="Are you sure you want to cancel this sales order? This action cannot be undone and will release any reserved stock."
        confirmText="Cancel Order"
        variant="danger"
      />

      <ConfirmDialog 
        isOpen={!!errorAlert}
        onClose={() => setErrorAlert(null)}
        onConfirm={() => setErrorAlert(null)}
        title={errorAlert?.title || "Alert"}
        description={errorAlert?.message || ""}
        confirmText="Acknowledged"
        isAlert={true}
        variant="warning"
      />
    </div>
  );
};

export default Sales;
