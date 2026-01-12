import {
  __spreadProps,
  __spreadValues
} from "./chunk-FWCSY2DS.mjs";

// app/api/chat-client.ts
var chatConfig = {};
function configureChatClient(config) {
  Object.assign(chatConfig, config);
}
var base64ToFile = (data, type, name) => {
  const b64 = data.includes(",") ? data.split(",")[1] : data;
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length).map((_, i) => bin.charCodeAt(i));
  return new File([new Blob([arr], { type })], name, { type });
};
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
var chatClient = {
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

export {
  configureChatClient,
  chatClient
};
