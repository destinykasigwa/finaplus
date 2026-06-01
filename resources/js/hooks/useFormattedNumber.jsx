import { useState } from 'react';

export const useFormattedNumber = (initialValue = '') => {
    const [rawValue, setRawValue] = useState(initialValue);
    const [formattedValue, setFormattedValue] = useState('');

    const handleChange = (e) => {
        let raw = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
        setRawValue(raw);
        if (raw === '') {
            setFormattedValue('');
        } else {
            const num = parseInt(raw, 10);
            setFormattedValue(num.toLocaleString('fr-FR'));
        }
    };

    return {
        rawValue,
        formattedValue,
        handleChange,
        numberValue: rawValue ? parseInt(rawValue, 10) : 0,
    };
};