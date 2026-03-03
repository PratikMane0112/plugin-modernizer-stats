import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, List, Beaker, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/plugins', label: 'Plugins', icon: List },
    { to: '/recipes', label: 'Recipes', icon: Beaker },
] as const;

const GithubIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

export const Layout = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Mobile header */}
            <header className="lg:hidden flex items-center justify-between bg-[#1a1d21] border-b border-slate-800 px-4 py-3">
                <Link to="/" className="flex items-center gap-2" aria-label="Home">
                    <img src="/jenkins.svg" alt="Jenkins Logo" className="w-8 h-8" />
                    <span className="text-lg font-bold text-white">PM Stats</span>
                </Link>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
                    aria-expanded={sidebarOpen}
                >
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </header>

            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed inset-y-0 left-0 z-40 w-64 bg-[#1a1d21] border-r border-slate-800 text-white flex flex-col transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
                aria-label="Main navigation"
            >
                <div className="p-6 border-b border-slate-800">
                    <Link
                        to="/"
                        className="block"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <img src="/jenkins.svg" alt="Jenkins Logo" className="w-28 h-28" />
                            <h1 className="text-xl font-serif font-bold text-white leading-tight">
                                Jenkins Plugin Modernizer Statistics
                            </h1>
                        </div>
                    </Link>
                    <p className="text-sm text-slate-400">
                        A visualization dashboard for tracking the modernization progress of the Jenkins plugin ecosystem.
                    </p>
                </div>

                <nav className="p-4 space-y-2">
                    {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                        const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
                        return (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => setSidebarOpen(false)}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                )}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <Icon size={20} aria-hidden="true" />
                                <span className="font-medium">{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto w-full p-4 border-t border-slate-700">
                    <a
                        href="https://github.com/jenkins-infra/metadata-plugin-modernizer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        <GithubIcon size={16} />
                        Data Source
                    </a>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Main content */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden" role="main">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
