import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, CheckCircle, Smartphone, QrCode, LogOut } from 'lucide-react';

const WhatsAppConnect = () => {
    const [step, setStep] = useState(0); // 0: Init (Disconnected), 1: Loading/Creating, 2: QR Scan, 3: Connected
    const [instanceName, setInstanceName] = useState('');
    const [qrCode, setQrCode] = useState(null);
    const [status, setStatus] = useState('disconnected');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load instance info on mount
    useEffect(() => {
        const fetchProfileAndStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // 1. Get User Profile to find instance ID
                const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const userInstanceStr = profileRes.data.whatsapp_instance_id;

                if (userInstanceStr) {
                    setInstanceName(userInstanceStr);
                    // 2. Check status immediately
                    await checkStatus(userInstanceStr);
                }
            } catch (err) {
                console.error("Error fetching profile for WhatsApp status:", err);
            }
        };

        fetchProfileAndStatus();
    }, []);

    const getUserId = () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr).id;
        } catch (e) {
            return null;
        }
    };

    const handleStartProcess = async () => {
        const userId = getUserId();
        if (!userId) {
            setError('User not found. Please login again.');
            return;
        }

        setLoading(true);
        setError('');
        setStep(1); // Show loading state

        try {
            // 1. Get or Create Instance for this User
            // Note: We use the token for auth now (via headers in axios setup or manual), 
            // but this endpoint expects body for now.
            const token = localStorage.getItem('token');

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/evolution/instance`,
                {
                    userId: userId,
                    description: 'Flow Estate Agent Connection'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const myInstanceName = response.data.instanceName || response.data.instance?.instanceName;

            if (!myInstanceName) {
                throw new Error('Could not retrieve instance name');
            }

            setInstanceName(myInstanceName);

            console.log('My Instance:', myInstanceName);

            // 2. Check if already connected
            const statusRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/evolution/instance/${myInstanceName}/status`);
            if (statusRes.data?.instance?.state === 'open') {
                setStep(3);
                setStatus('connected');
                setLoading(false);
                // Ensure webhook is configured
                configureWebhook(myInstanceName);
                return;
            }

            // 3. If not connected, Get QR
            await getQrCode(myInstanceName);

        } catch (err) {
            console.error(err);
            setError('Error al conectar: ' + (err.response?.data?.error || err.message));
            setLoading(false);
            setStep(0); // Reset on error
        }
    };

    const configureWebhook = async (name) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/evolution/webhook/configure/${name}`, {
                webhookUrl: `${import.meta.env.VITE_API_URL}/api/evolution/webhook`, // Explicitly correct URL
                events: ["MESSAGES_UPSERT", "MESSAGES_UPDATE"]
            });
            console.log('Webhook configured successfully');
        } catch (err) {
            console.error('Error configuring webhook:', err);
        }
    };

    const getQrCode = async (name) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/evolution/instance/${name}/qr`);
            const { base64 } = response.data;

            if (base64) {
                setQrCode(base64);
                setStatus('connecting');
                setStep(2); // Move to QR view
                startStatusPolling(name);
            } else if (response.data?.instance?.state === 'open' || response.data?.instance?.state === 'connecting') {
                // Might be already connected or connecting
                checkStatus(name);
            }
        } catch (err) {
            setError('Error al obtener QR. ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async (name = instanceName) => {
        if (!name) return false;
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/evolution/instance/${name}/status`);
            const connectionStatus = response.data?.instance?.state || 'close';

            if (connectionStatus === 'open') {
                setStatus('connected');
                setStep(3);
                setQrCode(null);
                configureWebhook(name); // Ensure webhook is on
                return true;
            } else if (connectionStatus === 'connecting') {
                setStatus('connecting');
                setStep(2); // Keep checking
            }
        } catch (err) {
            // console.error('Error checking status', err);
        }
        return false;
    };

    const startStatusPolling = (name) => {
        const interval = setInterval(async () => {
            const isConnected = await checkStatus(name);
            if (isConnected) {
                clearInterval(interval);
                setLoading(false);
            }
        }, 5000);
        return () => clearInterval(interval);
    };

    const handleLogout = async () => {
        if (!confirm('¿Estás seguro de que deseas desconectar esta sesión? Tendrás que escanear el QR nuevamente.')) return;

        setLoading(true);
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/evolution/instance/${instanceName}/logout`);
            setStatus('disconnected');
            setStep(0);
            setQrCode(null);
            // We keep the instanceName in state/DB, just logged out
        } catch (err) {
            setError('Error al cerrar sesión: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };


    // Helper to determine if "enabled" (visually)
    const isEnabled = step > 0 || status === 'connected';

    const handleToggle = (checked) => {
        if (checked) {
            // Turning ON -> Start flow (Auto create/fetch instance)
            handleStartProcess();
        } else {
            // Turning OFF -> Logout if connected, or reset if in progress
            if (status === 'connected') {
                handleLogout();
            } else {
                setStep(0);
                setQrCode(null);
                setLoading(false);
            }
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
            <div className="px-4 py-5 sm:px-6 flex items-center gap-3 border-b border-gray-200">
                <div className={`p-2 rounded-lg ${isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Smartphone className={`h-6 w-6 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">WhatsApp (Evolution API)</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Connect your WhatsApp number to manage leads and conversations.</p>
                </div>
                <div className="ml-auto">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isEnabled}
                            onChange={(e) => handleToggle(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
            </div>

            {isEnabled && (
                <div className="px-4 py-5 sm:p-6 bg-gray-50/50">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm flex items-center gap-2">
                            <LogOut className="w-4 h-4 ml-0" />
                            {error}
                        </div>
                    )}

                    {/* Step 1: Loading / Initializing */}
                    {step === 1 && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <RefreshCw className="animate-spin h-8 w-8 text-green-600 mb-4" />
                            <p className="text-sm text-gray-600">Setting up your secure WhatsApp instance...</p>
                        </div>
                    )}

                    {/* Step 2: QR Code */}
                    {step === 2 && (
                        <div className="text-center py-4 bg-white rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Scan QR Code</h4>
                            {qrCode ? (
                                <img src={qrCode} alt="QR Code" className="w-48 h-48 object-contain mx-auto" />
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 rounded mx-auto flex items-center justify-center">
                                    <RefreshCw className="animate-spin text-gray-400 h-8 w-8" />
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">Open WhatsApp &gt; Linked Devices &gt; Link a Device</p>
                            <div className="mt-4 text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Waiting for connection...
                            </div>
                        </div>
                    )}

                    {/* Step 3: Connected */}
                    {step === 3 && (
                        <div className="bg-white p-4 rounded-lg border border-green-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-full">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">Connected</h4>
                                    <p className="text-sm text-gray-500">Your WhatsApp is active and ready.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={loading}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Disconnect
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WhatsAppConnect;
