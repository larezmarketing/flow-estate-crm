import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, CheckCircle, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { API_URL } from '../config';

const FacebookConnect = ({ initialData, onSave }) => {
    // View states: 'initial', 'connected', 'list', 'edit'
    const [view, setView] = useState('initial');
    const [connections, setConnections] = useState([]);
    const [editingConnection, setEditingConnection] = useState(null);
    
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
    const [showPageDropdown, setShowPageDropdown] = useState(false);
    const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
    const [showAdAccountDropdown, setShowAdAccountDropdown] = useState(false);

    // Initialize from props
    useEffect(() => {
        if (initialData && initialData.status === 'active') {
            setView('connected');
            fetchConnections();
        }
    }, [initialData]);

    const fetchConnections = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/facebook/connections`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setConnections(res.data || []);
        } catch (err) {
            console.error('Error fetching connections:', err);
        }
    };

    // Listen for the token from the popup
    useEffect(() => {
        // Don't listen when already connected (to avoid re-triggering)
        if (view === 'connected') {
            return;
        }

        const handleMessage = (event) => {
            if (event.data?.type === 'facebook-token') {
                console.log('Received token from popup');
                setAccessToken(event.data.token);
                setError(null);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [view]);

    // Fetch assets after token is received
    useEffect(() => {
        if (accessToken && view === 'edit' && businesses.length === 0) {
            fetchAssets();
        }
    }, [accessToken, view]);

    const fetchAssets = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/api/facebook/assets`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            setBusinesses(response.data.businesses || []);
            setAdAccounts(response.data.adAccounts || []);
            setPages(response.data.pages || []);
            setView('edit'); // Switch to edit view after getting assets
        } catch (err) {
            console.error('Error fetching assets:', err);
            setError('Failed to fetch Facebook assets. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = () => {
        setLoading(true);
        setError(null);
        
        // Change to edit view first to enable message listening
        setView('edit');
        
        // Small delay to ensure view is updated before opening popup
        setTimeout(() => {
            const popup = window.open(`${API_URL}/api/facebook`, 'facebook-login', 'width=600,height=700');

            const checkPopup = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkPopup);
                    setLoading(false);
                    if (!accessToken) {
                        setError('Login was cancelled or failed. Please try again.');
                    }
                }
            }, 1000);
        }, 100);
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
                
                // Find the selected page to get its access token
                const selectedPageObj = pages.find(p => p.id === pageId);
                const pageAccessToken = selectedPageObj?.access_token || accessToken;
                
                console.log('Using page access token:', pageAccessToken ? 'Found' : 'Not found');
                
                const response = await axios.get(`${API_URL}/api/facebook/forms/${pageId}`, {
                    headers: {
                        Authorization: `Bearer ${pageAccessToken}`,
                    },
                });

                setForms(response.data || []);
                console.log('Forms fetched successfully:', response.data);
            } catch (err) {
                console.error('Error fetching forms:', err);
                setError('Failed to fetch forms for this page. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!selectedPage) {
            setError('Please select a page.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Find the selected page details
            const page = pages.find(p => p.id === selectedPage);
            const business = businesses.find(b => b.id === selectedBusiness);
            const adAccount = adAccounts.find(a => a.id === selectedAdAccount);
            const form = forms.find(f => f.id === selectedForm);

            // Prepare connection data
            const connectionData = {
                name: page?.name || 'Unnamed Connection',
                accessToken: accessToken,
                businessId: selectedBusiness,
                businessName: business?.name,
                adAccountId: selectedAdAccount,
                adAccountName: adAccount?.name,
                pageId: selectedPage,
                pageName: page?.name,
                pagePictureUrl: page?.picture?.data?.url,
                formId: selectedForm,
                formName: form?.name
            };

            // Save to database
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/facebook/connections`, connectionData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSuccess(true);
            setView('connected');
            fetchConnections();
        } catch (err) {
            console.error('Error saving configuration:', err);
            setError('Failed to save configuration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect Facebook?')) return;
        
        try {
            await onSave('meta', {}, 'inactive');
            setView('initial');
            setAccessToken(null);
            setConnections([]);
        } catch (err) {
            console.error('Error disconnecting:', err);
        }
    };

    const handleDeleteConnection = async (connectionId) => {
        if (!confirm('Are you sure you want to delete this connection?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/facebook/connections/${connectionId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchConnections();
        } catch (err) {
            console.error('Error deleting connection:', err);
        }
    };

    const handleEditConnection = (connection) => {
        setEditingConnection(connection);
        setSelectedBusiness(connection.business_id || '');
        setSelectedAdAccount(connection.ad_account_id || '');
        setSelectedPage(connection.page_id || '');
        setSelectedForm(connection.form_id || '');
        setView('edit');
    };

    // Connected Banner View
    if (view === 'connected') {
        return (
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 flex items-center gap-3 border-b border-gray-200">
                    <div className="p-2 rounded-lg bg-brand-blue/10">
                        <svg className="h-6 w-6 text-brand-blue" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Meta Ads (Facebook/Instagram)</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Connect to receive leads.</p>
                    </div>
                </div>

                <div className="px-6 py-6">
                    {/* Connected Banner */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                                <CheckCircle className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900">Connected</h4>
                                <p className="text-sm text-gray-600">Facebook Leads Integration Active v2.0</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDisconnect}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Disconnect
                        </button>
                    </div>

                    {/* View Connections Button */}
                    <button
                        onClick={() => setView('list')}
                        className="w-full px-4 py-3 text-sm font-medium text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20 rounded-lg transition-colors"
                    >
                        Ver Conexiones
                    </button>
                </div>
            </div>
        );
    }

    // Connections List View
    if (view === 'list') {
        return (
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 flex items-center justify-between border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setView('connected')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Integración de Facebook</h3>
                            <p className="mt-1 text-sm text-gray-500">Integra tus campañas de clientes potenciales de Facebook con tu embudo de AlterEstate.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditingConnection(null);
                            handleConnect();
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                        Agregar Nuevo
                    </button>
                </div>

                <div className="px-6 py-6">
                    <input
                        type="text"
                        placeholder="Search automations"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {connections.map((connection) => (
                            <div
                                key={connection.id}
                                onClick={() => handleEditConnection(connection)}
                                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {connection.status === 'active' ? (
                                            <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                                                <div className="w-4 h-4 bg-white rounded-full"></div>
                                            </div>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">Error</span>
                                        )}
                                        <button className="text-gray-400 hover:text-gray-600">⋯</button>
                                    </div>
                                </div>
                                <h4 className="text-base font-semibold text-gray-900 mb-1">{connection.name || connection.page_name || 'Unnamed Connection'}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Edit/Create View
    if (view === 'edit') {
        return (
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 flex items-center gap-3 border-b border-gray-200">
                    <button
                        onClick={() => setView(editingConnection ? 'list' : 'connected')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            {editingConnection ? 'Editar Integración de Facebook' : 'Nueva Integración de Facebook'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">Modificar la integración de Meta</p>
                    </div>
                </div>

                <div className="px-6 py-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-700">Configuration saved successfully!</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Business</label>
                                <div className="relative">
                                    <div
                                        onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
                                        className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-300 bg-white"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        {selectedBusiness ? (
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {businesses.find(b => b.id === selectedBusiness)?.name}
                                                </p>
                                                <p className="text-xs text-gray-500">Business Portfolio</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 flex-1">Select a Business (Optional)</p>
                                        )}
                                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${showBusinessDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    {showBusinessDropdown && (
                                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                            <div
                                                onClick={() => {
                                                    setSelectedBusiness('');
                                                    setShowBusinessDropdown(false);
                                                }}
                                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm text-gray-500 flex-1">None (Optional)</p>
                                            </div>
                                            {businesses.map((business) => (
                                                <div
                                                    key={business.id}
                                                    onClick={() => {
                                                        setSelectedBusiness(business.id);
                                                        setShowBusinessDropdown(false);
                                                    }}
                                                    className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${
                                                        selectedBusiness === business.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{business.name}</p>
                                                        <p className="text-xs text-gray-500">ID: {business.id}</p>
                                                    </div>
                                                    {selectedBusiness === business.id && (
                                                        <CheckCircle className="w-5 h-5 text-blue-500" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Account</label>
                                <div className="relative">
                                    <div
                                        onClick={() => setShowAdAccountDropdown(!showAdAccountDropdown)}
                                        className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-300 bg-white"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        {selectedAdAccount ? (
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {adAccounts.find(a => a.id === selectedAdAccount)?.name}
                                                </p>
                                                <p className="text-xs text-gray-500">Ad Account</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 flex-1">Select an Ad Account (Optional)</p>
                                        )}
                                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${showAdAccountDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    {showAdAccountDropdown && (
                                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                            <div
                                                onClick={() => {
                                                    setSelectedAdAccount('');
                                                    setShowAdAccountDropdown(false);
                                                }}
                                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm text-gray-500 flex-1">None (Optional)</p>
                                            </div>
                                            {adAccounts.map((adAccount) => (
                                                <div
                                                    key={adAccount.id}
                                                    onClick={() => {
                                                        setSelectedAdAccount(adAccount.id);
                                                        setShowAdAccountDropdown(false);
                                                    }}
                                                    className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${
                                                        selectedAdAccount === adAccount.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{adAccount.name}</p>
                                                        <p className="text-xs text-gray-500">ID: {adAccount.account_id || adAccount.id}</p>
                                                    </div>
                                                    {selectedAdAccount === adAccount.id && (
                                                        <CheckCircle className="w-5 h-5 text-blue-500" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Page</label>
                                <div className="relative">
                                    {/* Selected page display / dropdown trigger */}
                                    <div
                                        onClick={() => setShowPageDropdown(!showPageDropdown)}
                                        className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-300 bg-white"
                                    >
                                        {selectedPage ? (
                                            <>
                                                {pages.find(p => p.id === selectedPage)?.picture?.data?.url && (
                                                    <img
                                                        src={pages.find(p => p.id === selectedPage)?.picture?.data?.url}
                                                        alt={pages.find(p => p.id === selectedPage)?.name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {pages.find(p => p.id === selectedPage)?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">ID: {selectedPage}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-500 flex-1">Select a Page</p>
                                        )}
                                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${showPageDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    {/* Dropdown list */}
                                    {showPageDropdown && (
                                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                            {pages.map((page) => (
                                                <div
                                                    key={page.id}
                                                    onClick={() => {
                                                        handlePageChange({ target: { value: page.id } });
                                                        setShowPageDropdown(false);
                                                    }}
                                                    className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${
                                                        selectedPage === page.id
                                                            ? 'bg-blue-50'
                                                            : 'hover:bg-gray-50'
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
                                    )}
                                </div>
                            </div>

                            {selectedPage && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Form</label>
                                    <select
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        value={selectedForm}
                                        onChange={(e) => setSelectedForm(e.target.value)}
                                        disabled={loading}
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

                        <div className="flex justify-between pt-4">
                            {editingConnection && (
                                <button
                                    onClick={() => handleDeleteConnection(editingConnection.id)}
                                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={loading || !selectedPage}
                                className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Initial View - Connect Button
    return (
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex items-center gap-3 border-b border-gray-200">
                <div className="p-2 rounded-lg bg-gray-100">
                    <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Meta Ads (Facebook/Instagram) <span className="text-sm text-gray-500">v2.3</span></h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Connect your Facebook account to start receiving leads.</p>
                </div>
            </div>

            <div className="px-6 py-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1877F2] hover:bg-[#166fe5] focus:outline-none"
                >
                    {loading ? 'Connecting...' : 'Connect with Facebook'}
                </button>
            </div>
        </div>
    );
};

export default FacebookConnect;
