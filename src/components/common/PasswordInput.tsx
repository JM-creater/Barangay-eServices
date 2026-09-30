import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react'

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const PasswordInput: React.FC<PasswordInputProps> = ({ style, ...props }) => {

    const [visible, setVisible] = useState<boolean>(false);

    return (
        <div style={{ position: 'relative' }}>
            <input
                {...props}
                type={visible ? 'text' : 'password'}
                style={{ ...style, paddingRight: '2.75rem' }}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Hide password' : 'Show password'}
                title={visible ? 'Hide password' : 'Show password'}
                style={{
                    position: 'absolute',
                    right: '0.6rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    color: '#616E7C',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    )
}
