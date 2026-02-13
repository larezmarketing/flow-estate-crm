import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, DollarSign, MessageSquare, FileText, File, Send, MoreHorizontal } from 'lucide-react';
import WhatsAppChat from './WhatsAppChat';

const DealDetailModal = ({ deal, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('whatsapp'); // Default to WhatsApp for now
    const [instanceName, setInstanceName] = useState(localStorage.getItem('wa_instance_name') || '');

    if (!isOpen || !deal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* LEFT SIDEBAR (LEAD DETAILS) - 30% */}
                <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col overflow-y-auto">
                    {/* Header / Basic Info */}
                    <div className="p-6 pb-4">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-blue/10 text-brand-blue text-xl font-bold">
                                {deal.lead_name?.charAt(0).toUpperCase()}
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{deal.lead_name}</h2>
                        <p className="text-sm text-gray-500">Añadido el {new Date(deal.created_at || Date.now()).toLocaleDateString()}</p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                {deal.stage}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                Alta Probabilidad
                            </span>
                        </div>
                    </div>

                    {/* Contact Info Card */}
                    <div className="px-6 py-2">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-400 uppercase">Contacto</span>
                                <button className="text-xs text-brand-blue hover:underline">Editar</button>
                            </div>

                            <div className="flex items-center gap-3 text-sm group">
                                <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <Phone size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-900 font-medium">{deal.lead_phone || 'No registrado'}</p>
                                    <p className="text-xs text-gray-400">Móvil</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm group">
                                <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <Mail size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-900 font-medium">{deal.lead_email || 'No registrado'}</p>
                                    <p className="text-xs text-gray-400">Email</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-6 py-4">
                        <div className="grid grid-cols-3 gap-2">
                            <button className="flex flex-col items-center justify-center p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors shadow-sm shadow-green-200">
                                <Phone size={20} className="mb-1" />
                                <span className="text-xs font-medium">Llamar</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors shadow-sm shadow-blue-200">
                                <MessageSquare size={20} className="mb-1" />
                                <span className="text-xs font-medium">SMS</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl transition-colors shadow-sm shadow-gray-300">
                                <Mail size={20} className="mb-1" />
                                <span className="text-xs font-medium">Email</span>
                            </button>
                        </div>
                    </div>

                    {/* Deal Info */}
                    <div className="px-6 py-2 pb-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-400 uppercase">Detalles del Deal</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className="text-sm text-gray-500">Valor Estimado</span>
                                <span className="text-lg font-bold text-gray-900">${parseFloat(deal.value || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm text-gray-500">Cierre Esperado</span>
                                <span className="text-sm font-medium text-gray-900">{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '-'}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT CONTENT (TABS & CHAT) - 70% */}
                <div className="w-2/3 flex flex-col bg-white relative">
                    {/* Close Button Absolute */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Tabs Header */}
                    <div className="flex gap-6 px-8 pt-6 border-b border-gray-200">
                        {['Agent Form', 'Vehicle Info', 'Documents', 'WhatsApp'].map((tab) => {
                            const tabKey = tab.toLowerCase().replace(' ', '');
                            const isActive = (tab === 'WhatsApp' ? 'whatsapp' : tabKey) === activeTab; // Simple mapping

                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab === 'WhatsApp' ? 'whatsapp' : tabKey)}
                                    className={`pb-4 text-sm font-medium transition-colors relative ${isActive ? 'text-brand-blue' : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {tab}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue rounded-t-full"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content Area */}
                    <div className="flex-1 bg-gray-50 overflow-hidden relative">
                        {activeTab === 'whatsapp' && (
                            <div className="h-full flex flex-col">
                                {/* WhatsApp Chat Integration */}
                                {!deal.lead_phone ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                        <Phone size={48} className="mb-4 opacity-20" />
                                        <p>Sin número de teléfono para WhatsApp</p>
                                    </div>
                                ) : (
                                    <WhatsAppChat
                                        leadPhone={deal.lead_phone}
                                        leadName={deal.lead_name}
                                        instanceName={instanceName}
                                        className="h-full border-none rounded-none" // Custom prop to override styles if needed
                                    />
                                )}
                            </div>
                        )}

                        {activeTab === 'agentform' && (
                            <div className="p-8">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="font-semibold text-gray-900 mb-4">Notas del Agente</h3>
                                    <textarea
                                        className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none resize-none text-sm"
                                        placeholder="Escribe notas sobre la interacción con el cliente..."
                                    ></textarea>
                                    <div className="flex justify-end mt-4">
                                        <button className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-navy transition-colors">Guardar Notas</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Placeholders for other tabs */}
                        {(activeTab === 'vehicleinfo' || activeTab === 'documents') && (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <FileText size={48} className="mb-4 opacity-20" />
                                <p>Módulo en desarrollo</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DealDetailModal;
