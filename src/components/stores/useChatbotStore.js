// src/stores/useChatbotStore.js
import { create } from "zustand";
import axios from "../../components/lib/axios.js";

// ---- LocalStorage Helpers ----
const loadState = () => {
  try {
    const saved = localStorage.getItem("chatbotState");
    return saved ? JSON.parse(saved) : { 
      messages: [], 
      context: {}, 
      selectedStudent: null,
      searchSuggestions: [],
      commandHistory: [],
      lastSearchTerm: ""
    };
  } catch (err) {
    console.error("Failed to load chatbot state", err);
    return { 
      messages: [], 
      context: {}, 
      selectedStudent: null,
      searchSuggestions: [],
      commandHistory: [],
      lastSearchTerm: ""
    };
  }
};

const saveState = (state) => {
  try {
    localStorage.setItem("chatbotState", JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save chatbot state", err);
  }
};

// ---- Zustand Store ----
export const useChatbotStore = create((set, get) => ({
  messages: loadState().messages,
  context: loadState().context,
  selectedStudent: loadState().selectedStudent, // Track selected student
  searchSuggestions: loadState().searchSuggestions, // Track search suggestions
  commandHistory: loadState().commandHistory, // Track command history
  lastSearchTerm: loadState().lastSearchTerm, // Track last search term
  loading: false,
  error: null,
  isConnected: true, // Track connection status

  // Send a message to chatbot
  sendMessage: async (message) => {
    if (!message.trim()) return;

    // Add to command history if it's a command
    const isCommand = message.startsWith('/');
    if (isCommand) {
      set((state) => {
        const updatedHistory = [...state.commandHistory, message].slice(-20); // Keep last 20 commands
        saveState({ 
          messages: state.messages, 
          context: state.context,
          selectedStudent: state.selectedStudent,
          searchSuggestions: state.searchSuggestions,
          commandHistory: updatedHistory,
          lastSearchTerm: state.lastSearchTerm
        });
        return { commandHistory: updatedHistory };
      });
    }

    // Add user message immediately
    set((state) => {
      const updatedMessages = [...state.messages, { 
        role: "user", 
        text: message,
        timestamp: new Date().toISOString(),
        isCommand: isCommand
      }];
      saveState({ 
        messages: updatedMessages, 
        context: state.context,
        selectedStudent: state.selectedStudent,
        searchSuggestions: state.searchSuggestions,
        commandHistory: state.commandHistory,
        lastSearchTerm: state.lastSearchTerm
      });
      return { messages: updatedMessages, error: null, isConnected: true };
    });

    try {
      set({ loading: true, error: null });
      
      const res = await axios.post(
        "/chatbot",
        { message },
        { 
          withCredentials: true,
          timeout: 30000 // 30 second timeout
        }
      );

      const botReply = res.data.reply || "⚠️ No response from chatbot.";
      const newContext = res.data.context || get().context;
      const selectedStudent = newContext?.selectedStudent || get().selectedStudent;

      // Extract search suggestions if this is a search command
      let searchSuggestions = get().searchSuggestions;
      if (message.startsWith('/search') && botReply.includes('Found') && botReply.includes('student(s)')) {
        // Parse suggestions from bot reply
        const lines = botReply.split('\n').filter(line => line.match(/^\d+\./));
        searchSuggestions = lines.map(line => {
          const match = line.match(/^\d+\.\s*(.+?)\s*\((.+?)\)/);
          return match ? { name: match[1], studentId: match[2] } : null;
        }).filter(Boolean);
      }

      // Append bot reply and update context
      set((state) => {
        const updatedMessages = [
          ...state.messages,
          { 
            role: "bot", 
            text: botReply,
            timestamp: new Date().toISOString(),
            hasSuggestions: searchSuggestions.length > 0
          },
        ];
        saveState({ 
          messages: updatedMessages, 
          context: newContext,
          selectedStudent: selectedStudent,
          searchSuggestions: searchSuggestions,
          commandHistory: state.commandHistory,
          lastSearchTerm: message.startsWith('/search') ? message.split(' ').slice(1).join(' ') : state.lastSearchTerm
        });
        return { 
          messages: updatedMessages, 
          context: newContext, 
          selectedStudent: selectedStudent,
          searchSuggestions: searchSuggestions,
          loading: false,
          isConnected: true
        };
      });
    } catch (err) {
      console.error("Chatbot error:", err);
      
      let errorMessage = "⚠️ Failed to contact chatbot.";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = "⚠️ Request timeout. Please try again.";
      } else if (err.response?.status === 401) {
        errorMessage = "⚠️ Authentication required. Please login again.";
      } else if (err.response?.status === 403) {
        errorMessage = "⚠️ Access denied. Admin privileges required.";
      } else if (err.response?.data?.reply) {
        errorMessage = err.response.data.reply;
      }

      set({
        error: errorMessage,
        loading: false,
        isConnected: false
      });

      // Add error message to chat
      set((state) => {
        const updatedMessages = [
          ...state.messages,
          { 
            role: "bot", 
            text: errorMessage,
            timestamp: new Date().toISOString(),
            isError: true
          },
        ];
        return { messages: updatedMessages };
      });
    }
  },

  // Reset chat session
  clearChat: () => {
    saveState({ 
      messages: [], 
      context: {}, 
      selectedStudent: null,
      searchSuggestions: [],
      commandHistory: [],
      lastSearchTerm: ""
    });
    set({ 
      messages: [], 
      context: {}, 
      selectedStudent: null,
      searchSuggestions: [],
      commandHistory: [],
      lastSearchTerm: "",
      error: null,
      isConnected: true
    });
  },

  // Get selected student info
  getSelectedStudent: () => {
    return get().selectedStudent;
  },

  // Check if student is selected
  hasSelectedStudent: () => {
    return !!get().selectedStudent;
  },

  // Get recent messages (last 10)
  getRecentMessages: () => {
    const messages = get().messages;
    return messages.slice(-10);
  },

  // Get message count
  getMessageCount: () => {
    return get().messages.length;
  },

  // Check if chat is empty
  isEmpty: () => {
    return get().messages.length === 0;
  },

  // Retry last failed request
  retryLastMessage: async () => {
    const messages = get().messages;
    const lastUserMessage = messages.filter(msg => msg.role === "user").pop();
    
    if (lastUserMessage) {
      await get().sendMessage(lastUserMessage.text);
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null, isConnected: true });
  },

  // Get search suggestions
  getSearchSuggestions: () => {
    return get().searchSuggestions;
  },

  // Clear search suggestions
  clearSearchSuggestions: () => {
    set({ searchSuggestions: [] });
  },

  // Get command history
  getCommandHistory: () => {
    return get().commandHistory;
  },

  // Get recent commands (last 5)
  getRecentCommands: () => {
    return get().commandHistory.slice(-5);
  },

  // Get last search term
  getLastSearchTerm: () => {
    return get().lastSearchTerm;
  },

  // Quick select student from suggestions
  selectStudentFromSuggestion: async (studentId) => {
    const message = `/select ${studentId}`;
    await get().sendMessage(message);
  },

  // Quick search students
  searchStudents: async (searchTerm) => {
    const message = `/search ${searchTerm}`;
    await get().sendMessage(message);
  },

  // Quick behavior email
  sendBehaviorEmail: async (studentName, message) => {
    const command = `/behaviorEmail ${studentName} "${message}"`;
    await get().sendMessage(command);
  },

  // Quick behavior WhatsApp
  sendBehaviorWhatsApp: async (studentName, message) => {
    const command = `/behaviorWhatsApp ${studentName} "${message}"`;
    await get().sendMessage(command);
  },

  // Quick behavior both
  sendBehaviorBoth: async (studentName, message) => {
    const command = `/behaviorBoth ${studentName} "${message}"`;
    await get().sendMessage(command);
  },

  // Get student info if selected
  getSelectedStudentInfo: () => {
    const selectedStudent = get().selectedStudent;
    if (!selectedStudent) return null;
    
    // Try to find student info in recent messages
    const messages = get().messages;
    const studentInfoMessage = messages
      .filter(msg => msg.role === "bot" && msg.text.includes("Student selected:"))
      .pop();
    
    if (studentInfoMessage) {
      const match = studentInfoMessage.text.match(/Student selected: (.+?) \((.+?)\) - ID: (.+)/);
      if (match) {
        return {
          name: match[1],
          classSection: match[2],
          studentId: match[3]
        };
      }
    }
    
    return { studentId: selectedStudent };
  },

  // Check if last message has suggestions
  hasLastMessageSuggestions: () => {
    const messages = get().messages;
    const lastBotMessage = messages.filter(msg => msg.role === "bot").pop();
    return lastBotMessage?.hasSuggestions || false;
  },

  // Get quick action commands
  getQuickActions: () => {
    const selectedStudent = get().selectedStudent;
    if (!selectedStudent) {
      return [
        { command: '/search', label: 'Search Students', icon: '🔍' },
        { command: '/timetable', label: 'Timetable Overview', icon: '📅' },
        { command: '/stats', label: 'School Stats', icon: '📊' },
        { command: '/help', label: 'Help', icon: '❓' }
      ];
    }
    
    return [
      { command: '/student', label: 'Student Profile', icon: '👦' },
      { command: '/attendance', label: 'Attendance', icon: '📅' },
      { command: '/payment', label: 'Payments', icon: '💳' },
      { command: '/parent', label: 'Parent Info', icon: '👨' },
      { command: '/reminder', label: 'Send Reminder', icon: '📢' }
    ];
  },

  // Auto-complete command
  getCommandSuggestions: (input) => {
    if (!input.startsWith('/')) return [];
    
    const allCommands = [
      '/select', '/search', '/student', '/attendance', '/payment', 
      '/parent', '/teacher', '/reminder', '/stats', '/strength',
      '/timetable', '/classTimetable', '/teacherTimetable', '/myTimetable', 
      '/studentTimetable', '/timetableStats',
      '/behaviorEmail', '/behaviorWhatsApp', '/behaviorBoth',
      '/announcements', '/help'
    ];
    
    return allCommands.filter(cmd => 
      cmd.toLowerCase().includes(input.toLowerCase())
    );
  }
}));
