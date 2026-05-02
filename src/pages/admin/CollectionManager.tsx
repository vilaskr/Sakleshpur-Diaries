import React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import blueprint from '../../../firebase-blueprint.json';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit3, Loader2, AlertCircle, Inbox, X } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/firestore-utils';
import { toast } from 'sonner';

import ImageUpload, { MediaAsset } from '../../components/ImageUpload';

const COLLECTION_TO_ENTITY: Record<string, string> = {
  'places': 'Place',
  'stays': 'Stay',
  'food_spots': 'FoodSpot',
  'itineraries': 'Itinerary',
  'admin_users': 'AdminUser'
};

const ITEMS_PER_PAGE = 20;

export default function CollectionManager() {
  const { collection: colName } = useParams();
  const { user, role } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  const isSuperUser = user?.email?.toLowerCase() === 'vilaskr762@gmail.com';
  const isOwner = role === 'owner' || isSuperUser;
  const isManager = isOwner || role === 'manager';
  const isAgent = isManager || role === 'agent';

  const entityKey = colName ? COLLECTION_TO_ENTITY[colName] : null;
  const entitySchema = entityKey ? (blueprint.entities as any)[entityKey] : null;
  const properties = entitySchema ? entitySchema.properties : {};

  useEffect(() => {
    if (colName) {
      fetchData();
      setFormOpen(false);
      setFormData({});
      setEditingId(null);
      setCurrentPage(1);
    }
  }, [colName]);

  const fetchData = async () => {
    if (!colName) return;
    setLoading(true);
    setErrors({});
    try {
      const snap = await getDocs(collection(db, colName));
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, colName);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    const { id, createdAt, updatedAt, ...rest } = item;
    setFormData(rest);
    setErrors({});
    setFormOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!entitySchema) return true;

    const requiredFields = entitySchema.required || [];
    
    Object.keys(properties).forEach(key => {
      if (key === 'createdAt' || key === 'updatedAt') return;

      const value = formData[key];
      const prop = properties[key];

      // Check required
      if (requiredFields.includes(key) && (value === undefined || value === null || value === '')) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
        return;
      }

      // Skip remaining checks if empty and not required
      if (value === undefined || value === null || value === '') return;

      // Type checks
      if (prop.type === 'integer' || prop.type === 'number') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          newErrors[key] = 'Must be a valid number';
        } else if (prop.type === 'integer' && !Number.isInteger(numValue)) {
          newErrors[key] = 'Must be an integer';
        } else if (key === 'days' && numValue <= 0) {
          newErrors[key] = 'Days must be greater than 0';
        }
      }

      // Enum checks
      if (prop.enum && !prop.enum.includes(value)) {
        newErrors[key] = 'Invalid selection';
      }

      // Email check
      if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[key] = 'Invalid email address';
      }

      // String length checks
      if (prop.type === 'string' && typeof value === 'string') {
        if (key === 'name' || key === 'title') {
          if (value.length < 3) newErrors[key] = 'Title must be at least 3 characters';
          if (value.length > 100) newErrors[key] = 'Title is too long';
        }
        if (key === 'description' && value.length < 20) {
          newErrors[key] = 'Description must be at least 20 characters';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName) return;

    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      console.log('--- DEBUG: Submitting Collection Write ---');
      console.log('Collection:', colName);
      console.log('User UID:', user?.uid);
      console.log('User Email:', user?.email);
      console.log('Role Context:', role);
      
      // Strict payload construction based on blueprint to satisfy rules
      const payload: any = {};
      Object.keys(properties).forEach(key => {
        if (key === 'createdAt' || key === 'updatedAt') return;
        
        let value = formData[key];
        const prop = properties[key];

        if (prop.type === 'integer' || prop.type === 'number') {
          payload[key] = Number(value) || 0;
        } else if (prop.type === 'array') {
          payload[key] = Array.isArray(value) ? value : [];
        } else {
          payload[key] = value || '';
        }
      });
      
      payload.updatedAt = Date.now();

      if (editingId) {
        if (!isManager) throw new Error('No permission to update');
        await updateDoc(doc(db, colName, editingId), payload);
        toast.success('Record updated successfully');
      } else {
        if (!isAgent) throw new Error('No permission to create');
        payload.createdAt = Date.now();
        payload.createdBy = 'admin';
        console.log('Final Payload (Create):', payload);
        await addDoc(collection(db, colName), payload);
        toast.success('New record created successfully');
      }

      setFormOpen(false);
      setEditingId(null);
      setFormData({});
      fetchData();
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, colName);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isOwner) return toast.error('Only owners can delete records.');
    if (!window.confirm('This action cannot be undone. Delete this item?')) return;
    try {
      if (!colName) return;
      await deleteDoc(doc(db, colName, id));
      toast.success('Record deleted successfully');
      fetchData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${colName}/${id}`);
    }
  };

  const renderField = (key: string, prop: any) => {
    if (key === 'createdAt' || key === 'updatedAt') return null;

    const commonClass = (hasError: boolean) => `w-full border-2 ${hasError ? 'border-red-300 bg-red-50/30 focus:ring-red-100 focus:border-red-500' : 'border-gray-100 focus:ring-brand-green/10 focus:border-brand-green'} rounded-2xl p-5 outline-none transition-all placeholder:text-gray-400 text-brand-ink font-bold shadow-sm hover:border-gray-200`;
    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
    const hasError = !!errors[key];

    return (
      <div key={key} className={key === 'description' || prop.type === 'array' ? 'md:col-span-2 space-y-3' : 'space-y-3'}>
        {prop.type === 'array' || key === 'imageUrl' || key === 'images' ? (
          <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
            <ImageUpload 
              folder={colName || 'general'} 
              images={Array.isArray(formData[key]) ? formData[key] : []} 
              onImagesChange={(assets) => {
                setFormData({ ...formData, [key]: assets });
                if (errors[key]) setErrors({ ...errors, [key]: '' });
              }} 
            />
            {hasError && <p className="text-[10px] text-red-500 font-black mt-2 ml-1 uppercase tracking-widest">{errors[key]}</p>}
          </div>
        ) : (
          <>
            <label className="block text-xs font-black text-brand-ink/60 uppercase tracking-[0.2em] ml-1">{label}</label>
            {prop.enum ? (
              <select 
                value={formData[key] || ''} 
                onChange={e => {
                  setFormData({ ...formData, [key]: e.target.value });
                  if (errors[key]) setErrors({ ...errors, [key]: '' });
                }}
                className={commonClass(hasError)}
              >
                <option value="" className="text-gray-400">Select {label}</option>
                {prop.enum.map((opt: string) => (
                  <option key={opt} value={opt} className="text-brand-ink">{opt}</option>
                ))}
              </select>
            ) : key === 'description' ? (
              <textarea 
                value={formData[key] || ''} 
                onChange={e => {
                  setFormData({ ...formData, [key]: e.target.value });
                  if (errors[key]) setErrors({ ...errors, [key]: '' });
                }}
                className={commonClass(hasError)}
                rows={4}
                placeholder={`Provide a high-quality ${label.toLowerCase()}...`}
              />
            ) : (
              <input 
                type={prop.type === 'integer' || prop.type === 'number' ? 'number' : 'text'}
                value={formData[key] || ''} 
                onChange={e => {
                  setFormData({ ...formData, [key]: e.target.value });
                  if (errors[key]) setErrors({ ...errors, [key]: '' });
                }}
                className={commonClass(hasError)}
                placeholder={`Enter ${label.toLowerCase()}...`}
              />
            )}
            {hasError && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">{errors[key]}</p>}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
             <h1 className="text-3xl md:text-4xl font-black text-brand-ink capitalize">
              {colName?.replace('_', ' ')}
            </h1>
            <span className="text-[10px] bg-brand-yellow text-brand-green font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-sm">Collection</span>
          </div>
          <p className="text-gray-600 font-medium max-w-xl text-sm md:text-lg">{entitySchema?.description}</p>
        </div>
        {isAgent && !formOpen && (
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({});
              setFormOpen(true);
            }}
            className="w-full md:w-auto group bg-brand-green text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black hover:scale-105 transition-all shadow-xl md:shadow-2xl shadow-brand-green/30 flex items-center justify-center gap-3 text-base md:text-lg"
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform stroke-[3px]" />
            Add Entry
          </button>
        )}
      </div>

      {formOpen && (
        <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-gray-100 mb-12 md:mb-16 animate-in fade-in zoom-in slide-in-from-top-8 duration-500">
          <div className="flex justify-between items-start mb-8 md:mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-brand-ink">{editingId ? 'Edit Existing' : 'Create New'} {entitySchema?.title}</h2>
              <p className="text-gray-500 text-sm md:text-base font-medium mt-1">Fill in the details below to sync with the database.</p>
            </div>
            <button 
              onClick={() => {
                setFormOpen(false);
                setEditingId(null);
                setFormData({});
                setErrors({});
              }}
              className="p-2 md:p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-brand-ink"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 md:gap-y-8">
            {Object.keys(properties).map(key => renderField(key, properties[key]))}
            
            <div className="md:col-span-2 flex flex-col md:flex-row gap-4 pt-8 md:pt-12 border-t border-gray-50 mt-4 md:mt-6 font-black">
              <button 
                type="submit" 
                className="flex-1 bg-brand-green text-white px-8 py-4 md:px-12 md:py-5 rounded-xl md:rounded-2xl hover:bg-brand-green/90 transition-all shadow-xl shadow-brand-green/20 active:scale-[0.98] text-base md:text-lg uppercase tracking-widest"
              >
                {editingId ? 'Save Changes' : 'Publish Entry'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setFormOpen(false);
                  setEditingId(null);
                  setFormData({});
                  setErrors({});
                }} 
                className="px-8 py-4 md:px-12 md:py-5 rounded-xl md:rounded-2xl text-gray-500 hover:text-brand-ink hover:bg-gray-100 transition-all uppercase tracking-widest text-base md:text-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 md:py-40 bg-white rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-gray-100">
           <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-brand-green animate-spin mb-6 md:mb-8 stroke-[3px]" />
           <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs text-center px-4">Accessing Cloud Assets...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white p-12 md:p-24 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-full flex items-center justify-center mb-8 md:mb-10">
            <Inbox className="w-12 h-12 md:w-16 md:h-16 text-gray-200" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-brand-ink mb-3">No Data Found</h2>
          <p className="text-gray-500 max-w-sm mb-10 md:mb-12 font-medium text-base md:text-lg">This collection is currently empty. Start by adding your first record.</p>
          {isAgent && (
            <button 
              onClick={() => setFormOpen(true)}
              className="w-full md:w-auto bg-brand-ink text-white px-10 md:px-14 py-4 md:py-5 rounded-xl md:rounded-2xl font-black shadow-2xl shadow-brand-ink/30 hover:scale-105 transition-all uppercase tracking-widest"
            >
              Initialize
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-brand-ink/5 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left min-w-[800px] md:min-w-0">
              <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] md:text-[11px] font-black tracking-[0.3em] border-b border-gray-100">
                <tr>
                  <th className="px-6 md:px-10 py-6 md:py-8">Content Info</th>
                  <th className="px-6 md:px-10 py-6 md:py-8 hidden sm:table-cell">Cloud Registry</th>
                  <th className="px-6 md:px-10 py-6 md:py-8 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map(item => (
                   <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 md:px-10 py-6 md:py-10">
                      <div className="flex items-center gap-4 md:gap-8">
                        {item.images && item.images.length > 0 ? (
                          <div className="relative shrink-0">
                            <img 
                              src={item.images[0].url.replace('/upload/', '/upload/f_auto,q_auto,w_200,c_fill,g_auto/')} 
                              className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-[1.5rem] object-cover shadow-xl group-hover:scale-110 transition-all duration-500 ring-4 ring-white" 
                              alt="" 
                              referrerPolicy="no-referrer" 
                            />
                            {item.images.length > 1 && (
                              <div className="absolute -bottom-1 -right-1 bg-brand-green text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
                                +{item.images.length - 1}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-12 h-12 md:w-20 md:h-20 bg-gray-50 rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 shrink-0">
                            <Plus className="w-6 h-6 md:w-8 md:h-8" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-black text-lg md:text-2xl text-brand-ink mb-1 group-hover:text-brand-green transition-colors truncate">{item.name || item.title || 'Untitled Record'}</p>
                          <p className="text-gray-500 font-medium line-clamp-1 max-w-md text-xs md:text-sm">{item.description || 'No description provided.'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-10 py-6 md:py-10 hidden sm:table-cell">
                        <div className="space-y-2">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Resource ID</p>
                          <p className="text-[10px] md:text-xs text-brand-ink font-black font-mono bg-gray-100 px-3 py-1.5 rounded-lg inline-block">{item.id.toUpperCase()}</p>
                          <div className="text-[10px] md:text-[11px] text-gray-400 font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                            Synced: {new Date(item.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                    </td>
                    <td className="px-6 md:px-10 py-6 md:py-10 text-right">
                      <div className="flex justify-end gap-2 md:gap-3 md:translate-x-4 md:opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                        <button 
                          onClick={() => handleEdit(item)}
                          disabled={!isManager}
                          className="flex items-center justify-center w-10 h-10 md:w-auto md:px-5 md:py-3 bg-white text-brand-ink border-2 border-gray-100 rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest hover:border-brand-green hover:text-brand-green transition-all shadow-sm active:scale-95 disabled:hidden"
                        >
                          <Edit3 className="w-4 h-4 md:mr-1" />
                          <span className="hidden md:inline">Update</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          disabled={!isOwner}
                          className="flex items-center justify-center w-10 h-10 md:w-auto md:px-5 md:py-3 bg-white text-red-500 border-2 border-gray-100 rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest hover:border-red-500 transition-all shadow-sm active:scale-95 disabled:hidden"
                        >
                          <Trash2 className="w-4 h-4 md:mr-1" />
                          <span className="hidden md:inline">Purge</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-10 py-8 md:py-10 bg-gray-50/50 border-t border-gray-100 gap-6 md:gap-8">
              <div className="flex flex-col gap-1 text-center md:text-left">
                <div className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Data Range</div>
                <div className="text-xs md:text-sm font-bold text-gray-500">
                  Showing <span className="text-brand-ink font-black">{startIndex + 1}</span> - <span className="text-brand-ink font-black">{Math.min(startIndex + ITEMS_PER_PAGE, data.length)}</span> of <span className="text-brand-ink font-black">{data.length}</span> Objects
                </div>
              </div>
              
              <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
                <div className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Page {currentPage} of {totalPages}</div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-white border-2 border-gray-100 text-brand-ink disabled:opacity-30 transition-all hover:border-brand-green hover:text-brand-green active:scale-95 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5px]" />
                  </button>
                  <div className="flex gap-1.5 md:gap-2">
                    {[...Array(totalPages)].map((_, i) => {
                      if (totalPages > 5 && Math.abs(currentPage - (i + 1)) > 1 && i !== 0 && i !== totalPages - 1) return null;
                      return (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black transition-all active:scale-95 ${
                            currentPage === i + 1 
                              ? 'bg-brand-green text-white shadow-lg md:shadow-xl shadow-brand-green/30 scale-110 z-10' 
                              : 'bg-white text-gray-400 border-2 border-gray-100 hover:border-brand-green hover:text-brand-green'
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-white border-2 border-gray-100 text-brand-ink disabled:opacity-30 transition-all hover:border-brand-green hover:text-brand-green active:scale-95 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5px]" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
