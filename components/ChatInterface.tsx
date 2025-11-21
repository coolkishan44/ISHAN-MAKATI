import React, { useRef, useEffect } from 'react';
import { Message, BotPersona } from '../types';
import { Send, Paperclip, Mic, Smile, CheckCheck } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  currentInput: string;
  onInputChange: (val: string) => void;
  onSend: () => void;
  isTyping: boolean;
  persona: BotPersona;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentInput,
  onInputChange,
  onSend,
  isTyping,
  persona,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-wa-chat relative transition-colors duration-300">
      {/* Chat Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.06] pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Header */}
      <div className="h-16 bg-wa-header flex items-center px-4 justify-between flex-shrink-0 z-10 border-b border-wa-border transition-colors duration-300">
        <div className="flex items-center cursor-pointer">
          <img
            src={persona.avatar}
            alt={persona.name}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div className="flex flex-col">
            <span className="text-wa-text font-medium">{persona.name}</span>
            <span className="text-xs text-wa-subtext">
              {isTyping ? 'typing...' : 'online'}
            </span>
          </div>
        </div>
        <div className="flex space-x-5 text-wa-subtext">
          {/* Header Icons (Visual Only) */}
          <div className="w-5 h-5 rounded-full border border-wa-subtext flex items-center justify-center text-[10px]">?</div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 z-10 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[65%] rounded-lg px-3 py-1.5 relative shadow-sm text-sm sm:text-base transition-colors duration-300 ${
                msg.sender === 'user'
                  ? 'bg-wa-outgoing text-wa-text rounded-tr-none'
                  : 'bg-wa-incoming text-wa-text rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap break-words leading-relaxed">
                {msg.text}
              </div>
              <div className="flex justify-end items-center space-x-1 mt-1">
                <span className="text-[11px] text-wa-subtext opacity-70 min-w-[40px] text-right">
                  {msg.timestamp}
                </span>
                {msg.sender === 'user' && (
                  <CheckCheck size={14} className="text-blue-400" />
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-wa-incoming text-wa-subtext rounded-lg rounded-tl-none px-4 py-2 shadow-sm text-sm transition-colors duration-300">
                Typing...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-wa-header px-4 py-2 flex items-center space-x-4 z-10 transition-colors duration-300">
        <div className="flex items-center space-x-4 text-wa-subtext cursor-pointer">
           <Smile size={24} className="hover:text-wa-text transition" />
           <Paperclip size={24} className="hover:text-wa-text transition" />
        </div>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="w-full py-2 px-4 bg-wa-input border border-wa-border rounded-lg text-wa-text placeholder-wa-subtext focus:outline-none focus:ring-0 transition-colors duration-300"
          />
        </div>

        <button
          onClick={onSend}
          disabled={!currentInput.trim() || isTyping}
          className={`p-2 rounded-full transition-colors ${
            currentInput.trim() 
              ? 'bg-wa-teal text-white hover:brightness-110' 
              : 'text-wa-subtext hover:bg-wa-border'
          }`}
        >
          {currentInput.trim() ? <Send size={20} /> : <Mic size={20} />}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;