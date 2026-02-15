import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Facebook, Mail, MessageSquare, Save, CheckCircle, AlertCircle } from 'lucide-react';
import WhatsAppConnect from '../components/WhatsAppConnect';
import FacebookConnect from '../components/FacebookConnect';
import { API_URL } from '../config';

const IntegrationCard = ({ title, icon: Icon, type, description, fields, onSave, initialData }) => {
    const [enabled, setEnabled] = useState(false);
    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (initialData) {
            setEnabled(initialData.status === 'active');
            setConfig(initialData.config || {});
        }
    }, [initialData]);

    const handleChange = (e) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await onSave(type, config, enabled ? 'active' : 'inactive');
            setMessage({ type: 'success', text: 'Settings saved successfully' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex items-center gap-3 border-b border-gray-200">
                <div className={`p-2 rounded-lg ${enabled ? 'bg-brand-blue/10' : 'bg-gray-100'}`}>
                    <Icon className={`h-6 w-6 ${enabled ? 'text-brand-blue' : 'text-gray-400'}`} />
                </div>
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
                </div>
                <div className="ml-auto">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                    </label>
                </div>
            </div>

            {enabled && (
                <div className="px-4 py-5 sm:p-6 bg-gray-50/50">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields.map((field) => (
                            <div key={field.name}>
                                <label htmlFor={`${type}-${field.name}`} className="block text-sm font-medium text-gray-700">
                                    {field.label}
                                </label>
                                <div className="mt-1">
                                    <input
                                        type={field.inputType || 'text'}
                                        name={field.name}
                                        id={`${type}-${field.name}`}
                                        value={config[field.name] || ''}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm border p-2"
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            </div>
                        ))}

                        {message && (
                            <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        {message.type === 'success' ? (
                                            <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                            {message.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const Integrations = () => {
    const [integrations, setIntegrations] = useState([]);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/integrations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIntegrations(res.data);
        } catch (err) {
            console.error('Error fetching integrations:', err);
        }
    };

    const handleSave = async (type, config, status) => {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/api/integrations`,
            { type, config, status },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchIntegrations(); // Refresh
    };

    const getIntegrationData = (type) => {
        return integrations.find(i => i.type === type);
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-brand-graphite">Integrations</h1>
                <p className="mt-2 text-sm text-gray-700">
                    Connect your favorite tools to synchronize leads and automate workflows.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="md:col-span-2 lg:col-span-1">
                    <WhatsAppConnect />
                </div>

                <div className="md:col-span-2 lg:col-span-1">
                    <FacebookConnect
                        initialData={getIntegrationData('meta')}
                        onSave={handleSave}
                    />
                </div>

                <IntegrationCard
                    title="Google Ads"
                    type="google"
                    icon={Mail}
                    description="Capture leads from Google Ads search and display campaigns."
                    initialData={getIntegrationData('google')}
                    onSave={handleSave}
                    fields={[
                        { name: 'clientId', label: 'Client ID', placeholder: 'Google Cloud Client ID' },
                        { name: 'clientSecret', label: 'Client Secret', placeholder: 'Google Cloud Client Secret', inputType: 'password' },
                        { name: 'developerToken', label: 'Developer Token', placeholder: 'Google Ads Developer Token' },
                    ]}
                />

                <IntegrationCard
                    title="Twilio (SMS & Calls)"
                    type="twilio"
                    icon={MessageSquare}
                    description="Enable SMS notifications and click-to-call functionality."
                    initialData={getIntegrationData('twilio')}
                    onSave={handleSave}
                    fields={[
                        { name: 'accountSid', label: 'Account SID', placeholder: 'Twilio Account SID' },
                        { name: 'authToken', label: 'Auth Token', placeholder: 'Twilio Auth Token', inputType: 'password' },
                        { name: 'phoneNumber', label: 'Twilio Phone Number', placeholder: '+1234567890' },
                    ]}
                />
            </div>
        </Layout >
    );
};

export default Integrations;
