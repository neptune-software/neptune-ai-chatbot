import {
  chatClient
} from "./chunk-VONUV37R.mjs";
import "./chunk-FWCSY2DS.mjs";

// app/components/chat-input.tsx
import {
  useState,
  useRef,
  useEffect
} from "react";
import { Send, Paperclip, X, FileText } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
function ChatInput({
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
  inputBackgroundColorDark = "#303030"
}) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newAttachments = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      if (!isImage && !isPdf) {
        onError({
          title: "Unsupported File Type",
          message: `File "${file.name}" is not supported. Only images (PNG, JPG, GIF, etc.) and PDF files are supported at this time.`
        });
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        onError({
          title: "File Too Large",
          message: `File "${file.name}" exceeds the 10MB size limit. Please choose a smaller file.`
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
            image: base64data
          });
        } else {
          newAttachments.push({
            name: file.name,
            type: "file",
            mediaType: file.type,
            data: base64data,
            filename: file.name
          });
        }
      } catch (error) {
        console.error("File processing error:", error);
        onError({
          title: "File Processing Error",
          message: `There was an unexpected error processing "${file.name}". Please try again.`
        });
      }
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
  };
  const handlePaste = async (e) => {
    var _a;
    const clipboardItems = (_a = e.clipboardData) == null ? void 0 : _a.items;
    if (!clipboardItems) return;
    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      const trimmedItemType = item.type.trim();
      if (trimmedItemType.includes("image")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        if (file.size > 5 * 1024 * 1024) {
          onError({
            title: "Image Too Large",
            message: "The pasted image exceeds the 5MB size limit. Please paste a smaller image."
          });
          return;
        }
        try {
          const base64data = await fileToBase64(file);
          const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
          const filename = `pasted-image-${timestamp}.${trimmedItemType.split("/")[1] || "png"}`;
          setAttachments((prev) => [...prev, {
            name: filename,
            type: "image",
            mediaType: trimmedItemType,
            data: base64data,
            image: base64data
          }]);
          return;
        } catch (error) {
          console.error("Error processing pasted image:", error);
          onError({
            title: "Image Processing Error",
            message: "There was an unexpected error processing the pasted image. Please try again."
          });
        }
      }
    }
  };
  const fileToBase64 = (file) => {
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
  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };
  const handleAttachmentClick = () => {
    var _a;
    (_a = fileInputRef.current) == null ? void 0 : _a.click();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0 || isSubmitting || disabled) return;
    if (!agentId) {
      onError({
        title: "Missing Configuration",
        message: "Assistant ID or Agent ID is not set. Please ensure it is provided in the URL (e.g., ?assistantId=your-id or ?agentId=your-id)."
      });
      setIsSubmitting(false);
      return;
    }
    let accumulatedResponse = "";
    let errorOccurred = false;
    let finalErrorMessage = "";
    let metadata = null;
    try {
      setIsSubmitting(true);
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const userMessageText = input.trim();
      let messageContentParts = [];
      if (userMessageText) {
        messageContentParts.push({
          type: "text",
          text: userMessageText
        });
      }
      attachments.forEach((attachment) => {
        if (attachment.type === "image") {
          messageContentParts.push({
            type: "image",
            image: attachment.image || attachment.data,
            mediaType: attachment.mediaType
          });
        } else {
          messageContentParts.push({
            type: "file",
            data: attachment.data,
            mediaType: attachment.mediaType,
            filename: attachment.filename || attachment.name
          });
        }
      });
      const finalMessageContent = messageContentParts.length === 1 && messageContentParts[0].type === "text" && attachments.length === 0 ? messageContentParts[0].text : messageContentParts;
      setInput("");
      clearAttachments();
      onAddUserMessage({
        id: `local-user-${Date.now()}`,
        content: finalMessageContent,
        role: "user",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      onStreamStart();
      const { stream, threadId, conversation } = await chatClient.messages.sendMessage(
        agentId,
        conversationId,
        finalMessageContent,
        messages,
        abortController.signal,
        void 0,
        // stepData
        conversationId.startsWith("temp-"),
        // isTemporary - detect by ID prefix
        streaming
        // streaming mode
      );
      if (threadId && threadId !== conversationId && onThreadCreated) {
        onThreadCreated(conversationId, threadId, conversation);
      }
      if (!streaming) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let responseText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          responseText += decoder.decode(value, { stream: true });
        }
        const response = JSON.parse(responseText);
        const outputText = response.output || "";
        accumulatedResponse = outputText;
        onStreamUpdate(outputText);
        metadata = response;
      } else {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let buffer = "";
        let isToolExecuting = false;
        let currentToolName = "";
        while (!done) {
          try {
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
                        break;
                      case "tool-input-start":
                        currentToolName = event.toolName || "Unknown Tool";
                        isToolExecuting = true;
                        if (onToolExecutionStart) {
                          onToolExecutionStart(
                            currentToolName
                          );
                        }
                        if (onToolStart) {
                          onToolStart(event);
                        }
                        break;
                      case "tool-input-delta":
                        break;
                      case "tool-input-available":
                        if (onToolInput) {
                          onToolInput(event);
                        }
                        break;
                      case "tool-output-available":
                        if (isToolExecuting && onToolExecutionEnd) {
                          onToolExecutionEnd();
                        }
                        isToolExecuting = false;
                        currentToolName = "";
                        if (onToolFinish) {
                          onToolFinish(event);
                        }
                        break;
                      case "finish-step":
                        if (isToolExecuting && onToolExecutionEnd) {
                          onToolExecutionEnd();
                        }
                        isToolExecuting = false;
                        currentToolName = "";
                        break;
                      case "text-delta":
                        accumulatedResponse += event.delta;
                        onStreamUpdate(event.delta);
                        if (onChunk) {
                          onChunk(event.delta);
                        }
                        break;
                      case "data-finish-result":
                        metadata = event.data;
                        if (onFinish) {
                          onFinish(event.data);
                        }
                        break;
                      case "error":
                        throw new Error(
                          event.errorText || "Stream error occurred"
                        );
                      // Ignore other event types
                      default:
                        break;
                    }
                  } catch (parseError) {
                    console.error(
                      "Error parsing SSE event:",
                      parseError
                    );
                  }
                }
              }
            }
          } catch (streamReadError) {
            console.error(
              "Error reading stream chunk:",
              streamReadError
            );
            errorOccurred = true;
            finalErrorMessage = "An error occurred while reading the response.";
            onError({
              title: "Stream Error",
              message: finalErrorMessage
            });
            done = true;
          }
        }
      }
    } catch (error) {
      console.error("Error during chat submission:", error);
      if ((error == null ? void 0 : error.name) === "AbortError") {
        return;
      }
      errorOccurred = true;
      let title = "Request Error";
      let localMessage = "An unexpected error occurred. Please try again.";
      if (error == null ? void 0 : error.isConfigurationError) {
        title = "Configuration Error";
        localMessage = error.message || "Assistant ID is missing or invalid.";
      } else if (error == null ? void 0 : error.isApiError) {
        title = `API Error (${error.status})`;
        localMessage = error.message || error.statusText || "An error occurred processing your request.";
      } else if (error == null ? void 0 : error.isNetworkError) {
        title = "Network Error";
        localMessage = error.message || "Failed to connect to the server.";
      } else if (error instanceof Error) {
        localMessage = error.message;
      }
      finalErrorMessage = localMessage;
      onError({ title, message: finalErrorMessage });
    } finally {
      onStreamEnd(
        errorOccurred ? finalErrorMessage : accumulatedResponse,
        metadata
      );
      setIsSubmitting(false);
      abortControllerRef.current = null;
    }
  };
  useEffect(() => {
    if (!isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [isStreaming]);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  return /* @__PURE__ */ jsxs(
    "form",
    {
      onSubmit: handleSubmit,
      className: "chat-input relative px-2 pt-3 pb-3 flex w-full items-center border rounded-2xl shadow-sm overflow-hidden",
      style: {
        borderColor: accentColor,
        backgroundColor: theme === "dark" ? inputBackgroundColorDark : inputBackgroundColor
      },
      children: [
        attachments.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 right-0 bg-gray-100 dark:bg-gray-700 p-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto", children: attachments.map((att, index) => {
          const isImage = att.type === "image";
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-600",
              children: [
                isImage ? /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded overflow-hidden bg-white", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: att.image || att.data,
                    alt: "Preview",
                    className: "w-full h-full object-cover"
                  }
                ) }) : /* @__PURE__ */ jsx(
                  FileText,
                  {
                    size: 16,
                    className: "text-gray-600 dark:text-gray-300"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-xs truncate max-w-[120px]", children: att.name }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => removeAttachment(index),
                    className: "text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400",
                    children: /* @__PURE__ */ jsx(X, { size: 14 })
                  }
                )
              ]
            },
            index
          );
        }) }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            ref: textareaRef,
            value: input,
            onChange: (e) => setInput(e.target.value),
            onKeyDown: handleKeyDown,
            onPaste: handlePaste,
            placeholder: disabled ? "Please complete the form above..." : "Type a message...",
            className: `max-h-32 min-h-8 w-full resize-none bg-transparent py-2 pl-6 pr-16 focus:outline-none text-base ${attachments.length > 0 ? "mt-28" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`,
            rows: 1,
            disabled: isSubmitting || disabled
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            ref: fileInputRef,
            onChange: handleFileChange,
            accept: "application/pdf,image/*",
            multiple: true,
            className: "hidden"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleAttachmentClick,
            disabled: isSubmitting || isStreaming || disabled,
            className: "p-2 absolute bottom-3 right-12 rounded-full enabled:hover:bg-gray-300 enabled:dark:hover:bg-gray-700 disabled:opacity-40",
            style: { color: accentColor },
            "aria-label": "Attach file or image",
            children: /* @__PURE__ */ jsx(Paperclip, { size: 20 })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: !input.trim() && attachments.length === 0 || isSubmitting || disabled,
            className: "ml-2 p-2 absolute bottom-3 right-3 rounded-full enabled:hover:bg-gray-300 enabled:dark:hover:bg-gray-700 disabled:opacity-40",
            style: { color: accentColor },
            "aria-label": "Send message",
            children: /* @__PURE__ */ jsx(Send, { size: 20 })
          }
        )
      ]
    }
  );
}
export {
  ChatInput as default
};
