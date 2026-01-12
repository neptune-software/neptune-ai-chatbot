import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';

/**
 * Configuration for local development debugging
 */
interface LocalDebugConfig {
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
interface NeptuneChatBotProps {
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
     * @default "Naia is working on it..."
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
declare function NeptuneChatBot({ agentId: propAgentId, theme: propTheme, localDebug: propLocalDebug, title: propTitle, messageBubbleColor, messageBubbleColorDark, accentColor, accentColorDark, scrollButtonColor, scrollButtonColorDark, streamingText, streamingTextColor, streamingTextColorDark, welcomeMessagePrimary, welcomeMessageSecondary, welcomeIcon, welcomeIconSize, streaming, sidebarBackgroundColor, onToolStart, onToolInput, onToolFinish, onChunk, onFinish, sidebarBackgroundColorDark, inputBackgroundColor, inputBackgroundColorDark, headerBackgroundColor, headerBackgroundColorDark, vectorColor, vectorColorDark, }: NeptuneChatBotProps): react_jsx_runtime.JSX.Element;

interface TextContent {
    type: "text";
    text: string;
}
interface FileContent {
    type: "file";
    data: string;
    mediaType: string;
    filename: string;
}
interface ImageContent {
    type: "image";
    image: string;
    mediaType: string;
}
type MessageContent = TextContent | FileContent | ImageContent;
interface ToolCall {
    id: string;
    createdAt: string;
    toolCallId: string;
    toolName: string;
    args: Record<string, any>;
    result: any;
    status: string;
    error?: string | null;
}
interface Step {
    id: string;
    createdAt: string;
    stepOrder: number;
    type: string;
    text?: string;
    tools?: ToolCall[];
}
interface VectorResult {
    rowId: string;
    similarity: string;
    template: string;
    entityName: string;
    data: Record<string, any>;
}
interface MessageMetadata {
    logId?: string;
    steps?: Step[];
    vectors?: VectorResult[];
    feedbackPositive?: boolean | null;
}
interface Message {
    id: string;
    content: string | MessageContent[];
    role: "user" | "assistant" | "system";
    createdAt: string;
    waiting?: boolean;
    metadata?: MessageMetadata;
    isToolExecuting?: boolean;
    executingToolName?: string;
}
interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
    waiting?: boolean;
    isTemporary?: boolean;
}
declare function configureChatClient(config: {
    username: string;
    password: string;
    baseUrl: string;
}): void;

declare const ToolExecutionIndicator: react.MemoExoticComponent<({ toolName }: {
    toolName: string;
}) => react_jsx_runtime.JSX.Element>;
declare const ToolExecutionWidget: react.MemoExoticComponent<({ steps, theme }: {
    steps: Step[];
    theme?: "light" | "dark";
}) => react_jsx_runtime.JSX.Element | null>;

export { type Conversation, type MessageMetadata, NeptuneChatBot, type NeptuneChatBotProps, type Step, type ToolCall, ToolExecutionIndicator, ToolExecutionWidget, configureChatClient };
