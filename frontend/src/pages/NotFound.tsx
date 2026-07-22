import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { HelpCircle, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-600 flex items-center justify-center mb-4">
        <HelpCircle className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-extrabold font-heading text-slate-900 dark:text-slate-100">
        404 - Page Not Found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-6">
        The page or operational route you requested could not be located in the Mini ERP + CRM Portal.
      </p>
      <Link to="/dashboard">
        <Button icon={<Home className="w-4 h-4" />}>Return to Dashboard</Button>
      </Link>
    </div>
  );
};
