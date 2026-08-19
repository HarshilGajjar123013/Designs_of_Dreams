import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center relative overflow-hidden font-poppins">
      {/* Visual background details */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#FF6A00] blur-[150px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#FF6A00] blur-[150px]" />
      </div>

      <div className="w-full max-w-md px-6 py-12 relative z-10">
        {/* Header/Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="font-marcellus text-3xl tracking-[0.25em] uppercase font-light text-[#1A1A1A]">
            Designs
          </h1>
          <span className="font-marcellus text-sm tracking-[0.4em] uppercase text-[#FF6A00] mt-1 font-semibold">
            Of Dreams
          </span>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#6E6E6E] mt-3 font-semibold font-inter border-t border-[rgba(255, 106, 0,0.2)] pt-2 w-32">
            Atelier Suite
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
