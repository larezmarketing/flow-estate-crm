import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const Automations = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [iframeUrl, setIframeUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initN8n = async () => {
            try {
                // 1. Get current user
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    setError('User not found. Please login again.');
                    setIsLoading(false);
                    return;
                }
                const user = JSON.parse(userStr);

                // 2. Request n8n credentials/provisioning from backend
                const provisionRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/n8n/provision`, {
                    email: user.email,
                    password: 'password' // In a real scenario, this would be a specific n8n password or token
                });

                const { email, password } = provisionRes.data;

                // 3. Attempt "silent" login to n8n via proxy
                try {
                    await axios.post('/n8n/rest/login', {
                        email,
                        password
                    });
                } catch (loginErr) {
                    console.warn('Auto-login failed, might need manual setup:', loginErr.response?.data || loginErr.message);
                }

                // 4. Set iframe URL to the proxied workflows page
                setIframeUrl('/n8n/home/workflows'); // Updated path for newer n8n versions

            } catch (err) {
                console.error('N8n initialization error:', err);
                // Fallback to direct URL if backend fails
                setIframeUrl('http://localhost:5678/home/workflows');
            } finally {
                setIsLoading(false);
            }
        };

        initN8n();
    }, []);

    return (
        <Layout>
            <div className="h-[calc(100vh-100px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Workflows & Automations</h2>
                        <p className="text-sm text-gray-500">Manage your business logic and integrations via n8n.</p>
                    </div>
                    <div className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        <strong>Status:</strong> Integrated
                    </div>
                </div>

                <div className="flex-1 relative bg-gray-50">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                <p className="text-gray-500 text-sm">Initializing Automation Engine...</p>
                            </div>
                        </div>
                    )}

                    {iframeUrl && (
                        <iframe
                            src={iframeUrl}
                            className="absolute inset-0 w-full h-full border-0"
                            title="n8n Automations"
                            allow="clipboard-read; clipboard-write"
                        />
                    )}

                    {error && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow-sm border border-red-200 text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Automations;
