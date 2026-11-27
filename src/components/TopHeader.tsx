'use client'

import { useState } from 'react'
import { Search, Bell, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

export default function TopHeader() {
  const [query, setQuery] = useState('')

  return (
    <header className="flex justify-between items-center mb-2 shrink-0 z-30 h-12">
      <div className="bg-white rounded-[40px] px-2 py-2 flex items-center w-full shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-full">
        
        {/* LEFT ZONE: Aligns with main content (flex-1) */}
        <div className="flex-1 flex justify-between items-center pr-2">
           {/* Navigation & Search */}
           <div className="flex-1 flex items-center gap-4 pl-2">
              <div className="flex items-center bg-[#F4F6F8] rounded-[20px] p-0.5 shrink-0">
                 <button className="w-6 h-6 flex items-center justify-center text-[#1A1C1E] hover:bg-white rounded-full transition-colors">
                   <ChevronLeft strokeWidth={2} className="w-4 h-4" />
                 </button>
                 <button className="w-6 h-6 flex items-center justify-center text-[#1A1C1E] hover:bg-white rounded-full transition-colors">
                   <ChevronRight strokeWidth={2} className="w-4 h-4" />
                 </button>
              </div>

              <div className="flex-1 flex items-center gap-2 border border-gray-100 bg-transparent px-3 py-1.5 rounded-full">
                 <Search strokeWidth={2} className="w-4 h-4 text-[#707478]" />
                 <input
                   type="text"
                   value={query}
                   onChange={e => setQuery(e.target.value)}
                   placeholder="Search"
                   className="bg-transparent border-none text-[13px] text-[#1A1C1E] font-medium focus:outline-none w-full placeholder:text-[#A0A4A8]"
                 />
              </div>
           </div>

           {/* Toggle Pills */}
           <div className="flex items-center bg-[#F4F6F8] rounded-[20px] p-1 shadow-inner ml-6 shrink-0">
              <button className="px-5 py-1 rounded-[16px] bg-[#1A1C1E] text-white text-[11px] font-bold transition-colors shadow-sm">
                 Today
              </button>
              <button className="px-5 py-1 rounded-[16px] text-[#707478] hover:text-[#1A1C1E] text-[11px] font-bold transition-colors">
                 Week
              </button>
              <button className="px-5 py-1 rounded-[16px] text-[#707478] hover:text-[#1A1C1E] text-[11px] font-bold transition-colors">
                 Month
              </button>
           </div>
        </div>

        <div className="w-[1px] h-6 bg-[#E0E0E0] mx-4 shrink-0"></div>

        {/* RIGHT ZONE: User & Bell closely grouped */}
        <div className="shrink-0 flex items-center justify-end pr-2">
           <div className="flex items-center gap-3 cursor-pointer px-1">
              <div className="w-8 h-8 rounded-full bg-[#E0F7FA] overflow-hidden flex items-center justify-center shrink-0">
                 <img src="https://api.dicebear.com/9.x/rings/svg?seed=AdminUser&primaryColor=06b6d4,f97316" alt="Admin Graphic Avatar" className="w-full h-full object-cover scale-110" />
              </div>
              <div className="hidden md:flex flex-col justify-center">
                 <span className="text-[13px] font-bold text-[#1A1C1E] leading-none mb-1">Admin User</span>
                 <span className="text-[11px] font-medium text-[#A0A4A8] leading-none">Manager</span>
              </div>
              <ChevronDown strokeWidth={2} className="w-3.5 h-3.5 text-[#A0A4A8] ml-1 shrink-0" />
           </div>

           <div className="w-[1px] h-6 bg-[#E0E0E0] mx-4 shrink-0"></div>

           <div className="relative flex items-center shrink-0">
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#1A1C1E] hover:bg-[#F4F6F8] transition-colors">
                <Bell strokeWidth={2} className="w-[18px] h-[18px]" />
              </button>
              <span className="absolute top-[6px] right-[6px] w-[6px] h-[6px] bg-[#257b57] rounded-full ring-[1.5px] ring-white"></span>
           </div>
        </div>
      </div>
    </header>
  )
}
