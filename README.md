# Neptune AI Chatbot Component

A React component for integrating Neptune AI chat capabilities into your application.

## Installation

First, configure your `.npmrc` file in your project root to access GitHub Packages:

```bash
@neptune-software:registry=https://npm.pkg.github.com/
```

Then install the package:

```bash
npm install @neptune-software/neptune-ai-chatbot
```

## Usage

### Basic Usage
```tsx
import { NeptuneChatBot } from "@neptune-software/neptune-ai-chatbot";
import '@neptune-software/neptune-ai-chatbot/styles.css';

function App() {
  return <NeptuneChatBot agentId="your-agent-id" />;
}
```

### With Customization
```tsx
import { NeptuneChatBot } from "@neptune-software/neptune-ai-chatbot";
import '@neptune-software/neptune-ai-chatbot/styles.css';

function App() {
  return (
    <NeptuneChatBot
      agentId="your-agent-id"
      theme="dark"
      title="My Assistant"
      messageBubbleColor="#E5E3F8"
      messageBubbleColorDark="rgba(168, 140, 250, 0.3)"
      accentColor="#8B7FD9"
      streamingText="AI is thinking..."
      welcomeMessagePrimary="Welcome!"
      welcomeMessageSecondary="How can I assist you today?"
      welcomeIcon="local path to your icon"
    />
  );
}
```

## Configuration

### Props

All customization options are available through props with full TypeScript support and JSDoc documentation:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `agentId` | `string` | **required** | Unique identifier for the AI agent |
| `theme` | `"light" \| "dark"` | `"light"` | Color theme for the chat interface |
| `title` | `string` | `"Naia"` | Title displayed in the chat header |
| `messageBubbleColor` | `string` | `"#E5E3F8"` | Background color for message bubbles (light mode) |
| `messageBubbleColorDark` | `string` | `"rgba(168, 140, 250, 0.3)"` | Background color for message bubbles (dark mode) |
| `accentColor` | `string` | `"#8B7FD9"` | Accent color for buttons and interactive elements (light mode) |
| `accentColorDark` | `string` | `"#A88CFA"` | Accent color for buttons and interactive elements (dark mode) |
| `scrollButtonColor` | `string` | `"#6366F1"` | Color for the scroll-to-bottom button (light mode) |
| `scrollButtonColorDark` | `string` | `"#818CF8"` | Color for the scroll-to-bottom button (dark mode) |
| `streamingText` | `string` | `"NAIA is working on it..."` | Text displayed while AI is generating a response |
| `streamingTextColor` | `string` | `"#2563EB"` | Color of the streaming indicator text (light mode) |
| `streamingTextColorDark` | `string` | `"#818CF8"` | Color of the streaming indicator text (dark mode) |
| `welcomeMessagePrimary` | `string` | `"Hi there!"` | Primary welcome message on the initial screen |
| `welcomeMessageSecondary` | `string` | `"How can I help you today?"` | Secondary welcome message below the primary message |
| `welcomeIcon` | `string` | - | Path to a custom icon image for the welcome screen |
| `welcomeIconSize` | `string` | `"10rem"` | Size of the welcome icon with CSS units |
| `streaming` | `boolean` | `true` | Enable streaming responses from the AI |
| `sidebarBackgroundColor` | `string` | `"#FAFAFA"` | Background color for the sidebar (light mode) |
| `sidebarBackgroundColorDark` | `string` | `"#1F1F1F"` | Background color for the sidebar (dark mode) |
| `inputBackgroundColor` | `string` | `"#FFFFFF"` | Background color for the chat input field (light mode) |
| `inputBackgroundColorDark` | `string` | `"#303030"` | Background color for the chat input field (dark mode) |
| `headerBackgroundColor` | `string` | `"#FFFFFF"` | Background color for the header (light mode) |
| `headerBackgroundColorDark` | `string` | `"#1F1F1F"` | Background color for the header (dark mode) |
| `vectorColor` | `string` | `"#9333EA"` | Base color for vector search results (light mode) - automatically generates variations |
| `vectorColorDark` | `string` | `"#A855F7"` | Base color for vector search results (dark mode) - automatically generates variations |
| `localDebug` | `LocalDebugConfig` | - | Configuration for local development (see below) |
| `onToolStart` | `(metadata: any) => void` | - | Callback fired when a tool starts executing during streaming |
| `onToolInput` | `(metadata: any) => void` | - | Callback fired when tool input is available during streaming |
| `onToolFinish` | `(metadata: any) => void` | - | Callback fired when a tool finishes executing during streaming |
| `onChunk` | `(chunk: string) => void` | - | Callback fired for each text chunk received during streaming |
| `onFinish` | `(metadata: any) => void` | - | Callback fired when streaming finishes |

### Streaming Event Callbacks

When `streaming` is enabled, you can hook into various streaming events to track the AI's response generation:

```tsx
<NeptuneChatBot
  agentId="your-agent-id"
  streaming={true}
  onToolStart={(metadata) => {
    console.log('Tool started:', metadata.toolName);
  }}
  onToolInput={(metadata) => {
    console.log('Tool input available:', metadata);
  }}
  onToolFinish={(metadata) => {
    console.log('Tool finished:', metadata);
  }}
  onChunk={(chunk) => {
    console.log('Received text chunk:', chunk);
  }}
  onFinish={(metadata) => {
    console.log('Streaming completed:', metadata);
  }}
/>
```

Available callbacks:
- **onToolStart**: Fires when a tool begins execution (e.g., web search, API call)
- **onToolInput**: Fires when the tool's input parameters are generated
- **onToolFinish**: Fires when the tool completes and returns output
- **onChunk**: Fires for each text chunk received from the AI
- **onFinish**: Fires when the entire response stream is complete

### Local Development Configuration

The `localDebug` prop is used when the component runs **outside of a Neptune environment**. When deployed within Neptune, authentication is handled automatically.

**Note:** This configuration is only required for local development and testing.

```tsx
<NeptuneChatBot
  agentId="your-agent-id"
  localDebug={{
    username: "your-username",
    password: "your-password",
    baseUrl: "http://localhost:3000"
  }}
/>
```