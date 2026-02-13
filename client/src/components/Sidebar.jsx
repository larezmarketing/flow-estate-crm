import { Link, useLocation } from 'react-router-dom';

import { LayoutDashboard, Users, Briefcase, Settings, LogOut, MessageSquare, Workflow, Repeat, Mail } from 'lucide-react';
import logo from '../assets/1.png';

const Sidebar = () => {
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Inbox', href: '/inbox', icon: MessageSquare },
        { name: 'Leads', href: '/leads', icon: Users },
        { name: 'Deals', href: '/deals', icon: Briefcase },
        { name: 'Automations', href: '/automations', icon: Workflow },
        { name: 'Email Marketing', href: '/email-marketing', icon: Mail },
        { name: 'Round Robin', href: '/round-robin', icon: Repeat },
        { name: 'Integrations', href: '/integrations', icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-100 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
                {/* Logo placeholder - replacing text with a more 'NextNode' style if possible, or just clean text */}
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Flow Estate" className="h-10 w-auto" />
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Flow Estate</span>
                </div>
            </div>
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-2">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            to={item.href}
                                            className={`
                        group flex gap-x-3 rounded-lg p-2.5 text-sm leading-6 font-medium transition-all duration-200
                        ${isActive
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                                }
                      `}
                                        >
                                            <item.icon
                                                className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </li>
                    <li className="mt-auto">
                        <button
                            onClick={handleLogout}
                            className="group -mx-2 flex gap-x-3 rounded-lg p-2.5 text-sm font-medium leading-6 text-gray-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
                        >
                            <LogOut className="h-5 w-5 shrink-0 group-hover:text-red-600" aria-hidden="true" />
                            Log out
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
