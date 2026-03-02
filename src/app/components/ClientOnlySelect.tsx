'use client';
import dynamic from 'next/dynamic';

const ClientOnlySelect = dynamic(() => import('react-select'), { ssr: false });
export default ClientOnlySelect;