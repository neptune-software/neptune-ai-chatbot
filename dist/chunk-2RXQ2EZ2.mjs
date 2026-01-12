// app/components/tool-execution.tsx
import { useState, memo, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Check
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  oneLight
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { jsx, jsxs } from "react/jsx-runtime";
var ToolExecutionIndicator = memo(
  ({ toolName }) => {
    return /* @__PURE__ */ jsx("div", { className: "my-4 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950/30 animate-pulse", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        Loader2,
        {
          size: 20,
          className: "text-blue-600 dark:text-blue-400 animate-spin"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "font-semibold text-blue-900 dark:text-blue-100", children: "Executing Tool" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-blue-700 dark:text-blue-300 mt-0.5", children: toolName })
      ] })
    ] }) });
  }
);
ToolExecutionIndicator.displayName = "ToolExecutionIndicator";
var ToolCallDetail = memo(
  ({ tool, theme }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const isDark = theme === "dark";
    const syntaxTheme = isDark ? vscDarkPlus : oneLight;
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
        return /* @__PURE__ */ jsx(
          CheckCircle2,
          {
            size: 16,
            className: "text-green-600 dark:text-green-400"
          }
        );
      } else if (tool.error) {
        return /* @__PURE__ */ jsx(
          XCircle,
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
    const argsString = useMemo(() => formatJson(tool.args), [tool.args]);
    const resultString = useMemo(
      () => formatJson(tool.result),
      [tool.result]
    );
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: "my-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm",
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              onClick: () => setIsExpanded(!isExpanded),
              className: "flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900",
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
                isExpanded ? /* @__PURE__ */ jsx(
                  ChevronDown,
                  {
                    size: 18,
                    className: "text-gray-600 dark:text-gray-300 flex-shrink-0"
                  }
                ) : /* @__PURE__ */ jsx(
                  ChevronRight,
                  {
                    size: 18,
                    className: "text-gray-600 dark:text-gray-300 flex-shrink-0"
                  }
                ),
                getStatusIcon(),
                /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-semibold text-gray-900 dark:text-gray-100 truncate", children: tool.toolName }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusColor()}`,
                    children: tool.status
                  }
                )
              ] })
            }
          ),
          isExpanded && /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase", children: "Input" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleCopy(argsString, "input");
                    },
                    className: "p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors",
                    title: "Copy input",
                    children: copiedField === "input" ? /* @__PURE__ */ jsx(
                      Check,
                      {
                        size: 14,
                        className: "text-green-600"
                      }
                    ) : /* @__PURE__ */ jsx(
                      Copy,
                      {
                        size: 14,
                        className: "text-gray-500 dark:text-gray-400"
                      }
                    )
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                SyntaxHighlighter,
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
            /* @__PURE__ */ jsxs("div", { className: "p-3 bg-white dark:bg-gray-800", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase", children: "Output" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleCopy(resultString, "output");
                    },
                    className: "p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors",
                    title: "Copy output",
                    children: copiedField === "output" ? /* @__PURE__ */ jsx(
                      Check,
                      {
                        size: 14,
                        className: "text-green-600"
                      }
                    ) : /* @__PURE__ */ jsx(
                      Copy,
                      {
                        size: 14,
                        className: "text-gray-500 dark:text-gray-400"
                      }
                    )
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                SyntaxHighlighter,
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
var ToolExecutionWidget = memo(
  ({ steps, theme }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const allTools = useMemo(() => {
      return steps.filter((step) => step.tools && step.tools.length > 0).flatMap((step) => step.tools || []);
    }, [steps]);
    if (allTools.length === 0) {
      return null;
    }
    const successCount = allTools.filter(
      (t) => t.status === "SUCCESS"
    ).length;
    const errorCount = allTools.filter((t) => t.error).length;
    return /* @__PURE__ */ jsxs("div", { className: "my-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          onClick: () => setIsExpanded(!isExpanded),
          className: "flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            isExpanded ? /* @__PURE__ */ jsx(
              ChevronDown,
              {
                size: 20,
                className: "text-gray-600 dark:text-gray-300"
              }
            ) : /* @__PURE__ */ jsx(
              ChevronRight,
              {
                size: 20,
                className: "text-gray-600 dark:text-gray-300"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-800 dark:text-white", children: "Tool Execution" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full", children: [
              allTools.length,
              " ",
              allTools.length === 1 ? "tool" : "tools"
            ] }),
            successCount > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { size: 12 }),
              successCount
            ] }),
            errorCount > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(XCircle, { size: 12 }),
              errorCount
            ] })
          ] })
        }
      ),
      isExpanded && /* @__PURE__ */ jsx("div", { className: "border-t border-gray-200 dark:border-gray-700 p-3 space-y-2 bg-gray-50 dark:bg-gray-800", children: allTools.map((tool) => /* @__PURE__ */ jsx(
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

export {
  ToolExecutionIndicator,
  ToolExecutionWidget
};
