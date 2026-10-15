import {
  LayoutGrid,
  UserRound,
  BookOpen,
  Search,
  MessageSquare,
  ArrowLeftRight,
  HelpCircle,
  LogOut,
  Send,
  MoreVertical,
  CheckCheck,
  Clock,
  Trophy
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { messageApi, skillApi } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("user");
  const { user, logoutUser } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedChatIndex, setSelectedChatIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversations on mount or when user changes
  const loadConversations = async (selectTargetId = targetUserId) => {
    try {
      const list = await messageApi.getConversations();

      // If targetUserId query param is passed, ensure it exists in conversation list
      if (selectTargetId) {
        const parsedTarget = parseInt(selectTargetId, 10);
        const existingIdx = list.findIndex(c => c.user_id === parsedTarget);

        if (existingIdx !== -1) {
          setConversations(list);
          setSelectedChatIndex(existingIdx);
        } else {
          // Fetch teacher info from searchTeachers to initialize chat thread
          try {
            const teachers = await skillApi.searchTeachers();
            const foundTeacher = teachers.find(t => t.user_id === parsedTarget);
            if (foundTeacher) {
              const newConv = {
                user_id: foundTeacher.user_id,
                full_name: foundTeacher.full_name,
                email: foundTeacher.email,
                skill: foundTeacher.offers.join(", ") || "Peer Trader",
                last_message: "Start a conversation to arrange your session...",
                last_message_time: new Date().toISOString(),
                unread_count: 0
              };
              const updatedList = [newConv, ...list];
              setConversations(updatedList);
              setSelectedChatIndex(0);
            } else {
              setConversations(list);
            }
          } catch (e) {
            setConversations(list);
          }
        }
      } else {
        setConversations(list);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user?.user_id, targetUserId]);

  const activeChat = conversations[selectedChatIndex] || null;

  // Load message history when activeChat changes
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await messageApi.getMessages(activeChat.user_id);
        if (isMounted) {
          setMessages(res.messages || []);
          // Clear unread in conversations list locally
          setConversations(prev =>
            prev.map(c => c.user_id === activeChat.user_id ? { ...c, unread_count: 0 } : c)
          );
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Auto-refresh messages every 4 seconds
    const interval = setInterval(async () => {
      try {
        const res = await messageApi.getMessages(activeChat.user_id);
        if (isMounted && res.messages) {
          setMessages(res.messages);
        }
      } catch (e) {
        // ignore polling error
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeChat?.user_id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChat || sending) return;

    const text = messageInput.trim();
    setMessageInput("");
    setSending(true);

    try {
      const res = await messageApi.sendMessage(activeChat.user_id, text);
      const newMsg = res.data;

      // Optimistically append to local messages list
      setMessages(prev => [...prev, newMsg]);

      // Update conversations list with latest message
      setConversations(prev =>
        prev.map(c =>
          c.user_id === activeChat.user_id
            ? { ...c, last_message: text, last_message_time: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      alert(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { name: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { name: "My Profile", icon: UserRound, path: "/profile" },
    { name: "Skills", icon: BookOpen, path: "/discover" },
    { name: "Search", icon: Search, path: "/discover" },
    { name: "Messages", icon: MessageSquare, path: "/messages" },
    { name: "Requests", icon: ArrowLeftRight, path: "/requests" },
  ];

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return c.full_name?.toLowerCase().includes(q) || c.skill?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#06194F] text-white">
      <div className="min-h-screen flex">
        {/* SIDEBAR */}
        <aside className="hidden md:flex w-[280px] bg-[#F2F3FF] text-[#26365D] flex-col shrink-0 border-r border-[#D9DEFA]">
          <div className="px-7 pt-7 pb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#2864E8] flex items-center justify-center">
                <span className="text-white font-bold text-lg">↕</span>
              </div>
              <span className="text-[#06194F] text-[22px] font-extrabold">SkillSwap</span>
            </div>
          </div>

          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = item.name === "Messages";
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-[#2864E8] text-white shadow-sm"
                      : "text-[#3F465F] hover:bg-[#E3E7FF]"
                  }`}
                >
                  <Icon size={17} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto px-3 pb-6">
            <button
              onClick={() => navigate("/post-skill")}
              className="w-full bg-[#2864E8] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#1D55CC] transition"
            >
              + Post a Skill
            </button>

            <div className="mt-6 space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#3F465F] hover:bg-[#E3E7FF] rounded-lg"
              >
                <LogOut size={17} />
                Log out
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 overflow-hidden">
          <div className="h-screen flex flex-col">
            {/* Top Page Header */}
            <div className="px-6 md:px-8 py-5 border-b border-[#1C3975] flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Direct Messaging</h1>
                <p className="text-[#9DAACB] text-xs md:text-sm mt-0.5">
                  Coordinate time, place, and exchange details with peer teachers and students.
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Column: Conversations List */}
              <section className="w-[320px] md:w-[360px] shrink-0 border-r border-[#1C3975] bg-[#091F55] flex flex-col">
                {/* Search */}
                <div className="p-4 border-b border-[#152F64]">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8390B2]" />
                    <input
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full h-10 bg-[#162F66] rounded-xl pl-9 pr-3 text-xs md:text-sm text-white placeholder:text-[#8390B2] outline-none focus:ring-1 focus:ring-[#2864E8]"
                    />
                  </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto divide-y divide-[#152F64]">
                  {loadingConversations ? (
                    <div className="py-10 text-center text-xs text-[#9DAACB]">Loading conversations...</div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="py-12 px-6 text-center space-y-3">
                      <p className="text-xs text-[#9DAACB]">No conversations found.</p>
                      <button
                        onClick={() => navigate("/discover")}
                        className="bg-[#2864E8] hover:bg-[#1D55CC] text-white text-xs px-4 py-2 rounded-xl font-semibold transition"
                      >
                        Explore Teachers to Message
                      </button>
                    </div>
                  ) : (
                    filteredConversations.map((chat, index) => {
                      const isSelected = activeChat?.user_id === chat.user_id;
                      return (
                        <button
                          key={chat.user_id}
                          onClick={() => setSelectedChatIndex(index)}
                          className={`w-full text-left px-4 py-3.5 flex gap-3 hover:bg-[#122A5F] transition ${
                            isSelected ? "bg-[#122A5F] border-l-4 border-[#2864E8]" : ""
                          }`}
                        >
                          <div className="w-11 h-11 rounded-full bg-[#E5ECFC] text-[#2864E8] flex items-center justify-center font-bold text-base shrink-0">
                            {chat.full_name?.charAt(0) || "U"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-baseline gap-2">
                              <h3 className="font-semibold text-sm truncate text-white">
                                {chat.full_name}
                              </h3>
                              {chat.last_message_time && (
                                <span className="text-[10px] text-[#8293B8] shrink-0">
                                  {new Date(chat.last_message_time).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric"
                                  })}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-[#6EA0FF] truncate mt-0.5 font-medium">
                              {chat.skill}
                            </p>

                            <p className="text-xs text-[#AEBBD8] truncate mt-1">
                              {chat.last_message || "No messages yet"}
                            </p>
                          </div>

                          {chat.unread_count > 0 && (
                            <div className="w-5 h-5 rounded-full bg-[#2864E8] flex items-center justify-center text-[10px] font-bold shrink-0 self-center">
                              {chat.unread_count}
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Right Column: Active Chat */}
              <section className="flex-1 flex flex-col bg-[#06194F]">
                {activeChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="px-6 py-3.5 border-b border-[#1C3975] flex items-center justify-between bg-[#0A205A]/40">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E5ECFC] text-[#2864E8] flex items-center justify-center font-bold text-base shrink-0">
                          {activeChat.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h2 className="font-bold text-sm md:text-base text-white">{activeChat.full_name}</h2>
                          <p className="text-xs text-[#55E0B0] flex items-center gap-1 font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#55E0B0] inline-block" />
                            {activeChat.skill} • {activeChat.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate("/discover")}
                          className="text-xs text-[#8EA1D0] hover:text-white bg-[#142E68] px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          Find Skills
                        </button>
                      </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {loadingMessages && messages.length === 0 ? (
                        <div className="py-12 text-center text-xs text-[#9DAACB]">Loading chat history...</div>
                      ) : messages.length === 0 ? (
                        <div className="py-12 text-center text-xs text-[#9DAACB]">
                          No messages yet in this conversation. Send a message below to agree on a time and place!
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isMe = parseInt(msg.sender_id, 10) === parseInt(user?.user_id, 10);
                          return (
                            <div
                              key={msg.message_id}
                              className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2.5`}
                            >
                              {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-[#E5ECFC] text-[#2864E8] flex items-center justify-center text-xs font-bold shrink-0 self-end">
                                  {activeChat.full_name?.charAt(0) || "U"}
                                </div>
                              )}

                              <div className={`max-w-[80%] md:max-w-[500px] ${isMe ? "items-end" : "items-start"}`}>
                                <div
                                  className={`rounded-2xl px-4 py-2.5 text-sm ${
                                    isMe
                                      ? "bg-[#2864E8] text-white rounded-br-sm shadow-md"
                                      : "bg-[#1E3773] text-[#F0F3FA] rounded-bl-sm border border-[#2D4A94]"
                                  }`}
                                >
                                  <p className="leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>
                                </div>

                                <div
                                  className={`flex items-center gap-1 mt-1 text-[10px] text-[#7185AE] ${
                                    isMe ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                  {isMe && (
                                    <CheckCheck
                                      size={13}
                                      className={msg.is_read ? "text-[#55E0B0]" : "text-[#7185AE]"}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input Box */}
                    <div className="p-4 border-t border-[#1C3975] bg-[#0A205A]/30">
                      <div className="flex items-center gap-3 bg-[#13295F] border border-[#23458E] rounded-xl p-2 focus-within:border-[#2864E8] transition">
                        <input
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={`Message ${activeChat.full_name}...`}
                          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-[#8390B2] px-2"
                        />

                        <button
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim() || sending}
                          className="w-10 h-10 rounded-lg bg-[#2864E8] hover:bg-[#1D55CC] text-white flex items-center justify-center transition disabled:opacity-40 shrink-0"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#9DAACB]">
                    <MessageSquare size={48} className="text-[#2D458B] mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">Your Direct Messages</h3>
                    <p className="text-xs max-w-sm mb-4">
                      Select a conversation on the left or browse teachers in Skills to coordinate your swap sessions.
                    </p>
                    <button
                      onClick={() => navigate("/discover")}
                      className="bg-[#2864E8] hover:bg-[#1D55CC] text-white text-xs px-5 py-2.5 rounded-xl font-semibold transition"
                    >
                      Browse Teachers
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Messages;