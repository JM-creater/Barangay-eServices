import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { serviceCatalogService } from '../../services/serviceCatalogService';
import { ServiceItem } from '../../types/Service';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Edit, Trash2, Layers, CheckCircle2 } from 'lucide-react';

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [serviceCode, setServiceCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState<number>(0);
  const [processingDays, setProcessingDays] = useState<number>(1);
  const [instructions, setInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  // Add Requirement Modal
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqServiceId, setReqServiceId] = useState<number | null>(null);
  const [reqName, setReqName] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqMandatory, setReqMandatory] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await serviceCatalogService.getAllServices();
      setServices(data);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setServiceCode('');
    setName('');
    setDescription('');
    setFee(0);
    setProcessingDays(1);
    setInstructions('');
    setShowModal(true);
  };

  const handleOpenEdit = (svc: ServiceItem) => {
    setEditingId(svc.id);
    setServiceCode(svc.serviceCode);
    setName(svc.name);
    setDescription(svc.description);
    setFee(svc.fee);
    setProcessingDays(svc.estimatedProcessingDays);
    setInstructions(svc.instructions || '');
    setShowModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await serviceCatalogService.updateService(editingId, {
          name,
          description,
          fee,
          estimatedProcessingDays: processingDays,
          instructions,
        });
      } else {
        await serviceCatalogService.createService({
          serviceCode,
          name,
          description,
          fee,
          estimatedProcessingDays: processingDays,
          instructions,
        });
      }
      setShowModal(false);
      fetchServices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqServiceId) return;
    try {
      await serviceCatalogService.addRequirement(reqServiceId, {
        requirementName: reqName,
        description: reqDesc,
        isMandatory: reqMandatory,
      });
      setShowReqModal(false);
      setReqName('');
      setReqDesc('');
      fetchServices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add requirement');
    }
  };

  const columns = [
    {
      header: 'Code',
      accessor: (s: ServiceItem) => (
        <span style={{ fontWeight: 700, color: '#1E4E8C' }}>{s.serviceCode}</span>
      ),
    },
    {
      header: 'Service Name',
      accessor: (s: ServiceItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{s.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {s.requirements.length} requirement(s)
          </div>
        </div>
      ),
    },
    {
      header: 'Fee',
      accessor: (s: ServiceItem) => (
        <span style={{ fontWeight: 600 }}>{formatCurrency(s.fee)}</span>
      ),
    },
    {
      header: 'Processing Days',
      accessor: (s: ServiceItem) => `${s.estimatedProcessingDays} day(s)`,
    },
    {
      header: 'Status',
      accessor: (s: ServiceItem) => (
        <Badge variant={s.isActive ? 'success' : 'danger'}>
          {s.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (s: ServiceItem) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(s)}>
            <Edit size={13} /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setReqServiceId(s.id);
              setShowReqModal(true);
            }}
          >
            + Req
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout showSidebar>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: '#0F2A4A' }}>Services & Requirements Configuration</h1>
            <p style={{ color: '#616E7C', fontSize: '0.875rem' }}>
              Define certificates, clearances, statutory fees, and mandatory attachments
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Add New Service
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            data={services}
            keyExtractor={(s) => s.id}
            isLoading={loading}
          />
        </Card>

        {/* Modal: Create/Edit Service */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingId ? 'Edit Service' : 'Add New Service'}
        >
          <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!editingId && (
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Service Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BC-CLEARANCE"
                  value={serviceCode}
                  onChange={(e) => setServiceCode(e.target.value.toUpperCase())}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Service Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Description *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Barangay Fee (PHP) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={fee}
                  onChange={(e) => setFee(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Estimated Processing Days *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={processingDays}
                  onChange={(e) => setProcessingDays(parseInt(e.target.value, 10) || 1)}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Instructions to Resident
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                Save Service
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Add Requirement */}
        <Modal
          isOpen={showReqModal}
          onClose={() => setShowReqModal(false)}
          title="Add Document Requirement"
        >
          <form onSubmit={handleAddRequirement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Requirement Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Valid Government ID, Proof of Billing"
                value={reqName}
                onChange={(e) => setReqName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Description
              </label>
              <input
                type="text"
                placeholder="Guidelines on what document is acceptable..."
                value={reqDesc}
                onChange={(e) => setReqDesc(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: 'auto' }}
                  checked={reqMandatory}
                  onChange={(e) => setReqMandatory(e.target.checked)}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Is Mandatory for Application</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowReqModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add Requirement
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};
