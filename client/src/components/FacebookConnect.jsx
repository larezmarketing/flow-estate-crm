import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

const FacebookConnect = ({ initialData, onSave }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [businesses, setBusinesses] = useState([]);
    const [adAccounts, setAdAccounts] = useState([]);
    const [pages, setPages] = useState([]);
    const [forms, setForms] = useState([]);

    const [selectedBusiness, setSelectedBusiness] = useState('');
    const [selectedAdAccount, setSelectedAdAccount] = useState('');
    const [selectedPage, setSelectedPage] = useState('');
    const [selectedForm, setSelectedForm] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Initialize from props
    useEffect(() => {
        if (initialData && initialData.status === 'active') {
            setSuccess(true); // Already connected
            // Optionally populate state if we had stored it
            if (initialData.config) {
                setAccessToken(initialData.config.access_token); // If we decide to return this
                setSelectedPage(initialData.config.page_id);
                setSelectedForm(initialData.config.form_id);
            }
        }
    }, [initialData]);

    // Listen for the token from the popup
    useEffect(() => {
        const handleMessage = (event) => {
            // Security check: ensure origin matches if possible, or trust the type
            if (event.data?.type === 'facebook-token') {
                console.log('Received token from popup');
                setAccessToken(event.data.token);
                setError(null);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Fetch assets when token is received
    useEffect(() => {
        if (accessToken) {
            fetchAssets();
        }
    }, [accessToken]);

    const handleConnect = () => {
        console.log('Opening Facebook login popup...');

        // Use API_URL for the backend route
        const popup = window.open(`${API_URL}/api/facebook`, 'facebook-login', 'width=600,height=600');
        if (!popup) {
            setError('Popup was blocked. Please allow popups for this site.');
        }
    };

    const fetchAssets = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching assets...');
            const response = await axios.get(`${API_URL}/api/facebook/assets`, {
                headers: {
                    // Provided code uses 'Authorization: Bearer FB_TOKEN'
                    // We must match what the backend expects. 
                    // The v2 backend expects `req.headers.authorization` to be the FB token.
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setBusinesses(response.data.businesses || []);
            setAdAccounts(response.data.adAccounts || []);
            setPages(response.data.pages || []);
            console.log('Assets fetched successfully');
        } catch (err) {
            console.error('Error fetching assets:', err);
            setError('Failed to fetch your Facebook assets. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = async (e) => {
        const pageId = e.target.value;
        setSelectedPage(pageId);
        setForms([]);
        setSelectedForm('');

        if (pageId) {
            setLoading(true);
            setError(null);
            try {
                console.log(`Fetching forms for page ${pageId}...`);
                const response = await axios.get(`${API_URL}/api/facebook/forms/${pageId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                setForms(response.data || []);
                console.log('Forms fetched successfully');
            } catch (err) {
                console.error('Error fetching forms:', err);
                setError('Failed to fetch forms for this page. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!selectedPage) { // Form can be optional or 'all'
            setError('Please select a page.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log('Saving configuration...');

            const selectedPageObj = pages.find(p => p.id === selectedPage);

            const config = {
                business_id: selectedBusiness,
                ad_account_id: selectedAdAccount,
                page_id: selectedPage,
                page_name: selectedPageObj?.name,
                form_id: selectedForm,
                access_token: accessToken, // Important: Page Access Token usually needed, but user said 'page_access_token' in DB logic. 
                // The fetchAssets endpoint returned 'access_token' for each page in 'v19.0/me/accounts'. 
                // So 'selectedPageObj' should have 'access_token'.
                page_access_token: selectedPageObj?.access_token
            };

            // Call parent onSave which saves to DB
            await onSave('meta', config, 'active');

            setSuccess(true);
            console.log('Configuration saved successfully');

        } catch (err) {
            console.error('Error saving configuration:', err);
            setError('Failed to save configuration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        await onSave('meta', {}, 'inactive');
        setSuccess(false);
        setAccessToken(null);
    };

    if (success) {
        return (
            <div className="bg-white p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">Connected</h4>
                        <p className="text-sm text-gray-500">Facebook Leads Integration Active <span className="text-xs text-gray-400">v2.0</span></p>
                    </div>
                </div>
                <button
                    onClick={handleDisconnect}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
            <div className="px-4 py-5 sm:px-6 flex items-center gap-3 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Meta Ads (Facebook/Instagram) <span className="text-xs text-gray-400">v2.3</span></h3>
            </div>

            <div className="px-4 py-5 sm:p-6 bg-gray-50/50">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {!accessToken ? (
                    <div className="text-center py-6">
                        <p className="mb-4 text-sm text-gray-500">Connect your Facebook account to start receiving leads.</p>
                        <button
                            onClick={handleConnect}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1877F2] hover:bg-[#166fe5] focus:outline-none"
                        >
                            {loading ? 'Connecting...' : 'Connect with Facebook'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Business</label>
                                <select
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    value={selectedBusiness}
                                    onChange={(e) => setSelectedBusiness(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Select a Business (Optional)</option>
                                    {businesses.map((business) => (
                                        <option key={business.id} value={business.id}>
                                            {business.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ad Account</label>
                                <select
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    value={selectedAdAccount}
                                    onChange={(e) => setSelectedAdAccount(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Select an Ad Account (Optional)</option>
                                    {adAccounts.map((adAccount) => (
                                        <option key={adAccount.id} value={adAccount.id}>
                                            {adAccount.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Page</label>
                                <div className="space-y-2">
                                    {pages.map((page) => (
                                        <div
                                            key={page.id}
                                            onClick={() => handlePageChange({ target: { value: page.id } })}
                                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                                                selectedPage === page.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {page.picture?.data?.url && (
                                                <img
                                                    src={page.picture.data.url}
                                                    alt={page.name}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{page.name}</p>
                                                <p className="text-xs text-gray-500">ID: {page.id}</p>
                                            </div>
                                            {selectedPage === page.id && (
                                                <CheckCircle className="w-5 h-5 text-blue-500" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedPage && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Form</label>
                                    <select
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        value={selectedForm}
                                        onChange={(e) => setSelectedForm(e.target.value)}
                                        disabled={loading || forms.length === 0}
                                    >
                                        <option value="">Select a Form (Optional)</option>
                                        {forms.map((form) => (
                                            <option key={form.id} value={form.id}>
                                                {form.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSave}
                                disabled={loading || !selectedPage}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-300"
                            >
                                {loading ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacebookConnect;
