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
            backgroundColor: '#333333', // dark-20
            borderColor: state.isFocused ? '#E30000' : '#404040', // red-45 or dark-25
            color: 'white',
            borderRadius: '0.75rem', // rounded-xl to match standard inputs
            padding: '2px 6px',
            minHeight: '44px',
            boxShadow: 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#E30000' : '#4C4C4C'
            }
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: '#1F1F1F', // dark-12
            border: '1px solid #404040', // dark-25
            borderRadius: '0.75rem',
            overflow: 'hidden',
            zIndex: 9999
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused ? '#333333' : 'transparent',
            color: state.isSelected ? '#E30000' : 'white',
            padding: '10px 15px',
            cursor: 'pointer',
            fontSize: '14px',
            '&:active': {
                backgroundColor: '#262626'
            }
        }),
        singleValue: (base: any) => ({
            ...base,
            color: 'white',
            fontSize: '14px'
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: '#262626',
            color: 'white',
            borderRadius: '6px'
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: 'white'
        }),
        multiValueRemove: (base: any) => ({
            ...base,
            color: '#999999',
            '&:hover': {
                backgroundColor: '#E30000',
                color: 'white'
            }
        }),
        input: (base: any) => ({
            ...base,
            color: 'white',
            fontSize: '14px',
            '& input': {
                outline: 'none !important',
                boxShadow: 'none !important',
            }
        }),
        placeholder: (base: any) => ({
            ...base,
            color: '#999999', // grey-60
            fontSize: '14px'
        }),
        indicatorSeparator: () => ({
            display: 'none'
        }),
        dropdownIndicator: (base: any) => ({
            ...base,
            color: '#666'
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
