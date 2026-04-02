import { useState, useEffect } from 'react';

const API = '/api/admin/services'; // ajusta si tu base URL es diferente

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Modal state
  const [modal, setModal]       = useState(null); // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null); // servicio en edición
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({
    name: '', description: '', duration_minutes: '', price: '', display_order: '',
  });

  // ── Cargar servicios ──────────────────────────────────────────
  async function fetchServices() {
    setLoading(true);
    try {
      const res = await fetch(API, { credentials: 'include' });
      const data = await res.json();
      setServices(data.services || []);
    } catch {
      setError('No se pudieron cargar los servicios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchServices(); }, []);

  // ── Abrir modal ───────────────────────────────────────────────
  function openCreate() {
    setForm({ name: '', description: '', duration_minutes: '', price: '', display_order: '' });
    setSelected(null);
    setModal('create');
  }

  function openEdit(svc) {
    setForm({
      name:             svc.name,
      description:      svc.description || '',
      duration_minutes: svc.duration_minutes,
      price:            svc.price,
      display_order:    svc.display_order || 0,
    });
    setSelected(svc);
    setModal('edit');
  }

  function closeModal() { setModal(null); setSelected(null); }

  // ── Guardar (crear o editar) ───────────────────────────────────
  async function handleSave() {
    if (!form.name || !form.price || !form.duration_minutes) {
      alert('Nombre, precio y duración son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const url    = modal === 'edit' ? `${API}/${selected.id}` : API;
      const method = modal === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price:            parseFloat(form.price),
          duration_minutes: parseInt(form.duration_minutes),
          display_order:    parseInt(form.display_order) || 0,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Error al guardar');
        return;
      }
      await fetchServices();
      closeModal();
    } catch {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  // ── Eliminar (soft delete) ─────────────────────────────────────
  async function handleDelete(svc) {
    if (!confirm(`¿Desactivar el servicio "${svc.name}"?`)) return;
    try {
      const res = await fetch(`${API}/${svc.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) { alert('No se pudo desactivar'); return; }
      await fetchServices();
    } catch {
      alert('Error de conexión');
    }
  }

  // ── Render ────────────────────────────────────────────────────
  if (loading) return <p className="p-6 text-gray-500">Cargando servicios...</p>;
  if (error)   return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <button
          onClick={openCreate}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          + Nuevo servicio
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-right">Duración</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-right">Orden</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No hay servicios activos
                </td>
              </tr>
            )}
            {services.map(svc => (
              <tr key={svc.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium">{svc.name}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{svc.description || '—'}</td>
                <td className="px-4 py-3 text-right">{svc.duration_minutes} min</td>
                <td className="px-4 py-3 text-right font-semibold">
                  ${Number(svc.price).toLocaleString('es-CO')}
                </td>
                <td className="px-4 py-3 text-right text-gray-400">{svc.display_order}</td>
                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => openEdit(svc)}
                    className="text-blue-600 hover:underline text-xs font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(svc)}
                    className="text-red-500 hover:underline text-xs font-medium"
                  >
                    Desactivar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal crear / editar */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">
              {modal === 'edit' ? 'Editar servicio' : 'Nuevo servicio'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Ej: Corte clásico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  placeholder="Opcional"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (COP) *</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="25000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min) *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.duration_minutes}
                    onChange={e => setForm({ ...form, duration_minutes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orden de visualización</label>
                <input
                  type="number"
                  min="0"
                  value={form.display_order}
                  onChange={e => setForm({ ...form, display_order: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={closeModal}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition text-sm disabled:opacity-50"
              >
                {saving ? 'Guardando...' : modal === 'edit' ? 'Guardar cambios' : 'Crear servicio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}