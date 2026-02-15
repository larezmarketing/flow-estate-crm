import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Facebook, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const FacebookConnect = ({ initialData, onSave }) => {
    const [step, setStep] = useState(0); // 0: Disconnected, 1: Connecting (Auth), 2: Selecting Assets, 3: Connected
    const [userAccessToken, setUserAccessToken] = useState('');
    const [pages, setPages] = useState([]);
    const [forms, setForms] = useState([]);

    // Selection State
    const [selectedPageId, setSelectedPageId] = useState('');
    const [selectedFormId, setSelectedFormId] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check for token in URL handling redirect back from backend
        const searchParams = new URLSearchParams(window.location.search);
        const urlToken = searchParams.get('fb_token');

        if (urlToken) {
            setUserAccessToken(urlToken);
            setStep(2); // Move to Asset Selection
            fetchPages(urlToken);

            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (initialData && initialData.status === 'active') {
            setStep(3); // Already connected
            setSelectedPageId(initialData.config?.page_id);
            setSelectedFormId(initialData.config?.form_id);
        }
    }, [initialData]);

    const handleLogin = async () => {
        setLoading(true);
        try {
            // Get Auth URL from backend
            const res = await axios.get(`${API_URL}/api/facebook/login`);
            window.location.href = res.data.url; // Redirect to Facebook
        } catch (err) {
            setError('Failed to initiate Facebook Login');
            setLoading(false);
        }
    };

    const fetchPages = async (token) => {
        setLoading(true);
        setError('');
        try {
            // Backend proxy to avoid CORS and exposing tokens
            const tokenToUse = token || userAccessToken;
            const res = await axios.get(`${API_URL}/api/facebook/pages`, {
                params: { user_access_token: tokenToUse },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPages(res.data);
        } catch (err) {
            setError('Failed to fetch Facebook Pages');
        } finally {
            setLoading(false);
        }
    };

    const fetchForms = async (pageId, pageAccessToken) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/facebook/forms`, {
                params: { page_id: pageId, page_access_token: pageAccessToken },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setForms(res.data);
        } catch (err) {
            // If no forms or error, just show empty list
            setForms([]);
            console.error('Error getting forms', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (e) => {
        const pageId = e.target.value;
        setSelectedPageId(pageId);

        // Find access token for this page
        const page = pages.find(p => p.id === pageId);
        if (page) {
            fetchForms(pageId, page.access_token);
        }
    };

    const handleSaveConfig = async () => {
        if (!selectedPageId) {
            setError('Please select a Facebook Page');
            return;
        }

        setLoading(true);

        // Find selected page details
        const page = pages.find(p => p.id === selectedPageId);

        try {
            const config = {
                page_id: selectedPageId,
                page_name: page?.name,
                page_access_token: page?.access_token, // Critical for webhooks
                form_id: selectedFormId
            };

            await onSave('meta', config, 'active');
            setStep(3);
        } catch (err) {
            setError('Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        await onSave('meta', {}, 'inactive');
        setStep(0);
        setUserAccessToken('');
    };

    return (
        <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
            <div className="px-4 py-5 sm:px-6 flex items-center gap-3 border-b border-gray-200">
                <div className={`p-2 rounded-lg ${step > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Facebook className={`h-6 w-6 ${step > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Meta Ads (Facebook/Instagram) <span className="text-xs text-gray-400">v1.1</span></h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Connect to receive leads.</p>
                </div>
            </div>

            <div className="px-4 py-5 sm:p-6 bg-gray-50/50">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {step === 0 && (
                    <div className="text-center py-6">
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1877F2] hover:bg-[#166fe5] focus:outline-none"
                        >
                            {loading ? 'Connecting...' : 'Connect to Facebook'}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Facebook Page</label>
                            <select
                                value={selectedPageId}
                                onChange={handlePageChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="">Select a Page...</option>
                                {pages.map(page => (
                                    <option key={page.id} value={page.id}>{page.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedPageId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Lead Form (Optional)</label>
                                <select
                                    value={selectedFormId}
                                    onChange={(e) => setSelectedFormId(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="">All Forms</option>
                                    {forms.map(form => (
                                        <option key={form.id} value={form.id}>{form.name} ({form.status})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">If "All Forms" is selected, we will capture leads from any form on this page.</p>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSaveConfig}
                                disabled={loading || !selectedPageId}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-300"
                            >
                                {loading ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="bg-white p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <CheckCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Connected</h4>
                                <p className="text-sm text-gray-500">
                                    Page ID: {initialData?.config?.page_id || selectedPageId} <br />
                                    {initialData?.config?.page_name && <span>Page: {initialData.config.page_name}</span>}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDisconnect}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Disconnect
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacebookConnect;
