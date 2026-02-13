import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useNavigate, useParams } from 'react-router-dom';

const DealForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [leads, setLeads] = useState([]);
    const [formData, setFormData] = useState({
        lead_id: '',
        stage: 'Prospecting',
        value: '',
        probability: 50,
        expected_close_date: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLeads();
        if (isEditMode) {
            // Fetch deal logic would go here
        }
    }, []);

    const fetchLeads = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/leads`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeads(res.data);
        } catch (err) {
            console.error('Error fetching leads:', err);
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
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post(`${import.meta.env.VITE_API_URL}/api/deals`, formData, config);
            navigate('/deals');
        } catch (err) {
            console.error('Error saving deal:', err);
            setError('Failed to save deal');
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="md:flex md:items-center md:justify-between">
                <h2 className="text-2xl font-bold text-brand-graphite">Create New Deal</h2>
            </div>

            <div className="mt-8 max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-lg p-6">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                        <div className="sm:col-span-4">
                            <label htmlFor="lead_id" className="block text-sm font-medium leading-6 text-gray-900">
                                Related Lead
                            </label>
                            <div className="mt-2">
                                <select
                                    id="lead_id"
                                    name="lead_id"
                                    value={formData.lead_id}
                                    onChange={handleChange}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                                >
                                    <option value="">Select a Lead</option>
                                    {leads.map(lead => (
                                        <option key={lead.id} value={lead.id}>{lead.name} ({lead.email})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="value" className="block text-sm font-medium leading-6 text-gray-900">
                                Deal Value ($)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    name="value"
                                    id="value"
                                    value={formData.value}
                                    onChange={handleChange}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="probability" className="block text-sm font-medium leading-6 text-gray-900">
                                Probability (%)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    name="probability"
                                    id="probability"
                                    min="0" max="100"
                                    value={formData.probability}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="stage" className="block text-sm font-medium leading-6 text-gray-900">
                                Stage
                            </label>
                            <div className="mt-2">
                                <select
                                    id="stage"
                                    name="stage"
                                    value={formData.stage}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                                >
                                    <option value="Prospecting">Prospecting</option>
                                    <option value="Negotiation">Negotiation</option>
                                    <option value="Proposal">Proposal</option>
                                    <option value="Closed Won">Closed Won</option>
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="expected_close_date" className="block text-sm font-medium leading-6 text-gray-900">
                                Expected Close Date
                            </label>
                            <div className="mt-2">
                                <input
                                    type="date"
                                    name="expected_close_date"
                                    id="expected_close_date"
                                    value={formData.expected_close_date}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button type="button" onClick={() => navigate('/deals')} className="text-sm font-semibold leading-6 text-gray-900">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-brand-blue px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:opacity-50"
                        >
                            Save Deal
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default DealForm;
