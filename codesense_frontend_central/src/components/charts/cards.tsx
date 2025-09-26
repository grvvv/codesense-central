import type { StatCountDetails } from '@/types/dashboard';
import { Link } from '@tanstack/react-router';
import { Folder, Search, AlertTriangle, FileText } from 'lucide-react';
import { Card } from '../atomic/card';

const DashboardCards = ({ data }: { data: StatCountDetails | undefined }) => {
  
  const cards = [
    { 
      title: 'Users', 
      icon: <FileText size={28} className="text-[#bf0000]" />, 
      description: 'All Users',
      count: data?.users.toString(),
      href: "/users/list",
      accentColor: '#bf0000'
    },
    { 
      title: 'Project', 
      icon: <Folder size={28} className="text-[#bf0000]" />, 
      description: 'Manage your projects',
      count: data?.projects.toString(),
      href: "/project/list",
      accentColor: '#bf0000'
    },
    { 
      title: 'Scans', 
      icon: <Search size={28} className="text-[#bf0000]" />, 
      description: 'Security scans & audits',
      count: data?.scans.toString(),
      accentColor: '#bf0000'
    },
    { 
      title: 'Findings', 
      icon: <AlertTriangle size={28} className="text-[#bf0000]" />, 
      description: 'Security vulnerabilities',
      count: data?.findings.toString(),
      accentColor: '#bf0000'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-3 min-h-auto">
      {cards.map((card, index) => (
        <Card key={index} className='p-0 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out border-2 border-gray-200 dark:border-[#e5e5e5]/30'>
        <Link
          to={card.href}
          key={index}
          className={`
            relative group cursor-pointer
            rounded-2xl p-6 
            shadow-sm hover:shadow-lg dark:shadow-black/20 dark:hover:shadow-black/40
            overflow-hidden
          `}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 duration-300" />
          
          {/* Header with icon and action */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-[#e5e5e5]/10 transition-colors duration-300"
              style={{ borderLeft: `3px solid ${card.accentColor}`, borderBottom: `3px solid ${card.accentColor}`}}
            >
              {card.icon}
            </div>
            <span 
              className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300"
              style={{ color: card.accentColor }}
            >
              {card.count}
            </span>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2 transition-colors duration-300">
              {card.title}
            </h2>
            <div className="flex items-center justify-between">
            <p className="text-sm mb-4 transition-colors duration-300">
              {card.description}
            </p>
              
            {
              card.href &&
              <div className="text-xs transition-colors duration-300">
                View all
              </div>
            }
            
            </div>
          </div>
          
        </Link>
        </Card>
      ))}
    </div>
  );
};

export default DashboardCards;