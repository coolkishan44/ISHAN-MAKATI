import React, { useState, useEffect, useRef } from 'react';
import { BotPersona, Message } from '../types';
import { DEFAULT_PERSONAS, GCP_PROJECT_INFO } from '../constants';
import { Settings, Radio, Save, Sparkles, Store, Phone, Send, MapPin, Download, UploadCloud, FileJson, Server, ShieldCheck, CircleCheck } from 'lucide-react';
import { generateBroadcastMessage } from '../services/gemini';

interface SidebarProps {
  currentPersona: BotPersona;
  onPersonaChange: (persona: BotPersona) => void;
  activeTab: 'chat' | 'settings' | 'broadcast' | 'connect';
  onTabChange: (tab: 'chat' | 'settings' | 'broadcast' | 'connect') => void;
  onUpdateInstruction: (id: string, newInstruction: string) => void;
  isWhatsAppConnected: boolean;
  onToggleWhatsAppConnection: () => void;
  messages: Message[];
  customInstructions: Record<string, string>;
  onRestoreData: (data: { messages: Message[], instructions: Record<string, string> }) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPersona,
  onPersonaChange,
  activeTab,
  onTabChange,
  onUpdateInstruction,
  isWhatsAppConnected,
  onToggleWhatsAppConnection,
  messages,
  customInstructions,
  onRestoreData
}) => {
  const [broadcastTopic, setBroadcastTopic] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState('');
  const [broadcastResult, setBroadcastResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [instructionBuffer, setInstructionBuffer] = useState(currentPersona.systemInstruction);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store Contact Number
  const SHOP_PHONE_NUMBER = "917043759959";

  React.useEffect(() => {
    setInstructionBuffer(currentPersona.systemInstruction);
  }, [currentPersona]);

  const handleGenerateBroadcast = async () => {
    if (!broadcastTopic) return;
    setIsGenerating(true);
    const res = await generateBroadcastMessage(broadcastTopic, broadcastAudience, 'Exciting and Delicious');
    setBroadcastResult(res);
    setIsGenerating(false);
  };

  const handleOpenWhatsApp = () => {
    // Opens the official WhatsApp link to the shop owner
    const url = `https://wa.me/${SHOP_PHONE_NUMBER}?text=${encodeURIComponent(broadcastResult)}`;
    window.open(url, '_blank');
  };

  // Backup Logic
  const handleBackup = () => {
    const data = {
      messages,
      instructions: customInstructions,
      timestamp: new Date().toISOString(),
      app: "Ishan Assistant AI"
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ishan_assistant_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onRestoreData(json);
      } catch (err) {
        alert("Invalid Backup File");
        console.error(err);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-wa-panel border-r border-wa-border w-full md:w-[380px] flex-shrink-0 transition-colors duration-300">
      {/* Header */}
      <div className="h-16 bg-wa-header flex items-center px-4 justify-between border-b border-wa-border flex-shrink-0 transition-colors duration-300">
        <div className="flex items-center space-x-3">
           {/* Logo */}
           <div className="w-10 h-10 bg-[#C62828] rounded-full flex items-center justify-center overflow-hidden shadow-sm border-2 border-white">
             <img 
                src="https://cdn-icons-png.flaticon.com/512/4478/4478692.png" 
                alt="Ishan Assistant Logo" 
                className="w-7 h-7 object-contain invert"
             />
           </div>
           <div className="flex flex-col">
             <h1 className="text-wa-text text-lg font-bold tracking-tight leading-none uppercase text-[#C62828]">ISHAN ASSISTANT</h1>
             <div className="flex items-center space-x-1">
                <span className="text-[10px] text-wa-subtext font-semibold tracking-widest">ATUL BAKERY • KIM</span>
             </div>
           </div>
        </div>
        
        <div className="flex space-x-1">
          <button 
            onClick={() => onTabChange('connect')}
            className={`p-2 rounded-full ${activeTab === 'connect' ? 'bg-wa-border text-wa-teal' : ''} text-wa-subtext hover:text-wa-text hover:bg-wa-border transition-colors`}
            title="Store Info"
          >
            <Store size={20} />
          </button>
          <button 
            onClick={() => onTabChange('broadcast')}
            className={`p-2 rounded-full ${activeTab === 'broadcast' ? 'bg-wa-border' : ''} text-wa-subtext hover:text-wa-text hover:bg-wa-border transition-colors`}
            title="Marketing Tools"
          >
             <Radio size={20} />
          </button>
          <button 
            onClick={() => onTabChange('settings')}
            className={`p-2 rounded-full ${activeTab === 'settings' ? 'bg-wa-border' : ''} text-wa-subtext hover:text-wa-text hover:bg-wa-border transition-colors`}
            title="Assistant Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-wa-chat p-4 rounded-lg border border-wa-border">
                <h3 className="text-wa-teal text-sm font-bold uppercase mb-1">Ishan Assistant Active ✅</h3>
                <p className="text-wa-subtext text-xs">
                  Menu loaded. Auto-greeting (Morning/Evening) enabled.
                </p>
             </div>

             {/* Cloud Project Status (New) */}
             <div>
                <h2 className="text-wa-teal text-sm font-bold uppercase mb-3">Cloud Infrastructure</h2>
                <div className="bg-wa-input border border-wa-border rounded-lg p-4 space-y-3">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                         <Server size={18} className="text-green-500" />
                         <span className="text-wa-text text-sm font-semibold">Google Cloud Platform</span>
                      </div>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">Active</span>
                   </div>
                   
                   <div className="pt-2 border-t border-wa-border space-y-2">
                      <div className="flex justify-between">
                         <span className="text-wa-subtext text-xs">Project Name</span>
                         <span className="text-wa-text text-xs font-mono">{GCP_PROJECT_INFO.projectName}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-wa-subtext text-xs">Project ID</span>
                         <span className="text-wa-text text-xs font-mono">{GCP_PROJECT_INFO.projectId}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-wa-subtext text-xs">Project Number</span>
                         <span className="text-wa-text text-xs font-mono">{GCP_PROJECT_INFO.projectNumber}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-wa-subtext text-xs">Billing Account</span>
                         <span className="text-green-500 text-xs font-bold flex items-center">
                            <ShieldCheck size={12} className="mr-1" /> {GCP_PROJECT_INFO.billingStatus}
                         </span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Data Backup Section */}
             <div>
                <h2 className="text-wa-teal text-sm font-bold uppercase mb-3">Data Storage & Backup</h2>
                <div className="bg-wa-input border border-wa-border rounded-lg p-4 space-y-4">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <UploadCloud size={20} />
                        </div>
                        <div>
                            <h4 className="text-wa-text text-sm font-bold">Google Drive Backup</h4>
                            <p className="text-wa-subtext text-xs mt-1">
                                Since server storage costs money, use this <strong>Free</strong> method: 
                                Download your chat data and upload the file to your Google Drive.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button 
                            onClick={handleBackup}
                            className="flex flex-col items-center justify-center p-3 border border-wa-border rounded-lg hover:bg-wa-header transition-colors group"
                        >
                            <Download size={20} className="text-wa-teal mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs text-wa-text font-medium">Download Data</span>
                        </button>
                        
                        <button 
                            onClick={handleRestoreClick}
                            className="flex flex-col items-center justify-center p-3 border border-wa-border rounded-lg hover:bg-wa-header transition-colors group"
                        >
                            <FileJson size={20} className="text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs text-wa-text font-medium">Restore Backup</span>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".json"
                                className="hidden"
                            />
                        </button>
                    </div>
                </div>
             </div>

             <div>
              <h2 className="text-wa-teal text-sm font-bold uppercase mb-3">System Instructions</h2>
              <p className="text-wa-subtext text-xs mb-2">
                Edit exactly how Ishan Assistant should behave.
              </p>
              <textarea
                value={instructionBuffer}
                onChange={(e) => setInstructionBuffer(e.target.value)}
                className="w-full h-48 bg-wa-input text-wa-text border border-wa-border rounded-lg p-3 text-sm focus:border-wa-teal focus:outline-none resize-none transition-colors duration-300 font-mono"
              />
              <button
                onClick={() => onUpdateInstruction(currentPersona.id, instructionBuffer)}
                className="mt-2 flex items-center justify-center w-full py-2 bg-wa-teal text-white rounded-lg hover:brightness-110 transition"
              >
                <Save size={16} className="mr-2" /> Save Behavior
              </button>
            </div>
          </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="space-y-4 animate-fade-in">
             <div>
                <h2 className="text-wa-teal text-sm font-bold uppercase mb-3">Marketing Message Generator</h2>
                <p className="text-wa-subtext text-sm mb-4">
                  Create offers to send to your customers.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-wa-subtext text-xs mb-1 block">Offer / Announcement</label>
                    <input 
                      type="text"
                      className="w-full bg-wa-input border border-wa-border rounded p-2 text-wa-text focus:border-wa-teal focus:outline-none transition-colors duration-300"
                      placeholder="e.g., Buy 1KG Cake Get Pastry Free"
                      value={broadcastTopic}
                      onChange={(e) => setBroadcastTopic(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-wa-subtext text-xs mb-1 block">Target Customers</label>
                    <input 
                      type="text"
                      className="w-full bg-wa-input border border-wa-border rounded p-2 text-wa-text focus:border-wa-teal focus:outline-none transition-colors duration-300"
                      placeholder="e.g., Birthday lovers"
                      value={broadcastAudience}
                      onChange={(e) => setBroadcastAudience(e.target.value)}
                    />
                  </div>
                  
                  <button
                    onClick={handleGenerateBroadcast}
                    disabled={isGenerating || !broadcastTopic}
                    className={`w-full py-2 rounded-lg text-white flex items-center justify-center transition ${
                      isGenerating ? 'bg-wa-border cursor-wait' : 'bg-wa-teal hover:brightness-110'
                    }`}
                  >
                    {isGenerating ? (
                      <span className="text-sm">Creating...</span>
                    ) : (
                      <>
                        <Sparkles size={16} className="mr-2" /> Create Message
                      </>
                    )}
                  </button>
                </div>
             </div>

             {broadcastResult && (
               <div className="mt-4">
                 <label className="text-wa-subtext text-xs mb-1 block">Preview</label>
                 <div className="bg-wa-outgoing text-wa-text p-3 rounded-lg text-sm whitespace-pre-wrap border-l-4 border-wa-teal shadow-sm">
                    {broadcastResult}
                 </div>
                 <div className="flex space-x-2 mt-3">
                   <button 
                     onClick={() => navigator.clipboard.writeText(broadcastResult)}
                     className="flex-1 py-2 border border-wa-border rounded-lg text-wa-text text-xs hover:bg-wa-header transition"
                   >
                     Copy Text
                   </button>
                   <button 
                    onClick={handleOpenWhatsApp}
                    className="flex-1 py-2 bg-[#25D366] text-white rounded-lg text-xs font-medium hover:brightness-105 transition flex items-center justify-center"
                   >
                     <Send size={14} className="mr-2" /> Send to Self
                   </button>
                 </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'connect' && (
          <div className="h-full flex flex-col animate-fade-in">
            <h2 className="text-wa-teal text-sm font-bold uppercase mb-6">Store Contact Info</h2>
            
            <div className="bg-wa-chat p-6 rounded-xl border border-wa-border flex flex-col items-center text-center space-y-4">
                 <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <Store size={40} />
                 </div>
                 
                 <div>
                   <h3 className="text-wa-text text-xl font-bold">Ishan Assistant</h3>
                   <p className="text-wa-subtext text-sm">Official AI for Atul Bakery</p>
                 </div>

                 <div className="w-full bg-wa-panel rounded-lg p-3 border border-wa-border flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Phone size={20} className="text-green-500" />
                        <div className="text-left">
                            <p className="text-wa-subtext text-xs">WhatsApp Number</p>
                            <p className="text-wa-text font-mono font-medium">+91 91704 37599</p>
                        </div>
                    </div>
                 </div>

                 <div className="w-full bg-wa-panel rounded-lg p-3 border border-wa-border flex items-center space-x-3">
                    <MapPin size={20} className="text-red-500" />
                    <div className="text-left">
                        <p className="text-wa-subtext text-xs">Location</p>
                        <p className="text-wa-text text-sm">Kim, Surat</p>
                    </div>
                 </div>

                 <a 
                   href={`https://wa.me/${SHOP_PHONE_NUMBER}`}
                   target="_blank"
                   rel="noreferrer"
                   className="w-full py-3 bg-[#25D366] text-white rounded-lg font-bold hover:brightness-105 transition flex items-center justify-center"
                 >
                   Test WhatsApp Link
                 </a>
            </div>
          </div>
        )}

      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-wa-border text-center bg-wa-panel transition-colors duration-300">
         <div className="flex items-center justify-center space-x-2 mb-1">
            <CircleCheck size={14} className="text-green-500" />
            <span className="text-wa-text text-xs font-semibold">System Online</span>
         </div>
         <p className="text-wa-subtext text-[10px] font-mono">ID: {GCP_PROJECT_INFO.projectId}</p>
      </div>
    </div>
  );
};

export default Sidebar;