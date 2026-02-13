import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useNavigate, useParams } from 'react-router-dom';

const LeadForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        source: 'Manual',
        status: 'New',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchLead();
        }
    }, [id]);

    const fetchLead = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/leads/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData(res.data);
        } catch (err) {
            console.error('Error fetching lead:', err);
            setError('Failed to fetch lead details');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            if (isEditMode) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/leads/${id}`, formData, config);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/leads`, formData, config);
            }
            navigate('/leads');
        } catch (err) {
            console.error('Error saving lead:', err);
            setError('Failed to save lead');
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-brand-graphite sm:truncate sm:text-3xl sm:tracking-tight">
                        {isEditMode ? 'Edit Lead' : 'Create New Lead'}
                    </h2>
                </div>
            </div>

            <div className="mt-8 max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-lg p-6">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                                Full Name
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
                                Phone Number
                            </label>
                            <div className="mt-2">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>


                        <div className="sm:col-span-3">
                            <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
                                Status
                            </label>
                            <div className="mt-2">
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:max-w-xs sm:text-sm sm:leading-6"
                                >
                                    <option>New</option>
                                    <option>Contacted</option>
                                    <option>Qualified</option>
                                    <option>Lost</option>
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="source" className="block text-sm font-medium leading-6 text-gray-900">
                                Source
                            </label>
                            <div className="mt-2">
                                <select
                                    id="source"
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:max-w-xs sm:text-sm sm:leading-6"
                                >
                                    <option>Manual</option>
                                    <option>Meta Ads</option>
                                    <option>Google Ads</option>
                                    <option>Referral</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button type="button" onClick={() => navigate('/leads')} className="text-sm font-semibold leading-6 text-gray-900">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-brand-blue px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default LeadForm;
