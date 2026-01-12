import {
    useRef,
    useEffect,
    useState,
    useMemo,
    useCallback,
    lazy,
    Suspense,
    startTransition,
} from "react";
import { X, ArrowDownCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    chatClient,
    type Conversation,
    type Message,
} from "../api/chat-client";
import AnalyticsPanel from "./analytics-panel";

// Lazy load ChatInput
const ChatInput = lazy(() => import("./chat-input"));

// Lazy load ChatMessage
const DynamicChatMessage = lazy(() => import("./chat-message"));

interface ChatContentProps {
    conversation: Conversation;
    agentId: string;
    onConversationUpdate?: () => Promise<void>;
    theme?: "light" | "dark";
    onSidebarToggle?: () => void;
    isReadOnly?: boolean; // New prop for read-only mode
    onThreadCreated?: (oldId: string, newId: string) => void; // Callback when temp conversation becomes real
    messageBubbleColor?: string;
    accentColor?: string;
    scrollButtonColor?: string;
    streamingText?: string;
    streamingTextColor?: string;
    welcomeMessagePrimary?: string;
    welcomeMessageSecondary?: string;
    welcomeIcon?: string; // Path to icon (png, svg, etc.)
    welcomeIconSize?: string; // Size with CSS units (e.g., "10rem", "100px", "5em")
    streaming?: boolean;
    inputBackgroundColor?: string;
    inputBackgroundColorDark?: string;
    vectorColor?: string;
    vectorColorDark?: string;
    // Developer callbacks for streaming events
    onToolStart?: (metadata: any) => void;
    onToolInput?: (metadata: any) => void;
    onToolFinish?: (metadata: any) => void;
    onChunk?: (chunk: string) => void;
    onFinish?: (metadata: any) => void;
}

// Store static details of the streaming message outside of state
interface StreamingMessageRefData {
    id: string;
    role: Message["role"];
    createdAt: string;
}

// Error details structure
interface ErrorDetails {
    title: string;
    message: string;
}

const SCROLL_BOTTOM_THRESHOLD = 50; // Pixels from bottom to be considered "at bottom"

export default function ChatContent({
    conversation,
    agentId,
    theme,
    onSidebarToggle,
    isReadOnly = false,
    onThreadCreated,
    messageBubbleColor,
    accentColor,
    scrollButtonColor = "#6366F1",
    streamingText = "Naia is working on it...",
    streamingTextColor = "#2563EB",
    welcomeMessagePrimary = "How can I help you today?",
    welcomeMessageSecondary = "Feel free to ask any question you like — just be precise, as if you're speaking to a real person.",
    welcomeIcon,
    welcomeIconSize = "4rem",
    streaming = true,
    inputBackgroundColor = "#ffffff",
    inputBackgroundColorDark = "#303030",
    vectorColor,
    vectorColorDark,
    onToolStart,
    onToolInput,
    onToolFinish,
    onChunk,
    onFinish,
}: ChatContentProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>(
        conversation.messages || [],
    );
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState<Message | null>(
        null,
    );
    const streamingMessageRef = useRef<StreamingMessageRefData | null>(null);
    const previousConversationIdRef = useRef<string>(conversation.id);
    // Track the "stable" conversation key for animations - doesn't change during temp->real transitions
    const stableConversationKeyRef = useRef<string>(conversation.id);
    const [errorDialog, setErrorDialog] = useState<ErrorDetails | null>(null);
    const [showScrollToBottomButton, setShowScrollToBottomButton] =
        useState(false);
    const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

    const [openAnalytic, setOpenAnalytic] = useState<{
        name: string;
        data: string;
    } | null>(null);

    // Resizing state for chat-app divider
    const [chatWidth, setChatWidth] = useState(30); // Percentage width for chat area
    const [isResizingChatApp, setIsResizingChatApp] = useState(false);
    const chatAppResizeHandleRef = useRef<HTMLDivElement>(null);
    const chatAppContainerRef = useRef<HTMLDivElement>(null);
    const minChatWidth = 20; // Minimum 20% for chat
    const maxChatWidth = 80; // Maximum 80% for chat

    // Whether there are messages to display
    const hasMessages = messages.length > 0 || !!streamingMessage;

    // Whether any panel is open
    const hasOpenPanel = !!openAnalytic;

    // Waiting state for form widgets - simplified
    // Check if conversation or any message is in waiting state
    const isWaitingForInput = useMemo(() => {
        return (
            conversation.waiting === true ||
            messages.some((message) => message.waiting === true)
        );
    }, [conversation.waiting, messages]);

    // Combine finalized messages and the current streaming message
    const allMessages = useMemo(() => {
        const combined = [...messages];
        if (streamingMessage) {
            combined.push(streamingMessage);
        }
        // Sort messages by createdAt (streaming message will naturally be last)
        return combined.sort((a, b) => {
            return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
        });
    }, [messages, streamingMessage]);

    const scrollToBottom = useCallback(
        (behavior: ScrollBehavior = "smooth") => {
            messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
            const container = scrollContainerRef.current;
            if (container) container.scrollTop = container.scrollHeight;

            setTimeout(() => {
                document
                    .querySelector('[data-main-chat-scroll="true"]')
                    ?.scrollTo({
                        top:
                            document.querySelector(
                                '[data-main-chat-scroll="true"]',
                            )?.scrollHeight || 0,
                    });
            }, 10);

            setShowScrollToBottomButton(false);
            setUserHasScrolledUp(false);
        },
        [],
    );

    // Effect to handle user's manual scrolling behavior
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const isAtBottom =
                container.scrollHeight -
                    container.scrollTop -
                    container.clientHeight <
                SCROLL_BOTTOM_THRESHOLD;
            const isContentScrollable =
                container.scrollHeight > container.clientHeight;

            if (isAtBottom) {
                setShowScrollToBottomButton(false);
                setUserHasScrolledUp(false);
            } else {
                setUserHasScrolledUp(true);
                if (isContentScrollable) {
                    setShowScrollToBottomButton(true);
                } else {
                    setShowScrollToBottomButton(false);
                }
            }
        };

        container.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => container.removeEventListener("scroll", handleScroll);
    }, [allMessages]);

    // Effect to handle auto-scrolling or button visibility when new messages arrive
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || !hasMessages) {
            setShowScrollToBottomButton(false);
            return;
        }

        if (!userHasScrolledUp) {
            scrollToBottom("smooth");
        } else {
            const isContentScrollable =
                container.scrollHeight > container.clientHeight;
            if (isContentScrollable) {
                setShowScrollToBottomButton(true);
            } else {
                setShowScrollToBottomButton(false);
            }
        }
    }, [allMessages, scrollToBottom, userHasScrolledUp, hasMessages]);

    useEffect(() => {
        setShowScrollToBottomButton(false);
        setUserHasScrolledUp(false);

        const timeoutId = setTimeout(() => {
            scrollToBottom("auto");
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [conversation.id, scrollToBottom]);

    useEffect(() => {
        const conversationMessages = conversation.messages || [];
        const previousId = previousConversationIdRef.current;
        const currentId = conversation.id;

        const isTempToRealTransition =
            previousId?.startsWith("temp-") &&
            !currentId.startsWith("temp-") &&
            isStreaming;

        if (previousId !== currentId && !isTempToRealTransition) {
            setMessages(conversationMessages);
            previousConversationIdRef.current = currentId;
            stableConversationKeyRef.current = currentId;
            return;
        }

        if (isTempToRealTransition) {
            previousConversationIdRef.current = currentId;
        }

        if (isStreaming && !isTempToRealTransition) return;

        if (conversationMessages.length > 0 || isTempToRealTransition) {
            setMessages((prev) => {
                if (prev.length === 0) return conversationMessages;

                const filteredLocal = prev.filter((localMsg) => {
                    if (localMsg.role === "assistant") return true;

                    const localTime = new Date(localMsg.createdAt).getTime();
                    const isLocal = localMsg.id.startsWith("local-");

                    if (isLocal) {
                        return !conversationMessages.some((backendMsg) => {
                            const timeDiff = Math.abs(
                                new Date(backendMsg.createdAt).getTime() -
                                    localTime,
                            );
                            return (
                                backendMsg.role === localMsg.role &&
                                timeDiff < 5000
                            );
                        });
                    }
                    return true;
                });

                const seen = new Set();
                return [...filteredLocal, ...conversationMessages]
                    .filter(
                        (msg) => !seen.has(msg.id) && (seen.add(msg.id), true),
                    )
                    .sort(
                        (a, b) =>
                            new Date(a.createdAt).getTime() -
                            new Date(b.createdAt).getTime(),
                    );
            });
        }
    }, [conversation.id, conversation.messages, isStreaming]);

    // Separate effect to close panels when conversation changes
    useEffect(() => {
        if (openAnalytic) {
            setOpenAnalytic(null);
        }
    }, [conversation.id]); // Only depend on conversation.id, not openApp/openAnalytic

    // Effect to scroll to bottom when messages change (new user message added)
    useEffect(() => {
        // Always scroll to bottom when new messages are added
        if (messages.length > 0 && !userHasScrolledUp) {
            const timeoutId = setTimeout(() => {
                scrollToBottom("smooth");
            }, 50);

            return () => clearTimeout(timeoutId);
        }
    }, [messages.length, scrollToBottom, userHasScrolledUp]);

    // Effect to handle scrolling when conversation data loads (including initial load)
    useEffect(() => {
        // Trigger scroll when we have messages and the conversation changes
        if (conversation.messages && conversation.messages.length > 0) {
            // Multiple timeouts to ensure scrolling happens
            const timeouts = [
                setTimeout(() => scrollToBottom("auto"), 50),
                setTimeout(() => scrollToBottom("auto"), 200),
                setTimeout(() => scrollToBottom("auto"), 500),
            ];

            return () => timeouts.forEach(clearTimeout);
        }
    }, [conversation.messages, conversation.id, scrollToBottom]);

    // Effect to scroll when the component becomes visible with content
    useEffect(() => {
        if (hasMessages) {
            const timeoutId = setTimeout(() => {
                scrollToBottom("auto");
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [hasMessages, scrollToBottom]);

    // Clean-up streaming state on unmount
    useEffect(() => {
        return () => {
            setIsStreaming(false);
            setStreamingMessage(null);
            streamingMessageRef.current = null;
        };
    }, []);

    // Callback from ChatInput: Add the user's message to the list
    const handleAddUserMessage = useCallback(
        (message: Message) => {
            startTransition(() => {
                setMessages((prev) => [...prev, message]);
                setUserHasScrolledUp(false);
                setShowScrollToBottomButton(false);
            });

            setTimeout(
                () => {
                    scrollToBottom(
                        messages.length === 0 ? "instant" : "smooth",
                    );
                },
                messages.length === 0 ? 600 : 50,
            );
        },
        [messages.length, scrollToBottom],
    );

    // Callback from ChatInput: Streaming started
    const handleStreamStart = useCallback(() => {
        const newStreamingMessage: Message = {
            id: `stream-${Date.now()}`,
            role: "assistant",
            content: "",
            createdAt: new Date().toISOString(),
        };
        // Store static details in the ref
        streamingMessageRef.current = {
            id: newStreamingMessage.id,
            role: newStreamingMessage.role,
            createdAt: newStreamingMessage.createdAt,
        };

        // Set the state for rendering
        startTransition(() => {
            setStreamingMessage(newStreamingMessage);
            setIsStreaming(true);
        });
    }, []);

    // Callback from ChatInput: Tool execution started
    const handleToolExecutionStart = useCallback((toolName: string) => {
        setStreamingMessage((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                isToolExecuting: true,
                executingToolName: toolName,
            };
        });
    }, []);

    const handleToolExecutionEnd = useCallback(() => {
        setStreamingMessage((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                isToolExecuting: false,
                executingToolName: undefined,
            };
        });
    }, []);

    const pendingChunksRef = useRef<string>("");
    const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleStreamUpdate = useCallback((chunk: string) => {
        pendingChunksRef.current += chunk;

        if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);

        throttleTimerRef.current = setTimeout(() => {
            const chunks = pendingChunksRef.current;
            pendingChunksRef.current = "";

            setStreamingMessage((prev) =>
                prev
                    ? { ...prev, content: (prev.content || "") + chunks }
                    : null,
            );
        }, 50);
    }, []);

    const handleStreamEnd = useCallback(
        async (finalContent: string, metadata?: any) => {
            if (throttleTimerRef.current) {
                clearTimeout(throttleTimerRef.current);
                throttleTimerRef.current = null;
            }

            if (pendingChunksRef.current) {
                const chunks = pendingChunksRef.current;
                pendingChunksRef.current = "";
                setStreamingMessage((prev) =>
                    prev
                        ? { ...prev, content: (prev.content || "") + chunks }
                        : null,
                );
            }

            const streamDetails = streamingMessageRef.current;
            let messageToAdd: Message | null = null;

            if (streamDetails && finalContent?.trim()) {
                const hasFormWidget = /```widget:form\n[\s\S]*?\n```/.test(
                    finalContent,
                );
                const hasDecisionWidget =
                    /```(?:widget:decision|decision)\n[\s\S]*?\n```/.test(
                        finalContent,
                    );

                messageToAdd = {
                    id: `assistant-${Date.now()}`,
                    role: streamDetails.role,
                    createdAt: streamDetails.createdAt,
                    content: finalContent.trim(),
                    ...(hasFormWidget || hasDecisionWidget
                        ? { waiting: true }
                        : {}),
                    ...(metadata
                        ? {
                              metadata: {
                                  logId: metadata.logId,
                                  steps: metadata.steps,
                                  vectors: metadata.vectors,
                              },
                          }
                        : {}),
                };
            }

            if (messageToAdd) {
                setMessages((prev) => [...prev, messageToAdd]);
                streamingMessageRef.current = {
                    id: messageToAdd.id,
                    role: messageToAdd.role,
                    createdAt: messageToAdd.createdAt,
                };
                setTimeout(() => (streamingMessageRef.current = null), 1000);
            } else {
                streamingMessageRef.current = null;
            }

            setIsStreaming(false);
            setStreamingMessage(null);
        },
        [],
    );

    // Callback from ChatInput: An error occurred
    const handleError = useCallback((details: ErrorDetails) => {
        setIsStreaming(false);
        setStreamingMessage(null); // Clear any partial streaming message
        streamingMessageRef.current = null;
        setErrorDialog(details); // Set state to show the dialog
        setShowScrollToBottomButton(false); // Hide button on error
    }, []);

    // Handle stop streaming - this will be called when user clicks stop button
    const handleStopStreaming = useCallback(() => {
        setIsStreaming(false);
        setStreamingMessage(null);
        streamingMessageRef.current = null;
    }, []);

    // Handle opening analytics panel
    const handleAnalyticOpen = useCallback(
        (name: string, data: string) => {
            setOpenAnalytic({ name, data });
            onSidebarToggle?.(); // Minimize sidebar for more space
        },
        [onSidebarToggle],
    );

    // Handle closing panels
    const handlePanelClose = useCallback(() => {
        setOpenAnalytic(null);
    }, []);

    // Handle chat-app resize
    const startResizingChatApp = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsResizingChatApp(true);
        },
        [],
    );

    // Effect to handle chat-app resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingChatApp) return;

            // Get the main container element using ref
            const mainContainer = chatAppContainerRef.current;
            if (!mainContainer) return;

            const containerRect = mainContainer.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const relativeX = e.clientX - containerRect.left;

            const newChatWidthPercent = (relativeX / containerWidth) * 100;
            const clampedWidth = Math.max(
                minChatWidth,
                Math.min(newChatWidthPercent, maxChatWidth),
            );
            setChatWidth(clampedWidth);
        };

        const handleMouseUp = () => {
            setIsResizingChatApp(false);
        };

        if (isResizingChatApp) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.classList.add("resize-active");
            document.body.style.cursor = "col-resize";
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.classList.remove("resize-active");
            document.body.style.cursor = "";
        };
    }, [isResizingChatApp, minChatWidth, maxChatWidth]);

    // Simple inline dialog component (replace with your actual Dialog component)
    const ErrorDialog = () => {
        if (!errorDialog) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {errorDialog.title}
                        </h3>
                        <button
                            onClick={() => setErrorDialog(null)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="Close error dialog"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {errorDialog.message}
                    </p>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setErrorDialog(null)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Global styles for resize cursor */}
            <style>{`
        .resize-active {
          user-select: none;
        }
        .resize-active * {
          cursor: col-resize !important;
        }
      `}</style>

            <div
                ref={chatAppContainerRef}
                className="flex h-full relative w-full"
            >
                {/* Render Error Dialog */}
                <ErrorDialog />

                {/* Chat area - dynamic width when panel is open, full width when no panel */}
                <div
                    className={`flex flex-col transition-all duration-300 relative min-w-[500px] ${
                        hasOpenPanel ? "" : "w-full"
                    }`}
                    style={hasOpenPanel ? { width: `${chatWidth}%` } : {}}
                >
                    {/* Overlay to prevent chat area from interfering with resize */}
                    {isResizingChatApp && (
                        <div className="absolute inset-0 z-40 bg-transparent cursor-col-resize" />
                    )}
                    {/* Single unified layout */}
                    <>
                        {/* Scrollable Message Container */}
                        <div
                            ref={scrollContainerRef}
                            className={`flex-1 overflow-y-auto py-6 relative ${
                                hasOpenPanel ? "px-2 sm:px-4" : "px-4 sm:px-8"
                            } ${
                                !hasMessages
                                    ? "flex flex-col items-center justify-center"
                                    : ""
                            }`}
                            data-ref="scrollContainerRef"
                            data-main-chat-scroll="true"
                        >
                            <AnimatePresence mode="wait">
                                {!hasMessages && !isReadOnly && (
                                    <motion.div
                                        key="welcome-state"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{
                                            duration: 0.6,
                                            type: "spring",
                                            bounce: 0.15,
                                        }}
                                        className="flex flex-col items-center w-full max-w-4xl mx-auto"
                                    >
                                        {welcomeIcon && (
                                            <motion.div
                                                initial={{
                                                    scale: 0.8,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    scale: 1,
                                                    opacity: 1,
                                                }}
                                                transition={{
                                                    delay: 0.1,
                                                    duration: 0.5,
                                                }}
                                                className="mb-4"
                                            >
                                                <img
                                                    src={welcomeIcon}
                                                    alt="Welcome icon"
                                                    style={{
                                                        width: welcomeIconSize,
                                                        height: welcomeIconSize,
                                                    }}
                                                    className="object-contain"
                                                />
                                            </motion.div>
                                        )}
                                        <motion.h2
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: 0.2,
                                                duration: 0.5,
                                            }}
                                            className={`mb-2 font-bold ${
                                                hasOpenPanel
                                                    ? "text-lg"
                                                    : "text-2xl"
                                            }`}
                                        >
                                            {welcomeMessagePrimary}
                                        </motion.h2>
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: 0.3,
                                                duration: 0.5,
                                            }}
                                            className={`text-center text-gray-500 mb-8 ${
                                                hasOpenPanel
                                                    ? "text-sm max-w-xs"
                                                    : "max-w-md"
                                            }`}
                                        >
                                            {welcomeMessageSecondary}
                                        </motion.p>

                                        {/* Input field for empty state */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: 0.4,
                                                duration: 0.5,
                                            }}
                                            className={`w-full ${
                                                hasOpenPanel
                                                    ? "max-w-xs"
                                                    : "max-w-xl"
                                            }`}
                                        >
                                            <Suspense fallback={null}>
                                                <ChatInput
                                                    conversationId={
                                                        conversation.id
                                                    }
                                                    agentId={agentId}
                                                    onAddUserMessage={
                                                        handleAddUserMessage
                                                    }
                                                    onStreamStart={
                                                        handleStreamStart
                                                    }
                                                    onStreamUpdate={
                                                        handleStreamUpdate
                                                    }
                                                    onStreamEnd={
                                                        handleStreamEnd
                                                    }
                                                    onError={handleError}
                                                    messages={[]}
                                                    isStreaming={isStreaming}
                                                    onStopStreaming={
                                                        handleStopStreaming
                                                    }
                                                    disabled={isWaitingForInput}
                                                    onThreadCreated={
                                                        onThreadCreated
                                                    }
                                                    onToolExecutionStart={
                                                        handleToolExecutionStart
                                                    }
                                                    onToolExecutionEnd={
                                                        handleToolExecutionEnd
                                                    }
                                                    onToolStart={onToolStart}
                                                    onToolInput={onToolInput}
                                                    onToolFinish={onToolFinish}
                                                    onChunk={onChunk}
                                                    onFinish={onFinish}
                                                    accentColor={accentColor}
                                                    streaming={streaming}
                                                    theme={theme}
                                                    inputBackgroundColor={
                                                        inputBackgroundColor
                                                    }
                                                    inputBackgroundColorDark={
                                                        inputBackgroundColorDark
                                                    }
                                                />
                                            </Suspense>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!hasMessages && isReadOnly && (
                                <div className="text-center">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        Log View
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        This log contains no messages.
                                    </p>
                                </div>
                            )}

                            {hasMessages && (
                                <motion.div
                                    key={stableConversationKeyRef.current}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{
                                        duration: 0.4,
                                        ease: "easeOut",
                                    }}
                                    className="space-y-2"
                                >
                                    {allMessages.map((message, index) => {
                                        // Check if this message is the currently streaming one
                                        const isCurrentlyStreaming =
                                            isStreaming &&
                                            streamingMessage?.id === message.id; // Use state for rendering check

                                        // Check if this message was just streamed (has ID that matches streaming message ref)
                                        const wasJustStreamed =
                                            streamingMessageRef.current?.id ===
                                            message.id;

                                        return (
                                            <motion.div
                                                key={message.id || index}
                                                initial={{
                                                    opacity: wasJustStreamed
                                                        ? 1
                                                        : 0,
                                                    x: wasJustStreamed
                                                        ? 0
                                                        : -20,
                                                }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration:
                                                        isCurrentlyStreaming ||
                                                        wasJustStreamed
                                                            ? 0
                                                            : 0.3,
                                                    delay:
                                                        isCurrentlyStreaming ||
                                                        wasJustStreamed
                                                            ? 0
                                                            : index * 0.05,
                                                    ease: "easeOut",
                                                }}
                                            >
                                                {/* @ts-ignore - Typescript doesn't recognize dynamic imports properly */}
                                                <DynamicChatMessage
                                                    message={message}
                                                    isStreaming={
                                                        isCurrentlyStreaming
                                                    }
                                                    theme={theme}
                                                    onAnalyticOpen={
                                                        handleAnalyticOpen
                                                    }
                                                    messageBubbleColor={
                                                        messageBubbleColor
                                                    }
                                                    streamingText={
                                                        streamingText
                                                    }
                                                    streamingTextColor={
                                                        streamingTextColor
                                                    }
                                                    vectorColor={vectorColor}
                                                    vectorColorDark={
                                                        vectorColorDark
                                                    }
                                                    agentId={agentId}
                                                    onFeedbackChange={(
                                                        messageId,
                                                        feedbackPositive,
                                                    ) => {
                                                        // Update the message in state
                                                        setMessages((prev) =>
                                                            prev.map((msg) =>
                                                                msg.id ===
                                                                messageId
                                                                    ? {
                                                                          ...msg,
                                                                          metadata:
                                                                              {
                                                                                  ...msg.metadata,
                                                                                  feedbackPositive,
                                                                              },
                                                                      }
                                                                    : msg,
                                                            ),
                                                        );
                                                    }}
                                                />
                                            </motion.div>
                                        );
                                    })}

                                    <div
                                        ref={messagesEndRef}
                                        data-ref="messagesEndRef"
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* Single Unified Input with layout animation */}
                        {!isReadOnly && hasMessages && (
                            <motion.div
                                layout
                                initial={false}
                                transition={{
                                    layout: {
                                        duration: 0.6,
                                        type: "spring",
                                        bounce: 0.15,
                                    },
                                }}
                                className="relative border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-20"
                            >
                                <div
                                    className={
                                        hasOpenPanel
                                            ? "p-2 sm:p-3 w-full"
                                            : "p-4 sm:p-6 w-full max-w-4xl mx-auto"
                                    }
                                >
                                    {/* Waiting for input feedback */}
                                    {isWaitingForInput && (
                                        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                                    <div
                                                        className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"
                                                        style={{
                                                            animationDelay:
                                                                "0.2s",
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"
                                                        style={{
                                                            animationDelay:
                                                                "0.4s",
                                                        }}
                                                    ></div>
                                                </div>
                                                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                                                    Waiting for form input...
                                                </p>
                                            </div>
                                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                                Complete the form above or click
                                                Cancel to continue without data
                                                capture.
                                            </p>
                                        </div>
                                    )}

                                    {showScrollToBottomButton && (
                                        <div className="absolute bottom-22 left-1/2 transform -translate-x-1/2 z-10">
                                            <button
                                                onClick={() =>
                                                    scrollToBottom("smooth")
                                                }
                                                className="text-white rounded-full p-3 shadow-lg transition-all duration-200 ease-in-out animate-bounce"
                                                style={{
                                                    backgroundColor:
                                                        scrollButtonColor,
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.filter =
                                                        "brightness(0.85)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.filter =
                                                        "brightness(1)";
                                                }}
                                                title="Scroll to bottom"
                                            >
                                                <ArrowDownCircle size={24} />
                                            </button>
                                        </div>
                                    )}
                                    <Suspense fallback={null}>
                                        <ChatInput
                                            conversationId={conversation.id}
                                            agentId={agentId}
                                            onAddUserMessage={
                                                handleAddUserMessage
                                            }
                                            onStreamStart={handleStreamStart}
                                            onStreamUpdate={handleStreamUpdate}
                                            onStreamEnd={handleStreamEnd}
                                            onError={handleError}
                                            messages={messages}
                                            isStreaming={isStreaming}
                                            onStopStreaming={
                                                handleStopStreaming
                                            }
                                            disabled={isWaitingForInput}
                                            onThreadCreated={onThreadCreated}
                                            onToolExecutionStart={
                                                handleToolExecutionStart
                                            }
                                            onToolExecutionEnd={
                                                handleToolExecutionEnd
                                            }
                                            onToolStart={onToolStart}
                                            onToolInput={onToolInput}
                                            onToolFinish={onToolFinish}
                                            onChunk={onChunk}
                                            onFinish={onFinish}
                                            accentColor={accentColor}
                                            streaming={streaming}
                                            theme={theme}
                                            inputBackgroundColor={
                                                inputBackgroundColor
                                            }
                                            inputBackgroundColorDark={
                                                inputBackgroundColorDark
                                            }
                                        />
                                    </Suspense>
                                </div>
                            </motion.div>
                        )}
                    </>
                </div>

                {/* Resize handle */}
                {hasOpenPanel && (
                    <div
                        ref={chatAppResizeHandleRef}
                        onMouseDown={startResizingChatApp}
                        className={`h-full cursor-col-resize transition-all z-50 relative flex items-center justify-center ${
                            isResizingChatApp
                                ? "w-2 bg-indigo-500 dark:bg-indigo-400"
                                : "w-1 hover:w-2 bg-gray-300 dark:bg-gray-700 hover:bg-indigo-500 dark:hover:bg-indigo-400"
                        }`}
                        title="Drag to resize chat and app areas"
                    >
                        {/* Visual indicator dots */}
                        <div className="flex flex-col space-y-1 opacity-60">
                            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                        </div>
                    </div>
                )}

                {/* Panel area - takes remaining space */}
                {hasOpenPanel && (
                    <div className="flex-1 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col w-full">
                        {/* Panel header */}
                        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center space-x-3">
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        false ? "bg-blue-500" : "bg-emerald-500"
                                    }`}
                                >
                                    {false ? (
                                        <svg
                                            className="w-5 h-5 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="w-5 h-5 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                                        {false
                                            ? "openApp"
                                            : "Analytics Dashboard"}
                                    </h3>
                                    {openAnalytic && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {openAnalytic.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                {/* Close panel */}
                                <button
                                    onClick={handlePanelClose}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    aria-label="Close panel"
                                >
                                    <X
                                        size={20}
                                        className="text-gray-600 dark:text-gray-400"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Panel content */}
                        <div className="flex-1 relative h-full">
                            {/* Overlay to prevent content from interfering with resize */}
                            {isResizingChatApp && (
                                <div className="absolute inset-0 z-50 bg-transparent cursor-col-resize" />
                            )}

                            {false ? (
                                <iframe
                                    // src={openApp.url}
                                    className="w-full h-full border-0"
                                    // title={openApp.name}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
                                />
                            ) : openAnalytic ? (
                                <AnalyticsPanel
                                    name={openAnalytic.name}
                                    csvData={openAnalytic.data}
                                    theme={theme}
                                />
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
