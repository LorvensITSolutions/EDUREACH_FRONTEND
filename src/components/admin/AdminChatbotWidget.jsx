// components/ChatbotWidget.jsx
import React, { useState, useEffect, useRef } from "react";
import { useChatbotStore } from "../stores/useChatbotStore";
import { X, MessageSquare, Loader2, Minimize2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminChatbotWidget.css";

const ChatbotWidget = () => {
  const { messages, sendMessage, clearChat, loading } = useChatbotStore();
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        className={`fixed bg-primary text-white rounded-full shadow-lg hover:opacity-90 z-50 transition-all duration-200 ${
          isMobile 
            ? 'bottom-4 right-4 p-3' 
            : 'bottom-6 right-6 p-4'
        }`}
      >
        {open ? <X size={isMobile ? 20 : 24} /> : <MessageSquare size={isMobile ? 20 : 24} />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`fixed bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden z-50 border ${
              isMobile 
                ? 'bottom-16 right-2 left-2 w-auto h-[70vh] max-h-[600px]' 
                : isMinimized
                  ? 'bottom-20 right-6 w-80 h-16'
                  : 'bottom-20 right-6 w-96 h-[600px] max-h-[80vh]'
            }`}
          >
            {/* Header */}
            <div className="bg-primary text-white px-4 py-3 font-semibold flex justify-between items-center flex-shrink-0">
              <span className="text-sm md:text-base">Admin Chatbot</span>
              <div className="flex items-center gap-2">
                {!isMobile && (
                  <button 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 rounded hover:bg-white/20 transition-colors"
                  >
                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                  </button>
                )}
                <button 
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages - Only show when not minimized */}
            {!isMinimized && (
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto flex flex-col gap-3 bg-gray-50 chatbot-messages-container"
              >
                <div className="p-3 space-y-3 min-h-0">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-8">
                      <MessageSquare className="w-12 h-12 mb-3 text-gray-300" />
                      <h3 className="font-medium text-gray-700 mb-2 text-sm md:text-base">Admin Chatbot</h3>
                      <p className="text-xs md:text-sm mb-4 px-4">
                        Type <code className="bg-gray-200 px-2 py-1 rounded text-xs">/help</code> to see available commands
                      </p>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>Try: <code className="bg-gray-200 px-1 py-0.5 rounded">/select S190775</code></p>
                        <p>Or: <code className="bg-gray-200 px-1 py-0.5 rounded">/student</code></p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`px-3 py-2 rounded-lg max-w-[85%] ${
                          msg.role === "user"
                            ? "bg-blue-500 text-white self-end ml-auto"
                            : "bg-white text-gray-800 self-start border shadow-sm"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed break-words">
                          {msg.text}
                        </div>
                      </motion.div>
                    ))
                  )}

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {loading && (
                      <motion.div
                        key="typing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white text-gray-600 px-3 py-2 rounded-lg w-fit self-start flex items-center gap-2 border shadow-sm"
                      >
                        <Loader2 className="animate-spin w-3 h-3 md:w-4 md:h-4" />
                        <span className="text-xs md:text-sm">Bot is typing...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

            {/* Input - Only show when not minimized */}
            {!isMinimized && (
              <div className="p-3 border-t bg-white flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 border rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder={isMobile ? "Type command..." : "Type a command (e.g., /select S190775)..."}
                  />
                  <button
                    onClick={handleSend}
                    className="bg-primary text-white px-3 py-2 rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity text-xs md:text-sm whitespace-nowrap"
                    disabled={loading || !input.trim()}
                  >
                    {isMobile ? "Send" : "Send"}
                  </button>
                </div>
              </div>
            )}

            {/* Clear chat - Only show when not minimized and has messages */}
            {!isMinimized && messages.length > 0 && (
              <div className="border-t bg-gray-50 flex-shrink-0">
                <button
                  onClick={clearChat}
                  className="w-full text-xs text-gray-500 py-2 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Clear Chat
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
