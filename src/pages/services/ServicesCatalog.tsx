import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { serviceCatalogService } from '../../services/serviceCatalogService';
import { ServiceItem } from '../../types/Service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { FileText, Clock, Banknote, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const ServicesCatalog: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    serviceCatalogService
      .getActiveServices()
      .then((data) => setServices(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#1E4E8C',
              backgroundColor: '#eff5fc',
              padding: '0.3rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.825rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              border: '1px solid #bcd5f0',
            }}
          >
            <ShieldCheck size={16} /> Official Citizen's Charter
          </div>
          <h1 style={{ fontSize: '2.25rem', color: '#1F2933' }}>Barangay Services & Requirements</h1>
          <p style={{ color: '#616E7C', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '650px', margin: '0.5rem auto 0' }}>
            Browse available clearances, certificates, and permits issued by Barangay Cansojong. Review required
            supporting documents before submitting your request.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading services catalog..." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {services.map((service) => (
              <Card key={service.id} style={{ borderLeft: '5px solid #1E4E8C' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span
                        style={{
                          backgroundColor: '#1E4E8C',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        {service.serviceCode}
                      </span>
                      <h2 style={{ fontSize: '1.35rem', color: '#1F2933' }}>{service.name}</h2>
                    </div>

                    <p style={{ color: '#616E7C', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      {service.description}
                    </p>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '0.75rem',
                        backgroundColor: '#F5F7FA',
                        padding: '0.85rem',
                        borderRadius: '8px',
                        marginBottom: '1.25rem',
                        border: '1px solid #DDE3EA',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Banknote size={20} color="#1E4E8C" />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#616E7C' }}>Barangay Fee</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1F2933' }}>
                            {formatCurrency(service.fee)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={20} color="#1E4E8C" />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#616E7C' }}>Processing Time</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1F2933' }}>
                            {service.estimatedProcessingDays} business day(s)
                          </div>
                        </div>
                      </div>
                    </div>

                    {service.instructions && (
                      <div style={{ marginBottom: '1.25rem', fontSize: '0.875rem', color: '#1F2933' }}>
                        <strong>Instructions:</strong> {service.instructions}
                      </div>
                    )}

                    {/* Requirements List */}
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1F2933', marginBottom: '0.65rem' }}>
                        Required Supporting Documents:
                      </h4>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {service.requirements.map((req) => (
                          <li
                            key={req.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.5rem',
                              fontSize: '0.85rem',
                              color: '#1F2933',
                            }}
                          >
                            <CheckCircle
                              size={16}
                              color={req.isMandatory ? '#2E8B57' : '#8A94A0'}
                              style={{ flexShrink: 0, marginTop: '2px' }}
                            />
                            <div>
                              <span style={{ fontWeight: 600 }}>{req.requirementName}</span>
                              {req.isMandatory && (
                                <span style={{ color: '#D64545', marginLeft: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  (Mandatory)
                                </span>
                              )}
                              {req.description && (
                                <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '1px' }}>
                                  {req.description}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: '1 1 160px', minWidth: '140px', width: '100%' }}>
                    <Link to={`/services/${service.id}/apply`}>
                      <Button variant="primary" style={{ width: '100%' }}>
                        Apply Now <ArrowRight size={16} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
