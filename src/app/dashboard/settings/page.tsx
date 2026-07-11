'use client';

import { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  KeyIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useGetUserByIdQuery, useUpdateUserMutation } from '../../store/api/userApi';
import toast from 'react-hot-toast';

const BankAccountSchema = Yup.object({
  accountName: Yup.string().required('Account name is required'),
  accountNumber: Yup.string().required('Account number is required'),
  bankName: Yup.string().required('Bank name is required'),
  swiftCode: Yup.string().required('SWIFT code is required'),
});

const UPISchema = Yup.object({
  upiId: Yup.string()
    .required('UPI ID is required')
    .matches(/^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z._]{2,49}$/, 'Invalid UPI ID format'),
});

const sections = [
  { id: 'profile', title: 'Profile Settings', icon: <UserIcon className="h-5 w-5" /> },
  { id: 'notifications', title: 'Notifications', icon: <BellIcon className="h-5 w-5" /> },
  { id: 'security', title: 'Security', icon: <ShieldCheckIcon className="h-5 w-5" /> },
  { id: 'payment', title: 'Payment Settings', icon: <CreditCardIcon className="h-5 w-5" /> },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isEditingUPI, setIsEditingUPI] = useState(false);

  const currentUser = useSelector(selectCurrentUser);
  const { data: userData, isLoading: loadingUser } = useGetUserByIdQuery(currentUser?.id ?? '', { skip: !currentUser?.id });
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newEarnings: true,
    newComments: true,
    payoutConfirmations: true,
    marketingEmails: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    deviceHistory: true,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    defaultPaymentMethod: 'bank' as 'bank' | 'upi',
    autoPayoutThreshold: '1000',
    bankAccount: { accountName: '', accountNumber: '', bankName: '', swiftCode: '' },
    upiId: '',
  });

  // Notification toggle helper
  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSecurity = (key: keyof typeof securitySettings) => {
    setSecuritySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderToggle = (checked: boolean, onToggle: () => void) => (
    <label className="relative inline-flex items-center cursor-pointer" onClick={onToggle}>
      <div className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-red-45' : 'bg-dark-15'}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
    </label>
  );

  const renderProfileSettings = () => {
    if (loadingUser) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-dark-20 rounded animate-pulse" />
          ))}
        </div>
      );
    }

    const initialValues = {
      name: userData?.name ?? currentUser?.name ?? '',
      email: userData?.email ?? currentUser?.email ?? '',
      phone: '',
      language: userData?.preferences?.quality ?? 'English',
    };

    return (
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            if (!currentUser?.id) { toast.error('Not logged in'); return; }
            await updateUser({ id: currentUser.id, name: values.name, phone: values.phone, language: values.language }).unwrap();
            toast.success('Profile updated successfully!');
          } catch {
            toast.error('Failed to update profile');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-20 h-20 bg-red-45 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                {(userData?.name ?? currentUser?.name ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-primary font-semibold">{userData?.name ?? currentUser?.name}</p>
                <p className="text-grey-70 text-sm capitalize">{currentUser?.role}</p>
                <button type="button" className="text-red-45 text-sm hover:text-red-60 flex items-center space-x-1 mt-1">
                  <PencilIcon className="h-3.5 w-3.5" /><span>Change Photo</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-grey-70 text-sm mb-1">Full Name</label>
                <div className="flex items-center space-x-2 bg-dark-10 border border-dark-20 rounded-lg px-3 py-2">
                  <UserIcon className="h-4 w-4 text-grey-70 flex-shrink-0" />
                  <Field name="name" type="text" className="flex-1 bg-transparent text-primary text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-grey-70 text-sm mb-1">Email</label>
                <div className="flex items-center space-x-2 bg-dark-10 border border-dark-20 rounded-lg px-3 py-2">
                  <EnvelopeIcon className="h-4 w-4 text-grey-70 flex-shrink-0" />
                  <Field name="email" type="email" disabled className="flex-1 bg-transparent text-grey-70 text-sm focus:outline-none cursor-not-allowed" />
                </div>
                <p className="text-xs text-grey-60 mt-1">Email cannot be changed here</p>
              </div>
              <div>
                <label className="block text-grey-70 text-sm mb-1">Phone</label>
                <div className="flex items-center space-x-2 bg-dark-10 border border-dark-20 rounded-lg px-3 py-2">
                  <PhoneIcon className="h-4 w-4 text-grey-70 flex-shrink-0" />
                  <Field name="phone" type="tel" placeholder="+91 ..." className="flex-1 bg-transparent text-primary text-sm focus:outline-none placeholder:text-grey-60" />
                </div>
              </div>
              <div>
                <label className="block text-grey-70 text-sm mb-1">Language</label>
                <div className="flex items-center space-x-2 bg-dark-10 border border-dark-20 rounded-lg px-3 py-2">
                  <GlobeAltIcon className="h-4 w-4 text-grey-70 flex-shrink-0" />
                  <Field as="select" name="language" className="flex-1 bg-transparent text-primary text-sm focus:outline-none">
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </Field>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={isSubmitting || isUpdating}
                className="bg-red-45 text-white px-5 py-2 rounded-lg text-sm hover:bg-red-60 disabled:opacity-60">
                {isSubmitting || isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    );
  };

  const renderNotificationSettings = () => (
    <div className="space-y-3">
      {Object.entries(notificationSettings).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between py-3 border-b border-dark-15 last:border-0">
          <span className="text-grey-70 text-sm">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
          </span>
          {renderToggle(value, () => toggleNotification(key as any))}
        </div>
      ))}
      <p className="text-grey-60 text-xs mt-2">Note: Notification preferences are saved locally.</p>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-4">
      <div className="bg-dark-15 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary text-sm font-medium">Two-Factor Authentication</p>
            <p className="text-grey-70 text-xs">Extra security layer for your account</p>
          </div>
          {renderToggle(securitySettings.twoFactorEnabled, () => toggleSecurity('twoFactorEnabled'))}
        </div>
        <div className="flex items-center justify-between border-t border-dark-20 pt-4">
          <div className="flex items-center space-x-2">
            <KeyIcon className="h-4 w-4 text-grey-70" />
            <span className="text-grey-70 text-sm">Login Alerts</span>
          </div>
          {renderToggle(securitySettings.loginAlerts, () => toggleSecurity('loginAlerts'))}
        </div>
        <div className="flex items-center justify-between border-t border-dark-20 pt-4">
          <div className="flex items-center space-x-2">
            <CheckBadgeIcon className="h-4 w-4 text-grey-70" />
            <span className="text-grey-70 text-sm">Device History</span>
          </div>
          {renderToggle(securitySettings.deviceHistory, () => toggleSecurity('deviceHistory'))}
        </div>
      </div>
      <button className="bg-dark-15 text-primary px-4 py-2 rounded-lg text-sm hover:bg-dark-20 border border-dark-20">
        View Login History
      </button>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-4">
      <div className="bg-dark-10 rounded-lg p-4 border border-dark-20">
        <h3 className="text-primary text-sm font-semibold mb-3">Default Payment Method</h3>
        <select
          value={paymentSettings.defaultPaymentMethod}
          onChange={(e) => setPaymentSettings((prev) => ({ ...prev, defaultPaymentMethod: e.target.value as any }))}
          className="w-full bg-dark-15 text-primary px-3 py-2 rounded-lg text-sm border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45"
        >
          <option value="bank">Bank Transfer</option>
          <option value="upi">UPI</option>
        </select>
      </div>

      <div className="bg-dark-10 rounded-lg p-4 border border-dark-20">
        <h3 className="text-primary text-sm font-semibold mb-3">Auto-Payout Threshold</h3>
        <div className="flex items-center space-x-2">
          <span className="text-grey-70">₹</span>
          <input type="number" value={paymentSettings.autoPayoutThreshold}
            onChange={(e) => setPaymentSettings((prev) => ({ ...prev, autoPayoutThreshold: e.target.value }))}
            className="flex-1 bg-dark-15 text-primary px-3 py-2 rounded-lg text-sm border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45"
            min="0" step="100" />
        </div>
        <p className="text-grey-70 text-xs mt-1">Auto-payout when balance exceeds this amount</p>
      </div>

      {/* Bank Account */}
      <div className="bg-dark-10 rounded-lg p-4 border border-dark-20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-primary text-sm font-semibold">Bank Account Details</h3>
          {!isEditingBank && (
            <button onClick={() => setIsEditingBank(true)} className="text-red-45 hover:text-red-60">
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        {isEditingBank ? (
          <Formik initialValues={paymentSettings.bankAccount} validationSchema={BankAccountSchema}
            onSubmit={(values, { setSubmitting }) => {
              setPaymentSettings((prev) => ({ ...prev, bankAccount: values }));
              setIsEditingBank(false);
              setSubmitting(false);
              toast.success('Bank details saved');
            }}>
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-3">
                {(['accountName', 'accountNumber', 'bankName', 'swiftCode'] as const).map((key) => (
                  <div key={key}>
                    <label className="text-grey-70 text-xs mb-1 block">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                    </label>
                    <Field name={key} type="text"
                      className="w-full bg-dark-15 text-primary px-3 py-2 rounded-lg text-sm border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45" />
                    {errors[key] && touched[key] && <p className="text-red-400 text-xs mt-0.5">{errors[key]}</p>}
                  </div>
                ))}
                <div className="flex space-x-2 pt-1">
                  <button type="submit" disabled={isSubmitting}
                    className="bg-red-45 text-white px-3 py-1.5 rounded text-sm disabled:opacity-60 flex items-center space-x-1">
                    <CheckIcon className="h-3.5 w-3.5" /><span>Save</span>
                  </button>
                  <button type="button" onClick={() => setIsEditingBank(false)}
                    className="bg-dark-15 text-grey-70 px-3 py-1.5 rounded text-sm flex items-center space-x-1">
                    <XMarkIcon className="h-3.5 w-3.5" /><span>Cancel</span>
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="space-y-2 text-sm">
            {Object.entries(paymentSettings.bankAccount).map(([key, val]) => (
              <div key={key} className="flex justify-between">
                <span className="text-grey-70">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</span>
                <span className="text-primary">{val || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPI */}
      <div className="bg-dark-10 rounded-lg p-4 border border-dark-20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-primary text-sm font-semibold">UPI ID</h3>
          {!isEditingUPI && (
            <button onClick={() => setIsEditingUPI(true)} className="text-red-45 hover:text-red-60">
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        {isEditingUPI ? (
          <Formik initialValues={{ upiId: paymentSettings.upiId }} validationSchema={UPISchema}
            onSubmit={(values, { setSubmitting }) => {
              setPaymentSettings((prev) => ({ ...prev, upiId: values.upiId }));
              setIsEditingUPI(false);
              setSubmitting(false);
              toast.success('UPI ID saved');
            }}>
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-3">
                <Field name="upiId" type="text" placeholder="username@upi"
                  className="w-full bg-dark-15 text-primary px-3 py-2 rounded-lg text-sm border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45" />
                {errors.upiId && touched.upiId && <p className="text-red-400 text-xs">{errors.upiId}</p>}
                <div className="flex space-x-2">
                  <button type="submit" disabled={isSubmitting}
                    className="bg-red-45 text-white px-3 py-1.5 rounded text-sm disabled:opacity-60 flex items-center space-x-1">
                    <CheckIcon className="h-3.5 w-3.5" /><span>Save</span>
                  </button>
                  <button type="button" onClick={() => setIsEditingUPI(false)}
                    className="bg-dark-15 text-grey-70 px-3 py-1.5 rounded text-sm flex items-center space-x-1">
                    <XMarkIcon className="h-3.5 w-3.5" /><span>Cancel</span>
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-grey-70">UPI ID</span>
            <span className="text-primary">{paymentSettings.upiId || '—'}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'payment': return renderPaymentSettings();
      default: return null;
    }
  };

  return (
    <div className="relative">
      {/* Mobile menu button */}
      <div className="lg:hidden mb-4">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center space-x-2 bg-dark-8 px-4 py-2 rounded-lg text-grey-70 hover:text-primary border border-dark-20 text-sm">
          <span>{sections.find((s) => s.id === activeSection)?.title}</span>
          <svg className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-6">
        {/* Sidebar */}
        <div className={`lg:w-56 bg-dark-8 rounded-lg overflow-hidden ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block lg:h-fit fixed lg:static top-16 left-0 right-0 z-50 lg:z-0 p-3 border border-dark-20`}>
          {sections.map((section) => (
            <button key={section.id} onClick={() => { setActiveSection(section.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all ${activeSection === section.id
                  ? 'bg-red-45 text-white'
                  : 'text-grey-70 hover:bg-dark-15 hover:text-primary'
                }`}>
              {section.icon}
              <span>{section.title}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-dark-8 rounded-lg p-5 border border-dark-20">
            <h2 className="text-xl font-bold text-primary mb-5">
              {sections.find((s) => s.id === activeSection)?.title}
            </h2>
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
}