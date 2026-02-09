import { Loader2 } from 'lucide-react';

const sizeConfig = {
  sm: { icon: 'w-6 h-6', container: 'min-h-[200px]' },
  md: { icon: 'w-8 h-8', container: 'min-h-[400px]' },
  lg: { icon: 'w-10 h-10', container: 'min-h-[60vh]' },
  fullscreen: { icon: 'w-12 h-12', container: 'min-h-screen' },
};

const Loader = ({ 
  message = 'Loading...', 
  size = 'md',
  fullscreen = false,
  className = ''
}) => {
  const variant = fullscreen ? 'fullscreen' : size;
  const config = sizeConfig[variant];

  return (
    <div className={`flex items-center justify-center ${config.container} ${fullscreen ? 'bg-[#0a0a0f]' : ''} ${className}`}>
      <div className="text-center">
        <Loader2 className={`${config.icon} text-indigo-500 animate-spin mx-auto mb-4`} />
        <p className="text-slate-400 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
