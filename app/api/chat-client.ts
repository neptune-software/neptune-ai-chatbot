export interface TextContent {
    type: "text";
    text: string;
}
export interface FileContent {
    type: "file";
    data: string;
    mediaType: string;
    filename: string;
}
export interface ImageContent {
    type: "image";
    image: string;
    mediaType: string;
}
export type MessageContent = TextContent | FileContent | ImageContent;
export interface ToolCall {
    id: string;
    createdAt: string;
    toolCallId: string;
    toolName: string;
    args: Record<string, any>;
    result: any;
    status: string;
    error?: string | null;
}
export interface Step {
    id: string;
    createdAt: string;
    stepOrder: number;
    type: string;
    text?: string;
    tools?: ToolCall[];
}
export interface VectorResult {
    rowId: string;
    similarity: string;
    template: string;
    entityName: string;
    data: Record<string, any>;
}
export interface MessageMetadata {
    logId?: string;
    steps?: Step[];
    vectors?: VectorResult[];
    feedbackPositive?: boolean | null;
}
export interface Message {
    id: string;
    content: string | MessageContent[];
    role: "user" | "assistant" | "system";
    createdAt: string;
    waiting?: boolean;
    metadata?: MessageMetadata;
    isToolExecuting?: boolean;
    executingToolName?: string;
}
export interface LogFile {
    id: string;
    createdAt: string;
    name: string;
    mimeType: string;
    data: string;
    logId: string;
}
export interface LogEntry {
    id: string;
    createdAt: string;
    updatedAt: string;
    input: string;
    output: string;
    threadID: string;
    status: string;
    error?: string | null;
    files?: LogFile[];
    steps?: Step[];
    vectors?: VectorResult[];
    feedbackPositive?: boolean | null;
}
export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
    waiting?: boolean;
    isTemporary?: boolean;
}

let chatConfig: { username?: string; password?: string; baseUrl?: string } = {};

export function configureChatClient(config: {
    username: string;
    password: string;
    baseUrl: string;
}) {
    Object.assign(chatConfig, config);
}

const base64ToFile = (data: string, type: string, name: string) => {
    const b64 = data.includes(",") ? data.split(",")[1] : data;
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length).map((_, i) => bin.charCodeAt(i));
    return new File([new Blob([arr], { type })], name, { type });
};

async function fetchWithErrorHandling(
    url: string,
    options: RequestInit = {},
): Promise<any> {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    if (chatConfig.username && chatConfig.password) {
        headers.set(
            "Authorization",
            "Basic " + btoa(`${chatConfig.username}:${chatConfig.password}`),
        );
    }
    const finalUrl = chatConfig.baseUrl ? `${chatConfig.baseUrl}${url}` : url;

    try {
        const res = await fetch(finalUrl, { ...options, headers });
        const contentType = res.headers.get("content-type");
        const isJson = contentType?.includes("application/json");

        if (!res.ok) {
            const err = isJson
                ? await res.json()
                : { message: await res.text() };
            throw {
                ...err,
                status: res.status,
                statusText: res.statusText,
                isApiError: true,
            };
        }

        if (res.status === 204 || !contentType) return { success: true };
        return isJson
            ? res.json()
            : { success: true, nonJsonResponse: await res.text() };
    } catch (error: any) {
        if (error.isApiError) throw error;
        throw {
            isNetworkError: true,
            message: "Network connection failed",
            status: 0,
            originalError: error,
        };
    }
}

export async function createAgentStream(
    agentId: string,
    messages: { role: string; content: string | MessageContent[] }[],
    conversationId: string,
    signal?: AbortSignal,
    stepData?: any,
    streaming: boolean = true,
): Promise<ReadableStream<Uint8Array>> {
    const lastMsg = messages[messages.length - 1];
    let input = "";
    if (typeof lastMsg?.content === "string") input = lastMsg.content;
    else if (Array.isArray(lastMsg?.content))
        input =
            (lastMsg.content.find((c) => c.type === "text") as TextContent)
                ?.text || "";

    const formData = new FormData();
    formData.append("aiAgent", agentId);
    formData.append("input", input);
    formData.append("stream", String(streaming));
    if (conversationId && !conversationId.startsWith("temp-"))
        formData.append("threadID", conversationId);
    if (stepData) formData.append("variables", JSON.stringify(stepData));

    if (Array.isArray(lastMsg?.content)) {
        lastMsg.content.forEach((c) => {
            if (c.type === "image")
                formData.append(
                    "files",
                    base64ToFile(
                        c.image,
                        c.mediaType,
                        `image.${c.mediaType.split("/")[1]}`,
                    ),
                );
            else if (c.type === "file")
                formData.append(
                    "files",
                    base64ToFile(c.data, c.mediaType, c.filename),
                );
        });
    }

    const url = chatConfig.baseUrl
        ? `${chatConfig.baseUrl}/api/AIBuildersKit/createCompletionAI`
        : "/api/AIBuildersKit/createCompletionAI";
    const headers: HeadersInit = chatConfig.username
        ? {
              Authorization:
                  "Basic " +
                  btoa(`${chatConfig.username}:${chatConfig.password}`),
          }
        : {};

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
        signal,
    });
    if (!response.ok)
        throw new Error(
            (await response.json().catch(() => ({}))).message ||
                response.statusText,
        );
    if (!response.body) throw new Error("Stream not supported");
    return response.body;
}

export const chatClient = {
    conversations: {
        getAll: async (agentId: string): Promise<Conversation[]> => {
            const res = await fetchWithErrorHandling(
                "/api/functions/AIAgent/listUserThreads",
                { method: "POST", body: JSON.stringify({ agentId }) },
            );
            return Array.isArray(res)
                ? res
                : res.conversations || res.data || [];
        },

        get: async (id: string): Promise<Conversation> => {
            const res = await fetchWithErrorHandling(
                `/api/functions/AIAgent/getConversation`,
                { method: "POST", body: JSON.stringify({ id }) },
            );

            if (Array.isArray(res)) {
                const messages: Message[] = res.flatMap((log: LogEntry) => {
                    let userContent: string | MessageContent[] = log.input;
                    if (log.files?.length) {
                        userContent = [
                            ...(log.input?.trim()
                                ? [
                                      {
                                          type: "text",
                                          text: log.input,
                                      } as TextContent,
                                  ]
                                : []),
                            ...log.files.map((f) =>
                                f.mimeType.startsWith("image/")
                                    ? ({
                                          type: "image",
                                          image: `data:${f.mimeType};base64,${f.data}`,
                                          mediaType: f.mimeType,
                                      } as ImageContent)
                                    : ({
                                          type: "file",
                                          data: `data:${f.mimeType};base64,${f.data}`,
                                          mediaType: f.mimeType,
                                          filename: f.name,
                                      } as FileContent),
                            ),
                        ];
                    }
                    const asstMsg: Message = {
                        id: `${log.id}-assistant`,
                        content: log.output,
                        role: "assistant",
                        createdAt: log.updatedAt,
                    };
                    if (
                        log.steps?.length ||
                        log.vectors?.length ||
                        log.feedbackPositive !== undefined
                    ) {
                        asstMsg.metadata = {
                            logId: log.id,
                            steps: log.steps,
                            vectors: log.vectors,
                            feedbackPositive: log.feedbackPositive,
                        };
                    }
                    return [
                        {
                            id: `${log.id}-user`,
                            content: userContent,
                            role: "user",
                            createdAt: log.createdAt,
                        },
                        asstMsg,
                    ];
                });
                return {
                    id,
                    title: res[0]?.input.substring(0, 50) || "Conversation",
                    messages,
                    createdAt: res[0]?.createdAt || new Date().toISOString(),
                    updatedAt:
                        res[res.length - 1]?.updatedAt ||
                        new Date().toISOString(),
                };
            }

            const conv = res.conversation || res.data || res;
            if (conv.messages) {
                conv.messages = conv.messages.map((m: Message) => {
                    if (
                        m.role === "assistant" &&
                        typeof m.content === "string"
                    ) {
                        try {
                            const parsed = JSON.parse(m.content);
                            if (
                                typeof parsed === "object" &&
                                parsed !== null &&
                                !m.content.includes("```json:")
                            ) {
                                return {
                                    ...m,
                                    content: `\`\`\`json:Response\n${JSON.stringify(
                                        parsed,
                                        null,
                                        2,
                                    )}\n\`\`\``,
                                };
                            }
                        } catch (e) {}
                    }
                    return m;
                });
            }
            return conv;
        },

        create: (title?: string, agentId?: string | null) =>
            fetchWithErrorHandling(`/api/functions/AIAgent/createThread`, {
                method: "POST",
                body: JSON.stringify({
                    ...(title && { title }),
                    ...(agentId && { agentId }),
                }),
            }),

        delete: (id: string) =>
            fetchWithErrorHandling(
                `/api/functions/AIAgent/deleteThreadByIdAndUser`,
                { method: "POST", body: JSON.stringify({ id }) },
            ),

        update: (id: string, data: { title: string }) =>
            fetchWithErrorHandling(`/api/functions/AIAgent/renameThread`, {
                method: "POST",
                body: JSON.stringify({ id, title: data.title }),
            }),
    },

    messages: {
        getLastMessages: async (conversationId: string, limit = 100) =>
            (await chatClient.conversations.get(conversationId)).messages.slice(
                -limit,
            ),

        sendMessage: async (
            agentId: string,
            conversationId: string,
            content: string | MessageContent[],
            existingMessages?: Message[],
            signal?: AbortSignal,
            stepData?: any,
            isTemporary?: boolean,
            streaming: boolean = true,
        ) => {
            if (!agentId)
                throw {
                    isConfigurationError: true,
                    status: 400,
                    message: "Assistant ID missing",
                };

            let actualId = conversationId;
            let createdConv;

            if (isTemporary && agentId) {
                const titleText =
                    typeof content === "string"
                        ? content
                        : (
                              content.find(
                                  (c) => c.type === "text",
                              ) as TextContent
                          )?.text || "";
                createdConv = await chatClient.conversations.create(
                    titleText.substring(0, 50) || "New Chat",
                    agentId,
                );
                actualId = createdConv.id;
            }

            const context = [
                ...(existingMessages?.map((m) => ({
                    role: m.role,
                    content: m.content,
                })) || []),
                { role: "user", content },
            ].slice(-10);
            return {
                stream: await createAgentStream(
                    agentId,
                    context,
                    actualId,
                    signal,
                    stepData,
                    streaming,
                ),
                threadId: actualId,
                conversation: createdConv,
            };
        },
    },

    feedback: {
        submit: (id: string, feedbackPositive: boolean, aiAgent: string) =>
            fetchWithErrorHandling("/api/AIBuildersKit/giveAgentFeedbackAI", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, feedbackPositive, aiAgent }),
            }),
    },
};
