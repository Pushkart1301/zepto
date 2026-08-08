import { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, BarChart2,
  Settings, ChevronLeft, ChevronRight,
  HelpCircle, Search, X, Sun, Moon, LogOut,
  ChevronDown
} from 'lucide-react';
import { useTickets } from '../context/TicketsContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tickets',   icon: Ticket,          label: 'Tickets' },
  { to: '/analytics', icon: BarChart2,       label: 'Analytics' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
];

export default function Layout() {
  const [collapsed, setCollapsed]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode]     = useState(false);
  const navigate    = useNavigate();
  const profileRef  = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLDivElement>(null);

  const tickets = useTickets();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return tickets
      .filter(t =>
        t.ticket.ticket_id.toLowerCase().includes(q) ||
        t.ticket.order_id.toLowerCase().includes(q) ||
        t.ticket.description.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [tickets, searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (searchRef.current  && !searchRef.current.contains(e.target as Node))  setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F7]" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-[#1A1D2E] text-white transition-all duration-200 flex-shrink-0 ${collapsed ? 'w-[56px]' : 'w-[220px]'}`}
        style={{ zIndex: 50 }}
      >
        <div className={`flex items-center h-14 border-b border-white/10 px-3 ${collapsed ? 'justify-center' : 'gap-2'}`}>
          <div className="w-7 h-7 rounded-md bg-[#7C3AED] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">Z</span>
          </div>
          {!collapsed && <span className="text-white font-semibold text-sm tracking-tight">Zepto Support</span>}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 scroll-hidden">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 mx-2 rounded-md text-[13px] font-medium transition-all mb-0.5 ${
                  isActive ? 'bg-[#7C3AED] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-2">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/10 cursor-pointer mb-1">
              <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center text-xs font-semibold flex-shrink-0">PT</div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-[12px] font-medium truncate">Pushkar Toshniwal</div>
                <div className="text-gray-400 text-[11px] truncate">Senior Agent</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Online" />
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center py-1 mb-1">
              <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center text-xs font-semibold">PT</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0" style={{ zIndex: 40 }}>
          <div className="flex-1 min-w-0" />

          {/* Search */}
          <div ref={searchRef} className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-500 text-[13px] transition-all min-w-[220px]"
            >
              <Search size={14} />
              <span>Search tickets…</span>
              <span className="ml-auto text-[11px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono">⌘K</span>
            </button>
            {searchOpen && (
              <div className="absolute top-full mt-1 right-0 w-[480px] bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                  <Search size={14} className="text-gray-400" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search ticket ID, order ID, or description…"
                    className="flex-1 text-[13px] outline-none text-gray-800 placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')}>
                      <X size={13} className="text-gray-400" />
                    </button>
                  )}
                </div>
                <div className="py-1">
                  {searchQuery.trim() ? (
                    searchResults.length > 0 ? (
                      <div className="px-3 py-2">
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                        </div>
                        {searchResults.map(t => (
                          <button
                            key={t.ticket.ticket_id}
                            onClick={() => { navigate(`/tickets/${t.ticket.ticket_id}`); setSearchOpen(false); setSearchQuery(''); }}
                            className="w-full flex items-start gap-2.5 px-2 py-2 rounded hover:bg-purple-50 text-left"
                          >
                            <Ticket size={13} className="text-purple-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[12px] font-bold text-purple-700">{t.ticket.ticket_id}</span>
                                <span className="text-[10px] text-gray-400">{t.ticket.order_id}</span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  t.decision.status === 'AUTO_RESOLVE' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {t.decision.status === 'AUTO_RESOLVE' ? 'Auto' : 'Review'}
                                </span>
                              </div>
                              <div className="text-[12px] text-gray-600 truncate mt-0.5">{t.ticket.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-4 text-center">
                        <div className="text-[13px] text-gray-500 font-medium">No tickets found</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">Try a ticket ID, order ID, or description keyword</div>
                      </div>
                    )
                  ) : (
                    <div className="px-3 py-3 text-[12px] text-gray-400 text-center">
                      Search by ticket ID (N-005), order ID (ORD-9900), or issue description
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all">
            <HelpCircle size={16} />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center text-xs font-semibold text-white">PT</div>
              <ChevronDown size={13} className="text-gray-400" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-1 w-[200px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-[13px] font-semibold text-gray-800">Pushkar Toshniwal</div>
                  <div className="text-[11px] text-gray-500">pushkar@zepto.com</div>
                </div>
                <button
                  onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                  className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50"
                >
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
