import {
    useState,
    useEffect,
    useRef,
    useLayoutEffect,
    useCallback,
    startTransition,
} from "react";
import {
    Trash2,
    Edit,
    Moon,
    Sun,
    MessageCirclePlus,
    PanelRightClose,
    PanelRightOpen,
    MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    chatClient,
    configureChatClient,
    type Conversation,
} from "../api/chat-client";
import ChatContent from "./chat-content";
import ConfirmationDialog from "./confirmation-dialog";

// Create a safe useLayoutEffect that falls back to useEffect during SSR
const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Configuration for local development debugging
 */
export interface LocalDebugConfig {
    /** Username for local authentication */
    username: string;
    /** Password for local authentication */
    password: string;
    /** Base URL for the local API server */
    baseUrl: string;
}

/**
 * Props for the NeptuneChatBot component
 *
 * @example
 * ```tsx
 * <NeptuneChatBot
 *   agentId="your-agent-id"
 *   theme="dark"
 *   title="My Assistant"
 *   messageBubbleColor="#E5E3F8"
 * />
 * ```
 */
export interface NeptuneChatBotProps {
    /**
     * Unique identifier for the AI agent
     * @required
     */
    agentId: string;

    /**
     * Color theme for the chat interface
     * @default "light"
     */
    theme?: "light" | "dark";

    /**
     * Configuration for local development debugging
     */
    localDebug?: LocalDebugConfig;

    /**
     * Title displayed in the chat header
     * @default "Naia"
     */
    title?: string;

    /**
     * Background color for message bubbles in light mode
     * @default "#E5E3F8"
     * @example "#E5E3F8" or "rgba(229, 227, 248, 1)"
     */
    messageBubbleColor?: string;

    /**
     * Background color for message bubbles in dark mode
     * @default "rgba(168, 140, 250, 0.3)"
     */
    messageBubbleColorDark?: string;

    /**
     * Accent color for buttons and interactive elements in light mode
     * @default "#8B7FD9"
     */
    accentColor?: string;

    /**
     * Accent color for buttons and interactive elements in dark mode
     * @default "#A88CFA"
     */
    accentColorDark?: string;

    /**
     * Color for the scroll-to-bottom button in light mode
     * @default "#6366F1"
     */
    scrollButtonColor?: string;

    /**
     * Color for the scroll-to-bottom button in dark mode
     * @default "#818CF8"
     */
    scrollButtonColorDark?: string;

    /**
     * Text displayed while the AI is generating a response
     * @default "NAIA is working on it..."
     */
    streamingText?: string;

    /**
     * Color of the streaming indicator text in light mode
     * @default "#2563EB"
     */
    streamingTextColor?: string;

    /**
     * Color of the streaming indicator text in dark mode
     * @default "#818CF8"
     */
    streamingTextColorDark?: string;

    /**
     * Primary welcome message shown on the initial screen
     * @default "Hi there!"
     */
    welcomeMessagePrimary?: string;

    /**
     * Secondary welcome message shown below the primary message
     * @default "How can I help you today?"
     */
    welcomeMessageSecondary?: string;

    /**
     * Path to a custom icon image for the welcome screen (supports png, svg, etc.)
     * @example "/logo.png" or "https://example.com/icon.svg"
     */
    welcomeIcon?: string;

    /**
     * Size of the welcome icon with CSS units
     * @default "10rem"
     * @example "10rem", "100px", "5em"
     */
    welcomeIconSize?: string;

    /**
     * Enable streaming responses from the AI
     * @default true
     */
    streaming?: boolean;

    /**
     * Background color for the sidebar in light mode
     * @default "#FAFAFA"
     */
    sidebarBackgroundColor?: string;

    /**
     * Background color for the sidebar in dark mode
     * @default "#1F1F1F"
     */
    sidebarBackgroundColorDark?: string;

    /**
     * Background color for the chat input field in light mode
     * @default "#FFFFFF"
     */
    inputBackgroundColor?: string;

    /**
     * Background color for the chat input field in dark mode
     * @default "#303030"
     */
    inputBackgroundColorDark?: string;

    /**
     * Background color for the header in light mode
     * @default "#FFFFFF"
     */
    headerBackgroundColor?: string;

    /**
     * Background color for the header in dark mode
     * @default "#1F1F1F"
     */
    headerBackgroundColorDark?: string;

    /**
     * Base color for vector search results in light mode
     * @default "#9333EA" (purple-600)
     * @example "#3B82F6" for blue, "#10B981" for green
     */
    vectorColor?: string;

    /**
     * Base color for vector search results in dark mode
     * @default "#A855F7" (purple-500)
     * @example "#60A5FA" for blue, "#34D399" for green
     */
    vectorColorDark?: string;

    /**
     * Callback fired when a tool starts executing during streaming
     * @param metadata - Event metadata containing tool information
     * @example
     * ```tsx
     * onToolStart={(metadata) => {
     *   console.log('Tool started:', metadata.toolName);
     * }}
     * ```
     */
    onToolStart?: (metadata: any) => void;

    /**
     * Callback fired when tool input is available during streaming
     * @param metadata - Event metadata containing tool input information
     * @example
     * ```tsx
     * onToolInput={(metadata) => {
     *   console.log('Tool input received:', metadata);
     * }}
     * ```
     */
    onToolInput?: (metadata: any) => void;

    /**
     * Callback fired when a tool finishes executing during streaming
     * @param metadata - Event metadata containing tool output information
     * @example
     * ```tsx
     * onToolFinish={(metadata) => {
     *   console.log('Tool finished:', metadata);
     * }}
     * ```
     */
    onToolFinish?: (metadata: any) => void;

    /**
     * Callback fired for each text chunk received during streaming
     * @param chunk - The text chunk received
     * @example
     * ```tsx
     * onChunk={(chunk) => {
     *   console.log('Received chunk:', chunk);
     * }}
     * ```
     */
    onChunk?: (chunk: string) => void;

    /**
     * Callback fired when streaming finishes
     * @param metadata - Final response metadata
     * @example
     * ```tsx
     * onFinish={(metadata) => {
     *   console.log('Streaming finished:', metadata);
     * }}
     * ```
     */
    onFinish?: (metadata: any) => void;
}

export function NeptuneChatBot({
    agentId: propAgentId,
    theme: propTheme = "light",
    localDebug: propLocalDebug,
    title: propTitle = "Naia",
    messageBubbleColor = "#E5E3F8",
    messageBubbleColorDark = "rgba(168, 140, 250, 0.3)",
    accentColor = "#8B7FD9",
    accentColorDark = "#A88CFA",
    scrollButtonColor = "#6366F1",
    scrollButtonColorDark = "#818CF8",
    streamingText = "NAIA is working on it...",
    streamingTextColor = "#2563EB",
    streamingTextColorDark = "#60A5FA",
    welcomeMessagePrimary = "How can I help you today?",
    welcomeMessageSecondary = "Feel free to ask any question you like — just be precise, as if you're speaking to a real person.",
    welcomeIcon,
    welcomeIconSize = "4rem",
    streaming = true,
    sidebarBackgroundColor = "#f9f9f9",
    onToolStart,
    onToolInput,
    onToolFinish,
    onChunk,
    onFinish,
    sidebarBackgroundColorDark = "#171717",
    inputBackgroundColor = "#ffffff",
    inputBackgroundColorDark = "#303030",
    headerBackgroundColor = "#ffffff",
    headerBackgroundColorDark = "#171717",
    vectorColor = "#9333EA",
    vectorColorDark = "#A855F7",
}: NeptuneChatBotProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<
        string | null
    >(null);
    const [selectedConversation, setSelectedConversation] =
        useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [titleInput, setTitleInput] = useState("");
    const [isSavingTitle, setIsSavingTitle] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [conversationToRename, setConversationToRename] =
        useState<Conversation | null>(null);
    const [theme, setTheme] = useState<"light" | "dark">(propTheme);
    const [agentId] = useState<string>(propAgentId);
    const [initialAssistantIdChecked] = useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const [isResizing, setIsResizing] = useState(false);

    const titleInputRef = useRef<HTMLInputElement>(null);
    const resizeHandleRef = useRef<HTMLDivElement>(null);
    const hasFetchedRef = useRef(false);
    const minSidebarWidth = 200;
    const maxSidebarWidth = 600;

    // Configure chat client with localDebug credentials
    useEffect(() => {
        if (propLocalDebug) {
            configureChatClient(propLocalDebug);
        }
    }, [propLocalDebug]);

    const applyTheme = useCallback((newTheme: "light" | "dark") => {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.remove("light");

        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        }
        // Store theme preference
        localStorage.setItem("theme", newTheme);
    }, []);

    // Ensure theme is applied whenever theme state changes
    useEffect(() => {
        applyTheme(theme);
    }, [theme, applyTheme]);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        applyTheme(newTheme);

        document.body.style.opacity = "0.99";
        setTimeout(() => {
            document.body.style.opacity = "1";
        }, 1);
    };

    // Handle sidebar resizing with mouse
    const startResizing = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = e.clientX;
            const clampedWidth = Math.max(
                minSidebarWidth,
                Math.min(newWidth, maxSidebarWidth),
            );
            setSidebarWidth(clampedWidth);
        };
        const handleMouseUp = () => {
            setIsResizing(false);
        };
        if (isResizing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.classList.add("resize-active");
        }
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.classList.remove("resize-active");
        };
    }, [isResizing]);

    const categorizeConversationsByDate = useCallback(
        (conversations: Conversation[]) => {
            const now = new Date();
            const today = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
            );
            const thresholds = {
                Yesterday: new Date(today.getTime() - 24 * 60 * 60 * 1000),
                "Last 7 Days": new Date(
                    today.getTime() - 7 * 24 * 60 * 60 * 1000,
                ),
                "Last 30 Days": new Date(
                    today.getTime() - 30 * 24 * 60 * 60 * 1000,
                ),
            };

            const groups: Record<string, Conversation[]> = {
                Today: [],
                Yesterday: [],
                "Last 7 Days": [],
                "Last 30 Days": [],
                Older: [],
            };

            conversations.forEach((conv) => {
                try {
                    const convDate = new Date(conv.updatedAt);
                    const key =
                        convDate >= today
                            ? "Today"
                            : convDate >= thresholds.Yesterday
                            ? "Yesterday"
                            : convDate >= thresholds["Last 7 Days"]
                            ? "Last 7 Days"
                            : convDate >= thresholds["Last 30 Days"]
                            ? "Last 30 Days"
                            : "Older";
                    groups[key].push(conv);
                } catch {
                    groups.Older.push(conv);
                }
            });

            Object.values(groups).forEach((group) =>
                group.sort(
                    (a, b) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime(),
                ),
            );

            return groups;
        },
        [],
    );

    useEffect(() => {
        const fetchConversations = async () => {
            if (!initialAssistantIdChecked || hasFetchedRef.current) {
                return;
            }

            hasFetchedRef.current = true;
            setIsLoading(true);
            try {
                const data = await chatClient.conversations.getAll(agentId);
                if (!Array.isArray(data)) {
                    console.error(
                        "Expected array of conversations but got:",
                        data,
                    );
                    setConversations([]);
                    return;
                }
                setConversations(data);
                // Always start with new chat page (empty state)
                // Create temp conversation for empty state regardless of whether there are existing conversations
                const tempConversation: Conversation = {
                    id: `temp-${Date.now()}`,
                    title: "New Chat",
                    messages: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isTemporary: true,
                };
                setSelectedConversation(tempConversation);
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setIsLoading(false);
                setInitialLoadComplete(true); // Mark initial load as complete
            }
        };
        fetchConversations();
    }, [agentId, initialAssistantIdChecked]);

    const loadConversationData = async (id: string) => {
        setIsLoadingMessages(true);
        try {
            const fullConversation = await chatClient.conversations.get(id);
            setSelectedConversation(fullConversation);

            // Let ChatContent component handle its own scrolling internally
            // This prevents any possibility of accidentally scrolling the sidebar
        } catch (error) {
            console.error(
                `Failed to load conversation data for ID ${id}:`,
                error,
            );
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const refreshSelectedConversation = async () => {
        if (!selectedConversationId) return;

        try {
            const updatedConversation = await chatClient.conversations.get(
                selectedConversationId,
            );

            // Update the conversations list with the updated conversation
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === selectedConversationId
                        ? updatedConversation
                        : conv,
                ),
            );

            // Update the selected conversation
            setSelectedConversation(updatedConversation);
        } catch (error) {
            console.error("Failed to refresh selected conversation:", error);
        }
    };

    const selectConversation = useCallback((id: string) => {
        setSelectedConversationId(id);

        if (id.startsWith("temp-")) {
            setConversations((prev) => {
                const tempConv = prev.find((conv) => conv.id === id);
                if (tempConv) {
                    setSelectedConversation(tempConv);
                }
                return prev;
            });
        } else {
            loadConversationData(id);
        }
    }, []);

    const createNewConversation = async () => {
        try {
            // Check if there's already a temporary conversation
            const existingTempConv = conversations.find(
                (conv) => conv.isTemporary,
            );

            if (existingTempConv) {
                // If there's already a temporary conversation, just select it
                selectConversation(existingTempConv.id);
                return;
            }

            // Create a temporary conversation immediately without API call
            const tempConversation: Conversation = {
                id: `temp-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(7)}`,
                title: "New Chat",
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isTemporary: true, // Mark as temporary
            };

            // Set the conversation as selected immediately (but don't add to sidebar list)
            setSelectedConversationId(tempConversation.id);
            setSelectedConversation(tempConversation);
        } catch (error) {
            console.error("Failed to create new conversation:", error);
        }
    };

    const handleThreadCreated = useCallback(
        (oldId: string, newId: string, backendConversation?: Conversation) => {
            startTransition(() => {
                if (backendConversation) {
                    const updatedConv = {
                        ...backendConversation,
                        isTemporary: false,
                    };

                    setConversations((prev) => [
                        updatedConv,
                        ...prev.filter((conv) => conv.id !== oldId),
                    ]);
                    setSelectedConversationId(newId);
                    setSelectedConversation((current) =>
                        current?.id === oldId
                            ? {
                                  ...backendConversation,
                                  id: newId,
                                  isTemporary: false,
                                  messages: current.messages,
                              }
                            : current,
                    );
                } else {
                    setSelectedConversation((current) => {
                        if (current?.id !== oldId) return current;

                        const updated = {
                            ...current,
                            id: newId,
                            isTemporary: false,
                        };
                        setConversations((prev) => {
                            const idx = prev.findIndex(
                                (c) => c.id === oldId || c.id === newId,
                            );
                            return idx !== -1
                                ? [
                                      ...prev.slice(0, idx),
                                      updated,
                                      ...prev.slice(idx + 1),
                                  ]
                                : [updated, ...prev];
                        });
                        setSelectedConversationId(newId);
                        return updated;
                    });
                }
            });
        },
        [],
    );

    const deleteConversation = async (id: string) => {
        try {
            await chatClient.conversations.delete(id);
            const updatedConversations = conversations.filter(
                (conv) => conv.id !== id,
            );
            setConversations(updatedConversations);

            if (selectedConversationId === id) {
                const tempConversation: Conversation = {
                    id: `temp-${Date.now()}`,
                    title: "New Chat",
                    messages: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isTemporary: true,
                };
                setSelectedConversationId(tempConversation.id);
                setSelectedConversation(tempConversation);
            }
        } catch (error) {
            console.error("Failed to delete conversation:", error);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setPendingDeleteId(id);
        setDeleteDialogOpen(true);
        setOpenMenuId(null);
    };

    const toggleConversationMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleRenameClick = (
        e: React.MouseEvent,
        conversation: Conversation,
    ) => {
        e.stopPropagation();
        setConversationToRename(conversation);
        setTitleInput(conversation.title || "New Chat");
        setIsRenameDialogOpen(true);
        setOpenMenuId(null);
    };

    const handleConfirmRename = async () => {
        if (!conversationToRename || !titleInput.trim()) {
            setIsRenameDialogOpen(false);
            setConversationToRename(null);
            return;
        }

        setIsSavingTitle(true);
        try {
            await chatClient.conversations.update(conversationToRename.id, {
                title: titleInput.trim(),
            });
            const updatedConv = {
                ...conversationToRename,
                title: titleInput.trim(),
            };

            // Update conversations list
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === conversationToRename.id ? updatedConv : conv,
                ),
            );

            // Update selected conversation if it's the one being renamed
            if (selectedConversationId === conversationToRename.id) {
                setSelectedConversation(updatedConv);
            }
        } catch (error) {
            console.error("Failed to update conversation title:", error);
        } finally {
            setIsSavingTitle(false);
            setIsRenameDialogOpen(false);
            setConversationToRename(null);
        }
    };

    const handleCancelRename = () => {
        setIsRenameDialogOpen(false);
        setConversationToRename(null);
        setTitleInput("");
    };

    const confirmDelete = async () => {
        if (pendingDeleteId) {
            await deleteConversation(pendingDeleteId);
            setDeleteDialogOpen(false);
            setPendingDeleteId(null);
        }
    };

    useIsomorphicLayoutEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        if (openMenuId) {
            document.addEventListener("click", handleClickOutside);
            return () =>
                document.removeEventListener("click", handleClickOutside);
        }
    }, [openMenuId]);

    return (
        <>
            {/* Initial loading screen - prevents flash of content */}
            {!initialLoadComplete && (
                <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">
                            Loading...
                        </p>
                    </div>
                </div>
            )}

            {/* Main app UI */}
            <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
                {/* Add a style for preventing text selection during resize */}
                <style>{`
        .resize-active {
          cursor: col-resize;
          user-select: none;
        }
      `}</style>

                {/* Confirmation Dialog for Delete Conversation */}
                <ConfirmationDialog
                    isOpen={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Conversation"
                    message="Are you sure you want to delete this conversation? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    confirmButtonClass="bg-red-500 hover:bg-red-600"
                />

                {/* Rename Dialog */}
                {isRenameDialogOpen && (
                    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-120 max-w-[90vw]">
                            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                                Rename Conversation
                            </h3>
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={titleInput}
                                onChange={(e) => setTitleInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                        handleConfirmRename();
                                    else if (e.key === "Escape")
                                        handleCancelRename();
                                }}
                                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                placeholder="Enter conversation title"
                                disabled={isSavingTitle}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={handleCancelRename}
                                    disabled={isSavingTitle}
                                    className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmRename}
                                    disabled={
                                        isSavingTitle || !titleInput.trim()
                                    }
                                    className="px-4 py-2 text-sm text-white rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {isSavingTitle ? "Saving..." : "Rename"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile backdrop overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
                            onClick={() => setSidebarOpen(false)}
                            aria-hidden="true"
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: sidebarWidth, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{
                                duration: 0.3,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                            className="bg-[#f9f9f9] dark:bg-gray-900 dark:!bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full relative z-20 overflow-hidden"
                        >
                            <div className="flex flex-col h-full">
                                <div
                                    className="flex-1 overflow-y-auto p-2"
                                    style={{
                                        backgroundColor:
                                            theme === "dark"
                                                ? sidebarBackgroundColorDark
                                                : sidebarBackgroundColor,
                                    }}
                                >
                                    <div className="flex-1">
                                        {isLoading ? (
                                            <div className="space-y-4"></div>
                                        ) : conversations.length > 0 ? (
                                            <div className="space-y-0">
                                                {(() => {
                                                    const groupedConversations =
                                                        categorizeConversationsByDate(
                                                            conversations,
                                                        );
                                                    return Object.entries(
                                                        groupedConversations,
                                                    )
                                                        .map(
                                                            ([
                                                                groupName,
                                                                groupConversations,
                                                            ]) => {
                                                                if (
                                                                    groupConversations.length ===
                                                                    0
                                                                )
                                                                    return null;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            groupName
                                                                        }
                                                                        className="mb-4"
                                                                    >
                                                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide">
                                                                            {
                                                                                groupName
                                                                            }
                                                                        </div>
                                                                        <div className="space-y-0">
                                                                            {groupConversations.map(
                                                                                (
                                                                                    conversation,
                                                                                ) => {
                                                                                    // Check if conversation has waiting state at conversation level OR any waiting messages
                                                                                    const hasWaitingMessages =
                                                                                        conversation.waiting ===
                                                                                            true ||
                                                                                        conversation.messages?.some(
                                                                                            (
                                                                                                message,
                                                                                            ) =>
                                                                                                message.waiting ===
                                                                                                true,
                                                                                        ) ||
                                                                                        false;

                                                                                    return (
                                                                                        <div
                                                                                            key={
                                                                                                conversation.id
                                                                                            }
                                                                                            onClick={() => {
                                                                                                selectConversation(
                                                                                                    conversation.id,
                                                                                                );
                                                                                                // On mobile, close sidebar after selecting a conversation
                                                                                                if (
                                                                                                    window.innerWidth <
                                                                                                    1024
                                                                                                ) {
                                                                                                    setSidebarOpen(
                                                                                                        false,
                                                                                                    );
                                                                                                }
                                                                                            }}
                                                                                            className={`flex items-center w-full pl-4 pr-2 py-2 mb-1 rounded-xl text-left group cursor-pointer ${
                                                                                                selectedConversationId ===
                                                                                                conversation.id
                                                                                                    ? "text-gray-800 dark:text-gray-200"
                                                                                                    : "text-gray-800 dark:text-gray-100 conversation-item-background"
                                                                                            }`}
                                                                                            style={
                                                                                                selectedConversationId ===
                                                                                                conversation.id
                                                                                                    ? {
                                                                                                          backgroundColor:
                                                                                                              theme ===
                                                                                                              "dark"
                                                                                                                  ? messageBubbleColorDark
                                                                                                                  : messageBubbleColor,
                                                                                                      }
                                                                                                    : undefined
                                                                                            }
                                                                                        >
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <div className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                                                                                                        {conversation.title ||
                                                                                                            "New Chat"}
                                                                                                    </div>
                                                                                                    {hasWaitingMessages && (
                                                                                                        <div className="flex-shrink-0">
                                                                                                            <div
                                                                                                                className="w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse"
                                                                                                                title="Waiting for input"
                                                                                                            ></div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                            {/* Hide menu button for temporary conversations */}
                                                                                            {!conversation.isTemporary && (
                                                                                                <div className="relative">
                                                                                                    <button
                                                                                                        onClick={(
                                                                                                            e,
                                                                                                        ) =>
                                                                                                            toggleConversationMenu(
                                                                                                                e,
                                                                                                                conversation.id,
                                                                                                            )
                                                                                                        }
                                                                                                        className="p-1.5 cursor-pointer rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 opacity-0 hover:bg-gray-300 dark:hover:bg-gray-700 group-hover:opacity-100 transition-opacity"
                                                                                                        aria-label="More options"
                                                                                                    >
                                                                                                        <MoreHorizontal
                                                                                                            size={
                                                                                                                16
                                                                                                            }
                                                                                                        />
                                                                                                    </button>

                                                                                                    {openMenuId ===
                                                                                                        conversation.id && (
                                                                                                        <div className="absolute right-0 top-10 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 p-2">
                                                                                                            <button
                                                                                                                onClick={(
                                                                                                                    e,
                                                                                                                ) =>
                                                                                                                    handleRenameClick(
                                                                                                                        e,
                                                                                                                        conversation,
                                                                                                                    )
                                                                                                                }
                                                                                                                className="w-full text-left px-3 py-2 text-md flex cursor-pointer items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md"
                                                                                                            >
                                                                                                                <Edit
                                                                                                                    size={
                                                                                                                        14
                                                                                                                    }
                                                                                                                />
                                                                                                                Rename
                                                                                                            </button>
                                                                                                            <button
                                                                                                                onClick={(
                                                                                                                    e,
                                                                                                                ) =>
                                                                                                                    handleDeleteClick(
                                                                                                                        e,
                                                                                                                        conversation.id,
                                                                                                                    )
                                                                                                                }
                                                                                                                className="w-full text-left px-3 py-2 text-md text-red-600 cursor-pointer flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md"
                                                                                                            >
                                                                                                                <Trash2
                                                                                                                    size={
                                                                                                                        14
                                                                                                                    }
                                                                                                                />
                                                                                                                Delete
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                },
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            },
                                                        )
                                                        .filter(Boolean);
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                No conversations yet
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div
                                ref={resizeHandleRef}
                                onMouseDown={startResizing}
                                className="w-1 hover:w-2 bg-gray-300 dark:bg-gray-700 h-full cursor-col-resize transition-all hover:bg-indigo-500 dark:hover:bg-indigo-400 z-30 relative"
                                title="Drag to resize"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <header
                        className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4"
                        style={{
                            backgroundColor:
                                theme === "dark"
                                    ? headerBackgroundColorDark
                                    : headerBackgroundColor,
                        }}
                    >
                        <div className="flex items-center">
                            <>
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 cursor-pointer rounded-lg text-gray-500 disabled:opacity-50 transition-colors"
                                    style={{
                                        backgroundColor: "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            theme === "dark"
                                                ? messageBubbleColorDark
                                                : messageBubbleColor;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "transparent";
                                    }}
                                    title="Toggle Sidebar"
                                    aria-label="Toggle Sidebar"
                                >
                                    {sidebarOpen ? (
                                        <PanelRightOpen size={20} />
                                    ) : (
                                        <PanelRightClose size={20} />
                                    )}
                                </button>

                                <button
                                    onClick={createNewConversation}
                                    className="p-2 cursor-pointer rounded-lg text-gray-500 disabled:opacity-50 transition-colors"
                                    style={{
                                        backgroundColor: "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            theme === "dark"
                                                ? messageBubbleColorDark
                                                : messageBubbleColor;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "transparent";
                                    }}
                                    title="New Chat"
                                    aria-label="New Chat"
                                >
                                    <MessageCirclePlus size={20} />
                                </button>
                            </>
                        </div>

                        {/* Center Logo with Text */}
                        <div className="flex items-center justify-center">
                            <div className="relative flex items-center">
                                <span className="text-2xl font-bold mr-1">
                                    {propTitle}
                                </span>
                                {/* <img
                  src={getAssetPath('naia.svg')}
                  alt="NAIA"
                  width={20}
                  height={20}
                  className="opacity-70 -mt-4"
                /> */}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleTheme}
                                className="p-2 cursor-pointer rounded-lg text-gray-500 transition-colors"
                                style={{
                                    backgroundColor: "transparent",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        theme === "dark"
                                            ? messageBubbleColorDark
                                            : messageBubbleColor;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "transparent";
                                }}
                                title={`Switch to ${
                                    theme === "dark" ? "light" : "dark"
                                } mode`}
                                aria-label={`Switch to ${
                                    theme === "dark" ? "light" : "dark"
                                } mode`}
                            >
                                {theme === "dark" ? (
                                    <Sun size={20} />
                                ) : (
                                    <Moon size={20} />
                                )}
                            </button>
                        </div>
                    </header>

                    {/* Main content with dynamic width */}
                    <div
                        className={`flex-1 overflow-hidden bg-white dark:bg-gray-900 text-lg transition-all duration-300 ${
                            false ? "flex" : "flex justify-center"
                        }`}
                    >
                        <div
                            className={`flex flex-col transition-all duration-300 ${
                                false ? "w-full" : "w-full max-w-6xl"
                            }`}
                        >
                            {isLoading || !initialAssistantIdChecked ? (
                                <div className="flex h-full items-center justify-center">
                                    <div className="animate-pulse text-gray-500">
                                        {isLoading
                                            ? "Loading conversations..."
                                            : "Initializing Assistant..."}
                                    </div>
                                </div>
                            ) : !agentId ? (
                                <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                                    <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                                        Agent Not Configured
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 max-w-md">
                                        The Agent ID is missing or invalid.
                                        Please ensure it is provided in the URL
                                        parameters (e.g.,{" "}
                                        <code>?agentId=your-id-here</code>).
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
                                        If you continue to see this message,
                                        please contact support.
                                    </p>
                                </div>
                            ) : isLoadingMessages && selectedConversationId ? (
                                <div className="flex h-full items-center justify-center">
                                    <div className="animate-pulse text-gray-500">
                                        Loading messages...
                                    </div>
                                </div>
                            ) : selectedConversation ? (
                                <ChatContent
                                    conversation={selectedConversation}
                                    agentId={agentId}
                                    onConversationUpdate={
                                        refreshSelectedConversation
                                    }
                                    theme={theme}
                                    onSidebarToggle={() =>
                                        setSidebarOpen(false)
                                    }
                                    onThreadCreated={handleThreadCreated}
                                    messageBubbleColor={
                                        theme === "dark"
                                            ? messageBubbleColorDark
                                            : messageBubbleColor
                                    }
                                    accentColor={
                                        theme === "dark"
                                            ? accentColorDark
                                            : accentColor
                                    }
                                    scrollButtonColor={
                                        theme === "dark"
                                            ? scrollButtonColorDark
                                            : scrollButtonColor
                                    }
                                    streamingText={streamingText}
                                    streamingTextColor={
                                        theme === "dark"
                                            ? streamingTextColorDark
                                            : streamingTextColor
                                    }
                                    welcomeMessagePrimary={
                                        welcomeMessagePrimary
                                    }
                                    welcomeMessageSecondary={
                                        welcomeMessageSecondary
                                    }
                                    welcomeIcon={welcomeIcon}
                                    welcomeIconSize={welcomeIconSize}
                                    streaming={streaming}
                                    inputBackgroundColor={inputBackgroundColor}
                                    inputBackgroundColorDark={
                                        inputBackgroundColorDark
                                    }
                                    vectorColor={vectorColor}
                                    vectorColorDark={vectorColorDark}
                                    onToolStart={onToolStart}
                                    onToolInput={onToolInput}
                                    onToolFinish={onToolFinish}
                                    onChunk={onChunk}
                                    onFinish={onFinish}
                                />
                            ) : (
                                // Show loading while the useEffect handles conversation creation
                                <div className="flex h-full items-center justify-center">
                                    <div className="animate-pulse text-gray-500">
                                        {isCreatingConversation
                                            ? "Creating new conversation..."
                                            : conversations.length === 0
                                            ? "Creating new conversation..."
                                            : "Loading conversation..."}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
