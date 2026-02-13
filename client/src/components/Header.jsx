import { useState, useRef, useEffect } from 'react';
import { Bell, Search, LogOut, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
                <span className="sr-only">Open sidebar</span>
                {/* Mobile menu button icon would go here */}
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <form className="relative flex flex-1" action="#" method="GET">
                    <label htmlFor="search-field" className="sr-only">
                        Search
                    </label>
                    <Search
                        className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                        aria-hidden="true"
                    />
                    <input
                        id="search-field"
                        className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                        placeholder="Search..."
                        type="search"
                        name="search"
                    />
                </form>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

                    {/* User Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            className="-m-1.5 flex items-center p-1.5 focus:outline-none"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="sr-only">Open user menu</span>
                            {user.profile_picture ? (
                                <img
                                    className="h-8 w-8 rounded-full bg-gray-50 object-cover"
                                    src={user.profile_picture}
                                    alt={user.full_name}
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                            <span className="hidden lg:flex lg:items-center">
                                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                                    {user.full_name || 'User'}
                                </span>
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div
                                className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="user-menu-button"
                                tabIndex="-1"
                            >
                                <Link
                                    to="/profile"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    role="menuitem"
                                    tabIndex="-1"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <UserIcon size={16} /> Your Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    role="menuitem"
                                    tabIndex="-1"
                                >
                                    <LogOut size={16} /> Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
