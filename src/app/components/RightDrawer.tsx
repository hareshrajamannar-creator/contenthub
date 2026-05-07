import type { ReactNode } from "react";

interface RightDrawerProps {
  children: ReactNode;
  onClose: () => void;
  isOpen: boolean;
}

export function RightDrawer({ children, onClose, isOpen }: RightDrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] bg-[rgba(20,28,45,0.24)] backdrop-blur-[1px] transition-opacity duration-300 ease-out ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed bottom-3 right-3 top-3 w-[calc(100vw-24px)] overflow-hidden rounded-[8px] border border-[rgba(210,216,228,0.95)] dark:border-[#2e3340] bg-[#f7f8fb] dark:bg-[#181b22] shadow-[-4px_16px_40px_rgba(15,23,42,0.14)] dark:shadow-[-4px_16px_40px_rgba(0,0,0,0.5)] transition-transform duration-[1500ms] ease-[cubic-bezier(0.32,0.72,0,1)] md:w-[min(90vw,1320px)] 2xl:w-[min(74vw,1520px)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
