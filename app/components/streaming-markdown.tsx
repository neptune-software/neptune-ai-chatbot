import React, { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

/**
 * Code Block Component with syntax highlighting and copy button
 */
const CodeBlock = memo(
    ({
        language,
        code,
        theme,
    }: {
        language: string;
        code: string;
        theme?: 'light' | 'dark';
    }) => {
        const [copied, setCopied] = useState(false);

        const handleCopy = (e: React.MouseEvent) => {
            e.stopPropagation();
            navigator.clipboard
                .writeText(code)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch((err) => console.error('Failed to copy code: ', err));
        };

        const getLanguageLabel = (lang: string) => {
            const langMap: Record<string, string> = {
                js: 'JavaScript',
                javascript: 'JavaScript',
                jsx: 'JavaScript React',
                ts: 'TypeScript',
                typescript: 'TypeScript',
                tsx: 'TypeScript React',
                py: 'Python',
                python: 'Python',
                java: 'Java',
                cpp: 'C++',
                c: 'C',
                cs: 'C#',
                csharp: 'C#',
                go: 'Go',
                rs: 'Rust',
                rust: 'Rust',
                php: 'PHP',
                rb: 'Ruby',
                ruby: 'Ruby',
                sh: 'Shell',
                shell: 'Shell',
                bash: 'Bash',
                zsh: 'Zsh',
                sql: 'SQL',
                html: 'HTML',
                css: 'CSS',
                scss: 'SCSS',
                json: 'JSON',
                xml: 'XML',
                yaml: 'YAML',
                yml: 'YAML',
                md: 'Markdown',
                markdown: 'Markdown',
                text: 'Text',
                plaintext: 'Plain Text',
            };
            return langMap[lang.toLowerCase()] || lang.toUpperCase();
        };

        const isDark = theme === 'dark';
        const syntaxTheme = isDark ? vscDarkPlus : oneLight;
        const bgColor = isDark ? '#1e1e1e' : '#efefef';
        const headerBg = isDark ? '#1e1e1e' : '#f5f5f5';
        const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';
        const textColor = isDark ? 'text-gray-300' : 'text-gray-700';
        const buttonHover = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200';
        const iconColor = isDark ? 'text-gray-400' : 'text-gray-600';

        return (
            <div className={`mt-1 mb-3 rounded-lg border-2 ${borderColor}`}>
                <div
                    className={`sticky top-0 z-20 flex items-center justify-between px-4 py-2 border-b ${borderColor} rounded-tl-lg rounded-tr-lg`}
                    style={{ top: '-22px', backgroundColor: headerBg }}
                >
                    <span className={`text-xs font-medium ${textColor}`}>
                        {getLanguageLabel(language)}
                    </span>
                    <button
                        onClick={handleCopy}
                        className={`p-1.5 rounded transition-colors ${buttonHover}`}
                        title="Copy code"
                    >
                        {copied ? (
                            <Check size={14} className="text-green-500" />
                        ) : (
                            <Copy size={14} className={iconColor} />
                        )}
                    </button>
                </div>
                <div className="max-h-80 overflow-auto">
                    <SyntaxHighlighter
                        language={language.toLowerCase()}
                        style={syntaxTheme}
                        customStyle={{
                            margin: 0,
                            background: bgColor,
                            fontSize: '0.875rem',
                            padding: '1rem',
                        }}
                        codeTagProps={{
                            style: {
                                backgroundColor: bgColor,
                            },
                        }}
                    >
                        {code}
                    </SyntaxHighlighter>
                </div>
            </div>
        );
    },
);

CodeBlock.displayName = 'CodeBlock';

/**
 * Simple Markdown Renderer
 * Just renders markdown - no animations, no complexity
 */
interface StreamingMarkdownProps {
    content: string;
    isStreaming?: boolean;
    theme?: 'light' | 'dark';
    cursorColor?: string;
}

export const StreamingMarkdown = memo(
    ({
        content,
        isStreaming = false,
        theme = 'light',
        cursorColor = '#2563EB',
    }: StreamingMarkdownProps) => {
        return (
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-2 my-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                            {children}
                        </blockquote>
                    ),
                    p: ({ children }) => <p className="mb-0">{children}</p>,
                    h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mb-2 last:mb-0">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl font-bold mb-2 last:mb-0">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg font-bold mb-2 last:mb-0">{children}</h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-base font-bold mb-2 last:mb-0">{children}</h4>
                    ),
                    h5: ({ children }) => (
                        <h5 className="text-sm font-bold mb-2 last:mb-0">{children}</h5>
                    ),
                    h6: ({ children }) => (
                        <h6 className="text-xs font-bold mb-2 last:mb-0">{children}</h6>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-outside ml-6 mb-2 last:mb-0 space-y-1">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-outside ml-6 mb-2 last:mb-0 space-y-1">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    hr: () => (
                        <hr className="my-4 border-t border-gray-200 dark:border-gray-700 mb-3" />
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 underline"
                        >
                            {children}
                        </a>
                    ),
                    pre: ({ children, ...props }) => {
                        const childArray = Array.isArray(children) ? children : [children];
                        const codeElement = childArray.find((child: any) =>
                            child?.props?.className?.startsWith('language-'),
                        );

                        if (codeElement) {
                            const language =
                                codeElement.props.className.replace('language-', '') || 'text';
                            const code = String(codeElement.props.children || '').replace(
                                /\n$/,
                                '',
                            );
                            return <CodeBlock language={language} code={code} theme={theme} />;
                        }

                        return (
                            <pre className="my-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-x-auto">
                                <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                                    {children}
                                </code>
                            </pre>
                        );
                    },
                    code: ({ className, children, ...props }) => {
                        const isInlineCode = !className;
                        return isInlineCode ? (
                            <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">
                                {children}
                            </code>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="border-collapse w-full">{children}</table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left">
                            {children}
                        </th>
                    ),
                    td: ({ children, ...props }) => (
                        <td
                            className="border border-gray-300 dark:border-gray-700 px-4 py-2"
                            {...props}
                        >
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        );
    },
);

StreamingMarkdown.displayName = 'StreamingMarkdown';
