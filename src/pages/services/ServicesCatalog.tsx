import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { serviceCatalogService } from '../../services/serviceCatalogService';
import { ServiceItem } from '../../types/Service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ServicesCatalogSkeleton } from '../../components/skeletons';
import { formatCurrency } from '../../utils/formatters';
import { FileText, Clock, Banknote, CheckCircle, ArrowRight, ShieldCheck, Sparkles, Bot, Zap } from 'lucide-react';
import { triggerBarangayAi } from '../../components/ai/BarangayAiAssistant';

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

        {/* AI Citizen Assistant Guidance Callout */}
        <div className="ai-banner-callout" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#1E4E8C',
                color: '#F2B600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F2A4A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Unsure which document you need or what to prepare?</span>
                <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 700 }}>
                  Live Assistant
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                Chat with the official Barangay AI for instant answers regarding requirements, fees, residency proof, and processing times.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            style={{ backgroundColor: '#1E4E8C', gap: '6px' }}
            onClick={() => triggerBarangayAi("What document do I need for employment or school requirements?", { page: 'services' })}
          >
            <Sparkles size={14} color="#F2B600" /> Ask Barangay AI
          </Button>
        </div>

        {loading ? (
          <ServicesCatalogSkeleton count={4} />
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
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1F2933', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span>{service.estimatedProcessingDays} business day(s)</span>
                            <span className="ai-badge-fasttrack" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                              <Zap size={10} /> Fast-Track (~24h)
                            </span>
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
                    <button
                      type="button"
                      onClick={() =>
                        triggerBarangayAi(
                          `What are the requirements and procedure for ${service.name}?`,
                          { page: 'services', serviceCode: service.serviceCode }
                        )
                      }
                      style={{
                        width: '100%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        backgroundColor: '#EFF5FC',
                        color: '#1E4E8C',
                        border: '1px solid #BCD5F0',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1E4E8C';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#EFF5FC';
                        e.currentTarget.style.color = '#1E4E8C';
                      }}
                    >
                      <Sparkles size={13} color="#F2B600" /> Ask AI About Requirements
                    </button>
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
