'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import { FormLayout, FormItem } from '@/app/components/ui/FormLayout';
import FormSection from '@/app/components/ui/FormSection';
import BaseInput from '@/app/components/ui/input';
import SelectWithSearch from '@/app/components/ui/SelectWithSearch';
import BackButton from '@/app/components/ui/BackButton';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

interface StockItem {
  itemId: string;
  itemCode: string;
  itemDescription: string;
  qtyOrder: number;
  remainingQty: number;
  priceExVat: number;
  vatRate: number;
  total: number;
  isNewRow?: boolean;
}

export default function IssueStockPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const id = searchParams.get('id');
  const isViewMode = mode === 'view';

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    warehouseId: '',
    warehouseName: '',
    teamLeaderId: '',
    teamLeaderName: '',
    dateOfIssue: new Date().toISOString().split('T')[0],
    transactionId: 'System Generated',
    lines: Array(3).fill({
      itemId: '',
      itemCode: '',
      itemDescription: '',
      qtyOrder: 0,
      remainingQty: 0,
      priceExVat: 0,
      vatRate: 0,
      total: 0,
      isNewRow: true
    }) as StockItem[]
  });

  useEffect(() => {
    if (isViewMode && id) {
      fetchIssueStockDetails();
    }
  }, [isViewMode, id]);

  const fetchIssueStockDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/issueStock/${id}`);
      const data = response.data;
      
      setFormData({
        warehouseId: data.warehouseId._id,
        warehouseName: data.warehouseId.name,
        teamLeaderId: data.teamLeaderId._id,
        teamLeaderName: data.teamLeaderId.name,
        dateOfIssue: data.dateOfIssue.split('T')[0],
        transactionId: data.transactionId,
        lines: data.lines.map((line: any) => ({
          itemId: line.itemId,
          itemCode: line.itemCode,
          itemDescription: line.itemDescription,
          qtyOrder: line.qtyOrder,
          priceExVat: line.priceExVat,
          vatRate: line.vatRate,
          total: line.total,
          isNewRow: false
        }))
      });
    } catch (error: any) {
      console.error('Error fetching issue stock details:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch issue stock details');
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderChange = (field: string, value: string, option?: any) => {
    if (isViewMode) return;
    setFormData(prev => ({
      ...prev,
      [field]: value,
      [`${field}Name`]: option?.name || ''
    }));
  };

  const fetchItemDetails = async (itemId: string, warehouseId: string) => {
    try {
      const response = await axios.get(`/item/item-details/${itemId}/${warehouseId}`);
      // console.log("responsesssss>>>>>>>", response);

      console.log("response.data", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching item details:', error);
      toast.error('Failed to fetch item details');
      return null;
    }
  };

  const calculateTotals = () => {
    const totals = formData.lines.reduce((acc, line) => {
      const lineVat = (line.priceExVat * line.qtyOrder) * (line.vatRate / 100);
      return {
        totalExVat: acc.totalExVat + (line.priceExVat * line.qtyOrder),
        totalVat: acc.totalVat + lineVat
      };
    }, { totalExVat: 0, totalVat: 0 });

    return {
      totalExVat: totals.totalExVat,
      vat: totals.totalVat,
      totalInclVat: totals.totalExVat + totals.totalVat
    };
  };

  const handleItemChange = async (index: number, value: string, option?: any) => {
    if (isViewMode) return;
    if (!formData.warehouseId) {
      toast.error('Please select a warehouse first');
      return;
    }

    console.log("Selected Item Option:", option);
    if (option) {
      const itemDetails = await fetchItemDetails(value, formData.warehouseId);
      console.log("Item Details from API:", itemDetails);
      if (itemDetails) {
        const newLines = [...formData.lines];
        newLines[index] = {
          ...newLines[index],
          itemId: value,
          itemCode: option.code || option.itemCode,
          itemDescription: option.description || option.itemDescription,
          remainingQty: itemDetails.remainingQty,
          priceExVat: itemDetails.unit_price,
          vatRate: itemDetails.vat_rate,
          qtyOrder: 0,
          total: 0,
          isNewRow: true
        };
        setFormData(prev => ({ ...prev, lines: newLines }));
      }
    }
  };

  const handleQtyChange = (index: number, qty: number) => {
    const line = formData.lines[index];
    if (qty > line.remainingQty) {
      toast.error(`Quantity cannot exceed remaining quantity (${line.remainingQty})`);
      return;
    }

    const newLines = [...formData.lines];
    newLines[index] = {
      ...newLines[index],
      qtyOrder: qty,
      total: qty * line.priceExVat
    };
    setFormData(prev => ({ ...prev, lines: newLines }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate header fields
    if (!formData.warehouseId || !formData.teamLeaderId) {
      toast.error('Please select warehouse and team leader');
      return;
    }

    // Filter out empty lines and validate line items
    const validLines = formData.lines.filter(line => 
      line.itemId && line.qtyOrder > 0
    );

    if (validLines.length === 0) {
      toast.error('Please add at least one valid item');
      return;
    }

    // Check for incomplete lines
    const hasIncompleteLines = formData.lines.some((line, index) => {
      if (line.itemId || line.qtyOrder > 0) {  // If line has any data
        if (!line.itemId || !line.qtyOrder || line.qtyOrder <= 0) {
          toast.error(`Please complete all fields for item ${index + 1}`);
          return true;
        }
      }
      return false;
    });

    if (hasIncompleteLines) {
      return;
    }

    // Calculate totals
    const totals = calculateTotals();

    try {
      setSubmitting(true);

      // Prepare payload
      const payload = {
        warehouseId: formData.warehouseId,
        warehouseName: formData.warehouseName,
        teamLeaderId: formData.teamLeaderId,
        teamLeaderName: formData.teamLeaderName,
        dateOfIssue: formData.dateOfIssue,
        lines: validLines.map(line => ({
          itemId: line.itemId,
          itemCode: line.itemCode,
          itemDescription: line.itemDescription,
          qtyOrder: line.qtyOrder,
          priceExVat: line.priceExVat,
          vatRate: line.vatRate,
          total: line.total
        })),
        totalExVat: totals.totalExVat,
        totalVat: totals.vat,
        totalInclVat: totals.totalInclVat
      };

      console.log('Submitting payload:', payload);

      const response = await axios.post('/issueStock', payload);

      if (response.data?.success) {
        toast.success(response?.data?.message || 'Stock issue created successfully');
        // Reset form
        setFormData(prev => ({
          ...prev,
          lines: Array(3).fill({
            itemId: '',
            itemCode: '',
            itemDescription: '',
            qtyOrder: 0,
            remainingQty: 0,
            priceExVat: 0,
            vatRate: 0,
            total: 0,
            isNewRow: true
          }) as StockItem[]
        }));
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(error?.response?.data?.message || 'Failed to create stock issue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddRow = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, {
        itemId: '',
        itemCode: '',
        itemDescription: '',
        qtyOrder: 0,
        remainingQty: 0,
        priceExVat: 0,
        vatRate: 0,
        total: 0,
        isNewRow: true
      }]
    }));
  };

  const handleDeleteRow = (indexToDelete: number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, index) => index !== indexToDelete)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h1 className="text-xl font-semibold">
          {isViewMode ? 'View Issue Stock' : 'Create Issue Stock'}
        </h1>
        <BackButton />
      </div>

      <form onSubmit={handleSubmit}>
        <FormLayout>
          <FormSection title="">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isViewMode ? (
                // View mode display
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Issued From</label>
                    <div className="p-2 border rounded bg-gray-50">
                      {formData.warehouseName || '-'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Issued To</label>
                    <div className="p-2 border rounded bg-gray-50">
                      {formData.teamLeaderName || '-'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Date of Issue</label>
                    <div className="p-2 border rounded bg-gray-50">
                      {formData.dateOfIssue ? new Date(formData.dateOfIssue).toLocaleDateString() : '-'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Transaction ID</label>
                    <div className="p-2 border rounded bg-gray-50">
                      {formData.transactionId || '-'}
                    </div>
                  </div>
                </>
              ) : (
                // Edit mode inputs
                <>
                  <SelectWithSearch
                    id="warehouse"
                    name="warehouse"
                    label="Issued From"
                    placeholder="Search for warehouse"
                    value={formData.warehouseId}
                    initialValue={formData.warehouseId}
                    initialLabel={formData.warehouseName}
                    onChange={(value: any, option: any) => handleHeaderChange('warehouseId', value, option)}
                    valueField="_id"
                    labelField="name"
                    apiUrl="/warehouse/search"
                    required
                  />
                  <SelectWithSearch
                    id="teamLeader"
                    name="teamLeader"
                    label="Issued To"
                    placeholder="Search for team leader"
                    value={formData.teamLeaderId}
                    initialValue={formData.teamLeaderId}
                    initialLabel={formData.teamLeaderName}
                    onChange={(value: any, option: any) => handleHeaderChange('teamLeaderId', value, option)}
                    valueField="_id"
                    labelField="name"
                    apiUrl="/user/search?role=team_leader"
                    required
                  />
                  <FormItem label="Date of Issue">
                    <BaseInput
                      id="dateOfIssue"
                      name="dateOfIssue"
                      type="date"
                      value={formData.dateOfIssue}
                      onChange={(e) => handleHeaderChange('dateOfIssue', e.target.value)}
                      required
                    />
                  </FormItem>
                </>
              )}
            </div>
          </FormSection>

          <FormSection>
            {!isViewMode && (
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded border border-green-200 px-3 py-2"
                >
                  <FiPlus className="h-4 w-4 mr-1" /> Add Item
                </button>
              </div>
            )}

            <div className={`flex flex-col ${!isViewMode ? 'lg:flex-row' : ''} gap-4`}>
              <div className={`w-full ${!isViewMode ? 'lg:w-3/4' : ''}`}>
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">Item Code</th>
                      <th className="border p-2">Description</th>
                      <th className="border p-2">Qty</th>
                      {!isViewMode && (
                        <>
                          <th className="border p-2">Price Ex VAT</th>
                          <th className="border p-2">Total</th>
                          <th className="border p-2">Action</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.lines.map((line, index) => (
                      <tr key={index}>
                        <td className="border p-2">
                          {isViewMode ? (
                            line.itemCode
                          ) : (
                            <SelectWithSearch
                              id={`item_${index}`}
                              name={`item_${index}`}
                              placeholder="Search item code"
                              value={line.itemId}
                              onChange={(value: string, option?: any) => handleItemChange(index, value, option)}
                              valueField="_id"
                              labelField={['itemCode', 'itemDescription']}
                              apiUrl="/item/search"
                            />
                          )}
                        </td>
                        <td className="border p-2">
                          {line.itemDescription}
                          {!isViewMode && line.remainingQty > 0 && (
                            <span className="ml-2 text-xs text-gray-500">
                              (Available: {line.remainingQty})
                            </span>
                          )}
                        </td>
                        <td className="border p-2">
                          {isViewMode ? (
                            line.qtyOrder
                          ) : (
                            <BaseInput
                              id={`qty_${index}`}
                              name={`qty_${index}`}
                              type="number"
                              min="0"
                              max={line.remainingQty}
                              placeholder="Qty"
                              value={line.qtyOrder || ''}
                              onChange={(e) => handleQtyChange(index, Number(e.target.value))}
                            />
                          )}
                        </td>
                        {!isViewMode && (
                          <>
                            <td className="border p-2 text-right">
                              R {line.priceExVat.toFixed(2)}
                            </td>
                            <td className="border p-2 text-right">
                              R {line.total.toFixed(2)}
                            </td>
                            <td className="border p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!isViewMode && (
                <div className="w-full lg:w-1/4">
                  <table className="min-w-full border text-sm">
                    <tbody>
                      <tr>
                        <td className="border p-2 text-right font-semibold">Total ex VAT:</td>
                        <td className="border p-2 text-right">
                          R {calculateTotals().totalExVat.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2 text-right font-semibold">VAT:</td>
                        <td className="border p-2 text-right">
                          R {calculateTotals().vat.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2 text-right font-semibold">Total incl VAT:</td>
                        <td className="border p-2 text-right font-bold">
                          R {calculateTotals().totalInclVat.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end mt-4 gap-2">
              {!isViewMode && (
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition 
                    ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              )}
              <button
                type="button"
                className="px-2 py-1 border rounded hover:bg-gray-50"
                onClick={() => window.print()}
              >
                Print
              </button>
              <button
                type="button"
                className="px-2 py-1 border rounded hover:bg-gray-50"
              >
                Email
              </button>
            </div>
          </FormSection>
        </FormLayout>
      </form>
    </div>
  );
}
