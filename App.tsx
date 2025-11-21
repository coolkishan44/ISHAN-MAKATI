import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import OrderModal from './components/OrderModal';
import { Message, BotPersona, Tab, OrderData } from './types';
import { DEFAULT_PERSONAS } from './constants';
import { generateBotResponse } from './services/gemini';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [currentPersona, setCurrentPersona] = useState<BotPersona>(DEFAULT_PERSONAS[0]);
  const [customInstructions, setCustomInstructions] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Mobile toggle
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false); // WhatsApp Connection State
  
  // Order State
  const [pendingOrder, setPendingOrder] = useState<OrderData | null>(null);

  // Helper to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 17) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      text: `${getGreeting()}! 🙏 Welcome to **Atul Bakery KIM**.\nI am **Ishan Assistant**.\n\nBefore we begin, may I know your Good Name & Mobile Number please?`,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    }
  ]);
  
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Handlers
  const handlePersonaChange = (persona: BotPersona) => {
    setCurrentPersona(persona);
    setMessages([{
      id: Date.now().toString(),
      text: `Assistant switched to ${persona.name}.`,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    }]);
    
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleUpdateInstruction = (id: string, newInstruction: string) => {
    setCustomInstructions(prev => ({ ...prev, [id]: newInstruction }));
    if (currentPersona.id === id) {
        setCurrentPersona(prev => ({ ...prev, systemInstruction: newInstruction }));
    }
  };

  const handleRestoreData = (data: { messages: Message[], instructions: Record<string, string> }) => {
    if (data.messages && Array.isArray(data.messages)) {
      setMessages(data.messages);
    }
    if (data.instructions && typeof data.instructions === 'object') {
      setCustomInstructions(data.instructions);
      if (data.instructions[currentPersona.id]) {
         setCurrentPersona(prev => ({ ...prev, systemInstruction: data.instructions[currentPersona.id] }));
      }
    }
    alert('Backup restored successfully!');
  };

  const handleSendMessage = useCallback(async () => {
    if (!currentInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: currentInput,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setCurrentInput('');
    setIsTyping(true);

    setTimeout(async () => {
        const activeInstruction = customInstructions[currentPersona.id] || currentPersona.systemInstruction;
        
        const response = await generateBotResponse(
            updatedMessages,
            newMessage.text,
            activeInstruction
        );

        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: response.text,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);

        // Check if the response contains an order structure
        if (response.order) {
          setPendingOrder(response.order);
        }

    }, 600 + Math.random() * 1000); 

  }, [currentInput, messages, currentPersona, customInstructions]);

  const handleConfirmOrder = () => {
    if (!pendingOrder) return;

    // Construct WhatsApp Message
    let msgText = `Hi Ishan Assistant, I want to place a new order:\n\n`;
    pendingOrder.items.forEach(item => {
      msgText += `• ${item.quantity} x ${item.itemName} (₹${item.unitPrice})\n`;
    });
    msgText += `\n*Total Amount: ₹${pendingOrder.totalAmount}*`;
    msgText += `\n\nPlease confirm my order.`;

    const encodedMsg = encodeURIComponent(msgText);
    const shopNumber = "917043759959";
    window.open(`https://wa.me/${shopNumber}?text=${encodedMsg}`, '_blank');
    
    setPendingOrder(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-wa-app text-wa-text">
      {/* Order Modal Overlay */}
      {pendingOrder && (
        <OrderModal 
          order={pendingOrder}
          onClose={() => setPendingOrder(null)}
          onConfirm={handleConfirmOrder}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed md:relative z-30 h-full transition-transform duration-300 ease-in-out transform 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <Sidebar
          currentPersona={currentPersona}
          onPersonaChange={handlePersonaChange}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (window.innerWidth < 768 && tab === 'chat') {
                 setIsSidebarOpen(false);
            }
          }}
          onUpdateInstruction={handleUpdateInstruction}
          isWhatsAppConnected={isWhatsAppConnected}
          onToggleWhatsAppConnection={() => setIsWhatsAppConnected(!isWhatsAppConnected)}
          messages={messages}
          customInstructions={customInstructions}
          onRestoreData={handleRestoreData}
        />
        
        {/* Close button for mobile */}
        <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 text-wa-subtext"
        >
            <X size={24} />
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full relative bg-wa-chat">
        {/* Mobile Header Toggle */}
        <div className="md:hidden absolute top-4 left-4 z-20">
             {!isSidebarOpen && (
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="text-wa-subtext bg-wa-header p-2 rounded-full shadow-md"
                >
                    <Menu size={24} />
                </button>
             )}
        </div>

        <ChatInterface
          messages={messages}
          currentInput={currentInput}
          onInputChange={setCurrentInput}
          onSend={handleSendMessage}
          isTyping={isTyping}
          persona={currentPersona}
        />
      </div>
    </div>
  );
};

export default App;