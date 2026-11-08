import React from 'react';

interface RajaLogoProps {
  /**
   * 'on-light': renders directly on white/off-white backgrounds
   * 'on-dark': wraps in a crisp white badge so the black "RAJA" & gold lion stay 100% authentic on dark charcoal
   * 'compact': icon-only square badge showing the golden crowned lion for collapsed sidebar rail
   */
  variant?: 'on-light' | 'on-dark' | 'compact';
  heightClass?: string;
  className?: string;
}

export const RajaLogo: React.FC<RajaLogoProps> = ({
  variant = 'on-light',
  heightClass = 'h-9',
  className = '',
}) => {
  if (variant === 'compact') {
    return (
      <div
        className={`w-10 h-10 rounded-[8px] bg-[#263640]/60 p-1.5 flex items-center justify-center overflow-hidden border border-white/10 shrink-0 ${className}`}
        title="PT. Roda Jaya Sakti (RAJA)"
      >
        <img
          src="/logo-raja.png"
          alt="PT. Roda Jaya Sakti"
          className="h-full w-full object-contain select-none"
        />
      </div>
    );
  }

  if (variant === 'on-dark') {
    return (
      <div className={`inline-flex items-center shrink-0 ${className}`}>
        <img
          src="/logo-raja.png"
          alt="PT. Roda Jaya Sakti (RAJA)"
          className={`${heightClass} w-auto object-contain select-none`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center shrink-0 ${className}`}>
      <img
        src="/logo-raja.png"
        alt="PT. Roda Jaya Sakti (RAJA)"
        className={`${heightClass} w-auto object-contain select-none`}
      />
    </div>
  );
};

