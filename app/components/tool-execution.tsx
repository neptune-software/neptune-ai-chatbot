import { useState, memo, useMemo } from "react";
import {
    ChevronDown,
    ChevronRight,
    Loader2,
    CheckCircle2,
    XCircle,
    Copy,
    Check,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
    vscDarkPlus,
    oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ToolCall, Step } from "../api/chat-client";

export const ToolExecutionIndicator = memo(
    ({ toolName }: { toolName: string }) => {
        return (
            <div className="my-4 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950/30 animate-pulse">
                <div className="flex items-center gap-3">
                    <Loader2
                        size={20}
                        className="text-blue-600 dark:text-blue-400 animate-spin"
                    />
                    <div className="flex-1">
                        <div className="font-semibold text-blue-900 dark:text-blue-100">
                            Executing Tool
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">
                            {toolName}
                        </div>
                    </div>
                </div>
            </div>
        );
    },
);

ToolExecutionIndicator.displayName = "ToolExecutionIndicator";

const ToolCallDetail = memo(
    ({ tool, theme }: { tool: ToolCall; theme?: "light" | "dark" }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const [copiedField, setCopiedField] = useState<string | null>(null);

        const isDark = theme === "dark";
        const syntaxTheme = isDark ? vscDarkPlus : oneLight;
        const bgColor = isDark ? "#1e1e1e" : "#efefef";

        const formatJson = (obj: any): string => {
            try {
                return JSON.stringify(obj, null, 2);
            } catch (error) {
                return String(obj);
            }
        };

        const handleCopy = (content: string, fieldName: string) => {
            navigator.clipboard
                .writeText(content)
                .then(() => {
                    setCopiedField(fieldName);
                    setTimeout(() => setCopiedField(null), 2000);
                })
                .catch((err) => console.error("Failed to copy: ", err));
        };

        const getStatusIcon = () => {
            if (tool.status === "SUCCESS") {
                return (
                    <CheckCircle2
                        size={16}
                        className="text-green-600 dark:text-green-400"
                    />
                );
            } else if (tool.error) {
                return (
                    <XCircle
                        size={16}
                        className="text-red-600 dark:text-red-400"
                    />
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

        const argsString = useMemo(() => formatJson(tool.args), [tool.args]);
        const resultString = useMemo(
            () => formatJson(tool.result),
            [tool.result],
        );

        return (
            <div
                className={
                    "my-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm"
                }
            >
                {}
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900"
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isExpanded ? (
                            <ChevronDown
                                size={18}
                                className="text-gray-600 dark:text-gray-300 flex-shrink-0"
                            />
                        ) : (
                            <ChevronRight
                                size={18}
                                className="text-gray-600 dark:text-gray-300 flex-shrink-0"
                            />
                        )}
                        {getStatusIcon()}
                        <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {tool.toolName}
                        </span>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusColor()}`}
                        >
                            {tool.status}
                        </span>
                    </div>
                </div>

                {}
                {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        {}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                    Input
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(argsString, "input");
                                    }}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="Copy input"
                                >
                                    {copiedField === "input" ? (
                                        <Check
                                            size={14}
                                            className="text-green-600"
                                        />
                                    ) : (
                                        <Copy
                                            size={14}
                                            className="text-gray-500 dark:text-gray-400"
                                        />
                                    )}
                                </button>
                            </div>
                            <SyntaxHighlighter
                                language="json"
                                style={syntaxTheme}
                                customStyle={{
                                    margin: 0,
                                    background: bgColor,
                                    fontSize: "0.875rem",
                                    padding: "1rem",
                                }}
                                codeTagProps={{
                                    style: {
                                        backgroundColor: bgColor,
                                    },
                                }}
                            >
                                {argsString}
                            </SyntaxHighlighter>
                        </div>

                        {}
                        <div className="p-3 bg-white dark:bg-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                    Output
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(resultString, "output");
                                    }}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="Copy output"
                                >
                                    {copiedField === "output" ? (
                                        <Check
                                            size={14}
                                            className="text-green-600"
                                        />
                                    ) : (
                                        <Copy
                                            size={14}
                                            className="text-gray-500 dark:text-gray-400"
                                        />
                                    )}
                                </button>
                            </div>
                            <SyntaxHighlighter
                                language="json"
                                style={syntaxTheme}
                                customStyle={{
                                    margin: 0,
                                    background: bgColor,
                                    fontSize: "0.875rem",
                                    padding: "1rem",
                                }}
                                codeTagProps={{
                                    style: {
                                        backgroundColor: bgColor,
                                    },
                                }}
                            >
                                {tool.error ? tool.error : resultString}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                )}
            </div>
        );
    },
);

ToolCallDetail.displayName = "ToolCallDetail";

export const ToolExecutionWidget = memo(
    ({ steps, theme }: { steps: Step[]; theme?: "light" | "dark" }) => {
        const [isExpanded, setIsExpanded] = useState(false);

        const allTools = useMemo(() => {
            return steps
                .filter((step) => step.tools && step.tools.length > 0)
                .flatMap((step) => step.tools || []);
        }, [steps]);

        if (allTools.length === 0) {
            return null;
        }

        const successCount = allTools.filter(
            (t) => t.status === "SUCCESS",
        ).length;
        const errorCount = allTools.filter((t) => t.error).length;

        return (
            <div className="my-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                {}
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        {isExpanded ? (
                            <ChevronDown
                                size={20}
                                className="text-gray-600 dark:text-gray-300"
                            />
                        ) : (
                            <ChevronRight
                                size={20}
                                className="text-gray-600 dark:text-gray-300"
                            />
                        )}
                        <span className="font-semibold text-gray-800 dark:text-white">
                            Tool Execution
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                            {allTools.length}{" "}
                            {allTools.length === 1 ? "tool" : "tools"}
                        </span>
                        {successCount > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                {successCount}
                            </span>
                        )}
                        {errorCount > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full flex items-center gap-1">
                                <XCircle size={12} />
                                {errorCount}
                            </span>
                        )}
                    </div>
                </div>

                {}
                {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2 bg-gray-50 dark:bg-gray-800">
                        {allTools.map((tool) => (
                            <ToolCallDetail
                                key={tool.id}
                                tool={tool}
                                theme={theme}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    },
);

ToolExecutionWidget.displayName = "ToolExecutionWidget";
