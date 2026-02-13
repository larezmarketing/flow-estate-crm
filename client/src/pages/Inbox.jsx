import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import WhatsAppChat from '../components/WhatsAppChat';
import { Search, User, MessageSquare, Phone } from 'lucide-react';

const Inbox = () => {
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [instanceName, setInstanceName] = useState(localStorage.getItem('wa_instance_name') || '');

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        // Filter leads based on search
        if (!leads) return;
        const results = leads.filter(lead =>
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.phone && lead.phone.includes(searchTerm))
        );
        setFilteredLeads(results);
    }, [searchTerm, leads]);

    const fetchLeads = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/leads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter only leads with phone numbers for the inbox
            const validLeads = res.data.filter(l => l.phone);
            setLeads(validLeads);
            setFilteredLeads(validLeads);
            if (validLeads.length > 0) {
                // Optionally select the first one
                // setSelectedLead(validLeads[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex h-[calc(100vh-100px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Sidebar - Lead List */}
                <div className="w-1/3 border-r border-gray-100 flex flex-col">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Inbox</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-400 text-sm">Loading contacts...</div>
                        ) : filteredLeads.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">No contacts found</div>
                        ) : (
                            filteredLeads.map(lead => (
                                <div
                                    key={lead.id}
                                    onClick={() => setSelectedLead(lead)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedLead?.id === lead.id ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-semibold shrink-0">
                                            {lead.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={`text-sm font-medium truncate ${selectedLead?.id === lead.id ? 'text-blue-900' : 'text-gray-900'}`}>
                                                    {lead.name}
                                                </h3>
                                                {/* Timestamp placeholder */}
                                                <span className="text-[10px] text-gray-400">12:30 PM</span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                {/* Last message placeholder */}
                                                <Phone size={10} className="text-gray-300" /> {lead.phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 bg-gray-50/30 flex flex-col">
                    {selectedLead ? (
                        <div className="flex-1 flex flex-col h-full">
                            {/* Chat Header */}
                            <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                        {selectedLead.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{selectedLead.name}</h3>
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            WhatsApp Connected
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                        <Phone size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Chat Component Wrapper */}
                            <div className="flex-1 p-6 overflow-hidden">
                                {/* Reusing the WhatsAppChat component but styling it to fit smoothly */}
                                <div className="h-full">
                                    <WhatsAppChat
                                        leadPhone={selectedLead.phone}
                                        instanceName={instanceName}
                                        leadName={selectedLead.name}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={32} className="text-gray-300" />
                            </div>
                            <p>Select a contact to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Inbox;
