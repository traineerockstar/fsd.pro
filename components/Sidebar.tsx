import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Briefcase, Settings, LogOut, ChevronRight, Menu, X } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Schedule', icon: LayoutDashboard },
    { id: 'jobs', label: 'Active Jobs', icon: Briefcase },
    { id: 'settings', label: 'System Config', icon: Settings },
  ];

  return (
    <>
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-72 bg-black/80 backdrop-blur-xl border-r border-white/10 z-50 p-6 flex flex-col"
      >
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black text-white tracking-tight">FSD.PRO</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
                  ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 text-white border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut size={20} className="group-hover:text-red-400" />
            <span className="font-medium text-sm">Disconnect</span>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};