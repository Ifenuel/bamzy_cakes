import { useState, useEffect, Component } from 'react'
import { MapPin, Edit3, Save, X, Plus, Trash2, Clock, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiGetAdminDeliveryZones, apiUpdateDeliveryZone, apiCreateDeliveryZone, apiDeleteDeliveryZone } from '../../utils/api.js'
import { formatNaira } from '../../utils/format.js'
import { useToast } from '../../components/ui/Toast.jsx'

class DeliveryZonesError extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center max-w-md">
            <span className="text-4xl">🗺️</span>
            <h2 className="mt-4 font-heading text-xl font-bold text-ink">Delivery Zones Unavailable</h2>
            <p className="mt-2 text-sm text-ink-muted">We couldn't load the delivery zones. Please refresh the page or try again later.</p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
              className="mt-4 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white">Try Again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function AdminDeliveryZones() {
  const { showToast } = useToast()
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({
    zoneName: '',
    zoneSlug: '',
    deliveryFee: '',
    estimatedHoursMin: '2',
    estimatedHoursMax: '4',
  })

  useEffect(() => {
    loadZones()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadZones() {
    try {
      const data = await apiGetAdminDeliveryZones()
      setZones(data)
    } catch (err) {
      showToast('Failed to load delivery zones', 'error')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(zone) {
    setEditingId(zone.id)
    setEditForm({
      deliveryFee: zone.deliveryFee,
      estimatedHoursMin: zone.estimatedHoursMin,
      estimatedHoursMax: zone.estimatedHoursMax,
      isActive: zone.isActive,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({})
  }

  async function saveEdit(id) {
    setSaving(true)
    try {
      const updated = await apiUpdateDeliveryZone(id, {
        deliveryFee: parseFloat(editForm.deliveryFee),
        estimatedHoursMin: parseInt(editForm.estimatedHoursMin) || 2,
        estimatedHoursMax: parseInt(editForm.estimatedHoursMax) || 4,
        isActive: editForm.isActive,
      })
      setZones((prev) => prev.map((z) => (z.id === id ? updated : z)))
      setEditingId(null)
      setEditForm({})
      showToast('Delivery zone updated! Customers will see the new fee at checkout.', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to update zone', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!createForm.zoneName || !createForm.deliveryFee) {
      showToast('Zone name and fee are required', 'error')
      return
    }
    setSaving(true)
    try {
      const created = await apiCreateDeliveryZone({
        zoneName: createForm.zoneName,
        zoneSlug: createForm.zoneSlug || createForm.zoneName.toLowerCase().replace(/\s+/g, '-'),
        deliveryFee: parseFloat(createForm.deliveryFee),
        estimatedHoursMin: parseInt(createForm.estimatedHoursMin) || 2,
        estimatedHoursMax: parseInt(createForm.estimatedHoursMax) || 4,
      })
      setZones((prev) => [...prev, created])
      setShowCreate(false)
      setCreateForm({ zoneName: '', zoneSlug: '', deliveryFee: '', estimatedHoursMin: '2', estimatedHoursMax: '4' })
      showToast('New delivery zone created!', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to create zone', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(id, zoneName) {
    if (!confirm(`Deactivate "${zoneName}"? Customers won't see this zone at checkout.`)) return
    try {
      await apiDeleteDeliveryZone(id)
      setZones((prev) => prev.map((z) => (z.id === id ? { ...z, isActive: false } : z)))
      showToast(`${zoneName} deactivated`, 'success')
    } catch (err) {
      showToast('Failed to deactivate zone', 'error')
    }
  }

  async function handleReactivate(id) {
    try {
      const updated = await apiUpdateDeliveryZone(id, { isActive: true })
      setZones((prev) => prev.map((z) => (z.id === id ? updated : z)))
      showToast('Zone reactivated', 'success')
    } catch (err) {
      showToast('Failed to reactivate zone', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-lilac border-t-transparent" />
      </div>
    )
  }

  return (
    <DeliveryZonesError>
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Delivery Zones</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage delivery fees by location. Changes appear immediately at customer checkout.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:shadow-glow"
        >
          <Plus size={16} /> Add Zone
        </button>
      </div>

      {/* Info Banner */}
      <div className="mb-6 rounded-lg border border-lilac-soft bg-lilac-soft/20 p-4">
        <p className="text-sm text-ink">
          <strong>How it works:</strong> When you update a delivery fee here, every customer sees the new fee at checkout immediately.
          The backend calculates fees based on the customer&apos;s city and state, matching them to these zones.
        </p>
      </div>

      {/* Create Form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-lilac-soft bg-white p-6 shadow-soft"
        >
          <h3 className="mb-4 font-heading text-lg font-semibold text-ink">Create New Delivery Zone</h3>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Zone Name *</label>
              <input
                value={createForm.zoneName}
                onChange={(e) => setCreateForm((p) => ({ ...p, zoneName: e.target.value }))}
                placeholder="e.g. Abuja"
                className="w-full rounded-lg border border-lilac-soft bg-white px-3 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Slug (auto-generated)</label>
              <input
                value={createForm.zoneSlug || createForm.zoneName.toLowerCase().replace(/\s+/g, '-')}
                onChange={(e) => setCreateForm((p) => ({ ...p, zoneSlug: e.target.value }))}
                placeholder="abuja"
                className="w-full rounded-lg border border-lilac-soft bg-white px-3 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Delivery Fee (₦) *</label>
              <input
                type="number"
                value={createForm.deliveryFee}
                onChange={(e) => setCreateForm((p) => ({ ...p, deliveryFee: e.target.value }))}
                placeholder="2500"
                className="w-full rounded-lg border border-lilac-soft bg-white px-3 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-ink">Min Hours</label>
                <input
                  type="number"
                  value={createForm.estimatedHoursMin}
                  onChange={(e) => setCreateForm((p) => ({ ...p, estimatedHoursMin: e.target.value }))}
                  className="w-full rounded-lg border border-lilac-soft bg-white px-3 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-ink">Max Hours</label>
                <input
                  type="number"
                  value={createForm.estimatedHoursMax}
                  onChange={(e) => setCreateForm((p) => ({ ...p, estimatedHoursMax: e.target.value }))}
                  className="w-full rounded-lg border border-lilac-soft bg-white px-3 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
                />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:shadow-glow disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Creating...' : 'Create Zone'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-lilac-soft px-4 py-2.5 text-sm font-medium text-ink-muted hover:border-pink hover:text-pink"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Zone Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border bg-white p-5 shadow-soft transition-all ${
              zone.isActive ? 'border-lilac-soft' : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-lilac-soft text-lilac-deep">
                  <MapPin size={16} />
                </span>
                <div>
                  <h3 className="font-heading text-base font-semibold text-ink">{zone.zoneName}</h3>
                  <p className="text-xs text-ink-muted">{zone.zoneSlug}</p>
                </div>
              </div>
              {!zone.isActive && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                  INACTIVE
                </span>
              )}
            </div>

            {editingId === zone.id ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-muted">Delivery Fee (₦)</label>
                  <input
                    type="number"
                    value={editForm.deliveryFee}
                    onChange={(e) => setEditForm((p) => ({ ...p, deliveryFee: e.target.value }))}
                    className="w-full rounded-lg border border-lilac-soft bg-white px-3 py-2 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-ink-muted">Min Hours</label>
                    <input
                      type="number"
                      value={editForm.estimatedHoursMin}
                      onChange={(e) => setEditForm((p) => ({ ...p, estimatedHoursMin: e.target.value }))}
                      className="w-full rounded-lg border border-lilac-soft bg-white px-3 py-2 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-ink-muted">Max Hours</label>
                    <input
                      type="number"
                      value={editForm.estimatedHoursMax}
                      onChange={(e) => setEditForm((p) => ({ ...p, estimatedHoursMax: e.target.value }))}
                      className="w-full rounded-lg border border-lilac-soft bg-white px-3 py-2 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(zone.id)}
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-brand-gradient px-3 py-2 text-xs font-semibold text-white hover:shadow-glow disabled:opacity-50"
                  >
                    <Save size={12} /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center justify-center gap-1 rounded-lg border border-lilac-soft px-3 py-2 text-xs font-medium text-ink-muted hover:border-pink hover:text-pink"
                  >
                    <X size={12} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-pink" />
                    <span className="text-lg font-bold text-pink">{formatNaira(zone.deliveryFee)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <Clock size={12} />
                    <span>Est. {zone.estimatedHoursMin}–{zone.estimatedHoursMax} hours</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(zone)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-lilac-soft px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-lilac hover:text-lilac-deep"
                  >
                    <Edit3 size={12} /> Edit Fee
                  </button>
                  {zone.isActive ? (
                    <button
                      onClick={() => handleDeactivate(zone.id, zone.zoneName)}
                      className="flex items-center justify-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(zone.id)}
                      className="flex items-center justify-center gap-1 rounded-lg border border-green-200 px-3 py-2 text-xs font-medium text-green-600 transition-colors hover:bg-green-50"
                    >
                      Reactivate
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {zones.length === 0 && (
        <div className="py-16 text-center">
          <MapPin size={40} className="mx-auto text-lilac-soft" />
          <p className="mt-3 text-sm text-ink-muted">No delivery zones configured yet.</p>
        </div>
      )}
    </div>
    </DeliveryZonesError>
  )
}
