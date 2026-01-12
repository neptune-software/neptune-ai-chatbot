import {
    useState,
    FormEvent,
    useRef,
    useEffect,
    ChangeEvent,
    ClipboardEvent,
} from "react";
import { Send, Paperclip, X, FileText } from "lucide-react";
import {
    chatClient,
    type MessageContent,
    type Message,
    ImageContent,
    FileContent,
} from "../api/chat-client";

// Error details structure
interface ErrorDetails {
    title: string;
    message: string;
}

// File attachment structure
interface FileAttachment {
    name: string;
    type: "file" | "image"; // Type of attachment (file or image)
    data: string; // Base64 data for files
    mediaType: string; // MIME type (e.g., "application/pdf", "image/png")
    filename?: string; // Optional filename (for files)
    image?: string; // Base64 data for images
}

// Updated Props for simplified callbacks
interface ChatInputProps {
    conversationId: string;
    agentId: string;
    onAddUserMessage: (message: Message) => void;
    onStreamStart: () => void;
    onStreamUpdate: (chunk: string) => void;
    onStreamEnd: (finalContent: string, metadata?: any) => void; // Added metadata parameter
    onError: (details: ErrorDetails) => void;
    messages?: Message[];
    isStreaming?: boolean;
    onStopStreaming?: () => void;
    disabled?: boolean; // New prop for waiting mode
    onThreadCreated?: (oldId: string, newId: string, conversation?: any) => void; // Callback when temp conversation becomes real
    onToolExecutionStart?: (toolName: string) => void; // Callback when tool execution starts
    onToolExecutionEnd?: () => void; // Callback when tool execution ends
    // Developer callbacks for tool streaming events
    onToolStart?: (metadata: any) => void; // Callback when tool input starts streaming
    onToolInput?: (metadata: any) => void; // Callback when tool input is available
    onToolFinish?: (metadata: any) => void; // Callback when tool output is available
    onChunk?: (chunk: string) => void; // Callback for each text chunk
    onFinish?: (metadata: any) => void; // Callback when streaming finishes
    accentColor?: string;
    streaming?: boolean;
    theme?: "light" | "dark";
    inputBackgroundColor?: string;
    inputBackgroundColorDark?: string;
}

export default function ChatInput({
    conversationId,
    agentId,
    onAddUserMessage,
    onStreamStart,
    onStreamUpdate,
    onStreamEnd,
    onError,
    messages,
    isStreaming,
    disabled = false,
    onThreadCreated,
    onToolExecutionStart,
    onToolExecutionEnd,
    onToolStart,
    onToolInput,
    onToolFinish,
    onChunk,
    onFinish,
    accentColor = "#8B7FD9",
    streaming = true,
    theme = "light",
    inputBackgroundColor = "#ffffff",
    inputBackgroundColorDark = "#303030",
}: ChatInputProps) {
    const [input, setInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachments, setAttachments] = useState<FileAttachment[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Adjust textarea height based on content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "inherit";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    // Handle file upload (supports multiple files)
    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newAttachments: FileAttachment[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const isImage = file.type.startsWith("image/");
            const isPdf = file.type === "application/pdf";

            if (!isImage && !isPdf) {
                onError({
                    title: "Unsupported File Type",
                    message:
                        `File "${file.name}" is not supported. Only images (PNG, JPG, GIF, etc.) and PDF files are supported at this time.`,
                });
                continue;
            }

            if (file.size > 10 * 1024 * 1024) {
                onError({
                    title: "File Too Large",
                    message:
                        `File "${file.name}" exceeds the 10MB size limit. Please choose a smaller file.`,
                });
                continue;
            }

            try {
                const base64data = await fileToBase64(file);

                if (isImage) {
                    newAttachments.push({
                        name: file.name,
                        type: "image",
                        mediaType: file.type,
                        data: base64data,
                        image: base64data,
                    });
                } else {
                    newAttachments.push({
                        name: file.name,
                        type: "file",
                        mediaType: file.type,
                        data: base64data,
                        filename: file.name,
                    });
                }
            } catch (error) {
                console.error("File processing error:", error);
                onError({
                    title: "File Processing Error",
                    message:
                        `There was an unexpected error processing "${file.name}". Please try again.`,
                });
            }
        }

        // Add new attachments to existing ones
        setAttachments(prev => [...prev, ...newAttachments]);
    };

    // Handle clipboard paste events
    const handlePaste = async (e: ClipboardEvent<HTMLTextAreaElement>) => {
        const clipboardItems = e.clipboardData?.items;
        if (!clipboardItems) return;

        for (let i = 0; i < clipboardItems.length; i++) {
            const item = clipboardItems[i];
            const trimmedItemType = item.type.trim(); // Trim the item type

            if (trimmedItemType.includes("image")) {
                e.preventDefault(); // Prevent default paste behavior for images
                const file = item.getAsFile();
                if (!file) continue;
                if (file.size > 5 * 1024 * 1024) {
                    onError({
                        title: "Image Too Large",
                        message:
                            "The pasted image exceeds the 5MB size limit. Please paste a smaller image.",
                    });
                    return;
                }
                try {
                    const base64data = await fileToBase64(file);
                    const timestamp = new Date()
                        .toISOString()
                        .replace(/[:.]/g, "-");
                    const filename = `pasted-image-${timestamp}.${
                        trimmedItemType.split("/")[1] || "png"
                    }`;

                    setAttachments(prev => [...prev, {
                        name: filename,
                        type: "image",
                        mediaType: trimmedItemType,
                        data: base64data,
                        image: base64data,
                    }]);
                    return;
                } catch (error) {
                    console.error("Error processing pasted image:", error);
                    onError({
                        title: "Image Processing Error",
                        message:
                            "There was an unexpected error processing the pasted image. Please try again.",
                    });
                }
            }
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    resolve(reader.result);
                } else {
                    reject(new Error("Failed to convert file to base64"));
                }
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const clearAttachments = () => {
        setAttachments([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && attachments.length === 0) || isSubmitting || disabled) return;

        if (!agentId) {
            onError({
                title: "Missing Configuration",
                message:
                    "Assistant ID or Agent ID is not set. Please ensure it is provided in the URL (e.g., ?assistantId=your-id or ?agentId=your-id).",
            });
            setIsSubmitting(false);
            return;
        }

        let accumulatedResponse = "";
        let errorOccurred = false;
        let finalErrorMessage = "";
        let metadata: any = null;

        try {
            setIsSubmitting(true);

            // Create abort controller for this request
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            const userMessageText = input.trim();
            let messageContentParts: MessageContent[] = [];

            if (userMessageText) {
                messageContentParts.push({
                    type: "text",
                    text: userMessageText,
                });
            }

            // Add all attachments to message content
            attachments.forEach(attachment => {
                if (attachment.type === "image") {
                    messageContentParts.push({
                        type: "image",
                        image: attachment.image || attachment.data,
                        mediaType: attachment.mediaType,
                    } as ImageContent);
                } else {
                    messageContentParts.push({
                        type: "file",
                        data: attachment.data,
                        mediaType: attachment.mediaType,
                        filename: attachment.filename || attachment.name,
                    } as FileContent);
                }
            });

            const finalMessageContent =
                messageContentParts.length === 1 &&
                messageContentParts[0].type === "text" &&
                attachments.length === 0
                    ? messageContentParts[0].text
                    : messageContentParts;

            setInput("");
            clearAttachments();

            // Always add local user message immediately
            // This ensures the user sees their message right away
            onAddUserMessage({
                id: `local-user-${Date.now()}`,
                content: finalMessageContent,
                role: "user",
                createdAt: new Date().toISOString(),
            });

            onStreamStart();

            const { stream, threadId, conversation } = await chatClient.messages.sendMessage(
                agentId,
                conversationId,
                finalMessageContent,
                messages,
                abortController.signal,
                undefined, // stepData
                conversationId.startsWith("temp-"), // isTemporary - detect by ID prefix
                streaming, // streaming mode
            );

            // If a real threadId was returned (for temp conversations), call onThreadCreated immediately
            // This updates the conversation in the sidebar right away with the correct title and messages
            if (threadId && threadId !== conversationId && onThreadCreated) {
                onThreadCreated(conversationId, threadId, conversation);
            }

            // Handle non-streaming response
            if (!streaming) {
                const reader = stream.getReader();
                const decoder = new TextDecoder();
                let responseText = "";

                // Read the entire response
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    responseText += decoder.decode(value, { stream: true });
                }

                // Parse the JSON response
                const response = JSON.parse(responseText);

                // Extract the output text from the response
                const outputText = response.output || "";
                accumulatedResponse = outputText;

                // Update the streaming message with the full response at once
                onStreamUpdate(outputText);

                // Store metadata if present
                metadata = response;
            } else {
                // Handle streaming response
                const reader = stream.getReader();
                const decoder = new TextDecoder();
                let done = false;
                let buffer = "";
                let isToolExecuting = false;
                let currentToolName = "";

            while (!done) {
                try {
                    // Check if request was aborted
                    if (abortController.signal.aborted) {
                        break;
                    }

                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;

                    if (value) {
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split("\n");
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            if (!line.trim()) continue;

                            if (line.startsWith("data: ")) {
                                const jsonString = line.substring(6);

                                if (jsonString === "[DONE]") {
                                    done = true;
                                    break;
                                }

                                try {
                                    const event = JSON.parse(jsonString);

                                    switch (event.type) {
                                        case "start-step":
                                            // A new step is starting - might be a tool call
                                            break;

                                        case "tool-input-start":
                                            // Tool execution is starting
                                            currentToolName =
                                                event.toolName ||
                                                "Unknown Tool";
                                            isToolExecuting = true;
                                            if (onToolExecutionStart) {
                                                onToolExecutionStart(
                                                    currentToolName,
                                                );
                                            }
                                            // Developer callback for tool start
                                            if (onToolStart) {
                                                onToolStart(event);
                                            }
                                            break;

                                        case "tool-input-delta":
                                            // Tool input is being streamed (we can ignore this for now)
                                            break;

                                        case "tool-input-available":
                                            // Tool input is complete
                                            // Developer callback for tool input available
                                            if (onToolInput) {
                                                onToolInput(event);
                                            }
                                            break;

                                        case "tool-output-available":
                                            // Tool execution is complete
                                            if (
                                                isToolExecuting &&
                                                onToolExecutionEnd
                                            ) {
                                                onToolExecutionEnd();
                                            }
                                            isToolExecuting = false;
                                            currentToolName = "";
                                            // Developer callback for tool finish
                                            if (onToolFinish) {
                                                onToolFinish(event);
                                            }
                                            break;

                                        case "finish-step":
                                            // Step finished - if it was a tool step, ensure we clean up
                                            if (
                                                isToolExecuting &&
                                                onToolExecutionEnd
                                            ) {
                                                onToolExecutionEnd();
                                            }
                                            isToolExecuting = false;
                                            currentToolName = "";
                                            break;

                                        case "text-delta":
                                            // Accumulate the text delta
                                            accumulatedResponse += event.delta;
                                            onStreamUpdate(event.delta);
                                            // Developer callback for text chunk
                                            if (onChunk) {
                                                onChunk(event.delta);
                                            }
                                            break;

                                        case "data-finish-result":
                                            // Store metadata for later use
                                            metadata = event.data;
                                            // Developer callback for finish
                                            if (onFinish) {
                                                onFinish(event.data);
                                            }
                                            break;

                                        case "error":
                                            throw new Error(
                                                event.errorText ||
                                                    "Stream error occurred",
                                            );

                                        // Ignore other event types
                                        default:
                                            break;
                                    }
                                } catch (parseError) {
                                    console.error(
                                        "Error parsing SSE event:",
                                        parseError,
                                    );
                                }
                            }
                        }
                    }
                } catch (streamReadError: any) {
                    console.error(
                        "Error reading stream chunk:",
                        streamReadError,
                    );
                    errorOccurred = true;
                    finalErrorMessage =
                        "An error occurred while reading the response.";
                    onError({
                        title: "Stream Error",
                        message: finalErrorMessage,
                    });
                    done = true;
                }
            }
            }
        } catch (error: any) {
            console.error("Error during chat submission:", error);

            // Handle abort errors gracefully - don't show error dialog for intentional user abort
            if (error?.name === "AbortError") {
                return;
            }

            errorOccurred = true;
            let title = "Request Error";
            let localMessage =
                "An unexpected error occurred. Please try again.";

            if (error?.isConfigurationError) {
                title = "Configuration Error";
                localMessage =
                    error.message || "Assistant ID is missing or invalid.";
            } else if (error?.isApiError) {
                title = `API Error (${error.status})`;
                localMessage =
                    error.message ||
                    error.statusText ||
                    "An error occurred processing your request.";
            } else if (error?.isNetworkError) {
                title = "Network Error";
                localMessage =
                    error.message || "Failed to connect to the server.";
            } else if (error instanceof Error) {
                localMessage = error.message;
            }

            finalErrorMessage = localMessage;
            onError({ title: title, message: finalErrorMessage });
        } finally {
            onStreamEnd(
                errorOccurred ? finalErrorMessage : accumulatedResponse,
                metadata,
            );

            setIsSubmitting(false);
            // Clean up abort controller
            abortControllerRef.current = null;
        }
    };

    // Expose abort function for external use (when stop button is clicked)
    useEffect(() => {
        if (!isStreaming && abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, [isStreaming]);

    // Handle Enter key to submit, Shift+Enter for new line
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="chat-input relative px-2 pt-3 pb-3 flex w-full items-center border rounded-2xl shadow-sm overflow-hidden"
            style={{
                borderColor: accentColor,
                backgroundColor: theme === "dark" ? inputBackgroundColorDark : inputBackgroundColor
            }}
        >
            {attachments.length > 0 && (
                <div className="absolute top-0 left-0 right-0 bg-gray-100 dark:bg-gray-700 p-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {attachments.map((att, index) => {
                        const isImage = att.type === "image";
                        return (
                            <div
                                key={index}
                                className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-600"
                            >
                                {isImage ? (
                                    <div className="w-6 h-6 rounded overflow-hidden bg-white">
                                        <img
                                            src={att.image || att.data}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <FileText
                                        size={16}
                                        className="text-gray-600 dark:text-gray-300"
                                    />
                                )}
                                <span className="text-xs truncate max-w-[120px]">
                                    {att.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(index)}
                                    className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={
                    disabled
                        ? "Please complete the form above..."
                        : "Type a message..."
                }
                className={`max-h-32 min-h-8 w-full resize-none bg-transparent py-2 pl-6 pr-16 focus:outline-none text-base ${
                    attachments.length > 0 ? "mt-28" : ""
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                rows={1}
                disabled={isSubmitting || disabled}
            />

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf,image/*"
                multiple
                className="hidden"
            />

            <button
                type="button"
                onClick={handleAttachmentClick}
                disabled={isSubmitting || isStreaming || disabled}
                className="p-2 absolute bottom-3 right-12 rounded-full enabled:hover:bg-gray-300 enabled:dark:hover:bg-gray-700 disabled:opacity-40"
                style={{ color: accentColor }}
                aria-label="Attach file or image"
            >
                <Paperclip size={20} />
            </button>

            <button
                type="submit"
                disabled={
                    (!input.trim() && attachments.length === 0) || isSubmitting || disabled
                }
                className="ml-2 p-2 absolute bottom-3 right-3 rounded-full enabled:hover:bg-gray-300 enabled:dark:hover:bg-gray-700 disabled:opacity-40"
                style={{ color: accentColor }}
                aria-label="Send message"
            >
                <Send size={20} />
            </button>

            {/*
      {isStreaming && onStopStreaming ? (
        <button
          type="button"
          onClick={onStopStreaming}
          className="ml-2 p-2 absolute bottom-3 right-3 rounded-full text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          aria-label="Stop generating">
          <Square size={20} />
        </button>
      ) : (
        <button
          type="submit"
          disabled={(!input.trim() && !attachment) || isSubmitting}
          className="ml-2 p-2 absolute bottom-3 right-3 rounded-full text-gray-500 enabled:hover:bg-gray-300 enabled:dark:hover:bg-gray-700 disabled:opacity-40"
          aria-label="Send message">
          <Send size={20} />
        </button>
      )}
*/}
        </form>
    );
}
