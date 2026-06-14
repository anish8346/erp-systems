import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Factory, Package, ListTree, Timer, XCircle, Play, CheckCircle } from 'lucide-react';
import { Button, Card, Badge } from '../../components/UI';
import type { ManufacturingOrder, MOComponent, WorkOrder } from '../../types';

interface ManufacturingDetailProps {
  currentMO: ManufacturingOrder;
  onBack: () => void;
  onConfirm: (id: string) => void;
  onProduce: (id: string) => void;
  onCancel: (id: string) => void;
  updateConsumedQty: (compId: string, consumed: number) => void;
  updateWOStatus: (woId: string, status: string) => void;
  updateWODuration: (woId: string, duration: number) => void;
}

const ManufacturingDetail = ({ 
  currentMO, 
  onBack, 
  onConfirm, 
  onProduce, 
  onCancel,
  updateConsumedQty,
  updateWOStatus,
  updateWODuration
}: ManufacturingDetailProps) => {
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newElapsed: Record<string, number> = {};
      currentMO.WorkOrders?.forEach(wo => {
        if (wo.status === 'IN_PROGRESS' && wo.startTime) {
          const diffMs = new Date().getTime() - new Date(wo.startTime).getTime();
          newElapsed[wo.id] = Math.floor(diffMs / 1000); // Seconds
        }
      });
      setElapsedTimes(newElapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentMO.WorkOrders]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const isReadOnly = currentMO.status === 'DONE' || currentMO.status === 'CANCELLED';
  const isDraft = currentMO.status === 'DRAFT';
  const isConfirmed = currentMO.status === 'CONFIRMED' || currentMO.status === 'IN_PROGRESS';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to list
        </Button>
        <div className="flex gap-3">
           {isDraft && (
             <>
               <Button variant="danger" onClick={() => onCancel(currentMO.id)}>
                 <XCircle className="w-4 h-4 mr-2" /> Cancel MO
               </Button>
               <Button onClick={() => onConfirm(currentMO.id)}>
                 <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm MO
               </Button>
             </>
           )}
           {isConfirmed && (
             <>
               <Button variant="danger" onClick={() => onCancel(currentMO.id)}>
                 <XCircle className="w-4 h-4 mr-2" /> Cancel MO
               </Button>
               <Button variant="success" onClick={() => onProduce(currentMO.id)}>
                 <Factory className="w-4 h-4 mr-2" /> Produce
               </Button>
             </>
           )}
        </div>
      </div>

      <Card title={`Manufacturing Order ${currentMO.id.slice(0,8).toUpperCase()}`} subtitle={`Status: ${currentMO.status}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Finished Product</label>
              <p className="text-lg font-bold text-luxury-brown">{currentMO.product?.name}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Quantity to Produce</label>
              <p className="text-sm font-bold text-luxury-brown">{currentMO.quantity} units</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Assignee</label>
              <p className="text-sm font-medium text-luxury-brown">{currentMO.assignee?.name || 'Unassigned'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Bill of Materials</label>
              <p className="text-sm font-medium text-luxury-brown">{currentMO.bom?.name || 'Standard'}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Planned Date</label>
              <p className="text-sm font-medium text-luxury-brown">{new Date(currentMO.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Components Section */}
        <div className="mt-10">
          <h4 className="font-bold text-luxury-brown mb-4 border-b pb-2 flex items-center gap-2">
            <Package className="w-4 h-4" /> Components / Materials
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-bold text-warm-taupe uppercase tracking-widest border-b">
                  <th className="pb-3">Product</th>
                  <th className="pb-3 text-center">To Consume</th>
                  <th className="pb-3 text-center">Consumed</th>
                  <th className="pb-3 text-center">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentMO.components?.map((comp: MOComponent) => {
                  const freeToUse = (comp.product?.qtyOnHand || 0) - (comp.product?.qtyReserved || 0);
                  const isAvailable = freeToUse >= comp.toConsume;
                  return (
                    <tr key={comp.id}>
                      <td className="py-3 font-semibold text-luxury-brown">{comp.product?.name}</td>
                      <td className="py-3 text-center font-bold">{comp.toConsume}</td>
                      <td className="py-3 text-center">
                        {isConfirmed ? (
                          <input 
                            type="number"
                            className="w-20 px-2 py-1 border rounded text-center font-bold"
                            defaultValue={comp.consumed}
                            onBlur={(e) => updateConsumedQty(comp.id, Number(e.target.value))}
                            disabled={isReadOnly}
                          />
                        ) : (
                          <span className="text-gray-400 italic">Hidden until confirmed</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {isAvailable ? (
                          <Badge variant="success">Available</Badge>
                        ) : (
                          <Badge variant="warning">Shortage</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!currentMO.components || currentMO.components.length === 0) && (
              <p className="py-10 text-center text-gray-400 italic">No components defined for this order.</p>
            )}
          </div>
        </div>

        {/* Work Orders Section */}
        <div className="mt-10">
          <h4 className="font-bold text-luxury-brown mb-4 border-b pb-2 flex items-center gap-2">
            <ListTree className="w-4 h-4" /> Work Orders / Production Steps
          </h4>
          <div className="space-y-4">
             {currentMO.WorkOrders?.map((wo: WorkOrder) => (
               <div key={wo.id} className={`p-4 rounded-xl border ${wo.status === 'DONE' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-faded-white border-soft-cream'}`}>
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${wo.status === 'DONE' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-luxury-brown'}`}>
                           <Timer className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="font-bold text-luxury-brown">{wo.operation?.name || wo.operationName}</p>
                           <p className="text-[10px] font-bold text-warm-taupe uppercase">{wo.workCenter?.name || 'General Assembly'}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <Badge variant={wo.status === 'DONE' ? 'success' : wo.status === 'IN_PROGRESS' ? 'purple' : 'neutral'}>
                           {wo.status}
                        </Badge>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-soft-cream/50">
                     <div>
                        <label className="text-[9px] font-bold text-warm-taupe uppercase block">Expected</label>
                        <span className="text-sm font-bold text-luxury-brown">{wo.expectedDuration} mins</span>
                     </div>
                     <div>
                        <label className="text-[9px] font-bold text-warm-taupe uppercase block">Real Duration</label>
                        {wo.status === 'DONE' ? (
                            <span className="text-sm font-black text-emerald-600">{wo.realDuration} mins</span>
                        ) : wo.status === 'IN_PROGRESS' ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                <span className="text-sm font-black text-blue-600">{formatTime(elapsedTimes[wo.id] || 0)}</span>
                            </div>
                        ) : (
                            <span className="text-sm text-gray-400 font-bold italic">Not started</span>
                        )}
                     </div>
                     <div className="md:col-span-2 flex justify-end gap-2">
                        {wo.status === 'PENDING' && !isReadOnly && (
                          <Button size="sm" variant="secondary" onClick={() => updateWOStatus(wo.id, 'IN_PROGRESS')} className="gap-2">
                            <Play className="w-3.5 h-3.5" /> Start Task
                          </Button>
                        )}
                        {wo.status === 'IN_PROGRESS' && (
                          <Button size="sm" onClick={() => updateWOStatus(wo.id, 'DONE')} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                            <CheckCircle className="w-3.5 h-3.5" /> Mark Finished
                          </Button>
                        )}
                     </div>
                  </div>
               </div>
             ))}
             {(!currentMO.WorkOrders || currentMO.WorkOrders.length === 0) && (
               <p className="py-10 text-center text-gray-400 italic">No production steps tracked for this order.</p>
             )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ManufacturingDetail;
