import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, MessageSquare, Phone, RefreshCw } from 'lucide-react'; // Added RefreshCw

const WhatsAppChat = ({ leadPhone, instanceName, leadName, className = '' }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [messages, setMessages] = useState([]);

    // Sanitize phone number (remove +, spaces, dashes)
    const formatPhone = (phone) => {
        if (!phone) return '';
        return phone.replace(/\D/g, '');
    };

    useEffect(() => {
        if (instanceName && leadPhone) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
            return () => clearInterval(interval);
        }
    }, [instanceName, leadPhone]);

    const fetchMessages = async () => {
        try {
            const formattedPhone = formatPhone(leadPhone);
            if (!formattedPhone) return;

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/evolution/messages/${instanceName}/${formattedPhone}`);
            setMessages(res.data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        setError('');
        setSuccess('');

        const formattedPhone = formatPhone(leadPhone);
        if (!formattedPhone) {
            setError('Número de teléfono inválido');
            setSending(false);
            return;
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/evolution/text/send`, { // Corrected URL to match routes
                instanceName: instanceName,
                number: formattedPhone,
                text: message
            });

            setMessage('');
            setSuccess('Mensaje enviado');
            fetchMessages(); // Refresh messages immediately
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error(err);
            setError('Error al enviar mensaje. Verifique la conexión.');
        } finally {
            setSending(false);
        }
    };

    if (!instanceName) {
        return (
            <div className={`p-8 bg-gray-50 flex flex-col items-center justify-center text-center h-full ${className}`}>
                <RefreshCw size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">WhatsApp Desconectado</h3>
                <p className="text-gray-500 mt-2 max-w-xs">Conecta tu cuenta de WhatsApp en la sección de Integraciones para comenzar a chatear.</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full bg-white ${className}`}>
            {/* Header - now optional or simpler since specific to chat inside modal */}
            {/* Removed internal header to fit modal design better, relying on Modal context */}

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50 flex flex-col">
                {/* Actually standard column is better for chat usually unless using reverse mapping. 
                    Let's use standard and scroll to bottom ideally. 
                    For now, map normally. 
                 */}
                <div className="flex-1"></div> {/* Spacer to push messages down */}

                {messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex ${msg.from_me ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.from_me
                            ? 'bg-brand-blue text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                            }`}>
                            <p>{msg.content}</p>
                            <span className={`text-[10px] block text-right mt-1 ${msg.from_me ? 'text-white/70' : 'text-gray-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {messages.length === 0 && (
                    <div className="text-center text-xs text-gray-400 my-4">
                        -- Inicio del chat con {leadName} --
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

                <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                    <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-brand-blue/20 focus-within:bg-white transition-all border border-transparent focus-within:border-brand-blue/30">
                        <textarea
                            rows={1}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="w-full bg-transparent focus:outline-none resize-none text-sm max-h-32 pt-1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={sending || !message.trim()}
                        className="bg-brand-blue hover:bg-brand-navy text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-blue/30"
                    >
                        {sending ? <RefreshCw className="animate-spin w-5 h-5" /> : <Send size={20} />}
                    </button>
                </form>
                <div className="mt-2 text-center">
                    <p className="text-[10px] text-gray-400">Presiona Enter para enviar</p>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppChat;
