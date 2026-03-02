'use client';

import { useState, useCallback, ChangeEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  CloudArrowUpIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon,
  TagIcon,
  FolderIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  QueueListIcon,
  LanguageIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  Bars3Icon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface Video {
  id: number;
  title: string;
  thumbnail: string;
  status: 'Processing' | 'Published' | 'Draft';
  views: number;
  revenue: number;
  uploadDate: string;
  monetization: 'Free' | 'Pay-per-view' | 'Subscription' | 'Ad-supported';
  description: string;
  tags: string;
  category: string;
  visibility: 'Private' | 'Public' | 'Unlisted';
  quality: string;
  hasCaption: boolean;
}

const mockVideos: Video[] = [
  {
    id: 1,
    title: 'Getting Started with Crypto Trading',
    thumbnail: 'https://via.placeholder.com/160x90',
    status: 'Published',
    views: 1234,
    revenue: 299.99,
    uploadDate: '2024-02-20',
    monetization: 'Pay-per-view',
    description: 'Learn the basics of crypto trading',
    tags: 'crypto,trading,beginner',
    category: 'education',
    visibility: 'Public',
    quality: '1080p',
    hasCaption: true,
  },
  {
    id: 2,
    title: 'Blockchain Fundamentals',
    thumbnail: 'https://via.placeholder.com/160x90',
    status: 'Processing',
    views: 0,
    revenue: 0,
    uploadDate: '2024-02-21',
    monetization: 'Subscription',
    description: 'Understanding blockchain technology',
    tags: 'blockchain,crypto,technology',
    category: 'education',
    visibility: 'Private',
    quality: '1080p',
    hasCaption: false,
  },
];

type UploadStep = 'basic-info' | 'settings' | 'upload' | 'processing';
const WIZARD_STEPS = ['basic-info', 'settings', 'upload'] as const;

const columnHelper = createColumnHelper<Video>();

export default function VideoManagement() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<UploadStep>('basic-info');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    tags: '',
    category: '',
    visibility: 'Private',
    monetizationType: 'Free',
    price: '0',
    targetQuality: '1080p',
    enableCaptions: false,
    isDRM: false,
  });

  const handleUpload = () => {
    if (selectedFile) {
      // Start upload simulation
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setCurrentStep('processing');
        }
      }, 500);
    }
  };

  const columns = [
    columnHelper.accessor('thumbnail', {
      header: 'Thumbnail',
      cell: (info) => (
        <img src={info.getValue()} alt={info.row.original.title} className="w-20 h-12 object-cover rounded" />
      ),
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => <div className="font-medium">{info.getValue()}</div>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <span className={`px-3 py-1 rounded-md text-xs ${
          info.getValue() === 'Published' ? 'bg-green-900 text-green-300' :
          info.getValue() === 'Processing' ? 'bg-blue-900 text-blue-300' :
          'bg-yellow-900 text-yellow-300'
        }`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('views', {
      header: 'Views',
      cell: (info) => (
        <div className="flex items-center space-x-1">
          <EyeIcon className="h-5 w-5 text-gray-400" />
          <span>{info.getValue().toLocaleString()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('revenue', {
      header: 'Revenue',
      cell: (info) => (
        <div className="flex items-center space-x-1">
          <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
          <span>${info.getValue().toFixed(2)}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditingVideo(info.row.original);
              setVideoData({
                title: info.row.original.title,
                description: info.row.original.description,
                tags: info.row.original.tags,
                category: info.row.original.category,
                visibility: info.row.original.visibility,
                monetizationType: info.row.original.monetization,
                price: '0',
                targetQuality: info.row.original.quality,
                enableCaptions: info.row.original.hasCaption,
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
    data: mockVideos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setVideoData({
      title: video.title,
      description: video.description,
      tags: video.tags,
      category: video.category,
      visibility: video.visibility,
      monetizationType: video.monetization,
      price: '0',
      targetQuality: video.quality,
      enableCaptions: video.hasCaption,
      isDRM: false,
    });
    setCurrentStep('basic-info');
    setShowUploadModal(true);
  };

  const resetForm = () => {
    setVideoData({
      title: '',
      description: '',
      tags: '',
      category: '',
      visibility: 'Private',
      monetizationType: 'Free',
      price: '0',
      targetQuality: '1080p',
      enableCaptions: false,
      isDRM: false,
    });
    setSelectedFile(null);
    setUploadProgress(0);
    setCurrentStep('basic-info');
    setEditingVideo(null);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    resetForm();
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      // Start upload simulation
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setCurrentStep('processing');
        }
      }, 500);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    maxFiles: 1,
    maxSize: 8 * 1024 * 1024 * 1024, // 8GB max file size
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setVideoData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'basic-info':
        setCurrentStep('settings');
        break;
      case 'settings':
        setCurrentStep('upload');
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'settings':
        setCurrentStep('basic-info');
        break;
      case 'upload':
        setCurrentStep('settings');
        break;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic-info':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-grey-70 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={videoData.title}
                onChange={handleInputChange}
                className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45"
                placeholder="Enter video title"
                required
              />
            </div>
            <div>
              <label className="block text-grey-70 mb-2">Description</label>
              <textarea
                name="description"
                value={videoData.description}
                onChange={handleInputChange}
                className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45 h-32"
                placeholder="Enter video description"
                required
              />
            </div>
            <div>
              <label className="block text-grey-70 mb-2">
                <div className="flex items-center space-x-2">
                  <TagIcon className="h-4 w-4" />
                  <span>Tags</span>
                </div>
              </label>
              <input
                type="text"
                name="tags"
                value={videoData.tags}
                onChange={handleInputChange}
                className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45"
                placeholder="Enter tags (comma separated)"
              />
            </div>
            <div>
              <label className="block text-grey-70 mb-2">
                <div className="flex items-center space-x-2">
                  <FolderIcon className="h-4 w-4" />
                  <span>Category</span>
                </div>
              </label>
              <select
                name="category"
                value={videoData.category}
                onChange={handleInputChange}
                className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45"
                required
              >
                <option value="">Select category</option>
                <option value="education">Education</option>
                <option value="entertainment">Entertainment</option>
                <option value="gaming">Gaming</option>
                <option value="music">Music</option>
                <option value="tech">Technology</option>
              </select>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-grey-70 mb-2">
                <div className="flex items-center space-x-2">
                  <GlobeAltIcon className="h-4 w-4" />
                  <span>Visibility</span>
                </div>
              </label>
              <select
                name="visibility"
                value={videoData.visibility}
                onChange={handleInputChange}
                className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45"
              >
                <option value="Private">Private</option>
                <option value="Public">Public</option>
                <option value="Unlisted">Unlisted</option>
              </select>
            </div>
            <div>
              <label className="block text-grey-70 mb-2">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <span>Monetization</span>
                </div>
              </label>
              <select
                name="monetizationType"
                value={videoData.monetizationType}
                onChange={handleInputChange}
                className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45"
              >
                <option value="Free">Free</option>
                <option value="Pay-per-view">Pay-per-view</option>
                <option value="Subscription">Subscription Only</option>
                <option value="Ad-supported">Ad-supported</option>
              </select>
            </div>
            {videoData.monetizationType === 'Pay-per-view' && (
              <div>
                <label className="block text-grey-70 mb-2">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={videoData.price}
                  onChange={handleInputChange}
                  className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
            <div>
              <label className="flex items-center space-x-2 text-grey-70">
                <input
                  type="checkbox"
                  name="isDRM"
                  checked={videoData.isDRM}
                  onChange={handleInputChange}
                  className="form-checkbox bg-dark-10 border-grey-70 text-red-45 rounded"
                />
                <ShieldCheckIcon className="h-4 w-4" />
                <span>Enable DRM Protection</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2 text-grey-70">
                <input
                  type="checkbox"
                  name="enableCaptions"
                  checked={videoData.enableCaptions}
                  onChange={handleInputChange}
                  className="form-checkbox bg-dark-10 border-grey-70 text-red-45 rounded"
                />
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span>Auto-generate captions</span>
              </label>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-6">
            <div className="bg-dark-10 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Video Details Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-grey-70">Title</p>
                  <p className="text-white">{videoData.title}</p>
                </div>
                <div>
                  <p className="text-grey-70">Category</p>
                  <p className="text-white">{videoData.category}</p>
                </div>
                <div>
                  <p className="text-grey-70">Visibility</p>
                  <p className="text-white">{videoData.visibility}</p>
                </div>
                <div>
                  <p className="text-grey-70">Monetization</p>
                  <p className="text-white">{videoData.monetizationType}</p>
                </div>
              </div>
            </div>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed border-grey-70 rounded-lg p-8 text-center cursor-pointer
                ${isDragActive ? 'border-red-45 bg-red-45 bg-opacity-5' : ''}`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="h-24 w-24 mx-auto text-grey-70 mb-4" />
              <p className="text-grey-70">
                Drag & drop your video here, or click to select
              </p>
              <p className="text-grey-60 text-sm mt-2">
                Supported formats: MP4, MOV, AVI, MKV, WebM (max 8GB)
              </p>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <div className="flex justify-between text-grey-70 text-sm mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-dark-15 rounded-full h-2">
                  <div
                    className="bg-red-45 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-8">
            <CheckCircleIcon className="text-green-500 text-6xl mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Upload Complete!</h3>
            <p className="text-grey-70 mb-4">Your video is now being processed. This may take a few minutes.</p>
            <button
              onClick={() => setShowUploadModal(false)}
              className="bg-red-45 text-white px-6 py-2 rounded-lg hover:bg-red-60"
            >
              Done
            </button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Video Management</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <CloudArrowUpIcon className="h-5 w-5" />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Video Table */}
      <div className="bg-[#1A1A1A] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-400">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
          </div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-2 py-1 text-sm"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingVideo ? 'Edit Video' : 'Upload New Video'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Step indicator */}
            <div className="flex items-center justify-center mb-8">
              {WIZARD_STEPS.map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep === step
                        ? 'bg-red-500 text-white'
                        : WIZARD_STEPS.indexOf(currentStep as typeof WIZARD_STEPS[number]) > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {WIZARD_STEPS.indexOf(currentStep as typeof WIZARD_STEPS[number]) > index ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div
                      className={`w-20 h-1 mx-2 ${
                        WIZARD_STEPS.indexOf(currentStep as typeof WIZARD_STEPS[number]) > index
                          ? 'bg-green-500'
                          : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            {renderStepContent()}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              {currentStep !== 'basic-info' && currentStep !== 'processing' && (
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 px-4 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span>Back</span>
                </button>
              )}
              {currentStep !== 'processing' && (
                <button
                  onClick={currentStep === 'upload' ? handleUpload : handleNext}
                  className="flex items-center space-x-2 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 ml-auto"
                >
                  <span>{currentStep === 'upload' ? 'Upload' : 'Next'}</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 