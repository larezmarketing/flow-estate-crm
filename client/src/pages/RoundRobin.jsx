import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Save, CheckCircle, AlertCircle, Users, Power } from 'lucide-react';

const RoundRobin = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({ is_active: false, included_user_ids: [] });
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [settingsRes, usersRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/round-robin`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                // Ensure included_user_ids is an array
                const safeSettings = {
                    ...settingsRes.data,
                    included_user_ids: settingsRes.data.included_user_ids || []
                };

                setSettings(safeSettings);
                setUsers(usersRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setMessage({ type: 'error', text: 'Failed to load settings.' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleUser = (userId) => {
        setSettings(prev => {
            const currentIds = prev.included_user_ids;
            const newIds = currentIds.includes(userId)
                ? currentIds.filter(id => id !== userId)
                : [...currentIds, userId];
            return { ...prev, included_user_ids: newIds };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/round-robin`, settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Settings saved successfully.' });
        } catch (err) {
            console.error('Error saving:', err);
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Round Robin Configuration
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Automatically distribute new leads among selected team members.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${settings.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            <Power className={`h-6 w-6 ${settings.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                                Distribution System Status
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {settings.is_active ? 'System is currently active and distributing leads.' : 'System is paused. Leads will be assigned to creators.'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, is_active: !settings.is_active })}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 ${settings.is_active ? 'bg-green-600' : 'bg-gray-200'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Team Selection */}
                        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-400" />
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Team Members</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <div key={user.id} className="relative flex items-start px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => toggleUser(user.id)}>
                                        <div className="min-w-0 flex-1 text-sm">
                                            <label htmlFor={`user-${user.id}`} className="font-medium text-gray-900 select-none cursor-pointer">
                                                {user.full_name}
                                            </label>
                                            <p className="text-gray-500 select-none">{user.email}</p>
                                        </div>
                                        <div className="ml-3 flex h-5 items-center">
                                            <input
                                                id={`user-${user.id}`}
                                                name={`user-${user.id}`}
                                                type="checkbox"
                                                checked={settings.included_user_ids.includes(user.id)}
                                                onChange={() => toggleUser(user.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center justify-between pt-4">
                            {message ? (
                                <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            {message.type === 'success' ? (
                                                <CheckCircle className="h-5 w-5 text-green-400" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-red-400" />
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                                {message.text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : <div></div>}

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center rounded-md border border-transparent bg-brand-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 disabled:opacity-50"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default RoundRobin;
