'use client';

import { useState, useCallback, ChangeEvent, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import ClientOnlySelect from '../../components/ClientOnlySelect';
import SelectWithSearch from '../../components/ui/SelectWithSearch';

import {
  PencilIcon,
  TrashIcon,
  TagIcon,
  FolderIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  VideoCameraIcon,
  EyeIcon,
  CurrencyDollarIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

import {
  useUploadVideoMutation,
  useGetVideosQuery,
  useUploadExternalVideoMutation,
  useDeleteVideoMutation,
  useDeletethirdpartyVideoMutation,
  useUpdateVideoMutation,
} from '../../store/api/videoApi';
import { useGetGenericMasterByKeyQuery } from '../../store/api/commonApi';
import { useGetPayoutRateQuery } from '../../store/api/payoutApi';
import { getSocket } from '../../utils/socket';

const WIZARD_STEPS = ['basic-info', 'settings', 'upload'] as const;
type UploadStep = typeof WIZARD_STEPS[number];

export default function VideoManagement() {
  const [page, setPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<UploadStep>('basic-info');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalPreviewFile, setExternalPreviewFile] = useState<File | null>(null);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMonetization, setFilterMonetization] = useState('');
  const [filterUploader, setFilterUploader] = useState('');

  const limit = 10;
  const { data: categoryList = [], isLoading: loadingCategories } = useGetGenericMasterByKeyQuery('category');
  const { data: taglist = [], isLoading: loadingTags } = useGetGenericMasterByKeyQuery('tag');
  const { data, isLoading, refetch } = useGetVideosQuery({ page, limit });

  const [socketId, setSocketId] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    refetch();
  }, [page, refetch]);

  useEffect(() => {
    let socket: any = null;
    const initializeSocket = async () => {
      try {
        socket = getSocket();
        if (!socket.connected) {
          await new Promise((resolve) => {
            socket.once('connect', resolve);
            socket.connect();
          });
        }
        setSocketId(socket.id);
        setIsSocketConnected(true);

        socket.on('upload-progress', (data: any) => {
          setUploadProgress(parseFloat(data.percentage));
        });
        socket.on('upload-complete', () => {
          toast.success('Upload completed successfully!');
          setCurrentStep('completed' as any);
          refetch();
        });
        socket.on('upload-error', (data: any) => {
          toast.error(data.error || 'Upload failed');
          setCurrentStep('error' as any);
        });
      } catch (error) {
        setIsSocketConnected(false);
        setSocketId(null);
      }
    };
    initializeSocket();
    return () => {
      if (socket) {
        socket.off('upload-progress');
        socket.off('upload-complete');
        socket.off('upload-error');
        socket.disconnect();
      }
    };
  }, []);

  const [videoData, setVideoData] = useState({
    videoType: 'internal',
    title: '',
    videoUrl: '',
    description: '',
    tags: '',
    category: '',
    visibility: 'private',
    monetizationType: 'free',
    price: 0,
    targetQuality: '1080p',
    enableCaptions: false,
    isDRM: false,
  });

  // Fetch live payout rate for display in upload form
  const { data: payoutRate } = useGetPayoutRateQuery();

  const [uploadVideo] = useUploadVideoMutation();
  const [uploadThirdPartyVideo] = useUploadExternalVideoMutation();
  const [deleteVideo] = useDeleteVideoMutation();
  const [deleteThirdPartyVideo] = useDeletethirdpartyVideoMutation();
  const [updateVideo] = useUpdateVideoMutation();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    try {
      if (editingVideo) {
        // Edit flow
        await updateVideo({
          id: editingVideo._id,
          data: {
            title: videoData.title,
            description: videoData.description,
            category: videoData.category,
            tags: videoData.tags.split(',').map((t: string) => t.trim()),
            visibility: videoData.visibility.toLowerCase(),
          },
        }).unwrap();
        toast.success('Video updated successfully!');
        refetch();
        handleCloseModal();
        return;
      }

      // Upload flow
      if (videoData.videoType === 'internal') {
        if (!isSocketConnected || !socketId) {
          toast.error('Socket connection not established. Please try again.');
          return;
        }
      }

      setIsUploading(true);
      setIsProcessing(true);
      const formData = new FormData();

      if (videoData.videoType === 'external') {
        if (!externalPreviewFile && !selectedFile) {
          toast.error('Please select a Preview or Thumbnail');
          setIsUploading(false);
          setIsProcessing(false);
          return;
        }
        if (externalPreviewFile) formData.append('thumbnail', externalPreviewFile);
        formData.append('filepath', videoData.videoUrl);
        if (selectedFile) formData.append('preview', selectedFile);
      } else {
        if (!selectedFile) {
          toast.error('Please select a video to upload');
          setIsUploading(false);
          setIsProcessing(false);
          return;
        }
        formData.append('video', selectedFile);
      }

      formData.append('title', videoData.title);
      formData.append('description', videoData.description);
      formData.append('tags', JSON.stringify(videoData.tags.split(',').map((t: string) => t.trim())));
      formData.append('category', videoData.category);
      formData.append('visibility', videoData.visibility.toLowerCase());
      formData.append('drmEnabled', String(videoData.isDRM));
      formData.append('quality', videoData.targetQuality);
      formData.append('type', videoData.monetizationType.toLowerCase());
      formData.append('price', String(videoData.price || 0));
      formData.append('currency', 'INR');
      formData.append('enableCaptions', String(videoData.enableCaptions));
      formData.append('socketId', socketId!);

      if (videoData.videoType === 'external') {
        await uploadThirdPartyVideo(formData).unwrap();
        toast.success('Video uploaded successfully!');
        refetch();
        setCurrentStep('completed' as any);
      } else {
        await uploadVideo(formData).unwrap();
        toast.success('Upload started!');
        setCurrentStep('uploading' as any);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Upload failed');
      const errorObject = err?.data?.error || {};
      if (typeof errorObject === 'string') {
        toast.error(errorObject);
      } else {
        Object.values(errorObject).forEach((v) => toast.error(v + ''));
      }
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleDeleteVideo = async (row: any) => {
    const videoId = row.videoId;
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      setDeletingId(videoId);
      if (row.type === 'thirdparty') {
        await deleteThirdPartyVideo(videoId).unwrap();
      } else {
        await deleteVideo(videoId).unwrap();
      }
      toast.success('Video deleted successfully');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete video');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditVideo = (video: any) => {
    setEditingVideo(video);
    setVideoData({
      videoType: video.type === 'thirdparty' ? 'external' : 'internal',
      videoUrl: video.filePath || '',
      title: video.title || '',
      description: video.description || '',
      tags: Array.isArray(video.tags) ? video.tags.join(',') : video.tags || '',
      category: video.category || '',
      visibility: video.visibility || 'private',
      monetizationType: video.monetization?.type || 'free',
      price: video.monetization?.price || 0,
      targetQuality: '1080p',
      enableCaptions: video.hasCaption || false,
      isDRM: video.drmEnabled || false,
    });
    setCurrentStep('basic-info');
    setShowUploadModal(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setVideoData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Unique uploaders from current page
  const allVideos = data?.videos || [];
  const uniqueUploaders: { id: string; name: string }[] = [];
  const seenUploaderIds = new Set<string>();
  allVideos.forEach((v: any) => {
    const creator = v.creatorId;
    if (creator && creator._id && !seenUploaderIds.has(creator._id)) {
      seenUploaderIds.add(creator._id);
      uniqueUploaders.push({ id: creator._id, name: creator.name || creator.email || creator._id });
    }
  });

  // Client-side filter on the current page
  const filteredVideos = allVideos.filter((v: any) => {
    const matchSearch = !search || v.title?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || v.category === filterCategory;
    const matchType = !filterType || v.type === filterType;
    const matchMon = !filterMonetization || v.monetization?.type === filterMonetization;
    const matchUploader = !filterUploader || v.creatorId?._id === filterUploader;
    return matchSearch && matchCategory && matchType && matchMon && matchUploader;
  });

  // Insight stats from current page data
  const insightStats = {
    total: data?.total ?? 0,
    internal: allVideos.filter((v: any) => v.type === 'uploaded').length,
    thirdparty: allVideos.filter((v: any) => v.type === 'thirdparty').length,
    public: allVideos.filter((v: any) => v.visibility === 'public').length,
    private: allVideos.filter((v: any) => v.visibility === 'private').length,
  };


  const columnHelper = createColumnHelper<any>();
  const columns = [
    columnHelper.accessor('thumbnailPath', {
      header: 'Thumbnail',
      cell: (info) => (
        <div className="w-20 h-12 bg-dark-15 rounded overflow-hidden">
          {info.getValue() ? (
            <img src={info.getValue()} alt="thumbnail" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <VideoCameraIcon className="h-5 w-5 text-grey-70" />
            </div>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => <div className="font-medium max-w-[160px] truncate">{info.getValue()}</div>,
    }),
    columnHelper.accessor('category', { header: 'Category' }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => (
        <span className={`px-2 py-0.5 rounded text-xs ${info.getValue() === 'thirdparty' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'}`}>
          {info.getValue() === 'thirdparty' ? 'External' : 'Internal'}
        </span>
      ),
    }),
    columnHelper.accessor('monetization.type', {
      header: 'Monetization',
      cell: (info) => (
        <span className={`px-2 py-0.5 rounded text-xs ${info.getValue() === 'free' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
          {info.getValue()?.toUpperCase() ?? 'FREE'}
        </span>
      ),
    }),
    columnHelper.accessor('visibility', {
      header: 'Visibility',
      cell: (info) => (
        <span className={`px-2 py-0.5 rounded text-xs ${info.getValue() === 'public' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'}`}>
          {info.getValue() ?? 'private'}
        </span>
      ),
    }),
    columnHelper.accessor('creatorId.name', {
      header: 'Creator',
      cell: (info) => info.getValue() || '—',
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const row = info.row.original;
        const isDeleting = deletingId === row.videoId;
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEditVideo(row)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
              title="Edit"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteVideo(row)}
              disabled={isDeleting}
              className={`p-1.5 rounded-lg hover:bg-gray-800 ${isDeleting ? 'cursor-not-allowed text-yellow-400' : 'text-gray-400 hover:text-red-500'}`}
              title="Delete"
            >
              {isDeleting ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: filteredVideos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || 1,
  });

  const resetForm = () => {
    setVideoData({
      title: '',
      videoType: 'internal',
      videoUrl: '',
      description: '',
      tags: '',
      category: '',
      visibility: 'private',
      monetizationType: 'free',
      price: 0,
      targetQuality: '1080p',
      enableCaptions: false,
      isDRM: false,
    });
    setSelectedFile(null);
    setExternalPreviewFile(null);
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
    if (file) setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'] },
    maxFiles: 1,
    maxSize: 8 * 1024 * 1024 * 1024,
  });

  const handlePreviewDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) setExternalPreviewFile(file);
  }, []);
  const { getRootProps: getPreviewRootProps, getInputProps: getPreviewInputProps, isDragActive: isPreviewDragActive } = useDropzone({
    onDrop: handlePreviewDrop,
    accept: { 'image/jpeg': ['.jpg'] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
  });

  const handleNext = () => {
    if (currentStep === 'basic-info') setCurrentStep('settings');
    else if (currentStep === 'settings') setCurrentStep('upload');
  };
  const handleBack = () => {
    if (currentStep === 'settings') setCurrentStep('basic-info');
    else if (currentStep === 'upload') setCurrentStep('settings');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic-info':
        return (
          <div className="space-y-5">
            {!editingVideo && (
              <div>
                <label className="block text-grey-70 mb-2">Video Type</label>
                <select name="videoType" value={videoData.videoType} onChange={handleInputChange}
                  className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45">
                  <option value="internal">Internal Upload</option>
                  <option value="external">External (URL)</option>
                </select>
              </div>
            )}
            {videoData.videoType === 'external' && !editingVideo && (
              <div>
                <label className="block text-grey-70 mb-2">Video URL</label>
                <input name="videoUrl" value={videoData.videoUrl} onChange={handleInputChange}
                  className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45"
                  placeholder="https://..." />
              </div>
            )}
            <div>
              <label className="block text-grey-70 mb-2">Title</label>
              <input type="text" name="title" value={videoData.title} onChange={handleInputChange}
                className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45"
                placeholder="Enter video title" />
            </div>
            <div>
              <label className="block text-grey-70 mb-2">Description</label>
              <textarea name="description" value={videoData.description} onChange={handleInputChange}
                className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45 h-28"
                placeholder="Enter video description" />
            </div>
            <div>
              <label className="block text-grey-70 mb-2 flex items-center space-x-1"><TagIcon className="h-4 w-4" /><span>Tags</span></label>
              <SelectWithSearch
                isMulti
                endpoint="/genericMaster/tag"
                value={videoData.tags.split(',').filter(Boolean).map((tag) => ({ label: tag, value: tag }))}
                onChange={(selected: any) => {
                  setVideoData((prev) => ({ ...prev, tags: selected.map((s: any) => s.value).join(',') }));
                }}
                placeholder="Select tags..."
                className="text-black"
                transformResponse={(data: any) =>
                  Array.isArray(data)
                    ? data.map((item: any) => ({ label: item.value, value: item.value }))
                    : []
                }
              />
            </div>
            <div>
              <label className="block text-grey-70 mb-2 flex items-center space-x-1"><FolderIcon className="h-4 w-4" /><span>Category</span></label>
              <SelectWithSearch
                endpoint="/genericMaster/category"
                value={videoData.category ? { label: videoData.category, value: videoData.category } : null}
                onChange={(selected: any) => {
                  setVideoData((prev) => ({ ...prev, category: selected?.value ?? '' }));
                }}
                placeholder="Search category..."
                className="text-black"
                transformResponse={(data: any) =>
                  Array.isArray(data)
                    ? data.map((item: any) => ({ label: item.value, value: item.value }))
                    : []
                }
              />
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-grey-70 mb-2 flex items-center space-x-1"><GlobeAltIcon className="h-4 w-4" /><span>Visibility</span></label>
              <select name="visibility" value={videoData.visibility} onChange={handleInputChange}
                className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45">
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
            {!editingVideo && (
              <>
                <div>
                  <label className="block text-grey-70 mb-2 flex items-center space-x-1"><CurrencyDollarIcon className="h-4 w-4" /><span>Monetization</span></label>
                  <select name="monetizationType" value={videoData.monetizationType} onChange={handleInputChange}
                    className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45">
                    <option value="free">Free</option>
                    <option value="paid">Paid (Platform Subscription)</option>
                    <option value="rent">Rent (Individual Purchase)</option>
                  </select>
                </div>
                {videoData.monetizationType === 'rent' && (
                  <div>
                    <label className="block text-grey-70 mb-2">Rental Price (INR)</label>
                    <input
                      type="number"
                      name="price"
                      value={videoData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full bg-dark-10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45"
                      placeholder="e.g. 49.00"
                    />
                  </div>
                )}
                {(videoData.monetizationType === 'paid' || videoData.monetizationType === 'rent') && (
                  <div className="bg-green-900/20 border border-green-800 rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-300 text-xs font-semibold uppercase tracking-wide mb-0.5">Creator Payout Rate</p>
                        <p className="text-white text-sm">
                          Your earnings will be calculated at the platform rate of{' '}
                          <span className="text-green-400 font-bold">
                            ₹{payoutRate?.ratePerMinute ?? '—'} / minute
                          </span>{' '}
                          of watch time on this video.
                        </p>
                      </div>
                      <CurrencyDollarIcon className="h-8 w-8 text-green-400 flex-shrink-0 ml-3" />
                    </div>
                    <p className="text-grey-70 text-xs mt-2">
                      The rate is set by the platform admin and may be updated in the future. The rate at upload time will be snapshotted for this video.
                    </p>
                  </div>
                )}
                <label className="flex items-center space-x-2 text-grey-70 cursor-pointer">
                  <input type="checkbox" name="isDRM" checked={videoData.isDRM} onChange={handleInputChange}
                    className="form-checkbox bg-dark-10 border-grey-70 text-red-45 rounded" />
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Enable DRM Protection</span>
                </label>
                <label className="flex items-center space-x-2 text-grey-70 cursor-pointer">
                  <input type="checkbox" name="enableCaptions" checked={videoData.enableCaptions} onChange={handleInputChange}
                    className="form-checkbox bg-dark-10 border-grey-70 text-red-45 rounded" />
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>Auto-generate captions</span>
                </label>
              </>
            )}
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-5">
            <div className="bg-dark-10 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-3">Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-grey-70">Title</p><p className="text-white font-medium">{videoData.title}</p></div>
                <div><p className="text-grey-70">Category</p><p className="text-white font-medium">{videoData.category}</p></div>
                <div><p className="text-grey-70">Visibility</p><p className="text-white font-medium">{videoData.visibility}</p></div>
                <div><p className="text-grey-70">Monetization</p><p className="text-white font-medium">{videoData.monetizationType}</p></div>
              </div>
            </div>

            <div {...getRootProps()} className={`border-2 border-dashed border-grey-70 rounded-lg p-8 text-center cursor-pointer ${isDragActive ? 'border-red-45 bg-red-45/5' : ''}`}>
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="h-20 w-20 mx-auto text-grey-70 mb-3" />
              <p className="text-grey-70">
                {videoData.videoType === 'external' ? 'Drag & drop preview video' : 'Drag & drop your video here, or click to select'}
              </p>
              {selectedFile && <p className="text-green-400 mt-2 text-sm">✓ {selectedFile.name}</p>}
              <p className="text-grey-60 text-xs mt-1">Supported: MP4, MOV, MKV (max 8GB)</p>
            </div>

            {videoData.videoType === 'external' && (
              <div {...getPreviewRootProps()} className={`border-2 border-dashed border-yellow-400 rounded-lg p-5 text-center cursor-pointer ${isPreviewDragActive ? 'bg-yellow-900/10' : ''}`}>
                <input {...getPreviewInputProps()} />
                <p className="text-yellow-300">Drag & drop thumbnail image (.jpg), or click</p>
                {externalPreviewFile && <p className="text-white mt-1 text-sm">✓ {externalPreviewFile.name}</p>}
                <p className="text-yellow-400 text-xs mt-1">JPG only, max 2MB</p>
              </div>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div>
                <div className="flex justify-between text-grey-70 text-sm mb-1">
                  <span>Uploading...</span><span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-dark-15 rounded-full h-2">
                  <div className="bg-red-45 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        );

      case 'completed' as any:
        return (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-500 mb-2">
              {editingVideo ? 'Video Updated!' : 'Upload Successful!'}
            </h3>
            <p className="text-gray-400 mb-4">Your video has been {editingVideo ? 'updated' : 'uploaded'} successfully.</p>
            <button onClick={handleCloseModal} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-700">Done</button>
          </div>
        );

      case 'uploading' as any:
        return (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold text-white mb-2">Uploading...</h3>
            <p className="text-gray-400 mb-4">Please wait while your video is being uploaded.</p>
            <div className="w-3/4 mx-auto bg-gray-700 rounded-full h-4 overflow-hidden mb-2">
              <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-sm text-white">{uploadProgress}%</p>
          </div>
        );

      case 'error' as any:
        return (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold text-red-500 mb-2">Upload Failed</h3>
            <p className="text-gray-400 mb-4">There was an error uploading your video. Please try again.</p>
            <button onClick={handleCloseModal} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-700">Close</button>
          </div>
        );
    }
  };

  const isTerminalStep = ['completed', 'uploading', 'error'].includes(currentStep as string);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Video Management</h1>
        <button
          onClick={() => { resetForm(); setShowUploadModal(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <CloudArrowUpIcon className="h-5 w-5" />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Insight Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: insightStats.total, color: 'text-white' },
          { label: 'Internal', value: insightStats.internal, color: 'text-blue-400' },
          { label: 'External', value: insightStats.thirdparty, color: 'text-purple-400' },
          { label: 'Public', value: insightStats.public, color: 'text-green-400' },
          { label: 'Private', value: insightStats.private, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="bg-dark-10 rounded-lg p-3 border border-dark-20 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-grey-70 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-grey-70" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-10 text-white pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-45 border border-dark-20"
          />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-dark-10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-45 border border-dark-20">
          <option value="">All Categories</option>
          {categoryList.map((cat: { value: string }) => (
            <option key={cat.value} value={cat.value}>{cat.value}</option>
          ))}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="bg-dark-10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-45 border border-dark-20">
          <option value="">All Types</option>
          <option value="uploaded">Internal</option>
          <option value="thirdparty">External</option>
        </select>
        <select value={filterMonetization} onChange={(e) => setFilterMonetization(e.target.value)}
          className="bg-dark-10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-45 border border-dark-20">
          <option value="">All Monetization</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
          <option value="rent">Rent</option>
        </select>
        {/* Uploaded By — searchable */}
        <div style={{ minWidth: 200 }}>
          <SelectWithSearch
            endpoint="/user/search?role=creator"
            value={filterUploader ? { label: filterUploader, value: filterUploader } : null}
            onChange={(selected: any) => setFilterUploader(selected?.value ?? '')}
            placeholder="Search Creator..."
            className="text-black"
            transformResponse={(data: any) =>
              Array.isArray(data?.users)
                ? data.users.map((u: any) => ({ label: u.name || u.email, value: u._id }))
                : []
            }
          />
        </div>
        {(search || filterCategory || filterType || filterMonetization || filterUploader) && (
          <button onClick={() => { setSearch(''); setFilterCategory(''); setFilterType(''); setFilterMonetization(''); setFilterUploader(''); }}
            className="text-grey-70 hover:text-white text-sm underline">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-dark-20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-dark-20 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-10 text-gray-400">
                    <VideoCameraIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>No videos found.</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
          <span className="text-sm text-gray-400">
            Page {page} of {data?.totalPages || 1} &bull; {data?.total ?? 0} total videos
          </span>
          <div className="flex items-center space-x-2">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed bg-dark-15 rounded">
              ← Prev
            </button>
            <button onClick={() => setPage((p) => p + 1)} disabled={!data || data.videos.length < limit}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed bg-dark-15 rounded">
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Upload / Edit Modal */}
      {
        showUploadModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] rounded-xl p-6 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingVideo ? 'Edit Video' : 'Upload New Video'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Step indicator — only show for upload flow */}
              {!editingVideo && !isTerminalStep && (
                <div className="flex items-center justify-center mb-6">
                  {WIZARD_STEPS.map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step ? 'bg-red-500 text-white' :
                        WIZARD_STEPS.indexOf(currentStep) > index ? 'bg-green-500 text-white' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                        {WIZARD_STEPS.indexOf(currentStep) > index ? '✓' : index + 1}
                      </div>
                      {index < WIZARD_STEPS.length - 1 && (
                        <div className={`w-16 h-1 mx-2 ${WIZARD_STEPS.indexOf(currentStep) > index ? 'bg-green-500' : 'bg-gray-700'}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {renderStepContent()}

              {/* Navigation */}
              {!isTerminalStep && (
                <div className="flex justify-between mt-6">
                  {(currentStep !== 'basic-info') && (
                    <button onClick={handleBack}
                      className="flex items-center space-x-1 px-4 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-600">
                      <ArrowLeftIcon className="h-4 w-4" /><span>Back</span>
                    </button>
                  )}
                  <button
                    onClick={editingVideo && currentStep === 'basic-info' ? handleUpload : (currentStep === 'upload' ? handleUpload : handleNext)}
                    disabled={isProcessing || isUploading}
                    className={`flex items-center space-x-1 px-4 py-2 text-white rounded-lg ml-auto ${isProcessing || isUploading ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                      }`}
                  >
                    {isProcessing ? (
                      <><svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>Processing...</span></>
                    ) : (
                      <>
                        <span>{editingVideo ? 'Save Changes' : (currentStep === 'upload' ? 'Upload' : 'Next')}</span>
                        {!editingVideo && <ArrowRightIcon className="h-4 w-4" />}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      }
    </div >
  );
}
