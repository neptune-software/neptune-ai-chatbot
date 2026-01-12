"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// app/api/chat-client.ts
function configureChatClient(config) {
  Object.assign(chatConfig, config);
}
async function fetchWithErrorHandling(url, options = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (chatConfig.username && chatConfig.password) {
    headers.set(
      "Authorization",
      "Basic " + btoa(`${chatConfig.username}:${chatConfig.password}`)
    );
  }
  const finalUrl = chatConfig.baseUrl ? `${chatConfig.baseUrl}${url}` : url;
  try {
    const res = await fetch(finalUrl, __spreadProps(__spreadValues({}, options), { headers }));
    const contentType = res.headers.get("content-type");
    const isJson = contentType == null ? void 0 : contentType.includes("application/json");
    if (!res.ok) {
      const err = isJson ? await res.json() : { message: await res.text() };
      throw __spreadProps(__spreadValues({}, err), {
        status: res.status,
        statusText: res.statusText,
        isApiError: true
      });
    }
    if (res.status === 204 || !contentType) return { success: true };
    return isJson ? res.json() : { success: true, nonJsonResponse: await res.text() };
  } catch (error) {
    if (error.isApiError) throw error;
    throw {
      isNetworkError: true,
      message: "Network connection failed",
      status: 0,
      originalError: error
    };
  }
}
async function createAgentStream(agentId, messages, conversationId, signal, stepData, streaming = true) {
  var _a;
  const lastMsg = messages[messages.length - 1];
  let input = "";
  if (typeof (lastMsg == null ? void 0 : lastMsg.content) === "string") input = lastMsg.content;
  else if (Array.isArray(lastMsg == null ? void 0 : lastMsg.content))
    input = ((_a = lastMsg.content.find((c) => c.type === "text")) == null ? void 0 : _a.text) || "";
  const formData = new FormData();
  formData.append("aiAgent", agentId);
  formData.append("input", input);
  formData.append("stream", String(streaming));
  if (conversationId && !conversationId.startsWith("temp-"))
    formData.append("threadID", conversationId);
  if (stepData) formData.append("variables", JSON.stringify(stepData));
  if (Array.isArray(lastMsg == null ? void 0 : lastMsg.content)) {
    lastMsg.content.forEach((c) => {
      if (c.type === "image")
        formData.append(
          "files",
          base64ToFile(
            c.image,
            c.mediaType,
            `image.${c.mediaType.split("/")[1]}`
          )
        );
      else if (c.type === "file")
        formData.append(
          "files",
          base64ToFile(c.data, c.mediaType, c.filename)
        );
    });
  }
  const url = chatConfig.baseUrl ? `${chatConfig.baseUrl}/api/AIBuildersKit/createCompletionAI` : "/api/AIBuildersKit/createCompletionAI";
  const headers = chatConfig.username ? {
    Authorization: "Basic " + btoa(`${chatConfig.username}:${chatConfig.password}`)
  } : {};
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
    signal
  });
  if (!response.ok)
    throw new Error(
      (await response.json().catch(() => ({}))).message || response.statusText
    );
  if (!response.body) throw new Error("Stream not supported");
  return response.body;
}
var chatConfig, base64ToFile, chatClient;
var init_chat_client = __esm({
  "app/api/chat-client.ts"() {
    "use strict";
    chatConfig = {};
    base64ToFile = (data, type, name) => {
      const b64 = data.includes(",") ? data.split(",")[1] : data;
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length).map((_, i) => bin.charCodeAt(i));
      return new File([new Blob([arr], { type })], name, { type });
    };
    chatClient = {
      conversations: {
        getAll: async (agentId) => {
          const res = await fetchWithErrorHandling(
            "/api/functions/AIAgent/listUserThreads",
            { method: "POST", body: JSON.stringify({ agentId }) }
          );
          return Array.isArray(res) ? res : res.conversations || res.data || [];
        },
        get: async (id) => {
          var _a, _b, _c;
          const res = await fetchWithErrorHandling(
            `/api/functions/AIAgent/getConversation`,
            { method: "POST", body: JSON.stringify({ id }) }
          );
          if (Array.isArray(res)) {
            const messages = res.flatMap((log) => {
              var _a2, _b2, _c2, _d;
              let userContent = log.input;
              if ((_a2 = log.files) == null ? void 0 : _a2.length) {
                userContent = [
                  ...((_b2 = log.input) == null ? void 0 : _b2.trim()) ? [
                    {
                      type: "text",
                      text: log.input
                    }
                  ] : [],
                  ...log.files.map(
                    (f) => f.mimeType.startsWith("image/") ? {
                      type: "image",
                      image: `data:${f.mimeType};base64,${f.data}`,
                      mediaType: f.mimeType
                    } : {
                      type: "file",
                      data: `data:${f.mimeType};base64,${f.data}`,
                      mediaType: f.mimeType,
                      filename: f.name
                    }
                  )
                ];
              }
              const asstMsg = {
                id: `${log.id}-assistant`,
                content: log.output,
                role: "assistant",
                createdAt: log.updatedAt
              };
              if (((_c2 = log.steps) == null ? void 0 : _c2.length) || ((_d = log.vectors) == null ? void 0 : _d.length) || log.feedbackPositive !== void 0) {
                asstMsg.metadata = {
                  logId: log.id,
                  steps: log.steps,
                  vectors: log.vectors,
                  feedbackPositive: log.feedbackPositive
                };
              }
              return [
                {
                  id: `${log.id}-user`,
                  content: userContent,
                  role: "user",
                  createdAt: log.createdAt
                },
                asstMsg
              ];
            });
            return {
              id,
              title: ((_a = res[0]) == null ? void 0 : _a.input.substring(0, 50)) || "Conversation",
              messages,
              createdAt: ((_b = res[0]) == null ? void 0 : _b.createdAt) || (/* @__PURE__ */ new Date()).toISOString(),
              updatedAt: ((_c = res[res.length - 1]) == null ? void 0 : _c.updatedAt) || (/* @__PURE__ */ new Date()).toISOString()
            };
          }
          const conv = res.conversation || res.data || res;
          if (conv.messages) {
            conv.messages = conv.messages.map((m) => {
              if (m.role === "assistant" && typeof m.content === "string") {
                try {
                  const parsed = JSON.parse(m.content);
                  if (typeof parsed === "object" && parsed !== null && !m.content.includes("```json:")) {
                    return __spreadProps(__spreadValues({}, m), {
                      content: `\`\`\`json:Response
${JSON.stringify(
                        parsed,
                        null,
                        2
                      )}
\`\`\``
                    });
                  }
                } catch (e) {
                }
              }
              return m;
            });
          }
          return conv;
        },
        create: (title, agentId) => fetchWithErrorHandling(`/api/functions/AIAgent/createThread`, {
          method: "POST",
          body: JSON.stringify(__spreadValues(__spreadValues({}, title && { title }), agentId && { agentId }))
        }),
        delete: (id) => fetchWithErrorHandling(
          `/api/functions/AIAgent/deleteThreadByIdAndUser`,
          { method: "POST", body: JSON.stringify({ id }) }
        ),
        update: (id, data) => fetchWithErrorHandling(`/api/functions/AIAgent/renameThread`, {
          method: "POST",
          body: JSON.stringify({ id, title: data.title })
        })
      },
      messages: {
        getLastMessages: async (conversationId, limit = 100) => (await chatClient.conversations.get(conversationId)).messages.slice(
          -limit
        ),
        sendMessage: async (agentId, conversationId, content, existingMessages, signal, stepData, isTemporary, streaming = true) => {
          var _a;
          if (!agentId)
            throw {
              isConfigurationError: true,
              status: 400,
              message: "Assistant ID missing"
            };
          let actualId = conversationId;
          let createdConv;
          if (isTemporary && agentId) {
            const titleText = typeof content === "string" ? content : ((_a = content.find(
              (c) => c.type === "text"
            )) == null ? void 0 : _a.text) || "";
            createdConv = await chatClient.conversations.create(
              titleText.substring(0, 50) || "New Chat",
              agentId
            );
            actualId = createdConv.id;
          }
          const context = [
            ...(existingMessages == null ? void 0 : existingMessages.map((m) => ({
              role: m.role,
              content: m.content
            }))) || [],
            { role: "user", content }
          ].slice(-10);
          return {
            stream: await createAgentStream(
              agentId,
              context,
              actualId,
              signal,
              stepData,
              streaming
            ),
            threadId: actualId,
            conversation: createdConv
          };
        }
      },
      feedback: {
        submit: (id, feedbackPositive, aiAgent) => fetchWithErrorHandling("/api/AIBuildersKit/giveAgentFeedbackAI", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, feedbackPositive, aiAgent })
        })
      }
    };
  }
});

// app/components/chat-input.tsx
var chat_input_exports = {};
__export(chat_input_exports, {
  default: () => ChatInput
});
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
  const [input, setInput] = (0, import_react2.useState)("");
  const [isSubmitting, setIsSubmitting] = (0, import_react2.useState)(false);
  const [attachments, setAttachments] = (0, import_react2.useState)([]);
  const textareaRef = (0, import_react2.useRef)(null);
  const fileInputRef = (0, import_react2.useRef)(null);
  const abortControllerRef = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
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
  (0, import_react2.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "form",
    {
      onSubmit: handleSubmit,
      className: "chat-input relative px-2 pt-3 pb-3 flex w-full items-center border rounded-2xl shadow-sm overflow-hidden",
      style: {
        borderColor: accentColor,
        backgroundColor: theme === "dark" ? inputBackgroundColorDark : inputBackgroundColor
      },
      children: [
        attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "absolute top-0 left-0 right-0 bg-gray-100 dark:bg-gray-700 p-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto", children: attachments.map((att, index) => {
          const isImage = att.type === "image";
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            "div",
            {
              className: "flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-600",
              children: [
                isImage ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "w-6 h-6 rounded overflow-hidden bg-white", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  "img",
                  {
                    src: att.image || att.data,
                    alt: "Preview",
                    className: "w-full h-full object-cover"
                  }
                ) }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  import_lucide_react2.FileText,
                  {
                    size: 16,
                    className: "text-gray-600 dark:text-gray-300"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-xs truncate max-w-[120px]", children: att.name }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: () => removeAttachment(index),
                    className: "text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400",
                    children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.X, { size: 14 })
                  }
                )
              ]
            },
            index
          );
        }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            type: "button",
            onClick: handleAttachmentClick,
            disabled: isSubmitting || isStreaming || disabled,
            className: "p-2 absolute bottom-3 right-12 rounded-full enabled:hover:bg-gray-300 enabled:dark:hover:bg-gray-700 disabled:opacity-40",
            style: { color: accentColor },
            "aria-label": "Attach file or image",
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Paperclip, { size: 20 })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            type: "submit",
            disabled: !input.trim() && attachments.length === 0 || isSubmitting || disabled,
            className: "ml-2 p-2 absolute bottom-3 right-3 rounded-full enabled:hover:bg-gray-300 enabled:dark:hover:bg-gray-700 disabled:opacity-40",
            style: { color: accentColor },
            "aria-label": "Send message",
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Send, { size: 20 })
          }
        )
      ]
    }
  );
}
var import_react2, import_lucide_react2, import_jsx_runtime2;
var init_chat_input = __esm({
  "app/components/chat-input.tsx"() {
    "use strict";
    import_react2 = require("react");
    import_lucide_react2 = require("lucide-react");
    init_chat_client();
    import_jsx_runtime2 = require("react/jsx-runtime");
  }
});

// app/components/tool-execution.tsx
var import_react3, import_lucide_react3, import_react_syntax_highlighter, import_prism, import_jsx_runtime3, ToolExecutionIndicator, ToolCallDetail, ToolExecutionWidget;
var init_tool_execution = __esm({
  "app/components/tool-execution.tsx"() {
    "use strict";
    import_react3 = require("react");
    import_lucide_react3 = require("lucide-react");
    import_react_syntax_highlighter = require("react-syntax-highlighter");
    import_prism = require("react-syntax-highlighter/dist/esm/styles/prism");
    import_jsx_runtime3 = require("react/jsx-runtime");
    ToolExecutionIndicator = (0, import_react3.memo)(
      ({ toolName }) => {
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "my-4 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950/30 animate-pulse", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            import_lucide_react3.Loader2,
            {
              size: 20,
              className: "text-blue-600 dark:text-blue-400 animate-spin"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "font-semibold text-blue-900 dark:text-blue-100", children: "Executing Tool" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-sm text-blue-700 dark:text-blue-300 mt-0.5", children: toolName })
          ] })
        ] }) });
      }
    );
    ToolExecutionIndicator.displayName = "ToolExecutionIndicator";
    ToolCallDetail = (0, import_react3.memo)(
      ({ tool, theme }) => {
        const [isExpanded, setIsExpanded] = (0, import_react3.useState)(false);
        const [copiedField, setCopiedField] = (0, import_react3.useState)(null);
        const isDark = theme === "dark";
        const syntaxTheme = isDark ? import_prism.vscDarkPlus : import_prism.oneLight;
        const bgColor = isDark ? "#1e1e1e" : "#efefef";
        const formatJson = (obj) => {
          try {
            return JSON.stringify(obj, null, 2);
          } catch (error) {
            return String(obj);
          }
        };
        const handleCopy = (content, fieldName) => {
          navigator.clipboard.writeText(content).then(() => {
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2e3);
          }).catch((err) => console.error("Failed to copy: ", err));
        };
        const getStatusIcon = () => {
          if (tool.status === "SUCCESS") {
            return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              import_lucide_react3.CheckCircle2,
              {
                size: 16,
                className: "text-green-600 dark:text-green-400"
              }
            );
          } else if (tool.error) {
            return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              import_lucide_react3.XCircle,
              {
                size: 16,
                className: "text-red-600 dark:text-red-400"
              }
            );
          }
          return null;
        };
        const getStatusColor = () => {
          if (tool.status === "SUCCESS") {
            return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
          } else if (tool.error) {
            return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
          }
          return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
        };
        const argsString = (0, import_react3.useMemo)(() => formatJson(tool.args), [tool.args]);
        const resultString = (0, import_react3.useMemo)(
          () => formatJson(tool.result),
          [tool.result]
        );
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            className: "my-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "div",
                {
                  onClick: () => setIsExpanded(!isExpanded),
                  className: "flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900",
                  children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
                    isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                      import_lucide_react3.ChevronDown,
                      {
                        size: 18,
                        className: "text-gray-600 dark:text-gray-300 flex-shrink-0"
                      }
                    ) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                      import_lucide_react3.ChevronRight,
                      {
                        size: 18,
                        className: "text-gray-600 dark:text-gray-300 flex-shrink-0"
                      }
                    ),
                    getStatusIcon(),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-mono text-sm font-semibold text-gray-900 dark:text-gray-100 truncate", children: tool.toolName }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                      "span",
                      {
                        className: `text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusColor()}`,
                        children: tool.status
                      }
                    )
                  ] })
                }
              ),
              isExpanded && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase", children: "Input" }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                      "button",
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          handleCopy(argsString, "input");
                        },
                        className: "p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors",
                        title: "Copy input",
                        children: copiedField === "input" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                          import_lucide_react3.Check,
                          {
                            size: 14,
                            className: "text-green-600"
                          }
                        ) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                          import_lucide_react3.Copy,
                          {
                            size: 14,
                            className: "text-gray-500 dark:text-gray-400"
                          }
                        )
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                    import_react_syntax_highlighter.Prism,
                    {
                      language: "json",
                      style: syntaxTheme,
                      customStyle: {
                        margin: 0,
                        background: bgColor,
                        fontSize: "0.875rem",
                        padding: "1rem"
                      },
                      codeTagProps: {
                        style: {
                          backgroundColor: bgColor
                        }
                      },
                      children: argsString
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 bg-white dark:bg-gray-800", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase", children: "Output" }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                      "button",
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          handleCopy(resultString, "output");
                        },
                        className: "p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors",
                        title: "Copy output",
                        children: copiedField === "output" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                          import_lucide_react3.Check,
                          {
                            size: 14,
                            className: "text-green-600"
                          }
                        ) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                          import_lucide_react3.Copy,
                          {
                            size: 14,
                            className: "text-gray-500 dark:text-gray-400"
                          }
                        )
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                    import_react_syntax_highlighter.Prism,
                    {
                      language: "json",
                      style: syntaxTheme,
                      customStyle: {
                        margin: 0,
                        background: bgColor,
                        fontSize: "0.875rem",
                        padding: "1rem"
                      },
                      codeTagProps: {
                        style: {
                          backgroundColor: bgColor
                        }
                      },
                      children: tool.error ? tool.error : resultString
                    }
                  )
                ] })
              ] })
            ]
          }
        );
      }
    );
    ToolCallDetail.displayName = "ToolCallDetail";
    ToolExecutionWidget = (0, import_react3.memo)(
      ({ steps, theme }) => {
        const [isExpanded, setIsExpanded] = (0, import_react3.useState)(false);
        const allTools = (0, import_react3.useMemo)(() => {
          return steps.filter((step) => step.tools && step.tools.length > 0).flatMap((step) => step.tools || []);
        }, [steps]);
        if (allTools.length === 0) {
          return null;
        }
        const successCount = allTools.filter(
          (t) => t.status === "SUCCESS"
        ).length;
        const errorCount = allTools.filter((t) => t.error).length;
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "my-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "div",
            {
              onClick: () => setIsExpanded(!isExpanded),
              className: "flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
              children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2", children: [
                isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  import_lucide_react3.ChevronDown,
                  {
                    size: 20,
                    className: "text-gray-600 dark:text-gray-300"
                  }
                ) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  import_lucide_react3.ChevronRight,
                  {
                    size: 20,
                    className: "text-gray-600 dark:text-gray-300"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-semibold text-gray-800 dark:text-white", children: "Tool Execution" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full", children: [
                  allTools.length,
                  " ",
                  allTools.length === 1 ? "tool" : "tools"
                ] }),
                successCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.CheckCircle2, { size: 12 }),
                  successCount
                ] }),
                errorCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full flex items-center gap-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.XCircle, { size: 12 }),
                  errorCount
                ] })
              ] })
            }
          ),
          isExpanded && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "border-t border-gray-200 dark:border-gray-700 p-3 space-y-2 bg-gray-50 dark:bg-gray-800", children: allTools.map((tool) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            ToolCallDetail,
            {
              tool,
              theme
            },
            tool.id
          )) })
        ] });
      }
    );
    ToolExecutionWidget.displayName = "ToolExecutionWidget";
  }
});

// app/components/vector-results.tsx
function generateColorVariations(baseColor, isDark) {
  const hex = baseColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  if (isDark) {
    return {
      bg: `rgba(${r}, ${g}, ${b}, 0.15)`,
      // Very light bg
      bgHover: `rgba(${r}, ${g}, ${b}, 0.25)`,
      // Hover bg
      border: `rgba(${r}, ${g}, ${b}, 0.4)`,
      // Border
      icon: `rgba(${r}, ${g}, ${b}, 0.8)`,
      // Icon/accent
      textPrimary: `rgb(${Math.min(r + 100, 255)}, ${Math.min(g + 100, 255)}, ${Math.min(b + 100, 255)})`,
      // Light text
      textSecondary: `rgb(${Math.min(r + 60, 255)}, ${Math.min(g + 60, 255)}, ${Math.min(b + 60, 255)})`,
      // Medium text
      badge: `rgba(${r}, ${g}, ${b}, 0.5)`,
      // Badge bg
      badgeText: `rgb(${Math.min(r + 80, 255)}, ${Math.min(g + 80, 255)}, ${Math.min(b + 80, 255)})`,
      // Badge text
      itemBg: `rgba(${r}, ${g}, ${b}, 0.1)`,
      // Item background
      itemBorder: `rgba(${r}, ${g}, ${b}, 0.35)`,
      // Item border
      itemHover: `rgba(${r}, ${g}, ${b}, 0.18)`
      // Item hover
    };
  } else {
    return {
      bg: `rgb(${Math.min(r + 220, 255)}, ${Math.min(g + 220, 255)}, ${Math.min(b + 220, 255)})`,
      // Very light bg
      bgHover: `rgb(${Math.min(r + 200, 255)}, ${Math.min(g + 200, 255)}, ${Math.min(b + 200, 255)})`,
      // Hover bg
      border: `rgb(${Math.min(r + 150, 255)}, ${Math.min(g + 150, 255)}, ${Math.min(b + 150, 255)})`,
      // Border
      icon: `rgb(${Math.max(r - 50, 0)}, ${Math.max(g - 50, 0)}, ${Math.max(b - 50, 0)})`,
      // Icon/accent
      textPrimary: `rgb(${Math.max(r - 120, 0)}, ${Math.max(g - 120, 0)}, ${Math.max(b - 120, 0)})`,
      // Dark text
      textSecondary: `rgb(${Math.max(r - 80, 0)}, ${Math.max(g - 80, 0)}, ${Math.max(b - 80, 0)})`,
      // Medium text
      badge: `rgb(${Math.min(r + 150, 255)}, ${Math.min(g + 150, 255)}, ${Math.min(b + 150, 255)})`,
      // Badge bg
      badgeText: `rgb(${Math.max(r - 90, 0)}, ${Math.max(g - 90, 0)}, ${Math.max(b - 90, 0)})`,
      // Badge text
      itemBg: `rgb(255, 255, 255)`,
      // Item background (white)
      itemBorder: `rgb(${Math.min(r + 150, 255)}, ${Math.min(g + 150, 255)}, ${Math.min(b + 150, 255)})`,
      // Item border
      itemHover: `rgb(${Math.min(r + 210, 255)}, ${Math.min(g + 210, 255)}, ${Math.min(b + 210, 255)})`
      // Item hover
    };
  }
}
var import_react4, import_lucide_react4, import_jsx_runtime4, VectorResults, VectorResultItem;
var init_vector_results = __esm({
  "app/components/vector-results.tsx"() {
    "use strict";
    import_react4 = require("react");
    import_lucide_react4 = require("lucide-react");
    import_jsx_runtime4 = require("react/jsx-runtime");
    VectorResults = (0, import_react4.memo)(({ vectors, theme = "light", vectorColor, vectorColorDark }) => {
      const [isExpanded, setIsExpanded] = (0, import_react4.useState)(false);
      if (!vectors || vectors.length === 0) {
        return null;
      }
      const isDark = theme === "dark";
      const defaultLightColor = "#9333EA";
      const defaultDarkColor = "#A855F7";
      const baseColor = isDark ? vectorColorDark || defaultDarkColor : vectorColor || defaultLightColor;
      const colors = generateColorVariations(baseColor, isDark);
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
        "div",
        {
          className: "my-4 border rounded-lg overflow-hidden",
          style: {
            backgroundColor: colors.bg,
            borderColor: colors.border
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
              "button",
              {
                onClick: () => setIsExpanded(!isExpanded),
                className: "w-full px-4 py-3 flex items-center justify-between transition-colors",
                style: {
                  backgroundColor: isExpanded ? colors.bgHover : "transparent"
                },
                onMouseEnter: (e) => e.currentTarget.style.backgroundColor = colors.bgHover,
                onMouseLeave: (e) => e.currentTarget.style.backgroundColor = isExpanded ? colors.bgHover : "transparent",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                      import_lucide_react4.Database,
                      {
                        size: 20,
                        style: { color: colors.icon }
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "text-left", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                        "div",
                        {
                          className: "font-semibold",
                          style: { color: colors.textPrimary },
                          children: "Vector Search Results"
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                        "div",
                        {
                          className: "text-sm",
                          style: { color: colors.textSecondary },
                          children: [
                            vectors.length,
                            " ",
                            vectors.length === 1 ? "result" : "results",
                            " found"
                          ]
                        }
                      )
                    ] })
                  ] }),
                  isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                    import_lucide_react4.ChevronDown,
                    {
                      size: 20,
                      style: { color: colors.icon }
                    }
                  ) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                    import_lucide_react4.ChevronRight,
                    {
                      size: 20,
                      style: { color: colors.icon }
                    }
                  )
                ]
              }
            ),
            isExpanded && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              "div",
              {
                className: "border-t",
                style: { borderColor: colors.border },
                children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "p-4 space-y-3", children: vectors.map((vector, index) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  VectorResultItem,
                  {
                    vector,
                    theme,
                    colors
                  },
                  vector.rowId || index
                )) })
              }
            )
          ]
        }
      );
    });
    VectorResults.displayName = "VectorResults";
    VectorResultItem = (0, import_react4.memo)(
      ({ vector, theme, colors }) => {
        const [isExpanded, setIsExpanded] = (0, import_react4.useState)(false);
        const similarityPercentage = (parseFloat(vector.similarity) * 100).toFixed(1);
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "div",
          {
            className: "border rounded-lg",
            style: {
              backgroundColor: colors.itemBg,
              borderColor: colors.itemBorder
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                "button",
                {
                  onClick: () => setIsExpanded(!isExpanded),
                  className: "w-full px-3 py-2 flex items-center justify-between transition-colors rounded-t-lg",
                  onMouseEnter: (e) => e.currentTarget.style.backgroundColor = colors.itemHover,
                  onMouseLeave: (e) => e.currentTarget.style.backgroundColor = "transparent",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex-1 text-left", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                          "span",
                          {
                            className: "text-sm font-medium",
                            style: { color: colors.textPrimary },
                            children: vector.entityName
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                          "span",
                          {
                            className: "text-xs px-2 py-0.5 rounded-full",
                            style: {
                              backgroundColor: colors.badge,
                              color: colors.badgeText
                            },
                            children: [
                              similarityPercentage,
                              "% match"
                            ]
                          }
                        )
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-sm mt-1 text-gray-700 dark:text-gray-300", children: vector.template })
                    ] }),
                    isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                      import_lucide_react4.ChevronDown,
                      {
                        size: 16,
                        style: { color: colors.icon }
                      }
                    ) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                      import_lucide_react4.ChevronRight,
                      {
                        size: 16,
                        style: { color: colors.icon }
                      }
                    )
                  ]
                }
              ),
              isExpanded && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                "div",
                {
                  className: "border-t px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg",
                  style: { borderColor: colors.itemBorder },
                  children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "space-y-2", children: Object.entries(vector.data).map(([key, value]) => {
                    if (key === "id" || key === "createdAt" || key === "updatedAt" || key === "createdBy" || key === "updatedBy") {
                      return null;
                    }
                    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                      "div",
                      {
                        className: "flex items-start gap-2 text-sm",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "font-medium text-gray-700 dark:text-gray-300 min-w-[80px]", children: [
                            key,
                            ":"
                          ] }),
                          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: typeof value === "object" ? JSON.stringify(value) : String(value) })
                        ]
                      },
                      key
                    );
                  }) })
                }
              )
            ]
          }
        );
      }
    );
    VectorResultItem.displayName = "VectorResultItem";
  }
});

// app/components/streaming-markdown.tsx
var import_react5, import_react_markdown, import_remark_gfm, import_rehype_raw, import_react_syntax_highlighter2, import_prism2, import_lucide_react5, import_jsx_runtime5, CodeBlock, StreamingMarkdown;
var init_streaming_markdown = __esm({
  "app/components/streaming-markdown.tsx"() {
    "use strict";
    import_react5 = require("react");
    import_react_markdown = __toESM(require("react-markdown"));
    import_remark_gfm = __toESM(require("remark-gfm"));
    import_rehype_raw = __toESM(require("rehype-raw"));
    import_react_syntax_highlighter2 = require("react-syntax-highlighter");
    import_prism2 = require("react-syntax-highlighter/dist/esm/styles/prism");
    import_lucide_react5 = require("lucide-react");
    import_jsx_runtime5 = require("react/jsx-runtime");
    CodeBlock = (0, import_react5.memo)(
      ({
        language,
        code,
        theme
      }) => {
        const [copied, setCopied] = (0, import_react5.useState)(false);
        const handleCopy = (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2e3);
          }).catch((err) => console.error("Failed to copy code: ", err));
        };
        const getLanguageLabel = (lang) => {
          const langMap = {
            js: "JavaScript",
            javascript: "JavaScript",
            jsx: "JavaScript React",
            ts: "TypeScript",
            typescript: "TypeScript",
            tsx: "TypeScript React",
            py: "Python",
            python: "Python",
            java: "Java",
            cpp: "C++",
            c: "C",
            cs: "C#",
            csharp: "C#",
            go: "Go",
            rs: "Rust",
            rust: "Rust",
            php: "PHP",
            rb: "Ruby",
            ruby: "Ruby",
            sh: "Shell",
            shell: "Shell",
            bash: "Bash",
            zsh: "Zsh",
            sql: "SQL",
            html: "HTML",
            css: "CSS",
            scss: "SCSS",
            json: "JSON",
            xml: "XML",
            yaml: "YAML",
            yml: "YAML",
            md: "Markdown",
            markdown: "Markdown",
            text: "Text",
            plaintext: "Plain Text"
          };
          return langMap[lang.toLowerCase()] || lang.toUpperCase();
        };
        const isDark = theme === "dark";
        const syntaxTheme = isDark ? import_prism2.vscDarkPlus : import_prism2.oneLight;
        const bgColor = isDark ? "#1e1e1e" : "#efefef";
        const headerBg = isDark ? "#1e1e1e" : "#f5f5f5";
        const borderColor = isDark ? "border-gray-700" : "border-gray-300";
        const textColor = isDark ? "text-gray-300" : "text-gray-700";
        const buttonHover = isDark ? "hover:bg-gray-700" : "hover:bg-gray-200";
        const iconColor = isDark ? "text-gray-400" : "text-gray-600";
        return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: `mt-1 mb-3 rounded-lg border-2 ${borderColor}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
            "div",
            {
              className: `sticky top-0 z-20 flex items-center justify-between px-4 py-2 border-b ${borderColor} rounded-tl-lg rounded-tr-lg`,
              style: { top: "-22px", backgroundColor: headerBg },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: `text-xs font-medium ${textColor}`, children: getLanguageLabel(language) }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                  "button",
                  {
                    onClick: handleCopy,
                    className: `p-1.5 rounded transition-colors ${buttonHover}`,
                    title: "Copy code",
                    children: copied ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react5.Check, { size: 14, className: "text-green-500" }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react5.Copy, { size: 14, className: iconColor })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "max-h-80 overflow-auto", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            import_react_syntax_highlighter2.Prism,
            {
              language: language.toLowerCase(),
              style: syntaxTheme,
              customStyle: {
                margin: 0,
                background: bgColor,
                fontSize: "0.875rem",
                padding: "1rem"
              },
              codeTagProps: {
                style: {
                  backgroundColor: bgColor
                }
              },
              children: code
            }
          ) })
        ] });
      }
    );
    CodeBlock.displayName = "CodeBlock";
    StreamingMarkdown = (0, import_react5.memo)(
      ({
        content,
        isStreaming = false,
        theme = "light",
        cursorColor = "#2563EB"
      }) => {
        return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          import_react_markdown.default,
          {
            remarkPlugins: [import_remark_gfm.default],
            rehypePlugins: [import_rehype_raw.default],
            components: {
              blockquote: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("blockquote", { className: "border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-2 my-4 bg-gray-100 dark:bg-gray-800 rounded-md", children }),
              p: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "mb-0", children }),
              h1: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h1", { className: "text-2xl font-bold mb-2 last:mb-0", children }),
              h2: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { className: "text-xl font-bold mb-2 last:mb-0", children }),
              h3: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { className: "text-lg font-bold mb-2 last:mb-0", children }),
              h4: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h4", { className: "text-base font-bold mb-2 last:mb-0", children }),
              h5: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h5", { className: "text-sm font-bold mb-2 last:mb-0", children }),
              h6: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h6", { className: "text-xs font-bold mb-2 last:mb-0", children }),
              ul: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("ul", { className: "list-disc list-outside ml-6 mb-2 last:mb-0 space-y-1", children }),
              ol: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("ol", { className: "list-decimal list-outside ml-6 mb-2 last:mb-0 space-y-1", children }),
              li: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("li", { className: "mb-1", children }),
              hr: () => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("hr", { className: "my-4 border-t border-gray-200 dark:border-gray-700 mb-3" }),
              a: ({ href, children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                "a",
                {
                  href,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-500 hover:text-blue-600 underline",
                  children
                }
              ),
              pre: (_a) => {
                var _b = _a, { children } = _b, props = __objRest(_b, ["children"]);
                const childArray = Array.isArray(children) ? children : [children];
                const codeElement = childArray.find(
                  (child) => {
                    var _a2, _b2;
                    return (_b2 = (_a2 = child == null ? void 0 : child.props) == null ? void 0 : _a2.className) == null ? void 0 : _b2.startsWith("language-");
                  }
                );
                if (codeElement) {
                  const language = codeElement.props.className.replace("language-", "") || "text";
                  const code = String(codeElement.props.children || "").replace(
                    /\n$/,
                    ""
                  );
                  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CodeBlock, { language, code, theme });
                }
                return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("pre", { className: "my-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-x-auto", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { className: "text-sm font-mono text-gray-800 dark:text-gray-200", children }) });
              },
              code: (_c) => {
                var _d = _c, { className, children } = _d, props = __objRest(_d, ["className", "children"]);
                const isInlineCode = !className;
                return isInlineCode ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { className: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono", children }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", __spreadProps(__spreadValues({ className }, props), { children }));
              },
              table: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "overflow-x-auto my-4", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("table", { className: "border-collapse w-full", children }) }),
              th: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("th", { className: "border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left", children }),
              td: (_e) => {
                var _f = _e, { children } = _f, props = __objRest(_f, ["children"]);
                return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                  "td",
                  __spreadProps(__spreadValues({
                    className: "border border-gray-300 dark:border-gray-700 px-4 py-2"
                  }, props), {
                    children
                  })
                );
              }
            },
            children: content
          }
        );
      }
    );
    StreamingMarkdown.displayName = "StreamingMarkdown";
  }
});

// app/components/chart-component.tsx
var chart_component_exports = {};
__export(chart_component_exports, {
  default: () => ChartComponent
});
function ChartComponent({
  type,
  data,
  theme
}) {
  const [error, setError] = (0, import_react6.useState)(null);
  const [chartOptions, setChartOptions] = (0, import_react6.useState)({});
  const [isRecovering, setIsRecovering] = (0, import_react6.useState)(false);
  const [renderError, setRenderError] = (0, import_react6.useState)(false);
  const [isReady, setIsReady] = (0, import_react6.useState)(false);
  const chartRef = (0, import_react6.useRef)(null);
  const containerRef = (0, import_react6.useRef)(null);
  const recoveryTimeoutRef = (0, import_react6.useRef)(null);
  const mountedRef = (0, import_react6.useRef)(true);
  const readyTimeoutRef = (0, import_react6.useRef)(null);
  const scrollTimeoutRef = (0, import_react6.useRef)(null);
  const cleanupChart = () => {
    if (chartRef.current) {
      try {
        if (typeof chartRef.current.destroy === "function") {
          chartRef.current.destroy();
        }
      } catch (err) {
        console.warn("Error destroying chart instance:", err);
      }
      chartRef.current = null;
    }
  };
  (0, import_react6.useEffect)(() => {
    var _a;
    if (!((_a = chartRef.current) == null ? void 0 : _a.canvas)) return;
    const canvas = chartRef.current.canvas;
    const blockWheelEvents = (e) => {
      e.preventDefault();
      e.stopPropagation();
      let scrollableParent = canvas.parentElement;
      while (scrollableParent && scrollableParent !== document.body) {
        const style = window.getComputedStyle(scrollableParent);
        if (style.overflowY === "auto" || style.overflowY === "scroll") {
          break;
        }
        scrollableParent = scrollableParent.parentElement;
      }
      const target = scrollableParent || window;
      if (target === window) {
        window.scrollBy(0, e.deltaY);
      } else {
        scrollableParent.scrollTop += e.deltaY;
      }
    };
    canvas.addEventListener("wheel", blockWheelEvents, { passive: false });
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          canvas.style.position = "static";
          canvas.style.transform = "none";
          canvas.style.willChange = "auto";
        }
      });
    });
    observer.observe(canvas, {
      attributes: true,
      attributeFilter: ["style"]
    });
    return () => {
      observer.disconnect();
      canvas.removeEventListener("wheel", blockWheelEvents);
    };
  }, [isReady]);
  const recoverFromError = () => {
    if (!mountedRef.current) return;
    setIsRecovering(true);
    setRenderError(false);
    setIsReady(false);
    cleanupChart();
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
    }
    recoveryTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setError(null);
        setIsRecovering(false);
        setTimeout(() => {
          if (mountedRef.current) {
            setIsReady(true);
          }
        }, 100);
      }
    }, 500);
  };
  (0, import_react6.useEffect)(() => {
    mountedRef.current = true;
    readyTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setIsReady(true);
      }
    }, 50);
    return () => {
      mountedRef.current = false;
      cleanupChart();
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  const getThemeColors = (currentTheme) => {
    const isDark = currentTheme === "dark" || !currentTheme && document.documentElement.classList.contains("dark");
    return {
      textColor: isDark ? "white" : "black",
      tickColor: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
      gridColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
    };
  };
  (0, import_react6.useEffect)(() => {
    if (isRecovering) return;
    setError(null);
    try {
      if (!data || !data.data) {
        setError("Chart data missing required 'data' property");
        return;
      }
      const sanitizedData = JSON.parse(JSON.stringify(data.data));
      const chartType = type.toLowerCase();
      if (["line", "bar", "area"].includes(chartType)) {
        if (!sanitizedData.labels || !Array.isArray(sanitizedData.labels)) {
          setError("Missing or invalid 'labels' array for this chart type");
          return;
        }
        if (!sanitizedData.datasets || !Array.isArray(sanitizedData.datasets)) {
          setError("Missing or invalid 'datasets' array for this chart type");
          return;
        }
        for (let i = 0; i < sanitizedData.datasets.length; i++) {
          const dataset = sanitizedData.datasets[i];
          if (!dataset.data || !Array.isArray(dataset.data)) {
            setError(`Dataset ${i + 1} missing or invalid data array`);
            return;
          }
          if (chartType === "line" || chartType === "area") {
            if (dataset.data.length < 2) {
              setError(
                `Line charts require at least 2 data points. Dataset ${i + 1} has ${dataset.data.length} points.`
              );
              return;
            }
          }
          const validData = dataset.data.map((point, index) => {
            if (typeof point === "number" && !isNaN(point) && isFinite(point)) {
              return point;
            } else if (typeof point === "object" && point !== null) {
              if (typeof point.y === "number" && isFinite(point.y)) {
                return {
                  x: point.x !== void 0 ? point.x : index,
                  y: point.y
                };
              } else if (typeof point.x === "number" && typeof point.y === "number") {
                return {
                  x: isFinite(point.x) ? point.x : index,
                  y: isFinite(point.y) ? point.y : 0
                };
              }
            }
            return 0;
          });
          dataset.data = validData;
          if (chartType === "line" || chartType === "area") {
            if (typeof dataset.tension !== "number" || isNaN(dataset.tension) || !isFinite(dataset.tension)) {
              dataset.tension = 0.1;
            } else {
              dataset.tension = Math.max(0, Math.min(1, dataset.tension));
            }
            if (!dataset.borderColor) {
              dataset.borderColor = "#4BC0C0";
            }
            if (chartType === "area" && !dataset.backgroundColor) {
              dataset.backgroundColor = "rgba(75, 192, 192, 0.2)";
            }
            Object.keys(dataset).forEach((key) => {
              if (dataset[key] === void 0 || dataset[key] === null) {
                delete dataset[key];
              }
            });
          }
          if (dataset.fill !== void 0 && typeof dataset.fill === "string") {
            const validFillValues = ["origin", "start", "end", "stack"];
            if (!validFillValues.includes(dataset.fill) && !dataset.fill.match(/^\d+$/)) {
              dataset.fill = true;
            }
          }
        }
        const maxDataLength = Math.max(
          ...sanitizedData.datasets.map((d) => d.data.length)
        );
        if (sanitizedData.labels.length !== maxDataLength) {
          console.warn(
            "Labels length does not match data length, adjusting..."
          );
          if (sanitizedData.labels.length < maxDataLength) {
            for (let i = sanitizedData.labels.length; i < maxDataLength; i++) {
              sanitizedData.labels.push(`Point ${i + 1}`);
            }
          } else {
            sanitizedData.labels = sanitizedData.labels.slice(0, maxDataLength);
          }
        }
        sanitizedData.labels = sanitizedData.labels.map(
          (label, index) => {
            if (typeof label === "string") return label;
            if (typeof label === "number") return label.toString();
            return `Label ${index + 1}`;
          }
        );
      }
      if (["pie", "doughnut", "polararea"].includes(chartType)) {
        if (!sanitizedData.datasets || !Array.isArray(sanitizedData.datasets) || sanitizedData.datasets.length === 0) {
          setError("Missing dataset information for this chart type");
          return;
        }
        if (chartType === "polararea") {
          for (let i = 0; i < sanitizedData.datasets.length; i++) {
            const dataset = sanitizedData.datasets[i];
            if (!dataset.data || !Array.isArray(dataset.data)) {
              setError(
                `Polar area chart dataset ${i + 1} missing or invalid data array`
              );
              return;
            }
            const validData = dataset.data.map((point) => {
              if (typeof point === "number" && !isNaN(point) && isFinite(point)) {
                return Math.max(0, point);
              }
              return 0;
            });
            dataset.data = validData;
          }
        }
      }
      if (chartType === "scatter" && (!sanitizedData.datasets || !Array.isArray(sanitizedData.datasets))) {
        setError("Missing or invalid dataset for scatter chart");
        return;
      }
      if (chartType === "bubble") {
        if (!sanitizedData.datasets || !Array.isArray(sanitizedData.datasets)) {
          setError("Missing or invalid dataset for bubble chart");
          return;
        }
        for (let i = 0; i < sanitizedData.datasets.length; i++) {
          const dataset = sanitizedData.datasets[i];
          if (!dataset.data || !Array.isArray(dataset.data)) {
            setError(
              `Bubble chart dataset ${i + 1} missing or invalid data array`
            );
            return;
          }
          const validBubbleData = dataset.data.map(
            (point, index) => {
              if (typeof point === "object" && point !== null) {
                const x = typeof point.x === "number" && isFinite(point.x) ? point.x : index;
                const y = typeof point.y === "number" && isFinite(point.y) ? point.y : 0;
                const r = typeof point.r === "number" && isFinite(point.r) && point.r > 0 ? point.r : 5;
                return { x, y, r };
              }
              return { x: index, y: 0, r: 5 };
            }
          );
          dataset.data = validBubbleData;
        }
      }
      if (sanitizedData.datasets && sanitizedData.datasets.length === 0) {
        setError("No data to display in chart");
        return;
      }
      if (sanitizedData.datasets) {
        for (const dataset of sanitizedData.datasets) {
          if (!dataset.data || !Array.isArray(dataset.data) && typeof dataset.data !== "object") {
            setError("Invalid dataset data structure");
            return;
          }
        }
      }
      data.data = sanitizedData;
    } catch (err) {
      setError("An error occurred while processing chart data");
      console.error("Chart validation error:", err);
      setTimeout(recoverFromError, 500);
    }
  }, [type, data, isRecovering]);
  (0, import_react6.useEffect)(() => {
    var _a, _b, _c, _d;
    const colors = getThemeColors(theme);
    const newOptions = {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 50,
      devicePixelRatio: window.devicePixelRatio || 1,
      animation: false,
      events: ["mousemove", "mouseout", "click", "touchstart", "touchmove"],
      onResize: (chart) => {
        if (chart && chart.canvas) {
          chart.canvas.style.position = "static";
          chart.canvas.style.display = "block";
          chart.canvas.style.transform = "none";
          chart.canvas.style.willChange = "auto";
        }
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: colors.textColor,
            boxWidth: 12,
            padding: 15,
            font: {
              size: 12
            },
            usePointStyle: true
          }
        },
        title: {
          display: true,
          text: ((_c = (_b = (_a = data.options) == null ? void 0 : _a.plugins) == null ? void 0 : _b.title) == null ? void 0 : _c.text) || "Chart",
          color: colors.textColor,
          font: {
            size: 14,
            weight: "bold"
          },
          padding: {
            top: 10,
            bottom: 10
          }
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: false
            },
            pinch: {
              enabled: false
            },
            mode: "xy"
          },
          pan: {
            enabled: false
          }
        }
      },
      elements: {
        point: {
          hoverRadius: 6,
          radius: 3
        },
        line: {
          tension: 0.1
        }
      },
      interaction: {
        intersect: false,
        mode: "index",
        includeInvisible: false
      },
      scales: {
        x: {
          ticks: {
            color: colors.tickColor,
            maxRotation: 45,
            minRotation: 0,
            autoSkip: true,
            autoSkipPadding: 5
          },
          grid: {
            color: colors.gridColor
          }
        },
        y: {
          ticks: {
            color: colors.tickColor
          },
          grid: {
            color: colors.gridColor
          }
        }
      },
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 0,
          bottom: 5
        }
      }
    };
    const finalOptions = __spreadProps(__spreadValues(__spreadValues({}, newOptions), data.options), {
      plugins: __spreadValues(__spreadValues({}, newOptions.plugins), (_d = data.options) == null ? void 0 : _d.plugins)
    });
    setChartOptions(finalOptions);
  }, [theme, data]);
  const renderChart = () => {
    var _a, _b, _c, _d;
    if (renderError) {
      return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-5 w-5",
              viewBox: "0 0 20 20",
              fill: "currentColor",
              children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                "path",
                {
                  fillRule: "evenodd",
                  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
                  clipRule: "evenodd"
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { className: "font-medium", children: "Chart rendering failed" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "ml-8 text-sm mb-3", children: "The chart could not be rendered due to a technical error." }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "button",
          {
            onClick: recoverFromError,
            className: "ml-8 px-3 py-1 text-xs bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors",
            disabled: isRecovering,
            children: isRecovering ? "Recovering..." : "Try Again"
          }
        )
      ] });
    }
    if (!data || !data.data || !chartOptions) {
      return null;
    }
    try {
      const safeChartData = JSON.parse(JSON.stringify(data.data));
      const safeChartOptions = JSON.parse(JSON.stringify(chartOptions));
      if (type.toLowerCase() === "line" || type.toLowerCase() === "area") {
        safeChartData.datasets = safeChartData.datasets.map((dataset) => __spreadProps(__spreadValues({}, dataset), {
          tension: typeof dataset.tension === "number" && isFinite(dataset.tension) ? dataset.tension : 0.1,
          borderColor: dataset.borderColor || "#4BC0C0",
          pointRadius: dataset.pointRadius !== void 0 ? dataset.pointRadius : 3,
          pointHoverRadius: dataset.pointHoverRadius !== void 0 ? dataset.pointHoverRadius : 6,
          spanGaps: true
          // This helps with missing data points
        }));
        safeChartOptions.scales = __spreadProps(__spreadValues({}, safeChartOptions.scales), {
          x: __spreadProps(__spreadValues({}, (_a = safeChartOptions.scales) == null ? void 0 : _a.x), {
            type: "category"
          }),
          y: __spreadProps(__spreadValues({}, (_b = safeChartOptions.scales) == null ? void 0 : _b.y), {
            type: "linear"
          })
        });
      }
      switch (type.toLowerCase()) {
        case "line":
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            import_react_chartjs_2.Line,
            {
              ref: chartRef,
              data: safeChartData,
              options: safeChartOptions,
              style: {
                width: "100%",
                height: "100%",
                display: "block",
                position: "static"
              }
            }
          );
        case "bar":
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            import_react_chartjs_2.Bar,
            {
              ref: chartRef,
              data: safeChartData,
              options: safeChartOptions,
              style: {
                width: "100%",
                height: "100%",
                display: "block",
                position: "static"
              }
            }
          );
        case "pie":
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            import_react_chartjs_2.Pie,
            {
              ref: chartRef,
              data: safeChartData,
              options: safeChartOptions,
              style: {
                width: "100%",
                height: "100%",
                display: "block",
                position: "static"
              }
            }
          );
        case "doughnut":
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            import_react_chartjs_2.Doughnut,
            {
              ref: chartRef,
              data: safeChartData,
              options: safeChartOptions,
              style: {
                width: "100%",
                height: "100%",
                display: "block",
                position: "static"
              }
            }
          );
        case "polararea":
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            import_react_chartjs_2.PolarArea,
            {
              ref: chartRef,
              data: safeChartData,
              options: safeChartOptions,
              style: {
                width: "100%",
                height: "100%",
                display: "block",
                position: "static"
              }
            }
          );
        case "scatter":
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            import_react_chartjs_2.Scatter,
            {
              ref: chartRef,
              data: safeChartData,
              options: safeChartOptions,
              style: {
                width: "100%",
                height: "100%",
                display: "block",
                position: "static"
              }
            }
          );
        case "bubble":
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            import_react_chartjs_2.Bubble,
            {
              ref: chartRef,
              data: safeChartData,
              options: safeChartOptions,
              style: {
                width: "100%",
                height: "100%",
                display: "block",
                position: "static"
              }
            }
          );
        case "radar":
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            import_react_chartjs_2.Radar,
            {
              ref: chartRef,
              data: safeChartData,
              options: safeChartOptions,
              style: {
                width: "100%",
                height: "100%",
                display: "block",
                position: "static"
              }
            }
          );
        case "area":
          const areaData = __spreadProps(__spreadValues({}, safeChartData), {
            datasets: safeChartData.datasets.map((dataset) => __spreadProps(__spreadValues({}, dataset), {
              fill: true,
              backgroundColor: dataset.backgroundColor || "rgba(75, 192, 192, 0.2)",
              borderColor: dataset.borderColor || "rgba(75, 192, 192, 1)",
              tension: typeof dataset.tension === "number" && isFinite(dataset.tension) ? dataset.tension : 0.4,
              pointRadius: dataset.pointRadius !== void 0 ? dataset.pointRadius : 3,
              pointHoverRadius: dataset.pointHoverRadius !== void 0 ? dataset.pointHoverRadius : 6,
              spanGaps: true
            }))
          });
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            import_react_chartjs_2.Line,
            {
              ref: chartRef,
              data: areaData,
              options: safeChartOptions,
              style: {
                width: "100%",
                height: "100%",
                display: "block",
                position: "static"
              }
            }
          );
        default:
          return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "p-6 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 rounded-lg border border-amber-100 dark:border-amber-800 w-full max-w-full", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  className: "h-5 w-5",
                  viewBox: "0 0 20 20",
                  fill: "currentColor",
                  children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                    "path",
                    {
                      fillRule: "evenodd",
                      d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z",
                      clipRule: "evenodd"
                    }
                  )
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { children: [
                "Unsupported chart type: ",
                type
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-sm mt-2 ml-8", children: "Supported types: line, bar, pie, doughnut, polararea, scatter, bubble, radar, area" })
          ] });
      }
    } catch (renderError2) {
      console.error("Chart rendering error:", renderError2);
      if (((_c = renderError2.message) == null ? void 0 : _c.includes("cp1x")) || ((_d = renderError2.message) == null ? void 0 : _d.includes("control point"))) {
        console.error(
          "Chart.js control point error detected during render. Chart data:",
          JSON.stringify(data, null, 2)
        );
        setError(
          "Chart rendering failed due to data structure issues. Please check your data format."
        );
      } else {
        console.error("General chart rendering error:", renderError2.message);
        setRenderError(true);
      }
      return null;
    }
  };
  const ErrorFallback = () => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "w-full h-64 md:h-96 max-w-full overflow-hidden flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "text-center p-6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center justify-center gap-3 mb-3 text-red-600 dark:text-red-300", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-8 w-8",
          viewBox: "0 0 20 20",
          fill: "currentColor",
          children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "path",
            {
              fillRule: "evenodd",
              d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
              clipRule: "evenodd"
            }
          )
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { className: "font-medium text-lg", children: "Chart Error" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { className: "text-sm text-red-600 dark:text-red-300 mb-4", children: [
      "Something went wrong while rendering the ",
      type,
      " chart."
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "button",
      {
        onClick: recoverFromError,
        className: "px-4 py-2 text-sm bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors",
        disabled: isRecovering,
        children: isRecovering ? "Recovering..." : "Try Again"
      }
    )
  ] }) });
  const MainChart = () => {
    if (error) {
      return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800 w-full max-w-full", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-5 w-5",
              viewBox: "0 0 20 20",
              fill: "currentColor",
              children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                "path",
                {
                  fillRule: "evenodd",
                  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
                  clipRule: "evenodd"
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { className: "font-medium", children: "Chart data issue" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "ml-8 text-sm mb-3", children: error }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "button",
          {
            onClick: recoverFromError,
            className: "ml-8 px-3 py-1 text-xs bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors",
            disabled: isRecovering,
            children: isRecovering ? "Recovering..." : "Try Again"
          }
        )
      ] });
    }
    if (isRecovering || !isReady) {
      return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "w-full h-64 md:h-96 max-w-full overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "text-gray-500 dark:text-gray-400", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
          "svg",
          {
            className: "animate-spin h-8 w-8 mx-auto mb-2",
            fill: "none",
            viewBox: "0 0 24 24",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                "circle",
                {
                  className: "opacity-25",
                  cx: "12",
                  cy: "12",
                  r: "10",
                  stroke: "currentColor",
                  strokeWidth: "4"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                "path",
                {
                  className: "opacity-75",
                  fill: "currentColor",
                  d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-sm", children: isRecovering ? "Recovering chart..." : "Initializing chart..." })
      ] }) });
    }
    try {
      return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "div",
        {
          ref: containerRef,
          className: "w-full h-64 md:h-96 max-w-full overflow-hidden relative isolate",
          style: {
            contain: "layout style paint",
            overscrollBehavior: "contain",
            scrollSnapAlign: "start",
            scrollMargin: "1rem",
            isolation: "isolate"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "div",
            {
              className: "w-full h-full",
              style: {
                contain: "layout style paint",
                display: "block",
                position: "static",
                width: "100%",
                height: "100%"
              },
              children: renderChart()
            }
          )
        }
      );
    } catch (err) {
      console.error("Main chart render error:", err);
      setRenderError(true);
      return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ErrorFallback, {});
    }
  };
  try {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ChartErrorBoundary, { fallback: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ErrorFallback, {}), children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(MainChart, {}) });
  } catch (err) {
    console.error("Error rendering chart:", err);
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ErrorFallback, {});
  }
}
var import_chart, import_chartjs_plugin_zoom, import_react_chartjs_2, import_react6, import_react7, import_jsx_runtime6, ChartErrorBoundary;
var init_chart_component = __esm({
  "app/components/chart-component.tsx"() {
    "use strict";
    import_chart = require("chart.js");
    import_chartjs_plugin_zoom = __toESM(require("chartjs-plugin-zoom"));
    import_react_chartjs_2 = require("react-chartjs-2");
    import_react6 = require("react");
    import_react7 = require("react");
    import_jsx_runtime6 = require("react/jsx-runtime");
    import_chart.Chart.register(
      import_chart.CategoryScale,
      import_chart.LinearScale,
      import_chart.PointElement,
      import_chart.LineElement,
      import_chart.BarElement,
      import_chart.ArcElement,
      import_chart.RadialLinearScale,
      import_chart.Title,
      import_chart.Tooltip,
      import_chart.Legend,
      import_chart.Filler,
      import_chartjs_plugin_zoom.default
    );
    ChartErrorBoundary = class extends import_react7.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false };
      }
      static getDerivedStateFromError(error) {
        var _a, _b;
        console.error("Chart Error Boundary caught an error:", error);
        if (((_a = error.message) == null ? void 0 : _a.includes("cp1x")) || ((_b = error.message) == null ? void 0 : _b.includes("control point"))) {
          console.warn(
            "Chart.js control point error detected - this usually indicates data structure issues"
          );
        }
        return { hasError: true, error };
      }
      componentDidCatch(error, errorInfo) {
        var _a, _b;
        console.error("Chart Error Boundary caught an error:", error, errorInfo);
        if (((_a = error.message) == null ? void 0 : _a.includes("cp1x")) || ((_b = error.message) == null ? void 0 : _b.includes("control point"))) {
          console.error(
            "This appears to be a Chart.js control point error. Common causes:"
          );
          console.error("- Invalid data structure for line charts");
          console.error("- Missing or null data points");
          console.error("- Improper tension values");
          console.error("- Chart rendered before data validation complete");
        }
      }
      render() {
        if (this.state.hasError) {
          return this.props.fallback;
        }
        return this.props.children;
      }
    };
  }
});

// app/components/chat-message.tsx
var chat_message_exports = {};
__export(chat_message_exports, {
  default: () => ChatMessage
});
function ChatMessage({
  message,
  isStreaming = false,
  theme,
  onAnalyticOpen,
  messageBubbleColor = "#E5E3F8",
  streamingText = "Naia is working on it...",
  streamingTextColor = "#2563EB",
  vectorColor,
  vectorColorDark,
  agentId,
  onFeedbackChange
}) {
  var _a, _b;
  const { role, content } = message;
  const [copied, setCopied] = (0, import_react8.useState)(false);
  const [imageDialogOpen, setImageDialogOpen] = (0, import_react8.useState)(false);
  const [selectedImage, setSelectedImage] = (0, import_react8.useState)(null);
  const messageContainerRef = (0, import_react8.useRef)(null);
  const [feedback, setFeedback] = (0, import_react8.useState)(
    ((_a = message.metadata) == null ? void 0 : _a.feedbackPositive) !== void 0 ? message.metadata.feedbackPositive : null
  );
  const [feedbackLoading, setFeedbackLoading] = (0, import_react8.useState)(false);
  const handleFeedback = async (isPositive) => {
    var _a2;
    if (!((_a2 = message.metadata) == null ? void 0 : _a2.logId) || !agentId || feedbackLoading) return;
    if (feedback === isPositive) return;
    setFeedbackLoading(true);
    try {
      const response = await chatClient.feedback.submit(
        message.metadata.logId,
        isPositive,
        agentId
      );
      if (response.success) {
        setFeedback(isPositive);
        if (onFeedbackChange) {
          onFeedbackChange(message.id, isPositive);
        }
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setFeedbackLoading(false);
    }
  };
  const handleImageClick = (imageSrc, imageAlt = "Image") => {
    setSelectedImage({ src: imageSrc, alt: imageAlt });
    setImageDialogOpen(true);
  };
  const closeImageDialog = () => {
    setImageDialogOpen(false);
    setSelectedImage(null);
  };
  (0, import_react8.useEffect)(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && imageDialogOpen) {
        closeImageDialog();
      }
    };
    if (imageDialogOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [imageDialogOpen]);
  const detectChartBlocks = (markdown) => {
    const chartPattern = /```chart:([a-z]+)\n([\s\S]*?)\n```/g;
    const charts = [];
    let match;
    while ((match = chartPattern.exec(markdown)) !== null) {
      charts.push({
        type: match[1],
        data: match[2],
        index: match.index,
        fullMatch: match[0]
      });
    }
    return charts;
  };
  const captureChartsAsImages = async () => {
    if (!messageContainerRef.current) {
      return [];
    }
    const canvases = messageContainerRef.current.querySelectorAll("canvas");
    const images = [];
    canvases.forEach((canvas) => {
      try {
        const dataUrl = canvas.toDataURL("image/png");
        images.push(dataUrl);
      } catch (e) {
        console.error("Failed to capture chart canvas:", e);
        images.push("");
      }
    });
    return images;
  };
  const convertMarkdownToStyledHTML = (markdown, chartImages) => {
    let processedMarkdown = markdown;
    if (chartImages && chartImages.length > 0) {
      const chartBlocks = detectChartBlocks(markdown);
      chartBlocks.reverse().forEach((chart, index) => {
        const imageIndex = chartBlocks.length - 1 - index;
        const imageData = chartImages[imageIndex];
        if (imageData) {
          const imgTag = `

![Chart: ${chart.type}](${imageData})

`;
          processedMarkdown = processedMarkdown.substring(0, chart.index) + imgTag + processedMarkdown.substring(
            chart.index + chart.fullMatch.length
          );
        }
      });
    }
    import_marked.marked.setOptions({
      gfm: true,
      // GitHub Flavored Markdown
      breaks: true
      // Convert \n to <br>
    });
    let html = import_marked.marked.parse(processedMarkdown);
    const styledHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
        ${html}
      </div>
    `;
    return styledHTML.replace(
      /<h1>/g,
      '<h1 style="font-size: 2em; font-weight: bold; margin: 0.67em 0; color: #1a1a1a;">'
    ).replace(
      /<h2>/g,
      '<h2 style="font-size: 1.5em; font-weight: bold; margin: 0.75em 0; color: #1a1a1a;">'
    ).replace(
      /<h3>/g,
      '<h3 style="font-size: 1.17em; font-weight: bold; margin: 0.83em 0; color: #1a1a1a;">'
    ).replace(
      /<h4>/g,
      '<h4 style="font-size: 1em; font-weight: bold; margin: 1em 0; color: #1a1a1a;">'
    ).replace(
      /<h5>/g,
      '<h5 style="font-size: 0.83em; font-weight: bold; margin: 1.17em 0; color: #1a1a1a;">'
    ).replace(
      /<h6>/g,
      '<h6 style="font-size: 0.67em; font-weight: bold; margin: 1.33em 0; color: #1a1a1a;">'
    ).replace(/<p>/g, '<p style="margin: 0.5em 0;">').replace(/<strong>/g, '<strong style="font-weight: bold;">').replace(/<em>/g, '<em style="font-style: italic;">').replace(
      /<pre>/g,
      `<pre style="background-color: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; padding: 12px; overflow-x: auto; margin: 1em 0; font-family: 'Courier New', Courier, monospace; font-size: 13px;">`
    ).replace(
      /<code>/g,
      `<code style="font-family: 'Courier New', Courier, monospace; font-size: 13px; background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px;">`
    ).replace(
      /<ul>/g,
      '<ul style="margin: 0.5em 0; padding-left: 2em; list-style-type: disc;">'
    ).replace(
      /<ol>/g,
      '<ol style="margin: 0.5em 0; padding-left: 2em; list-style-type: decimal;">'
    ).replace(/<li>/g, '<li style="margin: 0.25em 0;">').replace(
      /<table>/g,
      '<table style="border-collapse: collapse; width: 100%; margin: 1em 0; border: 1px solid #ddd;">'
    ).replace(
      /<th>/g,
      '<th style="border: 1px solid #ddd; padding: 8px 12px; background-color: #f5f5f5; font-weight: bold; text-align: left;">'
    ).replace(
      /<td>/g,
      '<td style="border: 1px solid #ddd; padding: 8px 12px;">'
    ).replace(/<tr>/g, '<tr style="border-bottom: 1px solid #ddd;">').replace(
      /<a href=/g,
      '<a style="color: #0066cc; text-decoration: underline;" href='
    ).replace(
      /<blockquote>/g,
      '<blockquote style="border-left: 4px solid #ddd; margin: 1em 0; padding: 0.5em 1em; color: #666; background-color: #f9f9f9;">'
    ).replace(
      /<hr>/g,
      '<hr style="border: none; border-top: 1px solid #ddd; margin: 1em 0;">'
    ).replace(
      /<img /g,
      '<img style="max-width: 100%; height: auto; display: block; margin: 1em 0; border: 1px solid #ddd; border-radius: 4px;" '
    );
  };
  const copyToClipboard = async () => {
    const textToCopy = typeof content === "string" ? content : Array.isArray(content) ? content.filter((part) => part.type === "text").map((part) => part.text).join("\n") : "";
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const chartImages = await captureChartsAsImages();
        const htmlContent = convertMarkdownToStyledHTML(
          textToCopy,
          chartImages
        );
        const blob = new Blob([htmlContent], { type: "text/html" });
        const textBlob = new Blob([textToCopy], { type: "text/plain" });
        const clipboardItem = new ClipboardItem({
          "text/html": blob,
          "text/plain": textBlob
        });
        await navigator.clipboard.write([clipboardItem]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2e3);
      } else {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2e3);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2e3);
      } catch (fallbackErr) {
        console.error("Fallback copy also failed: ", fallbackErr);
      }
    }
  };
  const StreamingIndicator = () => {
    if (!isStreaming || role !== "assistant") {
      return null;
    }
    const hasContent = typeof content === "string" && content.trim().length > 0;
    if (hasContent) {
      return null;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "mt-3 inline-flex items-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "flex items-center space-x-1", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "span",
        {
          className: "text-sm font-medium streaming-text",
          style: { color: streamingTextColor },
          children: streamingText
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("style", { children: `
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-3px);
            }
          }

          .streaming-text {
            animation: bounce 1.5s ease-in-out infinite;
          }
        ` })
    ] });
  };
  const renderChart = (chartType, chartData, key) => {
    try {
      const cleanJsonString = chartData.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "").replace(/,(\s*[}\]])/g, "$1");
      const parsedData = JSON.parse(cleanJsonString);
      const formattedData = parsedData.data ? parsedData : { data: parsedData };
      return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        MemoizedChart,
        {
          type: chartType,
          data: formattedData,
          theme
        },
        key || `chart-${chartType}-${cleanJsonString.length}`
      );
    } catch (error) {
      console.error("Failed to parse chart data:", error);
      return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800 w-full max-w-full my-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-5 w-5",
              viewBox: "0 0 20 20",
              fill: "currentColor",
              children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "path",
                {
                  fillRule: "evenodd",
                  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
                  clipRule: "evenodd"
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "font-medium", children: "Unable to generate chart" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "ml-8 text-sm", children: "The data format is not compatible with the requested chart type. Please try a different visualization or check the data structure." })
      ] });
    }
  };
  const renderImage = (imageData, key) => {
    const trimmedData = imageData.trim();
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "div",
      {
        className: "my-6 p-2",
        children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "max-w-full", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "img",
            {
              src: trimmedData,
              alt: "Generated image",
              className: "max-w-full max-h-96 rounded-md object-contain mb-2 cursor-pointer hover:opacity-90 transition-opacity",
              onClick: () => handleImageClick(trimmedData, "Generated image"),
              onError: (e) => {
                console.error("Failed to load image:", trimmedData);
                e.target.style.display = "none";
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "flex justify-end text-sm mr-2", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "a",
            {
              href: trimmedData,
              download: "generated-image.jpeg",
              className: "text-blue-500 hover:text-blue-600",
              children: "Download"
            }
          ) })
        ] })
      },
      key || `image-${trimmedData.substring(0, 50)}`
    );
  };
  const renderJson = (title, jsonData, key) => {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      JsonBlock,
      {
        title,
        jsonContent: jsonData.trim(),
        keyProp: key || `json-${title.replace(/\s/g, "")}`
      },
      key || `json-${title.replace(/\s/g, "")}`
    );
  };
  const renderAnalytic = (analyticData, key) => {
    var _a2;
    const lines = analyticData.trim().split("\n");
    const headers = ((_a2 = lines[0]) == null ? void 0 : _a2.split(";")) || [];
    const dataRows = lines.slice(1);
    const recordCount = dataRows.length;
    const columnCount = headers.length;
    const datasetName = headers.length > 0 ? `Dataset (${headers.join(", ")})` : "Analytics Dataset";
    const handleAnalyticClick = () => {
      if (onAnalyticOpen) {
        onAnalyticOpen(datasetName, analyticData);
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "div",
      {
        onClick: handleAnalyticClick,
        className: "my-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 cursor-pointer hover:shadow-md transition-shadow",
        children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "svg",
              {
                className: "w-6 h-6 text-white",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                xmlns: "http://www.w3.org/2000/svg",
                children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  }
                )
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "font-semibold text-gray-800 dark:text-gray-200", children: "Analytics Dataset" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                recordCount,
                " records, ",
                columnCount,
                " columns - Click to analyze"
              ] }),
              headers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-1", children: [
                "Fields: ",
                headers.slice(0, 3).join(", "),
                headers.length > 3 ? ` (+${headers.length - 3} more)` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "px-3 py-1 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full", children: "Pivot Table" })
        ] })
      },
      key || `analytic-${analyticData.substring(0, 50)}`
    );
  };
  const ImageLoadingIndicator = (0, import_react8.memo)(
    ({ isStreaming: isStreaming2 }) => {
      (0, import_react8.useEffect)(() => {
        if (isStreaming2) {
          const timeout = setTimeout(() => {
            console.warn(
              "Image generation timeout - this may indicate a streaming issue"
            );
          }, 3e4);
          return () => clearTimeout(timeout);
        }
      }, [isStreaming2]);
      return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
        "div",
        {
          className: "my-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 w-full block",
          style: {
            display: "block",
            contain: "layout",
            marginTop: "1.5rem",
            marginBottom: "1.5rem",
            overscrollBehavior: "contain",
            scrollSnapStop: "always"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-3 mb-4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "animate-spin h-5 w-5 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "font-medium text-gray-700 dark:text-gray-300", children: "Generating image..." })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-64 md:h-80 relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 w-full flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 animate-pulse relative overflow-hidden", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                import_lucide_react6.Image,
                {
                  size: 48,
                  className: "text-gray-400 dark:text-gray-500"
                }
              ) }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-gray-400 dark:border-gray-500" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-gray-400 dark:border-gray-500" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-gray-400 dark:border-gray-500" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-gray-400 dark:border-gray-500" })
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: "Processing image data..." })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { children: "Please wait..." })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("style", { children: `
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        ` })
          ]
        }
      );
    }
  );
  ImageLoadingIndicator.displayName = "ImageLoadingIndicator";
  const renderImageLoading = () => {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(ImageLoadingIndicator, { isStreaming });
  };
  const renderChartLoading = (type = "unknown") => {
    const normalizedType = type.toLowerCase();
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
      "div",
      {
        className: "my-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 w-full block",
        style: {
          display: "block",
          contain: "layout",
          marginTop: "1.5rem",
          marginBottom: "1.5rem",
          overscrollBehavior: "contain",
          scrollSnapStop: "always"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-3 mb-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "animate-spin h-5 w-5 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "font-medium text-gray-700 dark:text-gray-300", children: [
              "Generating ",
              normalizedType,
              " chart..."
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "h-64 md:h-80 relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 w-full", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute bottom-0 left-0 w-full h-0.5 bg-gray-300 dark:bg-gray-600" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute bottom-0 left-0 w-0.5 h-full bg-gray-300 dark:bg-gray-600" }),
            [1, 2, 3, 4].map((i) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "div",
              {
                className: "absolute w-full h-px bg-gray-200 dark:bg-gray-600",
                style: { bottom: `${i * 20}%` }
              },
              `h-${i}`
            )),
            [1, 2, 3, 4, 5, 6, 7, 8].map((i) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "div",
              {
                className: "absolute h-full w-px bg-gray-200 dark:bg-gray-600",
                style: { left: `${i * 12.5}%` }
              },
              `v-${i}`
            )),
            normalizedType === "bar" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute bottom-0 left-0 w-full h-full flex items-end justify-around p-4", children: [45, 80, 30, 65, 50, 75, 40].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "div",
              {
                className: "w-8 bg-gray-300 dark:bg-gray-600 animate-pulse rounded-t-sm opacity-60",
                style: { height: `${h}%` }
              },
              `bar-${i}`
            )) }),
            normalizedType === "line" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute bottom-0 left-0 w-full h-full flex items-end justify-around p-4", children: [45, 80, 30, 65, 50, 75, 40].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "div",
              {
                className: "w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse",
                style: {
                  position: "absolute",
                  bottom: `${h}%`,
                  left: `${10 + i * 12}%`
                }
              },
              `point-${i}`
            )) }),
            (normalizedType === "pie" || normalizedType === "doughnut") && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "absolute inset-0 flex items-center justify-center", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  className: `w-32 h-32 rounded-full border-8 border-gray-300 dark:border-gray-600 animate-pulse ${normalizedType === "doughnut" ? "border-[16px]" : "border-8"}`
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute w-32 h-32", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  className: "absolute w-16 h-0.5 bg-gray-400 dark:bg-gray-500 origin-left",
                  style: {
                    left: "50%",
                    top: "50%",
                    transform: `rotate(${i * 45}deg)`
                  }
                },
                `slice-${i}`
              )) })
            ] }),
            normalizedType === "scatter" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute inset-0", children: Array.from({ length: 15 }).map((_, i) => {
              const x = 10 + Math.random() * 80;
              const y = 10 + Math.random() * 80;
              return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  className: "absolute w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse",
                  style: {
                    left: `${x}%`,
                    bottom: `${y}%`,
                    animationDelay: `${i * 100}ms`
                  }
                },
                `scatter-${i}`
              );
            }) }),
            normalizedType === "radar" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "w-48 h-48 relative", children: [
              [1, 2, 3].map((level) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  className: "absolute rounded-full border border-gray-300 dark:border-gray-600",
                  style: {
                    width: `${level * 33}%`,
                    height: `${level * 33}%`,
                    left: `${50 - level * 33 / 2}%`,
                    top: `${50 - level * 33 / 2}%`
                  }
                },
                `radar-web-${level}`
              )),
              [0, 60, 120, 180, 240, 300].map((angle) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  className: "absolute w-24 h-0.5 bg-gray-300 dark:bg-gray-600 origin-left",
                  style: {
                    left: "50%",
                    top: "50%",
                    transform: `rotate(${angle}deg)`
                  }
                },
                `radar-axis-${angle}`
              )),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "absolute w-full h-full animate-pulse", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "div",
                  {
                    className: "w-3 h-3 absolute rounded-full bg-gray-400 dark:bg-gray-500",
                    style: {
                      left: "50%",
                      top: "10%",
                      transform: "translate(-50%, -50%)"
                    }
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "div",
                  {
                    className: "w-3 h-3 absolute rounded-full bg-gray-400 dark:bg-gray-500",
                    style: {
                      left: "85%",
                      top: "35%",
                      transform: "translate(-50%, -50%)"
                    }
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "div",
                  {
                    className: "w-3 h-3 absolute rounded-full bg-gray-400 dark:bg-gray-500",
                    style: {
                      left: "75%",
                      top: "75%",
                      transform: "translate(-50%, -50%)"
                    }
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "div",
                  {
                    className: "w-3 h-3 absolute rounded-full bg-gray-400 dark:bg-gray-500",
                    style: {
                      left: "25%",
                      top: "75%",
                      transform: "translate(-50%, -50%)"
                    }
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "div",
                  {
                    className: "w-3 h-3 absolute rounded-full bg-gray-400 dark:bg-gray-500",
                    style: {
                      left: "15%",
                      top: "35%",
                      transform: "translate(-50%, -50%)"
                    }
                  }
                )
              ] })
            ] }) }),
            normalizedType !== "bar" && normalizedType !== "line" && normalizedType !== "pie" && normalizedType !== "doughnut" && normalizedType !== "scatter" && normalizedType !== "radar" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "text-gray-400 dark:text-gray-500 text-lg", children: [
              "Preparing ",
              normalizedType,
              " chart..."
            ] }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "w-2/3 flex gap-2", children: ["Dataset 1", "Dataset 2"].map((label, i) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
              "div",
              {
                className: "flex items-center",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                    "div",
                    {
                      className: `w-3 h-3 rounded-full mr-1 ${i === 0 ? "bg-gray-400 dark:bg-gray-500" : "bg-gray-300 dark:bg-gray-600"}`
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: label })
                ]
              },
              `legend-${i}`
            )) }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { children: "Processing data..." })
          ] })
        ]
      }
    );
  };
  const renderAppLoading = (appName = "Unknown App") => {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "my-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 w-full block", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "animate-spin h-5 w-5 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "font-medium text-gray-700 dark:text-gray-300", children: [
          "Preparing ",
          appName,
          "..."
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "w-10 h-10 rounded-lg bg-blue-500 animate-pulse flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "svg",
            {
              className: "w-6 h-6 text-white",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              xmlns: "http://www.w3.org/2000/svg",
              children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                }
              )
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "font-semibold text-gray-800 dark:text-gray-200", children: appName }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Getting ready to launch..." })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg", children: "Loading..." })
      ] })
    ] });
  };
  const renderAnalyticLoading = () => {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "my-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 w-full block", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "animate-spin h-5 w-5 border-2 border-emerald-500 dark:border-emerald-400 border-t-transparent rounded-full" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "font-medium text-gray-700 dark:text-gray-300", children: "Processing analytics data..." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "w-10 h-10 rounded-lg bg-emerald-500 animate-pulse flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "svg",
            {
              className: "w-6 h-6 text-white",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              xmlns: "http://www.w3.org/2000/svg",
              children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                }
              )
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "font-semibold text-gray-800 dark:text-gray-200", children: "Analytics Dataset" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Preparing pivot table interface..." })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "px-3 py-1 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full animate-pulse", children: "Loading..." })
      ] })
    ] });
  };
  const renderWidgetLoading = (widgetType = "card") => {
    const isForm = widgetType === "form";
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "my-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 w-full block", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "animate-spin h-5 w-5 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "font-medium text-gray-700 dark:text-gray-300", children: [
          "Preparing ",
          isForm ? "form" : "card",
          " widget..."
        ] })
      ] }),
      isForm ? (
        // Form loading skeleton
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" })
        ] })
      ) : (
        // Card loading skeleton
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" })
          ] })
        ] })
      )
    ] });
  };
  const CustomMarkdown = ({ content: content2 }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    import_react_markdown2.default,
    {
      remarkPlugins: [import_remark_gfm2.default],
      rehypePlugins: [import_rehype_raw2.default],
      components: {
        blockquote: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("blockquote", { className: "border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-2 my-4 bg-gray-100 dark:bg-gray-800 rounded-md", children }),
        p: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "mb-2 last:mb-0", children }),
        h1: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h1", { className: "text-2xl font-bold mb-2 last:mb-0", children }),
        h2: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "text-xl font-bold mb-2 last:mb-0", children }),
        h3: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "text-lg font-bold mb-2 last:mb-0", children }),
        h4: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h4", { className: "text-base font-bold mb-2 last:mb-0", children }),
        h5: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h5", { className: "text-sm font-bold mb-2 last:mb-0", children }),
        h6: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h6", { className: "text-xs font-bold mb-2 last:mb-0", children }),
        ul: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("ul", { className: "list-disc list-outside ml-6 mb-2 last:mb-0 space-y-1", children }),
        ol: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("ol", { className: "list-decimal list-outside ml-6 mb-2 last:mb-0 space-y-1", children }),
        li: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("li", { className: "mb-1", children }),
        hr: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("hr", { className: "my-4 border-t border-gray-200 dark:border-gray-700 mb-3" }),
        a: ({ href, children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "a",
          {
            href,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-blue-500 hover:text-blue-600 underline",
            children
          }
        ),
        pre: (_a2) => {
          var _b2 = _a2, { children } = _b2, props = __objRest(_b2, ["children"]);
          const childArray = Array.isArray(children) ? children : [children];
          const codeElement = childArray.find(
            (child) => {
              var _a3, _b3;
              return (_b3 = (_a3 = child == null ? void 0 : child.props) == null ? void 0 : _a3.className) == null ? void 0 : _b3.startsWith("language-");
            }
          );
          if (codeElement) {
            const language = codeElement.props.className.replace(
              "language-",
              ""
            ) || "text";
            const code = String(
              codeElement.props.children || ""
            ).replace(/\n$/, "");
            return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              CodeBlock2,
              {
                language,
                code,
                theme
              }
            );
          }
          return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("pre", { className: "my-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-x-auto", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("code", { className: "text-sm font-mono text-gray-800 dark:text-gray-200", children }) });
        },
        code: (_c) => {
          var _d = _c, { className, children } = _d, props = __objRest(_d, ["className", "children"]);
          const isInlineCode = !className;
          return isInlineCode ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("code", { className: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono", children }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("code", __spreadProps(__spreadValues({ className }, props), { children }));
        },
        table: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "overflow-x-auto my-4", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("table", { className: "border-collapse w-full", children }) }),
        th: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("th", { className: "border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left", children }),
        td: (_e) => {
          var _f = _e, { children } = _f, props = __objRest(_f, ["children"]);
          return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "td",
            __spreadProps(__spreadValues({
              className: "border border-gray-300 dark:border-gray-700 px-4 py-2"
            }, props), {
              children
            })
          );
        }
      },
      children: content2
    }
  );
  const processTextContent = (0, import_react8.useMemo)(() => {
    return (text) => {
      if (!isStreaming) {
        const parts = text.split(
          /(```(?:chart:[a-z]+|image|app:[^\n]+|analytic|(?:widget:)?(?:card|form|decision)|json:[^\n]+)\n[\s\S]*?\n```)/g
        );
        if (parts.length > 1) {
          return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_jsx_runtime7.Fragment, { children: parts.map((part, i) => {
            const chartMatch = part.match(
              /```chart:([a-z]+)\n([\s\S]*?)\n```/
            );
            const imageMatch = part.match(
              /```image\n([\s\S]*?)\n```/
            );
            const appMatch = part.match(
              /```app:([^\n]+)\n([\s\S]*?)\n```/
            );
            const analyticMatch = part.match(
              /```analytic\n([\s\S]*?)\n```/
            );
            const widgetMatch = part.match(
              /```(?:widget:(card|form|decision)|decision)\n([\s\S]*?)\n```/
            );
            const jsonMatch = part.match(
              /```json:([^\n]+)\n([\s\S]*?)\n```/
            );
            if (chartMatch) {
              const [_, chartType, chartData] = chartMatch;
              const chartKey = `completed-chart-${i}-${chartData.substring(0, 50).replace(/\s/g, "")}`;
              return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  className: "my-6 block w-full",
                  style: {
                    display: "block",
                    contain: "layout",
                    marginTop: "1.5rem",
                    marginBottom: "1.5rem",
                    overscrollBehavior: "contain",
                    scrollSnapStop: "always"
                  },
                  children: renderChart(
                    chartType,
                    chartData,
                    chartKey
                  )
                },
                chartKey
              );
            } else if (imageMatch) {
              const [_, imageData] = imageMatch;
              const imageKey = `completed-image-${i}-${imageData.substring(0, 50).replace(/\s/g, "")}`;
              return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  className: "my-6 block w-full",
                  style: {
                    display: "block",
                    contain: "layout",
                    marginTop: "1.5rem",
                    marginBottom: "1.5rem",
                    overscrollBehavior: "contain",
                    scrollSnapStop: "always"
                  },
                  children: renderImage(imageData, imageKey)
                },
                imageKey
              );
            } else if (analyticMatch) {
              const [_, analyticData] = analyticMatch;
              const analyticKey = `completed-analytic-${i}-${analyticData.substring(0, 50).replace(/\s/g, "")}`;
              return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  className: "my-6 block w-full",
                  style: {
                    display: "block",
                    contain: "layout",
                    marginTop: "1.5rem",
                    marginBottom: "1.5rem",
                    overscrollBehavior: "contain",
                    scrollSnapStop: "always"
                  },
                  children: renderAnalytic(
                    analyticData.trim(),
                    analyticKey
                  )
                },
                analyticKey
              );
            } else if (jsonMatch) {
              const [_, jsonTitle, jsonData] = jsonMatch;
              const jsonKey = `completed-json-${i}-${jsonTitle.replace(
                /\s/g,
                ""
              )}`;
              return renderJson(
                jsonTitle,
                jsonData,
                jsonKey
              );
            }
            return part ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              CustomMarkdown,
              {
                content: part
              },
              `text-${i}`
            ) : null;
          }) });
        }
        return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CustomMarkdown, { content: text });
      }
      const chartTagMatches = [...text.matchAll(/```chart:([a-z]+)\n/g)];
      const imageTagMatches = [...text.matchAll(/```image\n/g)];
      const appTagMatches = [...text.matchAll(/```app:([^\n]+)\n/g)];
      const analyticTagMatches = [...text.matchAll(/```analytic\n/g)];
      const widgetTagMatches = [
        ...text.matchAll(
          /```(?:widget:(?:card|form|decision)|decision)\n/g
        )
      ];
      const jsonTagMatches = [...text.matchAll(/```json:([^\n]+)\n/g)];
      if (!chartTagMatches.length && !imageTagMatches.length && !appTagMatches.length && !analyticTagMatches.length && !widgetTagMatches.length && !jsonTagMatches.length) {
        return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CustomMarkdown, { content: text });
      }
      const allTags = [
        ...chartTagMatches.map((match) => ({
          type: "chart",
          index: match.index,
          chartType: match[1],
          match: match[0]
        })),
        ...imageTagMatches.map((match) => ({
          type: "image",
          index: match.index,
          match: match[0]
        })),
        ...appTagMatches.map((match) => ({
          type: "app",
          index: match.index,
          appName: match[1],
          match: match[0]
        })),
        ...analyticTagMatches.map((match) => ({
          type: "analytic",
          index: match.index,
          match: match[0]
        })),
        ...widgetTagMatches.map((match) => {
          const widgetType = match[1] || "decision";
          return {
            type: "widget",
            index: match.index,
            widgetType,
            match: match[0]
          };
        }),
        ...jsonTagMatches.map((match) => ({
          type: "json",
          index: match.index,
          jsonTitle: match[1],
          match: match[0]
        }))
      ].sort((a, b) => a.index - b.index);
      if (!allTags.length) {
        return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CustomMarkdown, { content: text });
      }
      const lastTag = allTags[allTags.length - 1];
      const lastOpeningTagIndex = lastTag.index;
      const textBeforeLastBlock = text.substring(0, lastOpeningTagIndex);
      const lastBlockContent = text.substring(lastOpeningTagIndex);
      const hasClosingTag = /\n```|```\n|```$/.test(lastBlockContent);
      let processedBeforeBlock = null;
      if (textBeforeLastBlock) {
        const beforeParts = textBeforeLastBlock.split(
          /(```(?:chart:[a-z]+|image|app:[^\n]+|analytic|(?:widget:)?(?:card|form|decision)|json:[^\n]+)\n[\s\S]*?\n```)/g
        );
        if (beforeParts.length > 1) {
          processedBeforeBlock = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_jsx_runtime7.Fragment, { children: beforeParts.map((part, i) => {
            const chartMatch = part.match(
              /```chart:([a-z]+)\n([\s\S]*?)\n```/
            );
            const imageMatch = part.match(
              /```image\n([\s\S]*?)\n```/
            );
            const appMatch = part.match(
              /```app:([^\n]+)\n([\s\S]*?)\n```/
            );
            const analyticMatch = part.match(
              /```analytic\n([\s\S]*?)\n```/
            );
            const widgetMatch = part.match(
              /```(?:widget:(card|form|decision)|decision)\n([\s\S]*?)\n```/
            );
            const jsonMatch = part.match(
              /```json:([^\n]+)\n([\s\S]*?)\n```/
            );
            if (chartMatch) {
              const [_, chartType, chartData] = chartMatch;
              const chartKey = `streaming-complete-chart-${i}-${chartData.substring(0, 50).replace(/\s/g, "")}`;
              return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  className: "my-6 block w-full",
                  style: {
                    display: "block",
                    contain: "layout",
                    marginTop: "1.5rem",
                    marginBottom: "1.5rem",
                    overscrollBehavior: "contain",
                    scrollSnapStop: "always"
                  },
                  children: renderChart(
                    chartType,
                    chartData,
                    chartKey
                  )
                },
                chartKey
              );
            } else if (imageMatch) {
              const [_, imageData] = imageMatch;
              const imageKey = `streaming-complete-image-${i}-${imageData.substring(0, 50).replace(/\s/g, "")}`;
              return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  className: "my-6 block w-full",
                  style: {
                    display: "block",
                    contain: "layout",
                    marginTop: "1.5rem",
                    marginBottom: "1.5rem",
                    overscrollBehavior: "contain",
                    scrollSnapStop: "always"
                  },
                  children: renderImage(imageData, imageKey)
                },
                imageKey
              );
            } else if (analyticMatch) {
              const [_, analyticData] = analyticMatch;
              const analyticKey = `streaming-complete-analytic-${i}-${analyticData.substring(0, 50).replace(/\s/g, "")}`;
              return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  className: "my-6 block w-full",
                  style: {
                    display: "block",
                    contain: "layout",
                    marginTop: "1.5rem",
                    marginBottom: "1.5rem",
                    overscrollBehavior: "contain",
                    scrollSnapStop: "always"
                  },
                  children: renderAnalytic(
                    analyticData.trim(),
                    analyticKey
                  )
                },
                analyticKey
              );
            } else if (jsonMatch) {
              const [_, jsonTitle, jsonData] = jsonMatch;
              const jsonKey = `streaming-complete-json-${i}-${jsonTitle.replace(
                /\s/g,
                ""
              )}`;
              return renderJson(
                jsonTitle,
                jsonData,
                jsonKey
              );
            }
            return part ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              CustomMarkdown,
              {
                content: part
              },
              `text-${i}`
            ) : null;
          }) });
        } else {
          processedBeforeBlock = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CustomMarkdown, { content: textBeforeLastBlock });
        }
      }
      let lastBlockElement = null;
      if (hasClosingTag) {
        if (lastTag.type === "chart") {
          const chartMatch = lastBlockContent.match(
            /```chart:([a-z]+)\n([\s\S]*?)\n```/
          );
          if (chartMatch) {
            const [_, chartType, chartData] = chartMatch;
            const chartKey = `streaming-last-complete-chart-${chartData.substring(0, 50).replace(/\s/g, "")}`;
            lastBlockElement = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "div",
              {
                className: "my-6 block w-full",
                style: {
                  display: "block",
                  contain: "layout",
                  marginTop: "1.5rem",
                  marginBottom: "1.5rem",
                  overscrollBehavior: "contain",
                  scrollSnapStop: "always"
                },
                children: renderChart(chartType, chartData, chartKey)
              },
              chartKey
            );
          }
        } else if (lastTag.type === "image") {
          const imageMatch = lastBlockContent.match(
            /```image\n([\s\S]*?)\n```/
          );
          if (imageMatch) {
            const [_, imageData] = imageMatch;
            const imageKey = `streaming-last-complete-image-${imageData.substring(0, 50).replace(/\s/g, "")}`;
            lastBlockElement = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "div",
              {
                className: "my-6 block w-full",
                style: {
                  display: "block",
                  contain: "layout",
                  marginTop: "1.5rem",
                  marginBottom: "1.5rem",
                  overscrollBehavior: "contain",
                  scrollSnapStop: "always"
                },
                children: renderImage(imageData, imageKey)
              },
              imageKey
            );
          }
        } else if (lastTag.type === "analytic") {
          const analyticMatch = lastBlockContent.match(
            /```analytic\n([\s\S]*?)\n```/
          );
          if (analyticMatch) {
            const [_, analyticData] = analyticMatch;
            const analyticKey = `streaming-last-complete-analytic-${analyticData.substring(0, 50).replace(/\s/g, "")}`;
            lastBlockElement = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "div",
              {
                className: "my-6 block w-full",
                style: {
                  display: "block",
                  contain: "layout",
                  marginTop: "1.5rem",
                  marginBottom: "1.5rem",
                  overscrollBehavior: "contain",
                  scrollSnapStop: "always"
                },
                children: renderAnalytic(
                  analyticData.trim(),
                  analyticKey
                )
              },
              analyticKey
            );
          }
        } else if (lastTag.type === "json") {
          const jsonMatch = lastBlockContent.match(
            /```json:([^\n]+)\n([\s\S]*?)\n```/
          );
          if (jsonMatch) {
            const [_, jsonTitle, jsonData] = jsonMatch;
            const jsonKey = `streaming-last-complete-json-${jsonTitle.replace(
              /\s/g,
              ""
            )}`;
            lastBlockElement = renderJson(
              jsonTitle,
              jsonData,
              jsonKey
            );
          }
        }
      } else {
        if (lastTag.type === "chart") {
          const chartType = lastTag.chartType;
          lastBlockElement = renderChartLoading(chartType);
        } else if (lastTag.type === "image") {
          lastBlockElement = renderImageLoading();
        } else if (lastTag.type === "analytic") {
          lastBlockElement = renderAnalyticLoading();
        } else if (lastTag.type === "widget") {
          const widgetType = lastTag.widgetType;
          lastBlockElement = renderWidgetLoading(widgetType);
        } else if (lastTag.type === "json") {
          const jsonTitle = lastTag.jsonTitle;
          lastBlockElement = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "flex items-center justify-between p-4", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "animate-spin h-4 w-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "font-semibold text-gray-800 dark:text-gray-200", children: jsonTitle }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full", children: "JSON" })
          ] }) }) });
        }
      }
      return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
        processedBeforeBlock,
        lastBlockElement
      ] });
    };
  }, [isStreaming, theme]);
  const renderContent = () => {
    var _a2, _b2, _c, _d;
    const contentToRender = content;
    if (typeof contentToRender === "string") {
      return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
        message.isToolExecuting && message.executingToolName && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          ToolExecutionIndicator,
          {
            toolName: message.executingToolName
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "markdown-content", children: role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "whitespace-pre-wrap break-words", children: contentToRender }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          StreamingMarkdown,
          {
            content: contentToRender,
            isStreaming,
            theme,
            cursorColor: streamingTextColor
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(StreamingIndicator, {}),
        ((_a2 = message.metadata) == null ? void 0 : _a2.steps) && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          ToolExecutionWidget,
          {
            steps: message.metadata.steps,
            theme
          }
        ),
        ((_b2 = message.metadata) == null ? void 0 : _b2.vectors) && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          VectorResults,
          {
            vectors: message.metadata.vectors,
            theme,
            vectorColor,
            vectorColorDark
          }
        )
      ] });
    } else if (Array.isArray(contentToRender)) {
      return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-3", children: [
        message.isToolExecuting && message.executingToolName && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          ToolExecutionIndicator,
          {
            toolName: message.executingToolName
          }
        ),
        contentToRender.map((part, i) => {
          if (part.type === "text") {
            const textContent = part.text;
            return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { children: role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "whitespace-pre-wrap break-words", children: textContent }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              StreamingMarkdown,
              {
                content: textContent,
                isStreaming,
                theme,
                cursorColor: streamingTextColor
              }
            ) }, `text-${i}`);
          } else if (part.type === "file") {
            const filePart = part;
            return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
              "div",
              {
                className: "border border-gray-200 dark:border-gray-700 rounded-md p-4",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { className: "text-sm text-gray-500 mb-2 flex items-center", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.FileText, { size: 16, className: "mr-1" }),
                    "PDF Document:"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex flex-col", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-sm font-medium mb-2", children: filePart.filename || "Document" }),
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                      "a",
                      {
                        href: filePart.data,
                        download: filePart.filename,
                        className: "mb-2 inline-flex items-center text-blue-500 hover:text-blue-600",
                        children: "Download"
                      }
                    )
                  ] })
                ]
              },
              `file-${i}-${filePart.filename || i}`
            );
          } else if (part.type === "image") {
            const imagePart = part;
            return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "p-2", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "max-w-full", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "img",
                {
                  src: imagePart.image,
                  alt: "Attached image",
                  className: "max-w-full max-h-96 rounded-md object-contain mb-2 cursor-pointer hover:opacity-90 transition-opacity",
                  onClick: () => handleImageClick(
                    imagePart.image,
                    "Attached image"
                  )
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "flex justify-end text-sm mr-2", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "a",
                {
                  href: imagePart.image,
                  download: "image.png",
                  className: "text-blue-500 hover:text-blue-600",
                  children: "Download"
                }
              ) })
            ] }) }, `image-${i}-${i}`);
          }
          return null;
        }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(StreamingIndicator, {}),
        ((_c = message.metadata) == null ? void 0 : _c.steps) && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          ToolExecutionWidget,
          {
            steps: message.metadata.steps,
            theme
          }
        ),
        ((_d = message.metadata) == null ? void 0 : _d.vectors) && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          VectorResults,
          {
            vectors: message.metadata.vectors,
            theme,
            vectorColor,
            vectorColorDark
          }
        )
      ] });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { children: "..." });
  };
  const formatTime = (date) => {
    try {
      if (!date) {
        return "";
      }
      return new Intl.DateTimeFormat(void 0, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
      }).format(new Date(date));
    } catch (error) {
      console.error("Error formatting date:", date, error);
      return "--:--";
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { ref: messageContainerRef, className: "mb-3", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "div",
      {
        className: `flex ${role === "user" ? "justify-end" : "justify-start"}`,
        children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
          "div",
          {
            className: `max-w-[100%] sm:max-w-[90%] ${role === "user" ? "" : "w-full"}`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "div",
                {
                  className: `rounded-2xl ${role === "assistant" ? "bg-transparent pl-0" : ""} p-3 transition-all duration-200`,
                  style: role === "user" ? { backgroundColor: messageBubbleColor } : void 0,
                  children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                    "div",
                    {
                      className: `prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none [&_p]:!my-0`,
                      children: renderContent()
                    }
                  )
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
                "div",
                {
                  className: `mt-2 text-sm text-gray-500 dark:text-gray-400 ${role === "user" ? "text-right pr-1" : "text-left"}`,
                  children: [
                    formatTime(message.createdAt),
                    role === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                        "button",
                        {
                          onClick: copyToClipboard,
                          className: "ml-3 inline-flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors",
                          "aria-label": "Copy message",
                          children: copied ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                            import_lucide_react6.Check,
                            {
                              size: 16,
                              className: "text-green-500"
                            }
                          ) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Copy, { size: 16 })
                        }
                      ),
                      ((_b = message.metadata) == null ? void 0 : _b.logId) && agentId && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "ml-3 inline-flex items-center gap-1.5", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                          "button",
                          {
                            onClick: () => handleFeedback(true),
                            disabled: feedbackLoading,
                            className: `inline-flex items-center transition-colors ${feedback === true ? "text-green-600 dark:text-green-400" : "text-gray-500 hover:text-green-600 dark:hover:text-green-400"} ${feedbackLoading ? "opacity-50 cursor-not-allowed" : ""}`,
                            "aria-label": "Like this response",
                            title: "Like",
                            children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.ThumbsUp, { size: 16, fill: feedback === true ? "currentColor" : "none" })
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                          "button",
                          {
                            onClick: () => handleFeedback(false),
                            disabled: feedbackLoading,
                            className: `inline-flex items-center transition-colors ${feedback === false ? "text-red-600 dark:text-red-400" : "text-gray-500 hover:text-red-600 dark:hover:text-red-400"} ${feedbackLoading ? "opacity-50 cursor-not-allowed" : ""}`,
                            "aria-label": "Dislike this response",
                            title: "Dislike",
                            children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.ThumbsDown, { size: 16, fill: feedback === false ? "currentColor" : "none" })
                          }
                        )
                      ] })
                    ] })
                  ]
                }
              )
            ]
          }
        )
      }
    ) }),
    imageDialogOpen && selectedImage && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
        onClick: closeImageDialog,
        children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
          "div",
          {
            className: "relative max-w-[95vw] max-h-[95vh] bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-2xl",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "absolute top-0 right-0 z-10 p-4", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "a",
                  {
                    href: selectedImage.src,
                    download: "image.png",
                    className: "p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all cursor-pointer",
                    title: "Download image",
                    children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Download, { size: 20 })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    onClick: closeImageDialog,
                    className: "p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all cursor-pointer",
                    title: "Close",
                    children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.X, { size: 20 })
                  }
                )
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "img",
                {
                  src: selectedImage.src,
                  alt: selectedImage.alt,
                  className: "max-w-full max-h-[95vh] object-contain"
                }
              )
            ]
          }
        )
      }
    )
  ] });
}
var import_react8, import_react_markdown2, import_remark_gfm2, import_rehype_raw2, import_lucide_react6, import_marked, import_react_syntax_highlighter3, import_prism3, import_jsx_runtime7, CodeBlock2, DynamicChartComponent, MemoizedChart, JsonBlock;
var init_chat_message = __esm({
  "app/components/chat-message.tsx"() {
    "use strict";
    init_chat_client();
    import_react8 = require("react");
    import_react_markdown2 = __toESM(require("react-markdown"));
    import_remark_gfm2 = __toESM(require("remark-gfm"));
    import_rehype_raw2 = __toESM(require("rehype-raw"));
    import_lucide_react6 = require("lucide-react");
    init_tool_execution();
    init_vector_results();
    import_marked = require("marked");
    import_react_syntax_highlighter3 = require("react-syntax-highlighter");
    init_streaming_markdown();
    import_prism3 = require("react-syntax-highlighter/dist/esm/styles/prism");
    import_jsx_runtime7 = require("react/jsx-runtime");
    CodeBlock2 = (0, import_react8.memo)(
      ({
        language,
        code,
        theme
      }) => {
        const [copied, setCopied] = (0, import_react8.useState)(false);
        const handleCopy = (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2e3);
          }).catch((err) => console.error("Failed to copy code: ", err));
        };
        const getLanguageLabel = (lang) => {
          const langMap = {
            js: "JavaScript",
            javascript: "JavaScript",
            jsx: "JavaScript React",
            ts: "TypeScript",
            typescript: "TypeScript",
            tsx: "TypeScript React",
            py: "Python",
            python: "Python",
            java: "Java",
            cpp: "C++",
            c: "C",
            cs: "C#",
            csharp: "C#",
            go: "Go",
            rs: "Rust",
            rust: "Rust",
            php: "PHP",
            rb: "Ruby",
            ruby: "Ruby",
            sh: "Shell",
            shell: "Shell",
            bash: "Bash",
            zsh: "Zsh",
            sql: "SQL",
            html: "HTML",
            css: "CSS",
            scss: "SCSS",
            json: "JSON",
            xml: "XML",
            yaml: "YAML",
            yml: "YAML",
            md: "Markdown",
            markdown: "Markdown",
            text: "Text",
            plaintext: "Plain Text"
          };
          return langMap[lang.toLowerCase()] || lang.toUpperCase();
        };
        const isDark = theme === "dark";
        const syntaxTheme = isDark ? import_prism3.vscDarkPlus : import_prism3.oneLight;
        const bgColor = isDark ? "#1e1e1e" : "#efefef";
        const headerBg = isDark ? "#1e1e1e" : "#f5f5f5";
        const borderColor = isDark ? "border-gray-700" : "border-gray-300";
        const textColor = isDark ? "text-gray-300" : "text-gray-700";
        const buttonHover = isDark ? "hover:bg-gray-700" : "hover:bg-gray-200";
        const iconColor = isDark ? "text-gray-400" : "text-gray-600";
        return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: `mt-1 mb-3 rounded-lg border-2 ${borderColor}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
            "div",
            {
              className: `sticky top-0 z-20 flex items-center justify-between px-4 py-2 border-b ${borderColor} rounded-tl-lg rounded-tr-lg`,
              style: { top: "-22px", backgroundColor: headerBg },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: `text-xs font-medium ${textColor}`, children: getLanguageLabel(language) }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    onClick: handleCopy,
                    className: `p-1.5 rounded transition-colors ${buttonHover}`,
                    title: "Copy code",
                    children: copied ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Check, { size: 14, className: "text-green-500" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Copy, { size: 14, className: iconColor })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "max-h-80 overflow-auto", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            import_react_syntax_highlighter3.Prism,
            {
              language: language.toLowerCase(),
              style: syntaxTheme,
              customStyle: {
                margin: 0,
                background: bgColor,
                fontSize: "0.875rem",
                padding: "1rem"
              },
              codeTagProps: {
                style: {
                  backgroundColor: bgColor
                }
              },
              children: code
            }
          ) })
        ] });
      }
    );
    CodeBlock2.displayName = "CodeBlock";
    DynamicChartComponent = (0, import_react8.lazy)(() => Promise.resolve().then(() => (init_chart_component(), chart_component_exports)));
    MemoizedChart = (0, import_react8.memo)(
      ({
        type,
        data,
        theme
      }) => {
        return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          import_react8.Suspense,
          {
            fallback: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "animate-pulse h-64 bg-gray-100 dark:bg-gray-800 rounded-lg" }),
            children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(DynamicChartComponent, { type, data, theme })
          }
        );
      },
      (prevProps, nextProps) => {
        return prevProps.type === nextProps.type && prevProps.theme === nextProps.theme && JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
      }
    );
    MemoizedChart.displayName = "MemoizedChart";
    JsonBlock = (0, import_react8.memo)(
      ({
        title,
        jsonContent,
        keyProp
      }) => {
        const [isExpanded, setIsExpanded] = (0, import_react8.useState)(false);
        const [copyJsonSuccess, setCopyJsonSuccess] = (0, import_react8.useState)(false);
        const formattedJson = (0, import_react8.useMemo)(() => {
          try {
            const parsed = JSON.parse(jsonContent.trim());
            return JSON.stringify(parsed, null, 2);
          } catch (error) {
            console.error("Failed to parse JSON:", error);
            return jsonContent;
          }
        }, [jsonContent]);
        const highlightedJson = (0, import_react8.useMemo)(() => {
          return formattedJson.replace(
            /"([^"]+)":/g,
            '<span class="json-key">"$1"</span>:'
          ).replace(
            /:\s*"([^"]*)"/g,
            ': <span class="json-string">"$1"</span>'
          ).replace(
            /:\s*(-?\d+\.?\d*)/g,
            ': <span class="json-number">$1</span>'
          ).replace(
            /:\s*(true|false)/g,
            ': <span class="json-boolean">$1</span>'
          ).replace(
            /:\s*(null)/g,
            ': <span class="json-null">$1</span>'
          );
        }, [formattedJson]);
        const handleCopyJson = (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(formattedJson).then(() => {
            setCopyJsonSuccess(true);
            setTimeout(() => setCopyJsonSuccess(false), 2e3);
          }).catch((err) => console.error("Failed to copy JSON: ", err));
        };
        return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "my-4 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
            "div",
            {
              onClick: () => setIsExpanded(!isExpanded),
              className: "flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-gray-50 bg-gray-900",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-2", children: [
                  isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                    import_lucide_react6.ChevronDown,
                    {
                      size: 20,
                      className: "text-gray-600 dark:text-gray-300"
                    }
                  ) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                    import_lucide_react6.ChevronRight,
                    {
                      size: 20,
                      className: "text-gray-600 dark:text-gray-300"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "font-semibold text-gray-800 dark:text-white", children: title }),
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white rounded-full", children: "JSON" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    onClick: handleCopyJson,
                    className: "p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors",
                    title: "Copy JSON",
                    children: copyJsonSuccess ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Check, { size: 16, className: "text-green-500" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                      import_lucide_react6.Copy,
                      {
                        size: 16,
                        className: "text-gray-600 dark:text-gray-300"
                      }
                    )
                  }
                )
              ]
            }
          ),
          isExpanded && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "border-t border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("pre", { className: "p-4 overflow-x-auto bg-white dark:bg-black text-sm font-mono", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "code",
            {
              className: "language-json text-gray-800 dark:text-gray-100",
              dangerouslySetInnerHTML: {
                __html: highlightedJson
              }
            }
          ) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("style", { children: `
        :global(.json-key) {
          color: #d19a66;
        }
        :global(.json-string) {
          color: #98c379;
        }
        :global(.json-number) {
          color: #d19a66;
        }
        :global(.json-boolean) {
          color: #56b6c2;
        }
        :global(.json-null) {
          color: #c678dd;
        }
        :global(.dark .json-key) {
          color: #e5c07b;
        }
        :global(.dark .json-string) {
          color: #98c379;
        }
        :global(.dark .json-number) {
          color: #d19a66;
        }
        :global(.dark .json-boolean) {
          color: #61afef;
        }
        :global(.dark .json-null) {
          color: #c678dd;
        }
      ` })
        ] });
      }
    );
    JsonBlock.displayName = "JsonBlock";
  }
});

// app/components/index.ts
var index_exports = {};
__export(index_exports, {
  NeptuneChatBot: () => NeptuneChatBot,
  ToolExecutionIndicator: () => ToolExecutionIndicator,
  ToolExecutionWidget: () => ToolExecutionWidget,
  configureChatClient: () => configureChatClient
});
module.exports = __toCommonJS(index_exports);

// app/components/chat.tsx
var import_react11 = require("react");
var import_lucide_react8 = require("lucide-react");
var import_framer_motion2 = require("framer-motion");
init_chat_client();

// app/components/chat-content.tsx
var import_react9 = require("react");
var import_lucide_react7 = require("lucide-react");
var import_framer_motion = require("framer-motion");

// app/components/analytics-panel.tsx
var import_react = require("react");
var import_lucide_react = require("lucide-react");
var import_jsx_runtime = require("react/jsx-runtime");
function AnalyticsPanel({
  name,
  csvData
}) {
  const { headers, data } = (0, import_react.useMemo)(() => {
    var _a;
    const lines = csvData.trim().split("\n");
    const headers2 = ((_a = lines[0]) == null ? void 0 : _a.split(";").map((h) => h.trim())) || [];
    const rows = lines.slice(1).map((line) => {
      const values = line.split(";").map((v) => v.trim());
      const row = {};
      headers2.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      return row;
    });
    return { headers: headers2, data: rows };
  }, [csvData]);
  const [pivotConfig, setPivotConfig] = (0, import_react.useState)({
    rows: [],
    columns: [],
    values: [],
    aggregation: "count"
  });
  const [filters, setFilters] = (0, import_react.useState)({});
  const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
  const [activeFilterDropdown, setActiveFilterDropdown] = (0, import_react.useState)(null);
  const [sortConfig, setSortConfig] = (0, import_react.useState)(null);
  const [expandedGroups, setExpandedGroups] = (0, import_react.useState)(
    /* @__PURE__ */ new Set()
  );
  const [showGroupedView, setShowGroupedView] = (0, import_react.useState)(false);
  const [setTreeNodes] = (0, import_react.useState)([]);
  const [animatingNodes, setAnimatingNodes] = (0, import_react.useState)(
    /* @__PURE__ */ new Set()
  );
  const isNumericValue = (value) => {
    return typeof value === "number" || !isNaN(parseFloat(value)) && isFinite(value);
  };
  const formatNumericValue = (value) => {
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    const parsed = parseFloat(value);
    return !isNaN(parsed) ? parsed.toLocaleString() : value;
  };
  const shouldFormatAsNumber = (value, header) => {
    const isValueColumn = pivotConfig.values.includes(header);
    const isCountColumn = header === "_count";
    return (isValueColumn || isCountColumn) && isNumericValue(value);
  };
  const getCellAlignment = (value, header, isFirstColumn) => {
    if (isFirstColumn) return "text-left";
    const isValueColumn = pivotConfig.values.includes(header);
    const isCountColumn = header === "_count";
    if (isValueColumn || isCountColumn) {
      return "text-right";
    }
    return "text-left";
  };
  const getTreeIcon = (node, hasChildren) => {
    if (!hasChildren) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_lucide_react.FileText,
        {
          size: 14,
          className: "text-blue-500 dark:text-blue-400"
        }
      );
    }
    if (node.isExpanded) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_lucide_react.FolderOpen,
        {
          size: 14,
          className: "text-emerald-600 dark:text-emerald-400"
        }
      );
    } else {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_lucide_react.Folder,
        {
          size: 14,
          className: "text-emerald-600 dark:text-emerald-400"
        }
      );
    }
  };
  const getExpandIcon = (isExpanded, hasChildren) => {
    if (!hasChildren) return null;
    return isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_lucide_react.ChevronDown,
      {
        size: 14,
        className: "text-gray-600 dark:text-gray-400 transition-transform duration-200"
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_lucide_react.ChevronRight,
      {
        size: 14,
        className: "text-gray-600 dark:text-gray-400 transition-transform duration-200"
      }
    );
  };
  const getLevelColor = (level) => {
    const colors = [
      "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/10",
      // Level 0
      "border-l-blue-500 bg-blue-50 dark:bg-blue-900/10",
      // Level 1
      "border-l-purple-500 bg-purple-50 dark:bg-purple-900/10",
      // Level 2
      "border-l-orange-500 bg-orange-50 dark:bg-orange-900/10",
      // Level 3
      "border-l-pink-500 bg-pink-50 dark:bg-pink-900/10"
      // Level 4+
    ];
    return colors[Math.min(level, colors.length - 1)];
  };
  const generateTreeId = (path, level) => {
    return `tree-${level}-${path.join("-")}`;
  };
  const calculateAggregations = (rows, valueColumns, aggregation) => {
    const result = {};
    valueColumns.forEach((col) => {
      const numericValues = rows.map((row) => {
        const cleaned = String(row[col] || "").replace(
          /[,\s]/g,
          ""
        );
        const parsed = parseFloat(cleaned);
        return !isNaN(parsed) ? parsed : 0;
      }).filter((val) => !isNaN(val));
      switch (aggregation) {
        case "sum":
          result[col] = numericValues.reduce(
            (sum, val) => sum + val,
            0
          );
          break;
        case "avg":
          result[col] = numericValues.length > 0 ? numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length : 0;
          break;
        case "min":
          result[col] = numericValues.length > 0 ? Math.min(...numericValues) : 0;
          break;
        case "max":
          result[col] = numericValues.length > 0 ? Math.max(...numericValues) : 0;
          break;
        default:
          result[col] = rows.length;
      }
    });
    return result;
  };
  const buildTreeStructure = (rows, groupColumns, currentPath = [], level = 0) => {
    if (groupColumns.length === 0) {
      return [
        {
          id: generateTreeId([...currentPath, "aggregated"], level),
          level,
          label: `${rows.length} records`,
          value: rows.length,
          count: rows.length,
          aggregatedData: calculateAggregations(
            rows,
            pivotConfig.values,
            pivotConfig.aggregation
          ),
          children: [],
          isExpanded: false,
          originalRows: rows,
          _isTreeNode: true
        }
      ];
    }
    const [currentColumn, ...remainingColumns] = groupColumns;
    const grouped = rows.reduce((acc, row) => {
      const value = row[currentColumn] || "Unknown";
      if (!acc[value]) acc[value] = [];
      acc[value].push(row);
      return acc;
    }, {});
    let treeNodes = Object.entries(grouped).map(([value, groupRows]) => {
      const typedGroupRows = groupRows;
      const nodePath = [...currentPath, value];
      const nodeId = generateTreeId(nodePath, level);
      return {
        id: nodeId,
        level,
        label: value,
        value,
        count: typedGroupRows.length,
        aggregatedData: calculateAggregations(
          typedGroupRows,
          pivotConfig.values,
          pivotConfig.aggregation
        ),
        children: buildTreeStructure(
          typedGroupRows,
          remainingColumns,
          nodePath,
          level + 1
        ),
        isExpanded: expandedGroups.has(nodeId),
        originalRows: typedGroupRows,
        _isTreeNode: true
      };
    });
    if (sortConfig) {
      treeNodes = treeNodes.sort((a, b) => {
        let valueA;
        let valueB;
        if (sortConfig.key === currentColumn) {
          valueA = a.label;
          valueB = b.label;
        } else if (sortConfig.key === "_count") {
          valueA = a.count;
          valueB = b.count;
        } else if (pivotConfig.values.includes(sortConfig.key)) {
          valueA = a.aggregatedData[sortConfig.key] || 0;
          valueB = b.aggregatedData[sortConfig.key] || 0;
        } else {
          valueA = a.label;
          valueB = b.label;
        }
        return compareValues(valueA, valueB, sortConfig.direction);
      });
    } else {
      treeNodes = treeNodes.sort(
        (a, b) => a.label.localeCompare(b.label)
      );
    }
    return treeNodes;
  };
  const compareValues = (valueA, valueB, direction) => {
    const numA = parseFloat(String(valueA).replace(/[,\s]/g, ""));
    const numB = parseFloat(String(valueB).replace(/[,\s]/g, ""));
    let comparison = 0;
    if (!isNaN(numA) && !isNaN(numB)) {
      comparison = numA - numB;
    } else {
      comparison = String(valueA).localeCompare(String(valueB));
    }
    return direction === "desc" ? -comparison : comparison;
  };
  const flattenTreeToRows = (nodes) => {
    const result = [];
    nodes.forEach((node) => {
      result.push(__spreadProps(__spreadValues({}, node), {
        _isTreeNode: true,
        _treeLevel: node.level
      }));
      if (node.isExpanded && node.children.length > 0) {
        result.push(...flattenTreeToRows(node.children));
      }
    });
    return result;
  };
  const pivotData = (0, import_react.useMemo)(() => {
    if (!data.length || !headers.length)
      return { rows: [], summary: null, filteredData: [], totals: null };
    let filteredData = data.filter((row) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = Object.values(row).some(
          (value) => value.toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) return false;
      }
      return Object.entries(filters).every(([column, allowedValues]) => {
        return allowedValues.length === 0 || allowedValues.includes(row[column]);
      });
    });
    const totals = pivotConfig.values.length > 0 ? calculateAggregations(
      filteredData,
      pivotConfig.values,
      pivotConfig.aggregation
    ) : null;
    if (pivotConfig.rows.length === 0 && pivotConfig.columns.length === 0 && pivotConfig.values.length === 0) {
      return {
        rows: [],
        summary: {
          totalRows: 0,
          originalRows: data.length,
          totalColumns: headers.length
        },
        filteredData: [],
        totals: null
      };
    }
    const pivotRows = [];
    const groups = filteredData.reduce((acc, row) => {
      const rowKey = pivotConfig.rows.map((col) => row[col]).join(" | ") || "Total";
      if (!acc[rowKey]) {
        acc[rowKey] = [];
      }
      acc[rowKey].push(row);
      return acc;
    }, {});
    const useTreeView = pivotConfig.rows.length > 0 && showGroupedView;
    if (useTreeView) {
      const treeStructure = buildTreeStructure(
        filteredData,
        pivotConfig.rows
      );
      const flattenedRows = flattenTreeToRows(treeStructure);
      pivotRows.push(...flattenedRows);
    } else if (pivotConfig.rows.length > 0) {
      Object.entries(groups).forEach(([rowKey, groupData]) => {
        const pivotRow = {
          _rowKey: rowKey,
          _count: groupData.length
        };
        pivotConfig.rows.forEach((rowCol, index) => {
          pivotRow[rowCol] = rowKey.split(" | ")[index] || "";
        });
        pivotConfig.values.forEach((valueCol) => {
          const rawValues = groupData.map((d) => d[valueCol]);
          const numericValues = rawValues.map((val) => {
            const cleaned = String(val).replace(/[,\s]/g, "");
            const parsed = parseFloat(cleaned);
            return !isNaN(parsed) ? parsed : 0;
          });
          const validNumericValues = numericValues.filter(
            (val) => !isNaN(val) && val !== 0 || rawValues[numericValues.indexOf(val)] === "0"
          );
          switch (pivotConfig.aggregation) {
            case "sum":
              pivotRow[valueCol] = numericValues.reduce(
                (sum, val) => sum + val,
                0
              );
              break;
            case "avg":
              pivotRow[valueCol] = validNumericValues.length > 0 ? validNumericValues.reduce(
                (sum, val) => sum + val,
                0
              ) / validNumericValues.length : 0;
              break;
            case "min":
              pivotRow[valueCol] = validNumericValues.length > 0 ? Math.min(...validNumericValues) : 0;
              break;
            case "max":
              pivotRow[valueCol] = validNumericValues.length > 0 ? Math.max(...validNumericValues) : 0;
              break;
            default:
              pivotRow[valueCol] = groupData.length;
          }
        });
        pivotRows.push(pivotRow);
      });
    }
    if (sortConfig && useTreeView) {
    } else if (sortConfig && !useTreeView) {
      pivotRows.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return {
      rows: pivotRows,
      summary: {
        totalRows: pivotRows.length,
        totalGroups: Object.keys(groups).length,
        originalRows: filteredData.length
      },
      filteredData,
      totals
    };
  }, [
    data,
    headers,
    pivotConfig,
    filters,
    searchTerm,
    sortConfig,
    expandedGroups,
    showGroupedView
  ]);
  const getUniqueValues = (column) => {
    return [...new Set(data.map((row) => row[column]))].filter(Boolean).sort();
  };
  const updatePivotConfig = (key, value) => {
    setPivotConfig((prev) => __spreadProps(__spreadValues({}, prev), { [key]: value }));
  };
  const addToPivotConfig = (key, value) => {
    setPivotConfig((prev) => __spreadProps(__spreadValues({}, prev), {
      [key]: [...prev[key], value]
    }));
  };
  const removeFromPivotConfig = (key, value) => {
    setPivotConfig((prev) => __spreadProps(__spreadValues({}, prev), {
      [key]: prev[key].filter((item) => item !== value)
    }));
  };
  const moveColumnUp = (key, index) => {
    if (index === 0) return;
    setPivotConfig((prev) => {
      const newArray = [...prev[key]];
      [newArray[index - 1], newArray[index]] = [
        newArray[index],
        newArray[index - 1]
      ];
      return __spreadProps(__spreadValues({}, prev), { [key]: newArray });
    });
  };
  const moveColumnDown = (key, index) => {
    setPivotConfig((prev) => {
      if (index >= prev[key].length - 1) return prev;
      const newArray = [...prev[key]];
      [newArray[index], newArray[index + 1]] = [
        newArray[index + 1],
        newArray[index]
      ];
      return __spreadProps(__spreadValues({}, prev), { [key]: newArray });
    });
  };
  const toggleColumnFilter = (column, value) => {
    setFilters((prev) => {
      const currentFilters = prev[column] || [];
      const newFilters = currentFilters.includes(value) ? currentFilters.filter((v) => v !== value) : [...currentFilters, value];
      return __spreadProps(__spreadValues({}, prev), { [column]: newFilters });
    });
  };
  const clearColumnFilter = (column) => {
    setFilters((prev) => {
      const newFilters = __spreadValues({}, prev);
      delete newFilters[column];
      return newFilters;
    });
  };
  const handleSort = (columnKey) => {
    setSortConfig((prev) => {
      if (prev && prev.key === columnKey) {
        if (prev.direction === "asc") {
          return { key: columnKey, direction: "desc" };
        } else {
          return null;
        }
      } else {
        return { key: columnKey, direction: "asc" };
      }
    });
  };
  const toggleTreeNodeExpansion = (nodeId) => {
    setAnimatingNodes((prev) => new Set(prev).add(nodeId));
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
    setTimeout(() => {
      setAnimatingNodes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });
    }, 200);
  };
  const exportToCsv = () => {
    const csvContent = [
      headers.join(";"),
      ...pivotData.rows.map(
        (row) => headers.map((header) => row[header] || "").join(";")
      )
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(/[^a-zA-Z0-9]/g, "_")}_export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const resetConfig = () => {
    setPivotConfig({
      rows: [],
      columns: [],
      values: [],
      aggregation: "count"
    });
    setFilters({});
    setSearchTerm("");
    setActiveFilterDropdown(null);
    setSortConfig(null);
    setExpandedGroups(/* @__PURE__ */ new Set());
    setShowGroupedView(false);
    setAnimatingNodes(/* @__PURE__ */ new Set());
  };
  (0, import_react.useEffect)(() => {
    const handleClickOutside = (event) => {
      if (activeFilterDropdown && !event.target.closest(".relative")) {
        setActiveFilterDropdown(null);
      }
    };
    if (activeFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeFilterDropdown]);
  const [isFilterPanelVisible, setIsFilterPanelVisible] = (0, import_react.useState)(true);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex h-[calc(100%-70px)] bg-white dark:bg-gray-900 min-h-0", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center space-x-4", children: pivotData.summary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-medium", children: "Rows:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-semibold text-gray-800 dark:text-gray-200", children: pivotData.summary.totalRows.toLocaleString() })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-medium", children: "Columns:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-semibold text-gray-800 dark:text-gray-200", children: (pivotData.summary.totalColumns || headers.length).toLocaleString() })
          ] }),
          pivotData.summary.originalRows && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-medium", children: "Filtered:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-semibold text-gray-800 dark:text-gray-200", children: pivotData.summary.originalRows.toLocaleString() })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              onClick: exportToCsv,
              className: "flex items-center px-3 py-1.5 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 transition-colors",
              title: "Export to CSV",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Download, { size: 14, className: "mr-1" }),
                "Export"
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              onClick: resetConfig,
              className: "flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300",
              title: "Reset Configuration",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.RotateCcw, { size: 14, className: "mr-1" }),
                "Reset"
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              onClick: () => setIsFilterPanelVisible(
                !isFilterPanelVisible
              ),
              className: "flex items-center px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",
              title: isFilterPanelVisible ? "Hide Filters" : "Show Filters",
              children: [
                isFilterPanelVisible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.EyeOff, { size: 14, className: "mr-1" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Eye, { size: 14, className: "mr-1" }),
                isFilterPanelVisible ? "Hide" : "Show",
                " Filters"
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 overflow-auto min-w-0", children: pivotData.rows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "w-full text-sm border-collapse bg-white dark:bg-gray-900 analytics-table-container", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { className: "bg-gray-100 dark:bg-gray-900 sticky top-0", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: (pivotConfig.rows.length > 0 || pivotConfig.columns.length > 0 || pivotConfig.values.length > 0 ? [
          ...pivotConfig.rows,
          ...pivotConfig.values,
          ...showGroupedView ? [] : ["_count"]
        ] : headers).map((header, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "th",
          {
            className: "border-0 border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 relative",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-medium", children: header === "_count" ? "Count" : header }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    onClick: () => handleSort(
                      header
                    ),
                    className: "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer",
                    title: "Sort column",
                    children: (sortConfig == null ? void 0 : sortConfig.key) === header ? sortConfig.direction === "asc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_lucide_react.ArrowUp,
                      {
                        size: 14
                      }
                    ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_lucide_react.ArrowDown,
                      {
                        size: 14
                      }
                    ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_lucide_react.ArrowUpDown,
                      {
                        size: 14,
                        className: "opacity-50"
                      }
                    )
                  }
                ),
                header !== "_count" && header !== "_rowKey" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    onClick: () => setActiveFilterDropdown(
                      activeFilterDropdown === header ? null : header
                    ),
                    className: `p-1 rounded cursor-pointer ${(filters[header] || []).length > 0 ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`,
                    title: "Filter column",
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      import_lucide_react.Filter,
                      {
                        size: 14
                      }
                    )
                  }
                )
              ] }),
              activeFilterDropdown === header && header !== "_count" && header !== "_rowKey" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "absolute right-0 top-8 z-50 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg min-w-96 max-w-96 min-h-96 max-h-96 overflow-auto", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-2 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex justify-between items-center", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs font-medium text-gray-700 dark:text-gray-300", children: [
                    "Filter",
                    " ",
                    header
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      onClick: () => clearColumnFilter(
                        header
                      ),
                      className: "text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                      children: "Clear"
                    }
                  )
                ] }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "overflow-y-auto", children: getUniqueValues(
                  header
                ).map(
                  (value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "label",
                    {
                      className: "flex items-center px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          "input",
                          {
                            type: "checkbox",
                            checked: (filters[header] || []).includes(
                              value
                            ),
                            onChange: () => toggleColumnFilter(
                              header,
                              value
                            ),
                            className: "mr-2 text-emerald-600 focus:ring-emerald-500"
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm text-gray-700 dark:text-gray-300 truncate", children: value })
                      ]
                    },
                    value
                  )
                ) })
              ] })
            ] })
          },
          header
        )) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { className: "bg-white dark:bg-gray-900", children: pivotData.rows.slice(0, 1e6).map((row, index) => {
          if (row._isTreeNode && showGroupedView) {
            const indentLevel = row._treeLevel || row.level || 0;
            const isLeafNode = row.children && row.children.length === 0;
            const hasChildren = row.children && row.children.length > 0;
            const isAnimating = animatingNodes.has(
              row.id
            );
            if (isLeafNode) {
              return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "tr",
                {
                  className: `transition-all duration-200 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-700 border-l-2 border-l-transparent hover:border-l-blue-400 ${isAnimating ? "animate-pulse" : ""}`,
                  children: (pivotConfig.rows.length > 0 || pivotConfig.columns.length > 0 || pivotConfig.values.length > 0 ? [
                    ...pivotConfig.rows,
                    ...pivotConfig.values,
                    ...showGroupedView ? [] : [
                      "_count"
                    ]
                  ] : headers).map(
                    (header, headerIndex) => {
                      var _a, _b;
                      const cellIndent = headerIndex === 0 ? indentLevel * 24 + 32 : 0;
                      const isFirstColumn = headerIndex === 0;
                      let cellValue;
                      if (header === "_count") {
                        cellValue = row.count;
                      } else if (((_a = row.aggregatedData) == null ? void 0 : _a[header]) !== void 0) {
                        cellValue = row.aggregatedData[header];
                      } else if (((_b = row.value) == null ? void 0 : _b[header]) !== void 0) {
                        cellValue = row.value[header];
                      } else {
                        cellValue = isFirstColumn ? row.label : "";
                      }
                      const alignmentClass = getCellAlignment(
                        cellValue,
                        header,
                        isFirstColumn
                      );
                      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                        "td",
                        {
                          className: `border-0 border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 ${alignmentClass}`,
                          style: headerIndex === 0 ? {
                            paddingLeft: `${cellIndent}px`
                          } : {},
                          children: [
                            headerIndex === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-2", children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center", children: [
                                Array.from(
                                  {
                                    length: indentLevel
                                  }
                                ).map(
                                  (_, levelIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                    "div",
                                    {
                                      className: "w-6 flex justify-center",
                                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-full bg-gray-300 dark:bg-gray-600" })
                                    },
                                    levelIndex
                                  )
                                ),
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-6 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-3 h-px bg-gray-300 dark:bg-gray-600" }) })
                              ] }),
                              getTreeIcon(
                                row,
                                hasChildren
                              ),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-gray-700 dark:text-gray-300", children: shouldFormatAsNumber(
                                cellValue,
                                header
                              ) ? formatNumericValue(
                                cellValue
                              ) : cellValue })
                            ] }),
                            headerIndex !== 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: shouldFormatAsNumber(
                              cellValue,
                              header
                            ) ? formatNumericValue(
                              cellValue
                            ) : cellValue })
                          ]
                        },
                        header
                      );
                    }
                  )
                },
                row.id || index
              );
            }
            return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "tr",
              {
                className: `transition-all duration-200 font-medium ${getLevelColor(
                  indentLevel
                )} hover:bg-opacity-75 border-l-4 ${isAnimating ? "animate-pulse" : ""}`,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "td",
                  {
                    colSpan: (pivotConfig.rows.length > 0 || pivotConfig.columns.length > 0 || pivotConfig.values.length > 0 ? [
                      ...pivotConfig.rows,
                      ...pivotConfig.values,
                      ...showGroupedView ? [] : [
                        "_count"
                      ]
                    ] : headers).length,
                    className: "border-0 border-b border-gray-200 dark:border-gray-700 px-3 py-3 text-gray-900 dark:text-gray-100",
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                      "div",
                      {
                        className: "flex items-center space-x-3 cursor-pointer group",
                        style: {
                          paddingLeft: `${indentLevel * 24}px`
                        },
                        onClick: () => toggleTreeNodeExpansion(
                          row.id
                        ),
                        children: [
                          indentLevel > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center", children: Array.from(
                            {
                              length: indentLevel
                            }
                          ).map(
                            (_, levelIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                              "div",
                              {
                                className: "w-6 flex justify-center",
                                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-full bg-gray-300 dark:bg-gray-600" })
                              },
                              levelIndex
                            )
                          ) }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-300 dark:border-gray-600 group-hover:bg-gray-50 dark:group-hover:bg-gray-600 transition-colors", children: getExpandIcon(
                            row.isExpanded,
                            hasChildren
                          ) }),
                          getTreeIcon(
                            row,
                            hasChildren
                          ),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-2 flex-1", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-semibold text-gray-800 dark:text-gray-200", children: row.label }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400", children: [
                              row.count,
                              " ",
                              "records"
                            ] })
                          ] }),
                          pivotConfig.values.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400", children: [
                            pivotConfig.values.slice(
                              0,
                              3
                            ).map(
                              (col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                                "div",
                                {
                                  className: "flex items-center space-x-1",
                                  children: [
                                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                      import_lucide_react.BarChart3,
                                      {
                                        size: 12,
                                        className: "text-gray-500"
                                      }
                                    ),
                                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "font-medium", children: [
                                      col,
                                      ":"
                                    ] }),
                                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-semibold text-gray-800 dark:text-gray-200 font-mono", children: shouldFormatAsNumber(
                                      row.aggregatedData[col],
                                      col
                                    ) ? formatNumericValue(
                                      row.aggregatedData[col]
                                    ) : row.aggregatedData[col] })
                                  ]
                                },
                                col
                              )
                            ),
                            pivotConfig.values.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs text-gray-500", children: [
                              "+",
                              pivotConfig.values.length - 3,
                              " ",
                              "more"
                            ] })
                          ] })
                        ]
                      }
                    )
                  }
                )
              },
              row.id
            );
          }
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "tr",
            {
              className: "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700",
              children: (pivotConfig.rows.length > 0 || pivotConfig.columns.length > 0 || pivotConfig.values.length > 0 ? [
                ...pivotConfig.rows,
                ...pivotConfig.values,
                ...showGroupedView ? [] : [
                  "_count"
                ]
              ] : headers).map(
                (header, headerIndex) => {
                  const cellValue = header === "_count" ? row._count || "" : row[header] || "";
                  const isFirstColumn = headerIndex === 0;
                  const alignmentClass = getCellAlignment(
                    cellValue,
                    header,
                    isFirstColumn
                  );
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "td",
                    {
                      className: `border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 ${alignmentClass}`,
                      children: shouldFormatAsNumber(
                        cellValue,
                        header
                      ) ? formatNumericValue(
                        cellValue
                      ) : cellValue
                    },
                    header
                  );
                }
              )
            },
            row._rowKey || index
          );
        }) }),
        pivotData.totals && pivotConfig.values.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { className: "bg-gray-100 dark:bg-gray-800 border-t-2 border-gray-400 dark:border-gray-600", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: (pivotConfig.rows.length > 0 || pivotConfig.columns.length > 0 || pivotConfig.values.length > 0 ? [
          ...pivotConfig.rows,
          ...pivotConfig.values,
          ...showGroupedView ? [] : ["_count"]
        ] : headers).map(
          (header, headerIndex) => {
            const isFirstColumn = headerIndex === 0;
            let cellContent = "";
            let alignmentClass = getCellAlignment(
              "",
              header,
              isFirstColumn
            );
            if (isFirstColumn) {
              cellContent = `Total (${pivotConfig.aggregation})`;
              alignmentClass = "text-left";
            } else if (pivotConfig.values.includes(
              header
            ) && pivotData.totals && pivotData.totals[header] !== void 0) {
              const totalValue = pivotData.totals[header];
              cellContent = shouldFormatAsNumber(
                totalValue,
                header
              ) ? formatNumericValue(
                totalValue
              ) : String(
                totalValue
              );
              alignmentClass = "text-right";
            } else if (header === "_count" && !showGroupedView) {
              cellContent = pivotData.filteredData.length.toLocaleString();
              alignmentClass = "text-right";
            }
            return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "td",
              {
                className: `border-0 border-gray-300 dark:border-gray-600 px-3 py-3 font-semibold text-gray-900 dark:text-gray-100 ${alignmentClass}`,
                children: cellContent
              },
              header
            );
          }
        ) }) })
      ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-64 text-gray-500 dark:text-gray-400", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-center max-w-md", children: pivotConfig.rows.length === 0 && pivotConfig.columns.length === 0 && pivotConfig.values.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 mx-auto mt-16 mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "svg",
          {
            className: "w-8 h-8 text-emerald-600 dark:text-emerald-400",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              }
            )
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-lg font-medium mb-2", children: "Configure Your Analytics" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-sm mb-4", children: [
          "Dataset loaded with",
          " ",
          data.length.toLocaleString(),
          " ",
          "records and ",
          headers.length,
          " ",
          "columns.",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
          "Select columns in the filter panel to start analyzing your data."
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-left bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "font-medium mb-2", children: "Quick Start:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", { className: "list-decimal list-inside space-y-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Group by Rows:" }),
              " ",
              "Select dimensions to group your data"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Value Columns:" }),
              " ",
              "Choose metrics to analyze"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Aggregation:" }),
              " ",
              "Pick how to summarize values (sum, average, etc.)"
            ] })
          ] })
        ] })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-lg font-medium mb-2", children: "No data to display" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm", children: "Try adjusting your filters or configuration" })
      ] }) }) }) }) })
    ] }),
    isFilterPanelVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-80 min-w-80 border-l border-gray-200 dark:border-gray-700 bg-white flex flex-col flex-shrink-0", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300", children: "Search Data" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            type: "text",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            placeholder: "Search across all columns...",
            className: "w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-500 dark:placeholder-gray-400"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300", children: "Group by Rows" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              value: "",
              onChange: (e) => e.target.value && addToPivotConfig("rows", e.target.value),
              className: "w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: "Add column..." }),
                headers.filter(
                  (h) => !pivotConfig.rows.includes(h)
                ).sort().map((header) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: header, children: header }, header))
              ]
            }
          ),
          pivotConfig.rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              className: "flex items-center justify-between mt-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded text-sm",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-emerald-800 dark:text-emerald-200 flex-1", children: row }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      onClick: () => moveColumnUp("rows", index),
                      disabled: index === 0,
                      className: "text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowUp, { size: 14 })
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      onClick: () => moveColumnDown(
                        "rows",
                        index
                      ),
                      disabled: index === pivotConfig.rows.length - 1,
                      className: "text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowDown, { size: 14 })
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      onClick: () => removeFromPivotConfig(
                        "rows",
                        row
                      ),
                      className: "text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200",
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.X, { size: 14 })
                    }
                  )
                ] })
              ]
            },
            row
          ))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300", children: "Value Columns" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              value: "",
              onChange: (e) => e.target.value && addToPivotConfig(
                "values",
                e.target.value
              ),
              className: "w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: "Add column..." }),
                headers.filter(
                  (h) => !pivotConfig.values.includes(h)
                ).sort().map((header) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: header, children: header }, header))
              ]
            }
          ),
          pivotConfig.values.map((value, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              className: "flex items-center justify-between mt-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-sm",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-blue-800 dark:text-blue-200 flex-1", children: value }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      onClick: () => moveColumnUp(
                        "values",
                        index
                      ),
                      disabled: index === 0,
                      className: "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowUp, { size: 14 })
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      onClick: () => moveColumnDown(
                        "values",
                        index
                      ),
                      disabled: index === pivotConfig.values.length - 1,
                      className: "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowDown, { size: 14 })
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      onClick: () => removeFromPivotConfig(
                        "values",
                        value
                      ),
                      className: "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200",
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.X, { size: 14 })
                    }
                  )
                ] })
              ]
            },
            value
          ))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300", children: "Aggregation" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              value: pivotConfig.aggregation,
              onChange: (e) => updatePivotConfig(
                "aggregation",
                e.target.value
              ),
              className: "w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "count", children: "Count" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "sum", children: "Sum" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "avg", children: "Average" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "min", children: "Minimum" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "max", children: "Maximum" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300", children: "Display Mode" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              value: showGroupedView ? "grouped" : "aggregated",
              onChange: (e) => setShowGroupedView(
                e.target.value === "grouped"
              ),
              className: "w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "aggregated", children: "Aggregated View" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "grouped", children: "Grouped View" })
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}

// app/components/chat-content.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
var ChatInput2 = (0, import_react9.lazy)(() => Promise.resolve().then(() => (init_chat_input(), chat_input_exports)));
var DynamicChatMessage = (0, import_react9.lazy)(() => Promise.resolve().then(() => (init_chat_message(), chat_message_exports)));
var SCROLL_BOTTOM_THRESHOLD = 50;
function ChatContent({
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
  welcomeMessageSecondary = "Feel free to ask any question you like \u2014 just be precise, as if you're speaking to a real person.",
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
  onFinish
}) {
  const messagesEndRef = (0, import_react9.useRef)(null);
  const scrollContainerRef = (0, import_react9.useRef)(null);
  const [messages, setMessages] = (0, import_react9.useState)(
    conversation.messages || []
  );
  const [isStreaming, setIsStreaming] = (0, import_react9.useState)(false);
  const [streamingMessage, setStreamingMessage] = (0, import_react9.useState)(
    null
  );
  const streamingMessageRef = (0, import_react9.useRef)(null);
  const previousConversationIdRef = (0, import_react9.useRef)(conversation.id);
  const stableConversationKeyRef = (0, import_react9.useRef)(conversation.id);
  const [errorDialog, setErrorDialog] = (0, import_react9.useState)(null);
  const [showScrollToBottomButton, setShowScrollToBottomButton] = (0, import_react9.useState)(false);
  const [userHasScrolledUp, setUserHasScrolledUp] = (0, import_react9.useState)(false);
  const [openAnalytic, setOpenAnalytic] = (0, import_react9.useState)(null);
  const [chatWidth, setChatWidth] = (0, import_react9.useState)(30);
  const [isResizingChatApp, setIsResizingChatApp] = (0, import_react9.useState)(false);
  const chatAppResizeHandleRef = (0, import_react9.useRef)(null);
  const chatAppContainerRef = (0, import_react9.useRef)(null);
  const minChatWidth = 20;
  const maxChatWidth = 80;
  const hasMessages = messages.length > 0 || !!streamingMessage;
  const hasOpenPanel = !!openAnalytic;
  const isWaitingForInput = (0, import_react9.useMemo)(() => {
    return conversation.waiting === true || messages.some((message) => message.waiting === true);
  }, [conversation.waiting, messages]);
  const allMessages = (0, import_react9.useMemo)(() => {
    const combined = [...messages];
    if (streamingMessage) {
      combined.push(streamingMessage);
    }
    return combined.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [messages, streamingMessage]);
  const scrollToBottom = (0, import_react9.useCallback)(
    (behavior = "smooth") => {
      var _a;
      (_a = messagesEndRef.current) == null ? void 0 : _a.scrollIntoView({ behavior, block: "end" });
      const container = scrollContainerRef.current;
      if (container) container.scrollTop = container.scrollHeight;
      setTimeout(() => {
        var _a2, _b;
        (_b = document.querySelector('[data-main-chat-scroll="true"]')) == null ? void 0 : _b.scrollTo({
          top: ((_a2 = document.querySelector(
            '[data-main-chat-scroll="true"]'
          )) == null ? void 0 : _a2.scrollHeight) || 0
        });
      }, 10);
      setShowScrollToBottomButton(false);
      setUserHasScrolledUp(false);
    },
    []
  );
  (0, import_react9.useEffect)(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < SCROLL_BOTTOM_THRESHOLD;
      const isContentScrollable = container.scrollHeight > container.clientHeight;
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
  (0, import_react9.useEffect)(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMessages) {
      setShowScrollToBottomButton(false);
      return;
    }
    if (!userHasScrolledUp) {
      scrollToBottom("smooth");
    } else {
      const isContentScrollable = container.scrollHeight > container.clientHeight;
      if (isContentScrollable) {
        setShowScrollToBottomButton(true);
      } else {
        setShowScrollToBottomButton(false);
      }
    }
  }, [allMessages, scrollToBottom, userHasScrolledUp, hasMessages]);
  (0, import_react9.useEffect)(() => {
    setShowScrollToBottomButton(false);
    setUserHasScrolledUp(false);
    const timeoutId = setTimeout(() => {
      scrollToBottom("auto");
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [conversation.id, scrollToBottom]);
  (0, import_react9.useEffect)(() => {
    const conversationMessages = conversation.messages || [];
    const previousId = previousConversationIdRef.current;
    const currentId = conversation.id;
    const isTempToRealTransition = (previousId == null ? void 0 : previousId.startsWith("temp-")) && !currentId.startsWith("temp-") && isStreaming;
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
                new Date(backendMsg.createdAt).getTime() - localTime
              );
              return backendMsg.role === localMsg.role && timeDiff < 5e3;
            });
          }
          return true;
        });
        const seen = /* @__PURE__ */ new Set();
        return [...filteredLocal, ...conversationMessages].filter(
          (msg) => !seen.has(msg.id) && (seen.add(msg.id), true)
        ).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    }
  }, [conversation.id, conversation.messages, isStreaming]);
  (0, import_react9.useEffect)(() => {
    if (openAnalytic) {
      setOpenAnalytic(null);
    }
  }, [conversation.id]);
  (0, import_react9.useEffect)(() => {
    if (messages.length > 0 && !userHasScrolledUp) {
      const timeoutId = setTimeout(() => {
        scrollToBottom("smooth");
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, scrollToBottom, userHasScrolledUp]);
  (0, import_react9.useEffect)(() => {
    if (conversation.messages && conversation.messages.length > 0) {
      const timeouts = [
        setTimeout(() => scrollToBottom("auto"), 50),
        setTimeout(() => scrollToBottom("auto"), 200),
        setTimeout(() => scrollToBottom("auto"), 500)
      ];
      return () => timeouts.forEach(clearTimeout);
    }
  }, [conversation.messages, conversation.id, scrollToBottom]);
  (0, import_react9.useEffect)(() => {
    if (hasMessages) {
      const timeoutId = setTimeout(() => {
        scrollToBottom("auto");
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [hasMessages, scrollToBottom]);
  (0, import_react9.useEffect)(() => {
    return () => {
      setIsStreaming(false);
      setStreamingMessage(null);
      streamingMessageRef.current = null;
    };
  }, []);
  const handleAddUserMessage = (0, import_react9.useCallback)(
    (message) => {
      (0, import_react9.startTransition)(() => {
        setMessages((prev) => [...prev, message]);
        setUserHasScrolledUp(false);
        setShowScrollToBottomButton(false);
      });
      setTimeout(
        () => {
          scrollToBottom(
            messages.length === 0 ? "instant" : "smooth"
          );
        },
        messages.length === 0 ? 600 : 50
      );
    },
    [messages.length, scrollToBottom]
  );
  const handleStreamStart = (0, import_react9.useCallback)(() => {
    const newStreamingMessage = {
      id: `stream-${Date.now()}`,
      role: "assistant",
      content: "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    streamingMessageRef.current = {
      id: newStreamingMessage.id,
      role: newStreamingMessage.role,
      createdAt: newStreamingMessage.createdAt
    };
    (0, import_react9.startTransition)(() => {
      setStreamingMessage(newStreamingMessage);
      setIsStreaming(true);
    });
  }, []);
  const handleToolExecutionStart = (0, import_react9.useCallback)((toolName) => {
    setStreamingMessage((prev) => {
      if (!prev) return null;
      return __spreadProps(__spreadValues({}, prev), {
        isToolExecuting: true,
        executingToolName: toolName
      });
    });
  }, []);
  const handleToolExecutionEnd = (0, import_react9.useCallback)(() => {
    setStreamingMessage((prev) => {
      if (!prev) return null;
      return __spreadProps(__spreadValues({}, prev), {
        isToolExecuting: false,
        executingToolName: void 0
      });
    });
  }, []);
  const pendingChunksRef = (0, import_react9.useRef)("");
  const throttleTimerRef = (0, import_react9.useRef)(null);
  const handleStreamUpdate = (0, import_react9.useCallback)((chunk) => {
    pendingChunksRef.current += chunk;
    if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);
    throttleTimerRef.current = setTimeout(() => {
      const chunks = pendingChunksRef.current;
      pendingChunksRef.current = "";
      setStreamingMessage(
        (prev) => prev ? __spreadProps(__spreadValues({}, prev), { content: (prev.content || "") + chunks }) : null
      );
    }, 50);
  }, []);
  const handleStreamEnd = (0, import_react9.useCallback)(
    async (finalContent, metadata) => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      if (pendingChunksRef.current) {
        const chunks = pendingChunksRef.current;
        pendingChunksRef.current = "";
        setStreamingMessage(
          (prev) => prev ? __spreadProps(__spreadValues({}, prev), { content: (prev.content || "") + chunks }) : null
        );
      }
      const streamDetails = streamingMessageRef.current;
      let messageToAdd = null;
      if (streamDetails && (finalContent == null ? void 0 : finalContent.trim())) {
        const hasFormWidget = /```widget:form\n[\s\S]*?\n```/.test(
          finalContent
        );
        const hasDecisionWidget = /```(?:widget:decision|decision)\n[\s\S]*?\n```/.test(
          finalContent
        );
        messageToAdd = __spreadValues(__spreadValues({
          id: `assistant-${Date.now()}`,
          role: streamDetails.role,
          createdAt: streamDetails.createdAt,
          content: finalContent.trim()
        }, hasFormWidget || hasDecisionWidget ? { waiting: true } : {}), metadata ? {
          metadata: {
            logId: metadata.logId,
            steps: metadata.steps,
            vectors: metadata.vectors
          }
        } : {});
      }
      if (messageToAdd) {
        setMessages((prev) => [...prev, messageToAdd]);
        streamingMessageRef.current = {
          id: messageToAdd.id,
          role: messageToAdd.role,
          createdAt: messageToAdd.createdAt
        };
        setTimeout(() => streamingMessageRef.current = null, 1e3);
      } else {
        streamingMessageRef.current = null;
      }
      setIsStreaming(false);
      setStreamingMessage(null);
    },
    []
  );
  const handleError = (0, import_react9.useCallback)((details) => {
    setIsStreaming(false);
    setStreamingMessage(null);
    streamingMessageRef.current = null;
    setErrorDialog(details);
    setShowScrollToBottomButton(false);
  }, []);
  const handleStopStreaming = (0, import_react9.useCallback)(() => {
    setIsStreaming(false);
    setStreamingMessage(null);
    streamingMessageRef.current = null;
  }, []);
  const handleAnalyticOpen = (0, import_react9.useCallback)(
    (name, data) => {
      setOpenAnalytic({ name, data });
      onSidebarToggle == null ? void 0 : onSidebarToggle();
    },
    [onSidebarToggle]
  );
  const handlePanelClose = (0, import_react9.useCallback)(() => {
    setOpenAnalytic(null);
  }, []);
  const startResizingChatApp = (0, import_react9.useCallback)(
    (e) => {
      e.preventDefault();
      setIsResizingChatApp(true);
    },
    []
  );
  (0, import_react9.useEffect)(() => {
    const handleMouseMove = (e) => {
      if (!isResizingChatApp) return;
      const mainContainer = chatAppContainerRef.current;
      if (!mainContainer) return;
      const containerRect = mainContainer.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const relativeX = e.clientX - containerRect.left;
      const newChatWidthPercent = relativeX / containerWidth * 100;
      const clampedWidth = Math.max(
        minChatWidth,
        Math.min(newChatWidthPercent, maxChatWidth)
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
  const ErrorDialog = () => {
    if (!errorDialog) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: errorDialog.title }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "button",
          {
            onClick: () => setErrorDialog(null),
            className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
            "aria-label": "Close error dialog",
            children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.X, { size: 20 })
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-300 mb-4", children: errorDialog.message }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "flex justify-end", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "button",
        {
          onClick: () => setErrorDialog(null),
          className: "px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
          children: "OK"
        }
      ) })
    ] }) });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("style", { children: `
        .resize-active {
          user-select: none;
        }
        .resize-active * {
          cursor: col-resize !important;
        }
      ` }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
      "div",
      {
        ref: chatAppContainerRef,
        className: "flex h-full relative w-full",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ErrorDialog, {}),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
            "div",
            {
              className: `flex flex-col transition-all duration-300 relative min-w-[500px] ${hasOpenPanel ? "" : "w-full"}`,
              style: hasOpenPanel ? { width: `${chatWidth}%` } : {},
              children: [
                isResizingChatApp && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "absolute inset-0 z-40 bg-transparent cursor-col-resize" }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
                    "div",
                    {
                      ref: scrollContainerRef,
                      className: `flex-1 overflow-y-auto py-6 relative ${hasOpenPanel ? "px-2 sm:px-4" : "px-4 sm:px-8"} ${!hasMessages ? "flex flex-col items-center justify-center" : ""}`,
                      "data-ref": "scrollContainerRef",
                      "data-main-chat-scroll": "true",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_framer_motion.AnimatePresence, { mode: "wait", children: !hasMessages && !isReadOnly && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
                          import_framer_motion.motion.div,
                          {
                            initial: { opacity: 0, y: 20 },
                            animate: { opacity: 1, y: 0 },
                            exit: { opacity: 0, y: -20 },
                            transition: {
                              duration: 0.6,
                              type: "spring",
                              bounce: 0.15
                            },
                            className: "flex flex-col items-center w-full max-w-4xl mx-auto",
                            children: [
                              welcomeIcon && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                import_framer_motion.motion.div,
                                {
                                  initial: {
                                    scale: 0.8,
                                    opacity: 0
                                  },
                                  animate: {
                                    scale: 1,
                                    opacity: 1
                                  },
                                  transition: {
                                    delay: 0.1,
                                    duration: 0.5
                                  },
                                  className: "mb-4",
                                  children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                    "img",
                                    {
                                      src: welcomeIcon,
                                      alt: "Welcome icon",
                                      style: {
                                        width: welcomeIconSize,
                                        height: welcomeIconSize
                                      },
                                      className: "object-contain"
                                    }
                                  )
                                }
                              ),
                              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                import_framer_motion.motion.h2,
                                {
                                  initial: { opacity: 0, y: 10 },
                                  animate: { opacity: 1, y: 0 },
                                  transition: {
                                    delay: 0.2,
                                    duration: 0.5
                                  },
                                  className: `mb-2 font-bold ${hasOpenPanel ? "text-lg" : "text-2xl"}`,
                                  children: welcomeMessagePrimary
                                }
                              ),
                              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                import_framer_motion.motion.p,
                                {
                                  initial: { opacity: 0, y: 10 },
                                  animate: { opacity: 1, y: 0 },
                                  transition: {
                                    delay: 0.3,
                                    duration: 0.5
                                  },
                                  className: `text-center text-gray-500 mb-8 ${hasOpenPanel ? "text-sm max-w-xs" : "max-w-md"}`,
                                  children: welcomeMessageSecondary
                                }
                              ),
                              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                import_framer_motion.motion.div,
                                {
                                  initial: { opacity: 0, y: 10 },
                                  animate: { opacity: 1, y: 0 },
                                  transition: {
                                    delay: 0.4,
                                    duration: 0.5
                                  },
                                  className: `w-full ${hasOpenPanel ? "max-w-xs" : "max-w-xl"}`,
                                  children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_react9.Suspense, { fallback: null, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                    ChatInput2,
                                    {
                                      conversationId: conversation.id,
                                      agentId,
                                      onAddUserMessage: handleAddUserMessage,
                                      onStreamStart: handleStreamStart,
                                      onStreamUpdate: handleStreamUpdate,
                                      onStreamEnd: handleStreamEnd,
                                      onError: handleError,
                                      messages: [],
                                      isStreaming,
                                      onStopStreaming: handleStopStreaming,
                                      disabled: isWaitingForInput,
                                      onThreadCreated,
                                      onToolExecutionStart: handleToolExecutionStart,
                                      onToolExecutionEnd: handleToolExecutionEnd,
                                      onToolStart,
                                      onToolInput,
                                      onToolFinish,
                                      onChunk,
                                      onFinish,
                                      accentColor,
                                      streaming,
                                      theme,
                                      inputBackgroundColor,
                                      inputBackgroundColorDark
                                    }
                                  ) })
                                }
                              )
                            ]
                          },
                          "welcome-state"
                        ) }),
                        !hasMessages && isReadOnly && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "text-center", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-2", children: "Log View" }),
                          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-gray-500 dark:text-gray-400", children: "This log contains no messages." })
                        ] }),
                        hasMessages && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
                          import_framer_motion.motion.div,
                          {
                            initial: { opacity: 0, y: 20 },
                            animate: { opacity: 1, y: 0 },
                            exit: { opacity: 0, y: -20 },
                            transition: {
                              duration: 0.4,
                              ease: "easeOut"
                            },
                            className: "space-y-2",
                            children: [
                              allMessages.map((message, index) => {
                                var _a;
                                const isCurrentlyStreaming = isStreaming && (streamingMessage == null ? void 0 : streamingMessage.id) === message.id;
                                const wasJustStreamed = ((_a = streamingMessageRef.current) == null ? void 0 : _a.id) === message.id;
                                return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                  import_framer_motion.motion.div,
                                  {
                                    initial: {
                                      opacity: wasJustStreamed ? 1 : 0,
                                      x: wasJustStreamed ? 0 : -20
                                    },
                                    animate: { opacity: 1, x: 0 },
                                    transition: {
                                      duration: isCurrentlyStreaming || wasJustStreamed ? 0 : 0.3,
                                      delay: isCurrentlyStreaming || wasJustStreamed ? 0 : index * 0.05,
                                      ease: "easeOut"
                                    },
                                    children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                      DynamicChatMessage,
                                      {
                                        message,
                                        isStreaming: isCurrentlyStreaming,
                                        theme,
                                        onAnalyticOpen: handleAnalyticOpen,
                                        messageBubbleColor,
                                        streamingText,
                                        streamingTextColor,
                                        vectorColor,
                                        vectorColorDark,
                                        agentId,
                                        onFeedbackChange: (messageId, feedbackPositive) => {
                                          setMessages(
                                            (prev) => prev.map(
                                              (msg) => msg.id === messageId ? __spreadProps(__spreadValues({}, msg), {
                                                metadata: __spreadProps(__spreadValues({}, msg.metadata), {
                                                  feedbackPositive
                                                })
                                              }) : msg
                                            )
                                          );
                                        }
                                      }
                                    )
                                  },
                                  message.id || index
                                );
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                "div",
                                {
                                  ref: messagesEndRef,
                                  "data-ref": "messagesEndRef"
                                }
                              )
                            ]
                          },
                          stableConversationKeyRef.current
                        )
                      ]
                    }
                  ),
                  !isReadOnly && hasMessages && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                    import_framer_motion.motion.div,
                    {
                      layout: true,
                      initial: false,
                      transition: {
                        layout: {
                          duration: 0.6,
                          type: "spring",
                          bounce: 0.15
                        }
                      },
                      className: "relative border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-20",
                      children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
                        "div",
                        {
                          className: hasOpenPanel ? "p-2 sm:p-3 w-full" : "p-4 sm:p-6 w-full max-w-4xl mx-auto",
                          children: [
                            isWaitingForInput && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg", children: [
                              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-2", children: [
                                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex space-x-1", children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "w-2 h-2 bg-amber-500 rounded-full animate-pulse" }),
                                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                    "div",
                                    {
                                      className: "w-2 h-2 bg-amber-500 rounded-full animate-pulse",
                                      style: {
                                        animationDelay: "0.2s"
                                      }
                                    }
                                  ),
                                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                                    "div",
                                    {
                                      className: "w-2 h-2 bg-amber-500 rounded-full animate-pulse",
                                      style: {
                                        animationDelay: "0.4s"
                                      }
                                    }
                                  )
                                ] }),
                                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-sm text-amber-800 dark:text-amber-200 font-medium", children: "Waiting for form input..." })
                              ] }),
                              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-xs text-amber-700 dark:text-amber-300 mt-1", children: "Complete the form above or click Cancel to continue without data capture." })
                            ] }),
                            showScrollToBottomButton && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "absolute bottom-22 left-1/2 transform -translate-x-1/2 z-10", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                              "button",
                              {
                                onClick: () => scrollToBottom("smooth"),
                                className: "text-white rounded-full p-3 shadow-lg transition-all duration-200 ease-in-out animate-bounce",
                                style: {
                                  backgroundColor: scrollButtonColor
                                },
                                onMouseEnter: (e) => {
                                  e.currentTarget.style.filter = "brightness(0.85)";
                                },
                                onMouseLeave: (e) => {
                                  e.currentTarget.style.filter = "brightness(1)";
                                },
                                title: "Scroll to bottom",
                                children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.ArrowDownCircle, { size: 24 })
                              }
                            ) }),
                            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_react9.Suspense, { fallback: null, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                              ChatInput2,
                              {
                                conversationId: conversation.id,
                                agentId,
                                onAddUserMessage: handleAddUserMessage,
                                onStreamStart: handleStreamStart,
                                onStreamUpdate: handleStreamUpdate,
                                onStreamEnd: handleStreamEnd,
                                onError: handleError,
                                messages,
                                isStreaming,
                                onStopStreaming: handleStopStreaming,
                                disabled: isWaitingForInput,
                                onThreadCreated,
                                onToolExecutionStart: handleToolExecutionStart,
                                onToolExecutionEnd: handleToolExecutionEnd,
                                onToolStart,
                                onToolInput,
                                onToolFinish,
                                onChunk,
                                onFinish,
                                accentColor,
                                streaming,
                                theme,
                                inputBackgroundColor,
                                inputBackgroundColorDark
                              }
                            ) })
                          ]
                        }
                      )
                    }
                  )
                ] })
              ]
            }
          ),
          hasOpenPanel && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "div",
            {
              ref: chatAppResizeHandleRef,
              onMouseDown: startResizingChatApp,
              className: `h-full cursor-col-resize transition-all z-50 relative flex items-center justify-center ${isResizingChatApp ? "w-2 bg-indigo-500 dark:bg-indigo-400" : "w-1 hover:w-2 bg-gray-300 dark:bg-gray-700 hover:bg-indigo-500 dark:hover:bg-indigo-400"}`,
              title: "Drag to resize chat and app areas",
              children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex flex-col space-y-1 opacity-60", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "w-0.5 h-0.5 bg-white rounded-full" }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "w-0.5 h-0.5 bg-white rounded-full" }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "w-0.5 h-0.5 bg-white rounded-full" })
              ] })
            }
          ),
          hasOpenPanel && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex-1 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col w-full", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center space-x-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  "div",
                  {
                    className: `w-8 h-8 rounded-lg flex items-center justify-center ${false ? "bg-blue-500" : "bg-emerald-500"}`,
                    children: false ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                      "svg",
                      {
                        className: "w-5 h-5 text-white",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        xmlns: "http://www.w3.org/2000/svg",
                        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                          "path",
                          {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          }
                        )
                      }
                    ) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                      "svg",
                      {
                        className: "w-5 h-5 text-white",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        xmlns: "http://www.w3.org/2000/svg",
                        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                          "path",
                          {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          }
                        )
                      }
                    )
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h3", { className: "font-semibold text-gray-800 dark:text-gray-200", children: false ? "openApp" : "Analytics Dashboard" }),
                  openAnalytic && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: openAnalytic.name })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "flex items-center space-x-2", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                "button",
                {
                  onClick: handlePanelClose,
                  className: "p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors",
                  "aria-label": "Close panel",
                  children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                    import_lucide_react7.X,
                    {
                      size: 20,
                      className: "text-gray-600 dark:text-gray-400"
                    }
                  )
                }
              ) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex-1 relative h-full", children: [
              isResizingChatApp && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "absolute inset-0 z-50 bg-transparent cursor-col-resize" }),
              false ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                "iframe",
                {
                  className: "w-full h-full border-0",
                  allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                  sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
                }
              ) : openAnalytic ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                AnalyticsPanel,
                {
                  name: openAnalytic.name,
                  csvData: openAnalytic.data,
                  theme
                }
              ) : null
            ] })
          ] })
        ]
      }
    )
  ] });
}

// app/components/confirmation-dialog.tsx
var import_react_dom = require("react-dom");
var import_react10 = require("react");
var import_jsx_runtime9 = require("react/jsx-runtime");
function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-red-500 hover:bg-red-600"
}) {
  const [isMounted, setIsMounted] = (0, import_react10.useState)(false);
  (0, import_react10.useEffect)(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  if (!isOpen || !isMounted) return null;
  return (0, import_react_dom.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "fixed inset-0 z-[9999] flex items-center justify-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        "div",
        {
          className: "fixed inset-0 bg-black/50",
          onClick: onClose,
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-80 max-w-[90vw] z-10", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("h3", { className: "text-lg font-medium mb-2", children: title }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "text-gray-500 dark:text-gray-400 mb-4", children: message }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex justify-end gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            "button",
            {
              onClick: onClose,
              className: "px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer",
              children: cancelText
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            "button",
            {
              onClick: onConfirm,
              className: `px-4 py-2 text-sm text-white rounded-md cursor-pointer ${confirmButtonClass}`,
              children: confirmText
            }
          )
        ] })
      ] })
    ] }),
    document.body
  );
}

// app/components/chat.tsx
var import_jsx_runtime10 = require("react/jsx-runtime");
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? import_react11.useLayoutEffect : import_react11.useEffect;
function NeptuneChatBot({
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
  streamingText = "Naia is working on it...",
  streamingTextColor = "#2563EB",
  streamingTextColorDark = "#60A5FA",
  welcomeMessagePrimary = "How can I help you today?",
  welcomeMessageSecondary = "Feel free to ask any question you like \u2014 just be precise, as if you're speaking to a real person.",
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
  vectorColorDark = "#A855F7"
}) {
  const [conversations, setConversations] = (0, import_react11.useState)([]);
  const [selectedConversationId, setSelectedConversationId] = (0, import_react11.useState)(null);
  const [selectedConversation, setSelectedConversation] = (0, import_react11.useState)(null);
  const [isLoading, setIsLoading] = (0, import_react11.useState)(true);
  const [isLoadingMessages, setIsLoadingMessages] = (0, import_react11.useState)(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = (0, import_react11.useState)(false);
  const [pendingDeleteId, setPendingDeleteId] = (0, import_react11.useState)(null);
  const [sidebarOpen, setSidebarOpen] = (0, import_react11.useState)(true);
  const [titleInput, setTitleInput] = (0, import_react11.useState)("");
  const [isSavingTitle, setIsSavingTitle] = (0, import_react11.useState)(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = (0, import_react11.useState)(false);
  const [conversationToRename, setConversationToRename] = (0, import_react11.useState)(null);
  const [theme, setTheme] = (0, import_react11.useState)(propTheme);
  const [agentId] = (0, import_react11.useState)(propAgentId);
  const [initialAssistantIdChecked] = (0, import_react11.useState)(true);
  const [initialLoadComplete, setInitialLoadComplete] = (0, import_react11.useState)(false);
  const [openMenuId, setOpenMenuId] = (0, import_react11.useState)(null);
  const [isCreatingConversation, setIsCreatingConversation] = (0, import_react11.useState)(false);
  const [sidebarWidth, setSidebarWidth] = (0, import_react11.useState)(250);
  const [isResizing, setIsResizing] = (0, import_react11.useState)(false);
  const titleInputRef = (0, import_react11.useRef)(null);
  const resizeHandleRef = (0, import_react11.useRef)(null);
  const hasFetchedRef = (0, import_react11.useRef)(false);
  const minSidebarWidth = 200;
  const maxSidebarWidth = 600;
  (0, import_react11.useEffect)(() => {
    if (propLocalDebug) {
      configureChatClient(propLocalDebug);
    }
  }, [propLocalDebug]);
  const applyTheme = (0, import_react11.useCallback)((newTheme) => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.remove("light");
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
    localStorage.setItem("theme", newTheme);
  }, []);
  (0, import_react11.useEffect)(() => {
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
  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };
  (0, import_react11.useEffect)(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      const clampedWidth = Math.max(
        minSidebarWidth,
        Math.min(newWidth, maxSidebarWidth)
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
  const categorizeConversationsByDate = (0, import_react11.useCallback)(
    (conversations2) => {
      const now = /* @__PURE__ */ new Date();
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const thresholds = {
        Yesterday: new Date(today.getTime() - 24 * 60 * 60 * 1e3),
        "Last 7 Days": new Date(
          today.getTime() - 7 * 24 * 60 * 60 * 1e3
        ),
        "Last 30 Days": new Date(
          today.getTime() - 30 * 24 * 60 * 60 * 1e3
        )
      };
      const groups = {
        Today: [],
        Yesterday: [],
        "Last 7 Days": [],
        "Last 30 Days": [],
        Older: []
      };
      conversations2.forEach((conv) => {
        try {
          const convDate = new Date(conv.updatedAt);
          const key = convDate >= today ? "Today" : convDate >= thresholds.Yesterday ? "Yesterday" : convDate >= thresholds["Last 7 Days"] ? "Last 7 Days" : convDate >= thresholds["Last 30 Days"] ? "Last 30 Days" : "Older";
          groups[key].push(conv);
        } catch (e) {
          groups.Older.push(conv);
        }
      });
      Object.values(groups).forEach(
        (group) => group.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      );
      return groups;
    },
    []
  );
  (0, import_react11.useEffect)(() => {
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
            data
          );
          setConversations([]);
          return;
        }
        setConversations(data);
        const tempConversation = {
          id: `temp-${Date.now()}`,
          title: "New Chat",
          messages: [],
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          isTemporary: true
        };
        setSelectedConversation(tempConversation);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setIsLoading(false);
        setInitialLoadComplete(true);
      }
    };
    fetchConversations();
  }, [agentId, initialAssistantIdChecked]);
  const loadConversationData = async (id) => {
    setIsLoadingMessages(true);
    try {
      const fullConversation = await chatClient.conversations.get(id);
      setSelectedConversation(fullConversation);
    } catch (error) {
      console.error(
        `Failed to load conversation data for ID ${id}:`,
        error
      );
    } finally {
      setIsLoadingMessages(false);
    }
  };
  const refreshSelectedConversation = async () => {
    if (!selectedConversationId) return;
    try {
      const updatedConversation = await chatClient.conversations.get(
        selectedConversationId
      );
      setConversations(
        (prev) => prev.map(
          (conv) => conv.id === selectedConversationId ? updatedConversation : conv
        )
      );
      setSelectedConversation(updatedConversation);
    } catch (error) {
      console.error("Failed to refresh selected conversation:", error);
    }
  };
  const selectConversation = (0, import_react11.useCallback)((id) => {
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
      const existingTempConv = conversations.find(
        (conv) => conv.isTemporary
      );
      if (existingTempConv) {
        selectConversation(existingTempConv.id);
        return;
      }
      const tempConversation = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        title: "New Chat",
        messages: [],
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isTemporary: true
        // Mark as temporary
      };
      setSelectedConversationId(tempConversation.id);
      setSelectedConversation(tempConversation);
    } catch (error) {
      console.error("Failed to create new conversation:", error);
    }
  };
  const handleThreadCreated = (0, import_react11.useCallback)(
    (oldId, newId, backendConversation) => {
      (0, import_react11.startTransition)(() => {
        if (backendConversation) {
          const updatedConv = __spreadProps(__spreadValues({}, backendConversation), {
            isTemporary: false
          });
          setConversations((prev) => [
            updatedConv,
            ...prev.filter((conv) => conv.id !== oldId)
          ]);
          setSelectedConversationId(newId);
          setSelectedConversation(
            (current) => (current == null ? void 0 : current.id) === oldId ? __spreadProps(__spreadValues({}, backendConversation), {
              id: newId,
              isTemporary: false,
              messages: current.messages
            }) : current
          );
        } else {
          setSelectedConversation((current) => {
            if ((current == null ? void 0 : current.id) !== oldId) return current;
            const updated = __spreadProps(__spreadValues({}, current), {
              id: newId,
              isTemporary: false
            });
            setConversations((prev) => {
              const idx = prev.findIndex(
                (c) => c.id === oldId || c.id === newId
              );
              return idx !== -1 ? [
                ...prev.slice(0, idx),
                updated,
                ...prev.slice(idx + 1)
              ] : [updated, ...prev];
            });
            setSelectedConversationId(newId);
            return updated;
          });
        }
      });
    },
    []
  );
  const deleteConversation = async (id) => {
    try {
      await chatClient.conversations.delete(id);
      const updatedConversations = conversations.filter(
        (conv) => conv.id !== id
      );
      setConversations(updatedConversations);
      if (selectedConversationId === id) {
        const tempConversation = {
          id: `temp-${Date.now()}`,
          title: "New Chat",
          messages: [],
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          isTemporary: true
        };
        setSelectedConversationId(tempConversation.id);
        setSelectedConversation(tempConversation);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };
  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
    setOpenMenuId(null);
  };
  const toggleConversationMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };
  const handleRenameClick = (e, conversation) => {
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
        title: titleInput.trim()
      });
      const updatedConv = __spreadProps(__spreadValues({}, conversationToRename), {
        title: titleInput.trim()
      });
      setConversations(
        (prev) => prev.map(
          (conv) => conv.id === conversationToRename.id ? updatedConv : conv
        )
      );
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
  (0, import_react11.useEffect)(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
    !initialLoadComplete && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "text-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "text-gray-500 dark:text-gray-400", children: "Loading..." })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex h-screen overflow-hidden bg-white dark:bg-gray-900", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("style", { children: `
        .resize-active {
          cursor: col-resize;
          user-select: none;
        }
      ` }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        ConfirmationDialog,
        {
          isOpen: deleteDialogOpen,
          onClose: () => setDeleteDialogOpen(false),
          onConfirm: confirmDelete,
          title: "Delete Conversation",
          message: "Are you sure you want to delete this conversation? This action cannot be undone.",
          confirmText: "Delete",
          cancelText: "Cancel",
          confirmButtonClass: "bg-red-500 hover:bg-red-600"
        }
      ),
      isRenameDialogOpen && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-120 max-w-[90vw]", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h3", { className: "text-lg font-medium mb-4 text-gray-900 dark:text-gray-100", children: "Rename Conversation" }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "input",
          {
            ref: titleInputRef,
            type: "text",
            value: titleInput,
            onChange: (e) => setTitleInput(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter")
                handleConfirmRename();
              else if (e.key === "Escape")
                handleCancelRename();
            },
            className: "w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
            placeholder: "Enter conversation title",
            disabled: isSavingTitle,
            autoFocus: true
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex justify-end gap-2 mt-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            "button",
            {
              onClick: handleCancelRename,
              disabled: isSavingTitle,
              className: "px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            "button",
            {
              onClick: handleConfirmRename,
              disabled: isSavingTitle || !titleInput.trim(),
              className: "px-4 py-2 text-sm text-white rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50",
              children: isSavingTitle ? "Saving..." : "Rename"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_framer_motion2.AnimatePresence, { children: sidebarOpen && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        import_framer_motion2.motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.3 },
          className: "lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10",
          onClick: () => setSidebarOpen(false),
          "aria-hidden": "true"
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_framer_motion2.AnimatePresence, { children: sidebarOpen && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        import_framer_motion2.motion.div,
        {
          initial: { width: 0, opacity: 0 },
          animate: { width: sidebarWidth, opacity: 1 },
          exit: { width: 0, opacity: 0 },
          transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          },
          className: "bg-[#f9f9f9] dark:bg-gray-900 dark:!bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full relative z-20 overflow-hidden",
          children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex flex-col h-full", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            "div",
            {
              className: "flex-1 overflow-y-auto p-2",
              style: {
                backgroundColor: theme === "dark" ? sidebarBackgroundColorDark : sidebarBackgroundColor
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex-1", children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "space-y-4" }) : conversations.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "space-y-0", children: (() => {
                const groupedConversations = categorizeConversationsByDate(
                  conversations
                );
                return Object.entries(
                  groupedConversations
                ).map(
                  ([
                    groupName,
                    groupConversations
                  ]) => {
                    if (groupConversations.length === 0)
                      return null;
                    return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
                      "div",
                      {
                        className: "mb-4",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide", children: groupName }),
                          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "space-y-0", children: groupConversations.map(
                            (conversation) => {
                              var _a;
                              const hasWaitingMessages = conversation.waiting === true || ((_a = conversation.messages) == null ? void 0 : _a.some(
                                (message) => message.waiting === true
                              )) || false;
                              return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
                                "div",
                                {
                                  onClick: () => {
                                    selectConversation(
                                      conversation.id
                                    );
                                    if (window.innerWidth < 1024) {
                                      setSidebarOpen(
                                        false
                                      );
                                    }
                                  },
                                  className: `flex items-center w-full pl-4 pr-2 py-2 mb-1 rounded-xl text-left group cursor-pointer ${selectedConversationId === conversation.id ? "text-gray-800 dark:text-gray-200" : "text-gray-800 dark:text-gray-100 conversation-item-background"}`,
                                  style: selectedConversationId === conversation.id ? {
                                    backgroundColor: theme === "dark" ? messageBubbleColorDark : messageBubbleColor
                                  } : void 0,
                                  children: [
                                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex items-center gap-2", children: [
                                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "font-medium overflow-hidden text-ellipsis whitespace-nowrap", children: conversation.title || "New Chat" }),
                                      hasWaitingMessages && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex-shrink-0", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                                        "div",
                                        {
                                          className: "w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse",
                                          title: "Waiting for input"
                                        }
                                      ) })
                                    ] }) }),
                                    !conversation.isTemporary && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "relative", children: [
                                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                                        "button",
                                        {
                                          onClick: (e) => toggleConversationMenu(
                                            e,
                                            conversation.id
                                          ),
                                          className: "p-1.5 cursor-pointer rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 opacity-0 hover:bg-gray-300 dark:hover:bg-gray-700 group-hover:opacity-100 transition-opacity",
                                          "aria-label": "More options",
                                          children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                                            import_lucide_react8.MoreHorizontal,
                                            {
                                              size: 16
                                            }
                                          )
                                        }
                                      ),
                                      openMenuId === conversation.id && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "absolute right-0 top-10 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 p-2", children: [
                                        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
                                          "button",
                                          {
                                            onClick: (e) => handleRenameClick(
                                              e,
                                              conversation
                                            ),
                                            className: "w-full text-left px-3 py-2 text-md flex cursor-pointer items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md",
                                            children: [
                                              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                                                import_lucide_react8.Edit,
                                                {
                                                  size: 14
                                                }
                                              ),
                                              "Rename"
                                            ]
                                          }
                                        ),
                                        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
                                          "button",
                                          {
                                            onClick: (e) => handleDeleteClick(
                                              e,
                                              conversation.id
                                            ),
                                            className: "w-full text-left px-3 py-2 text-md text-red-600 cursor-pointer flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md",
                                            children: [
                                              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                                                import_lucide_react8.Trash2,
                                                {
                                                  size: 14
                                                }
                                              ),
                                              "Delete"
                                            ]
                                          }
                                        )
                                      ] })
                                    ] })
                                  ]
                                },
                                conversation.id
                              );
                            }
                          ) })
                        ]
                      },
                      groupName
                    );
                  }
                ).filter(Boolean);
              })() }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "text-center py-8 text-gray-500", children: "No conversations yet" }) })
            }
          ) })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_framer_motion2.AnimatePresence, { children: sidebarOpen && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        import_framer_motion2.motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.3 },
          children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            "div",
            {
              ref: resizeHandleRef,
              onMouseDown: startResizing,
              className: "w-1 hover:w-2 bg-gray-300 dark:bg-gray-700 h-full cursor-col-resize transition-all hover:bg-indigo-500 dark:hover:bg-indigo-400 z-30 relative",
              title: "Drag to resize"
            }
          )
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
          "header",
          {
            className: "h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4",
            style: {
              backgroundColor: theme === "dark" ? headerBackgroundColorDark : headerBackgroundColor
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex items-center", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                  "button",
                  {
                    onClick: () => setSidebarOpen(!sidebarOpen),
                    className: "p-2 cursor-pointer rounded-lg text-gray-500 disabled:opacity-50 transition-colors",
                    style: {
                      backgroundColor: "transparent"
                    },
                    onMouseEnter: (e) => {
                      e.currentTarget.style.backgroundColor = theme === "dark" ? messageBubbleColorDark : messageBubbleColor;
                    },
                    onMouseLeave: (e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    },
                    title: "Toggle Sidebar",
                    "aria-label": "Toggle Sidebar",
                    children: sidebarOpen ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react8.PanelRightOpen, { size: 20 }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react8.PanelRightClose, { size: 20 })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                  "button",
                  {
                    onClick: createNewConversation,
                    className: "p-2 cursor-pointer rounded-lg text-gray-500 disabled:opacity-50 transition-colors",
                    style: {
                      backgroundColor: "transparent"
                    },
                    onMouseEnter: (e) => {
                      e.currentTarget.style.backgroundColor = theme === "dark" ? messageBubbleColorDark : messageBubbleColor;
                    },
                    onMouseLeave: (e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    },
                    title: "New Chat",
                    "aria-label": "New Chat",
                    children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react8.MessageCirclePlus, { size: 20 })
                  }
                )
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "relative flex items-center", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "text-2xl font-bold mr-1", children: propTitle }) }) }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                "button",
                {
                  onClick: toggleTheme,
                  className: "p-2 cursor-pointer rounded-lg text-gray-500 transition-colors",
                  style: {
                    backgroundColor: "transparent"
                  },
                  onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = theme === "dark" ? messageBubbleColorDark : messageBubbleColor;
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  },
                  title: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
                  "aria-label": `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
                  children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react8.Sun, { size: 20 }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react8.Moon, { size: 20 })
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "div",
          {
            className: `flex-1 overflow-hidden bg-white dark:bg-gray-900 text-lg transition-all duration-300 ${false ? "flex" : "flex justify-center"}`,
            children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              "div",
              {
                className: `flex flex-col transition-all duration-300 ${false ? "w-full" : "w-full max-w-6xl"}`,
                children: isLoading || !initialAssistantIdChecked ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "animate-pulse text-gray-500", children: isLoading ? "Loading conversations..." : "Initializing Assistant..." }) }) : !agentId ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex h-full flex-col items-center justify-center p-4 text-center", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h2", { className: "text-xl font-semibold text-red-600 dark:text-red-400 mb-2", children: "Agent Not Configured" }),
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("p", { className: "text-gray-700 dark:text-gray-300 max-w-md", children: [
                    "The Agent ID is missing or invalid. Please ensure it is provided in the URL parameters (e.g.,",
                    " ",
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("code", { children: "?agentId=your-id-here" }),
                    ")."
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "text-gray-500 dark:text-gray-400 mt-4 text-sm", children: "If you continue to see this message, please contact support." })
                ] }) : isLoadingMessages && selectedConversationId ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "animate-pulse text-gray-500", children: "Loading messages..." }) }) : selectedConversation ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                  ChatContent,
                  {
                    conversation: selectedConversation,
                    agentId,
                    onConversationUpdate: refreshSelectedConversation,
                    theme,
                    onSidebarToggle: () => setSidebarOpen(false),
                    onThreadCreated: handleThreadCreated,
                    messageBubbleColor: theme === "dark" ? messageBubbleColorDark : messageBubbleColor,
                    accentColor: theme === "dark" ? accentColorDark : accentColor,
                    scrollButtonColor: theme === "dark" ? scrollButtonColorDark : scrollButtonColor,
                    streamingText,
                    streamingTextColor: theme === "dark" ? streamingTextColorDark : streamingTextColor,
                    welcomeMessagePrimary,
                    welcomeMessageSecondary,
                    welcomeIcon,
                    welcomeIconSize,
                    streaming,
                    inputBackgroundColor,
                    inputBackgroundColorDark,
                    vectorColor,
                    vectorColorDark,
                    onToolStart,
                    onToolInput,
                    onToolFinish,
                    onChunk,
                    onFinish
                  }
                ) : (
                  // Show loading while the useEffect handles conversation creation
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "animate-pulse text-gray-500", children: isCreatingConversation ? "Creating new conversation..." : conversations.length === 0 ? "Creating new conversation..." : "Loading conversation..." }) })
                )
              }
            )
          }
        )
      ] })
    ] })
  ] });
}

// app/components/index.ts
init_chat_client();
init_tool_execution();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NeptuneChatBot,
  ToolExecutionIndicator,
  ToolExecutionWidget,
  configureChatClient
});
