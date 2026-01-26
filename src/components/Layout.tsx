import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Github } from 'lucide-react';
import clsx from 'clsx';

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Plugins', path: '/plugins', icon: List },
        // { label: 'About', path: '/about', icon: Info },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1a1d21] border-r border-slate-800 text-white fixed h-full z-10">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-serif font-bold text-white">
                        Jenkins Plugin Modernizer Statistics
                    </h1>
                    <p className="text-xs text-slate-400 mt-2">Graphical representation of numbers and information around Jenkins</p>
                </div>
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                )}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
                    <a
                        href="https://github.com/jenkins-infra/metadata-plugin-modernizer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        <Github size={16} />
                        Data Source
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
