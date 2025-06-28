import React from "react";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-zinc-900 rounded-xl p-6 max-w-[40rem] w-full max-h-[85vh] relative shadow-lg border border-zinc-700">
        <button
          className="absolute top-3 right-3 text-white hover:text-red-400"
          onClick={onClose}
        >
          <FaTimes />
        </button>
        <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;