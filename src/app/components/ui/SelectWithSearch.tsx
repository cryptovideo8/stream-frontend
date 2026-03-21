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
            const response = await fetch(`${API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}q=${inputValue}`);
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
        control: (base: any) => ({
            ...base,
            backgroundColor: '#111111',
            borderColor: '#222222',
            color: 'white',
            '&:hover': {
                borderColor: '#333333'
            }
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: '#111111',
            border: '1px solid #222222'
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused ? '#222222' : '#111111',
            color: 'white',
            '&:active': {
                backgroundColor: '#333333'
            }
        }),
        singleValue: (base: any) => ({
            ...base,
            color: 'white'
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: '#222222',
            color: 'white'
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: 'white'
        }),
        multiValueRemove: (base: any) => ({
            ...base,
            color: 'white',
            '&:hover': {
                backgroundColor: '#333333',
                color: 'white'
            }
        }),
        input: (base: any) => ({
            ...base,
            color: 'white'
        }),
        placeholder: (base: any) => ({
            ...base,
            color: '#666666'
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
