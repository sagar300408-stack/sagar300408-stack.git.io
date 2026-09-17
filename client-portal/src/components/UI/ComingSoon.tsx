import { ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface ComingSoonProps {
  title: string;
  description: string;
  actionText?: string;
  actionTo?: string;
}

export default function ComingSoon({ title, description, actionText, actionTo }: ComingSoonProps) {
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e8e8e5',
        margin: '40px auto',
        maxWidth: '800px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.015)'
      }}
    >
      <div 
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#244235',
          marginBottom: '24px',
          backgroundColor: '#f0f4f1',
          padding: '6px 16px',
          borderRadius: '100px'
        }}
      >
        Coming Soon
      </div>
      
      <h2 
        style={{
          fontFamily: 'Lora, serif',
          fontSize: '2.5rem',
          fontWeight: 400,
          color: '#1c1c1c',
          marginBottom: '16px',
          letterSpacing: '-0.01em'
        }}
      >
        {title}
      </h2>
      
      <p 
        style={{
          fontFamily: 'Calibri, "Segoe UI", sans-serif',
          fontSize: '17px',
          color: '#4a4a4a',
          maxWidth: '500px',
          lineHeight: 1.6,
          marginBottom: actionText ? '32px' : '0'
        }}
      >
        {description}
      </p>

      {actionText && actionTo && (
        <NavLink 
          to={actionTo}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #e8e8e5',
            color: '#1c1c1c',
            fontFamily: 'Calibri, "Segoe UI", sans-serif',
            fontSize: '15px',
            fontWeight: 600,
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fbfbfa'; e.currentTarget.style.borderColor = '#d0d0cd'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#e8e8e5'; }}
        >
          {actionText} <ArrowRight size={16} />
        </NavLink>
      )}
    </div>
  );
}
