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
    const [messages, setMessages] = useState([]);
    const [instanceName, setInstanceName] = useState('');

    useEffect(() => {
        fetchLeads();
        fetchInstance();
    }, []);

    // Fetch user instance
    const fetchInstance = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.whatsapp_instance_id) {
                setInstanceName(res.data.whatsapp_instance_id);
            }
        } catch (err) {
            console.error("Error fetching instance:", err);
        }
    };

    useEffect(() => {
        // Filter leads based on search
        if (!leads) return;
        const results = leads.filter(lead =>
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.phone && lead.phone.includes(searchTerm))
        );
        setFilteredLeads(results);
    }, [searchTerm, leads]);

    // Fetch messages when selected lead changes
    useEffect(() => {
        if (selectedLead && instanceName) {
            fetchMessages(selectedLead.phone);
            // Optional: Poll for new messages every 5s
            const interval = setInterval(() => fetchMessages(selectedLead.phone), 5000);
            return () => clearInterval(interval);
        } else {
            setMessages([]);
        }
    }, [selectedLead, instanceName]);

    const fetchMessages = async (phone) => {
        try {
            const token = localStorage.getItem('token');
            const cleanPhone = phone.replace(/\D/g, ''); // Ensure only digits
            // Note: The backend route is /api/evolution/messages/:instanceName/:phone
            // We need to confirm the route path in server/src/routes/evolution.js or index.js
            // Looking at the file view, it's defined in evolution.js. 
            // If evolution.js is mounted at /api/evolution, then it is correct.
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/evolution/messages/${instanceName}/${cleanPhone}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

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
            if (validLeads.length > 0 && !selectedLead) {
                // Don't auto-select to avoid confusion? Or select first?
                // Let's leave it null to let user choose.
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
                                                <span className="text-[10px] text-gray-400">--:--</span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
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
                                            {instanceName ? (
                                                <>
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    WhatsApp Connected
                                                </>
                                            ) : (
                                                <span className="text-gray-400 italic">Instance not connected</span>
                                            )}
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
                            <div className="flex-1 p-0 overflow-hidden bg-[#e5ddd5]">
                                {/* Pass messages to WhatsAppChat or handle fetching there?
                                    The existing WhatsAppChat component seems to handle layout. 
                                    Let's peek at it? No, I'll pass the messages prop if it accepts it, 
                                    or I'll have to modify it. 
                                    Wait, the previous code block showed:
                                    <WhatsAppChat leadPhone={selectedLead.phone} instanceName={instanceName} leadName={selectedLead.name} />
                                    It didn't take 'messages' prop. 
                                    I should check WhatsAppChat.jsx to see if it fetches independently or accepts props.
                                    The prompt says "all wha at inbox".
                                    I will assume I need to pass the messages I just fetched. 
                                    Or I can modify WhatsAppChat to accept `initialMessages` or `messages`.
                                    Let's check `WhatsAppChat.jsx` first.
                                 */}
                                <div className="h-full">
                                    <WhatsAppChat
                                        leadPhone={selectedLead.phone}
                                        instanceName={instanceName}
                                        leadName={selectedLead.name}
                                        messages={messages}
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
