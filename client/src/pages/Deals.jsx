import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Plus, Search, MoreHorizontal, DollarSign, Calendar } from 'lucide-react';
import DealDetailModal from '../components/DealDetailModal';
import { Link } from 'react-router-dom';

// Kanban Column Component
const KanbanColumn = ({ title, count, children, color }) => (
    <div className="flex flex-col h-full min-w-[300px] bg-gray-50/50 rounded-xl p-4 mr-4">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${color}`}></span>
                <h3 className="font-semibold text-gray-700">{title}</h3>
                <span className="bg-white px-2 py-0.5 rounded-md text-xs font-medium text-gray-500 shadow-sm border border-gray-100">
                    {count}
                </span>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={16} />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {children}
        </div>
    </div>
);

// Kanban Card Component
const KanbanCard = ({ deal, onClick }) => (
    <div
        onClick={() => onClick(deal)}
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group"
    >
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-gray-900 group-hover:text-brand-blue transition-colors">
                {deal.lead_name || 'Sin Nombre'}
            </h4>
            {/* <span className="bg-green-50 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-medium">High</span> */}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
            <div className="flex items-center gap-1">
                <DollarSign size={14} />
                <span className="font-medium text-gray-900">
                    {deal.value ? `$${parseInt(deal.value).toLocaleString()}` : '-'}
                </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
                <Calendar size={12} />
                <span>{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'N/A'}</span>
            </div>
        </div>
    </div>
);

const Deals = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            const token = localStorage.getItem('token');
            // Using port 5001 as updated
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/deals`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDeals(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching deals:', err);
            setLoading(false);
        }
    };

    const handleDealClick = (deal) => {
        setSelectedDeal(deal);
        setIsModalOpen(true);
    };

    const filteredDeals = deals.filter(deal =>
        (deal.lead_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group deals by stage
    const stages = {
        'Prospecting': filteredDeals.filter(d => d.stage === 'Prospecting'),
        'Negotiation': filteredDeals.filter(d => d.stage === 'Negotiation'),
        'Proposal': filteredDeals.filter(d => d.stage === 'Proposal'),
        'Closed': filteredDeals.filter(d => d.stage === 'Closed' || d.stage === 'Won' || d.stage === 'Closed Won'),
    };

    return (
        <Layout>
            <div className="flex flex-col h-[calc(100vh-theme(spacing.24))]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-navy-900">Deals Pipeline</h1>
                        <p className="text-sm text-gray-500 mt-1">Gestiola tus oportunidades de venta y arrastra para actualizar.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar deal..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue w-64"
                            />
                        </div>
                        <Link to="/deals/new" className="flex items-center gap-2 bg-brand-blue hover:bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-brand-blue/30">
                            <Plus size={18} />
                            Nuevo Deal
                        </Link>
                    </div>
                </div>

                {/* Kanban Board */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Cargando deals...
                    </div>
                ) : usingEmptyState(deals) ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <p>No hay deals disponibles</p>
                        <Link to="/deals/new" className="mt-4 text-brand-blue font-medium hover:underline">Crear el primer deal</Link>
                    </div>
                ) : (
                    <div className="flex-1 overflow-x-auto pb-4">
                        <div className="flex h-full min-w-max">
                            <KanbanColumn title="Prospecting" count={stages['Prospecting'].length} color="bg-blue-400">
                                {stages['Prospecting'].map(deal => (
                                    <KanbanCard key={deal.id} deal={deal} onClick={handleDealClick} />
                                ))}
                            </KanbanColumn>

                            <KanbanColumn title="Negotiation" count={stages['Negotiation'].length} color="bg-yellow-400">
                                {stages['Negotiation'].map(deal => (
                                    <KanbanCard key={deal.id} deal={deal} onClick={handleDealClick} />
                                ))}
                            </KanbanColumn>

                            <KanbanColumn title="Proposal" count={stages['Proposal'].length} color="bg-purple-400">
                                {stages['Proposal'].map(deal => (
                                    <KanbanCard key={deal.id} deal={deal} onClick={handleDealClick} />
                                ))}
                            </KanbanColumn>

                            <KanbanColumn title="Closed" count={stages['Closed'].length} color="bg-green-400">
                                {stages['Closed'].map(deal => (
                                    <KanbanCard key={deal.id} deal={deal} onClick={handleDealClick} />
                                ))}
                            </KanbanColumn>
                        </div>
                    </div>
                )}
            </div>

            <DealDetailModal
                deal={selectedDeal}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </Layout>
    );
};

const usingEmptyState = (list) => list.length === 0;

export default Deals;
