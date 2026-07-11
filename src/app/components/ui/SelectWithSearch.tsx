'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { API_BASE_URL } from '../../config/env';

const AsyncSelect = dynamic(() => import('react-select/async'), { ssr: false });

interface Option {
    value: string;
    label: string;
}

interface SelectWithSearchProps {
    endpoint: string;
    placeholder?: string;
    isMulti?: boolean;
    value?: any;
    onChange: (value: any) => void;
    transformResponse?: (data: any) => Option[];
    className?: string;
    isClearable?: boolean;
}

export default function SelectWithSearch({
    endpoint,
    placeholder = 'Search...',
    isMulti = false,
    value,
    onChange,
    transformResponse,
    className = '',
    isClearable = true
}: SelectWithSearchProps) {

    const loadOptions = async (inputValue: string) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const response = await fetch(`${API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}q=${inputValue}`, {
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (transformResponse) {
                return transformResponse(data);
            }

            // Default transformations based on common keys
            if (data.users && Array.isArray(data.users)) {
                return data.users.map((u: any) => ({
                    value: u._id,
                    label: u.name || u.email
                }));
            }

            if (Array.isArray(data)) {
                return data.map((item: any) => ({
                    value: item._id || item.id || item.value || item,
                    label: item.name || item.value || item.label || item
                }));
            }

            return [];
        } catch (error) {
            console.error('Error loading options:', error);
            return [];
        }
    };

    const customStyles = {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: 'rgb(var(--color-dark-15))',
            borderColor: state.isFocused ? '#E30000' : 'rgb(var(--color-dark-25))',
            color: 'rgb(var(--color-fg))',
            borderRadius: '0.75rem',
            padding: '2px 6px',
            minHeight: '44px',
            boxShadow: 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#E30000' : 'rgb(var(--color-dark-30))'
            }
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: 'rgb(var(--color-dark-10))',
            border: '1px solid rgb(var(--color-dark-25))',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            zIndex: 9999
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused ? 'rgb(var(--color-dark-15))' : 'transparent',
            color: state.isSelected ? '#E30000' : 'rgb(var(--color-fg))',
            padding: '10px 15px',
            cursor: 'pointer',
            fontSize: '14px',
            '&:active': {
                backgroundColor: 'rgb(var(--color-dark-20))'
            }
        }),
        singleValue: (base: any) => ({
            ...base,
            color: 'rgb(var(--color-fg))',
            fontSize: '14px'
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: 'rgb(var(--color-dark-15))',
            color: 'rgb(var(--color-fg))',
            borderRadius: '6px'
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: 'rgb(var(--color-fg))'
        }),
        multiValueRemove: (base: any) => ({
            ...base,
            color: 'rgb(var(--color-grey-60))',
            '&:hover': {
                backgroundColor: '#E30000',
                color: 'white'
            }
        }),
        input: (base: any) => ({
            ...base,
            color: 'rgb(var(--color-fg))',
            fontSize: '14px',
            '& input': {
                outline: 'none !important',
                boxShadow: 'none !important',
                border: 'none !important',
            }
        }),
        placeholder: (base: any) => ({
            ...base,
            color: 'rgb(var(--color-grey-60))',
            fontSize: '14px'
        }),
        indicatorSeparator: () => ({
            display: 'none'
        }),
        dropdownIndicator: (base: any) => ({
            ...base,
            color: 'rgb(var(--color-grey-60))'
        })
    };

    return (
        <AsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={loadOptions}
            isMulti={isMulti}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={className}
            isClearable={isClearable}
            styles={customStyles}
        />
    );
}
