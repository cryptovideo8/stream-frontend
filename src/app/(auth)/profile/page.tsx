'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useGetUserByIdQuery, useUpdateUserMutation } from '../../store/api/userApi';
import { Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const userId = currentUser?.id;

  const { data: userDetails, isLoading } = useGetUserByIdQuery(userId!, {
    skip: !userId
  });

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [formData, setFormData] = useState({
    name: '',
    // phone: '',
    // profileImage: '',
    preferences: {
      quality: 'auto',
      notifications: true,
      autoplay: true,
    },
  });

  useEffect(() => {
    if (userDetails) {
      setFormData({
        name: userDetails.name || '',
        // phone: userDetails.phone || '',
        // profileImage: userDetails.profileImage || '',
        preferences: {
          quality: userDetails.preferences?.quality || 'auto',
          notifications: userDetails.preferences?.notifications ?? true,
          autoplay: userDetails.preferences?.autoplay ?? true,
        },
      });
    }
  }, [userDetails]);

  const handleChange = (field: string, value: string | boolean) => {
    if (field.startsWith('preferences.')) {
      const key = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [key]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      await updateUser({ id: userId!, ... formData }).unwrap();
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Update failed');
    }
  };

  if (isLoading) {
    return <div className="text-center py-10 text-primary">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-primary mb-6">My Profile</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Full Name</label>
          <input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full p-3 rounded-lg bg-dark-15 text-primary focus:outline-none"
            placeholder="Your Name"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Email (read-only)</label>
          <input
            value={userDetails?.email}
            readOnly
            className="w-full p-3 rounded-lg bg-dark-10 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Role (read-only)</label>
          <input
            value={userDetails?.role}
            readOnly
            className="w-full p-3 rounded-lg bg-dark-10 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Subscription ID</label>
          <input
            value={userDetails?.subscriptionId || 'None'}
            readOnly
            className="w-full p-3 rounded-lg bg-dark-10 text-gray-500"
          />
        </div>


        <div>
          <label className="block text-sm text-gray-400 mb-1">Quality Preference</label>
          <select
            value={formData.preferences.quality}
            onChange={(e) => handleChange('preferences.quality', e.target.value)}
            className="w-full p-3 rounded-lg bg-dark-15 text-primary"
          >
            <option value="auto">Auto</option>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-400">Notifications</label>
          <input
            type="checkbox"
            checked={formData.preferences.notifications}
            onChange={(e) => handleChange('preferences.notifications', e.target.checked)}
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-400">Autoplay</label>
          <input
            type="checkbox"
            checked={formData.preferences.autoplay}
            onChange={(e) => handleChange('preferences.autoplay', e.target.checked)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="mt-4 w-full bg-red-45 hover:bg-red-55 text-white font-medium py-3 rounded-lg"
        >
          {isUpdating ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin h-5 w-5 mr-2" /> Saving...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Check className="h-5 w-5 mr-2" /> Update Profile
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
