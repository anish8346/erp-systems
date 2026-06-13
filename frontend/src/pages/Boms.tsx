import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

const Boms = () => {
  const [boms, setBoms] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newBom, setNewBom] = useState({
    productId: '',
    name: '',
    components: [{ componentId: '', quantity: 1 }]
  });

  const fetchData = async () => {
    try {
      const bomsRes = await api.get('/boms').catch(err => {
        console.error("Failed to fetch BoMs", err);
        return { data: [] };
      });
      setBoms(bomsRes.data);

      const productsRes = await api.get('/products').catch(err => {
        console.error("Failed to fetch Products", err);
        return { data: [] };
      });
      setProducts(productsRes.data);
    } catch (err) {
      console.error("Critical fetch error in BoM page", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addComponent = () => {
    setNewBom({
      ...newBom,
      components: [...newBom.components, { componentId: '', quantity: 1 }]
    });
  };

  const removeComponent = (index: number) => {
    const updated = newBom.components.filter((_, i) => i !== index);
    setNewBom({ ...newBom, components: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/boms', newBom);
    setShowForm(false);
    fetchData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Bill of Materials (BoM)</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Create BoM
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">New BoM Definition</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <select 
                className="border p-2 rounded"
                value={newBom.productId}
                onChange={(e) => setNewBom({...newBom, productId: e.target.value})}
                required
              >
                <option value="">Select Finished Good</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input 
                placeholder="BoM Name (e.g. Standard Version)" 
                className="border p-2 rounded"
                value={newBom.name}
                onChange={(e) => setNewBom({...newBom, name: e.target.value})}
                required
              />
            </div>

            <h4 className="font-medium mb-2">Components</h4>
            {newBom.components.map((comp, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select 
                  className="flex-1 border p-2 rounded"
                  value={comp.componentId}
                  onChange={(e) => {
                    const updated = [...newBom.components];
                    updated[idx].componentId = e.target.value;
                    setNewBom({...newBom, components: updated});
                  }}
                  required
                >
                  <option value="">Select Component</option>
                  {products && products.length > 0 ? (
                    products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  ) : (
                    <option disabled>No products found</option>
                  )}
                </select>
                <input 
                  type="number" 
                  placeholder="Qty" 
                  className="w-24 border p-2 rounded"
                  value={comp.quantity}
                  onChange={(e) => {
                    const updated = [...newBom.components];
                    updated[idx].quantity = Number(e.target.value);
                    setNewBom({...newBom, components: updated});
                  }}
                  required
                />
                <button type="button" onClick={() => removeComponent(idx)} className="text-red-500 p-2">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            
            <button type="button" onClick={addComponent} className="text-indigo-600 text-sm font-medium mb-4">+ Add Component</button>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Save BoM</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {boms.map((bom) => (
          <div key={bom.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{bom.product.name}</h3>
                <p className="text-sm text-gray-500">{bom.name}</p>
              </div>
              <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-mono">BoM-Ref</span>
            </div>
            <div className="space-y-2">
              {bom.bomLines.map((line: any) => (
                <div key={line.id} className="flex justify-between text-sm border-b border-gray-50 pb-1">
                  <span className="text-gray-600">{line.component.name}</span>
                  <span className="font-medium">x {line.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Boms;
