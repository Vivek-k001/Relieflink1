import React from 'react';

const VEHICLE_LABELS = {
  car: '🚗 Car / 4x4',
  bike: '🏍️ Bike / Motorcycle',
  motorcycle: '🏍️ Motorcycle',
  truck: '🚚 Rescue Truck',
  boat: '🚤 Rescue Boat',
  foot: '🚶 On Foot',
  walking: '🚶 On Foot',
  none: '🚶 On Foot',
};

export default function VolunteerDetailsBox({ volunteer, title = 'Assigned Volunteer' }) {
  if (!volunteer || typeof volunteer !== 'object') return null;

  const vehicleKey = volunteer.vehicleType?.toLowerCase()?.trim() || '';
  const modeDisplay = VEHICLE_LABELS[vehicleKey] || (volunteer.vehicleType ? `🚗 ${volunteer.vehicleType}` : '🚶 On Foot');

  const skillsList = Array.isArray(volunteer.skills) && volunteer.skills.length > 0
    ? volunteer.skills
    : ['General Rescue & First Aid'];

  return (
    <div style={{
      marginTop: '0.75rem',
      padding: '0.625rem 0.875rem',
      background: '#F8FAFC',
      border: '1.5px solid #CBD5E1',
      borderRadius: '8px',
      fontSize: '0.8125rem',
      lineHeight: '1.4',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '0.4rem',
        marginBottom: '0.4rem',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
          <span>🦺</span> {title}
        </div>
        {volunteer.phone && (
          <a
            href={`tel:${volunteer.phone}`}
            style={{
              fontSize: '0.75rem',
              color: '#0284C7',
              background: '#E0F2FE',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            📞 {volunteer.phone}
          </a>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '55px 1fr', gap: '0.3rem 0.5rem', alignItems: 'baseline' }}>
        <span style={{ fontWeight: 600, color: '#64748B' }}>Name:</span>
        <span style={{ fontWeight: 700, color: '#0F172A' }}>{volunteer.name || 'Assigned Rescuer'}</span>

        <span style={{ fontWeight: 600, color: '#64748B' }}>Skills:</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {skillsList.map((skill, idx) => (
            <span
              key={idx}
              style={{
                background: '#EEF2FF',
                color: '#4338CA',
                border: '1px solid #C7D2FE',
                borderRadius: '4px',
                padding: '1px 6px',
                fontSize: '0.72rem',
                fontWeight: 600
              }}
            >
              {skill.replace(/_/g, ' ')}
            </span>
          ))}
        </div>

        <span style={{ fontWeight: 600, color: '#64748B' }}>Mode:</span>
        <span style={{ fontWeight: 600, color: '#0369A1' }}>{modeDisplay}</span>
      </div>
    </div>
  );
}
