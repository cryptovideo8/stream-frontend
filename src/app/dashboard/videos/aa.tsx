'use client';

import { useState, useCallback, useEffect, ChangeEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import ClientOnlySelect from '../../components/ClientOnlySelect';

import {
  PencilIcon,
  TrashIcon,
  ShareIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  TagIcon,
  FolderIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

import { useUploadVideoMutation, useGetVideosQuery } from '../../store/api/videoApi';
import { useGetGenericMasterByKeyQuery } from '../../store/api/commonApi';

const WIZARD_STEPS = ['basic-info', 'settings', 'upload'] as const;
type UploadStep = typeof WIZARD_STEPS[number];

export default function VideoManagement() {
  const [page, setPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<UploadStep>('basic-info');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    tags: '',
    category: '',
    visibility: 'private',
    monetizationType: 'free',
    price: '0',
    targetQuality: '1080p',
    enableCaptions: false,
    isDRM: false,
  });

  const [uploadVideo] = useUploadVideoMutation();
  const { data, isLoading, refetch } = useGetVideosQuery({ page, limit: 20 });

  const { data: categoryList = [], isLoading: loadingCategories } = useGetGenericMasterByKeyQuery('category');
  const { data: taglist = [], isLoading: loadingTags } = useGetGenericMasterByKeyQuery('tag');

  useEffect(() => {
    refetch();
  }, [page, refetch]);

  const columnHelper = createColumnHelper<any>();
  const columns = [
    columnHelper.accessor('thumbnailPath', {
      header: 'Thumbnail',
      cell: info => <img src={info.getValue()} alt="thumbnail" className="w-20 h-12 object-cover rounded" />,
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => <div className="font-medium">{info.getValue()}</div>,
    }),
    columnHelper.accessor('category', { header: 'Category' }),
    columnHelper.accessor('type', { header: 'Type' }),
    columnHelper.accessor('monetization.type', {
      header: 'Monetization Type',
      cell: info => info.getValue()?.toUpperCase(),
    }),
    columnHelper.accessor('monetization.price', {
      header: 'Price',
      cell: info => `₹${info.getValue()}`,
    }),
    columnHelper.accessor('creatorId.name', {
      header: 'Creator',
      cell: info => info.getValue() || '—',
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const original = info.row.original;
              setEditingVideo(original);
              setVideoData({
                title: original.title,
                description: original.description,
                tags: original.tags,
                category: original.category,
                visibility: original.visibility,
                monetizationType: original.monetization,
                price: '0',
                targetQuality: original.quality,
                enableCaptions: original.hasCaption,
                isDRM: false,
              });
              setCurrentStep('basic-info');
              setShowUploadModal(true);
            }}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
            <ShareIcon className="h-5 w-5" />
          </button>
          <button className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-800">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.videos || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Video Management</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          <CloudArrowUpIcon className="h-5 w-5" />
          <span>Upload Video</span>
        </button>
      </div>

      <div className="mt-4 bg-[#1A1A1A] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-gray-800">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={columns.length} className="text-center py-4 text-gray-400">Loading...</td></tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={data && data.videos.length < 20}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <span className="text-sm text-gray-400">
              Page {page}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
