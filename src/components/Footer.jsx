import React from "react";
import logoImg from "../assets/logo.jpeg";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center space-x-2">
          <img src={logoImg} alt="Get Job Link Logo Footer" className="w-5 h-5 object-contain rounded" />
          <span className="font-bold text-slate-800">GetJobLink</span>
          <span>© {new Date().getFullYear()} — All rights reserved.</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="mailto:getjoblink647@gmail.com" className="hover:text-slate-800 transition-colors">Contact</a>
          <a href="https://www.linkedin.com/in/getjob-link-b62169334/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">LinkedIn</a>
          <a href="https://x.com/intent/follow?screen_name=GetJobLink" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">Twitter</a>
          <a href="https://www.instagram.com/codes_and_clouds/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">Instagram</a>
        </div>
      </div>
    </footer>
  );
}