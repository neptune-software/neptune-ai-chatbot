import {
  ToolExecutionIndicator,
  ToolExecutionWidget
} from "./chunk-2RXQ2EZ2.mjs";
import {
  chatClient
} from "./chunk-VONUV37R.mjs";
import {
  __objRest,
  __spreadProps,
  __spreadValues
} from "./chunk-FWCSY2DS.mjs";

// app/components/chat-message.tsx
import {
  useEffect,
  useState as useState3,
  memo as memo3,
  useMemo,
  useRef,
  lazy,
  Suspense
} from "react";
import ReactMarkdown2 from "react-markdown";
import remarkGfm2 from "remark-gfm";
import rehypeRaw2 from "rehype-raw";
import {
  Copy as Copy2,
  Check as Check2,
  FileText,
  Image as ImageIcon,
  X,
  Download,
  ChevronDown as ChevronDown2,
  ChevronRight as ChevronRight2,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

// app/components/vector-results.tsx
import { useState, memo } from "react";
import { ChevronDown, ChevronRight, Database } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
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
var VectorResults = memo(({ vectors, theme = "light", vectorColor, vectorColorDark }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!vectors || vectors.length === 0) {
    return null;
  }
  const isDark = theme === "dark";
  const defaultLightColor = "#9333EA";
  const defaultDarkColor = "#A855F7";
  const baseColor = isDark ? vectorColorDark || defaultDarkColor : vectorColor || defaultLightColor;
  const colors = generateColorVariations(baseColor, isDark);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "my-4 border rounded-lg overflow-hidden",
      style: {
        backgroundColor: colors.bg,
        borderColor: colors.border
      },
      children: [
        /* @__PURE__ */ jsxs(
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
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  Database,
                  {
                    size: 20,
                    style: { color: colors.icon }
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "font-semibold",
                      style: { color: colors.textPrimary },
                      children: "Vector Search Results"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
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
              isExpanded ? /* @__PURE__ */ jsx(
                ChevronDown,
                {
                  size: 20,
                  style: { color: colors.icon }
                }
              ) : /* @__PURE__ */ jsx(
                ChevronRight,
                {
                  size: 20,
                  style: { color: colors.icon }
                }
              )
            ]
          }
        ),
        isExpanded && /* @__PURE__ */ jsx(
          "div",
          {
            className: "border-t",
            style: { borderColor: colors.border },
            children: /* @__PURE__ */ jsx("div", { className: "p-4 space-y-3", children: vectors.map((vector, index) => /* @__PURE__ */ jsx(
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
var VectorResultItem = memo(
  ({ vector, theme, colors }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const similarityPercentage = (parseFloat(vector.similarity) * 100).toFixed(1);
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: "border rounded-lg",
        style: {
          backgroundColor: colors.itemBg,
          borderColor: colors.itemBorder
        },
        children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setIsExpanded(!isExpanded),
              className: "w-full px-3 py-2 flex items-center justify-between transition-colors rounded-t-lg",
              onMouseEnter: (e) => e.currentTarget.style.backgroundColor = colors.itemHover,
              onMouseLeave: (e) => e.currentTarget.style.backgroundColor = "transparent",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex-1 text-left", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "text-sm font-medium",
                        style: { color: colors.textPrimary },
                        children: vector.entityName
                      }
                    ),
                    /* @__PURE__ */ jsxs(
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
                  /* @__PURE__ */ jsx("div", { className: "text-sm mt-1 text-gray-700 dark:text-gray-300", children: vector.template })
                ] }),
                isExpanded ? /* @__PURE__ */ jsx(
                  ChevronDown,
                  {
                    size: 16,
                    style: { color: colors.icon }
                  }
                ) : /* @__PURE__ */ jsx(
                  ChevronRight,
                  {
                    size: 16,
                    style: { color: colors.icon }
                  }
                )
              ]
            }
          ),
          isExpanded && /* @__PURE__ */ jsx(
            "div",
            {
              className: "border-t px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg",
              style: { borderColor: colors.itemBorder },
              children: /* @__PURE__ */ jsx("div", { className: "space-y-2", children: Object.entries(vector.data).map(([key, value]) => {
                if (key === "id" || key === "createdAt" || key === "updatedAt" || key === "createdBy" || key === "updatedBy") {
                  return null;
                }
                return /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "flex items-start gap-2 text-sm",
                    children: [
                      /* @__PURE__ */ jsxs("span", { className: "font-medium text-gray-700 dark:text-gray-300 min-w-[80px]", children: [
                        key,
                        ":"
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400", children: typeof value === "object" ? JSON.stringify(value) : String(value) })
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

// app/components/chat-message.tsx
import { marked } from "marked";
import { Prism as SyntaxHighlighter2 } from "react-syntax-highlighter";

// app/components/streaming-markdown.tsx
import { memo as memo2, useState as useState2 } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var CodeBlock = memo2(
  ({
    language,
    code,
    theme
  }) => {
    const [copied, setCopied] = useState2(false);
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
    const syntaxTheme = isDark ? vscDarkPlus : oneLight;
    const bgColor = isDark ? "#1e1e1e" : "#efefef";
    const headerBg = isDark ? "#1e1e1e" : "#f5f5f5";
    const borderColor = isDark ? "border-gray-700" : "border-gray-300";
    const textColor = isDark ? "text-gray-300" : "text-gray-700";
    const buttonHover = isDark ? "hover:bg-gray-700" : "hover:bg-gray-200";
    const iconColor = isDark ? "text-gray-400" : "text-gray-600";
    return /* @__PURE__ */ jsxs2("div", { className: `mt-1 mb-3 rounded-lg border-2 ${borderColor}`, children: [
      /* @__PURE__ */ jsxs2(
        "div",
        {
          className: `sticky top-0 z-20 flex items-center justify-between px-4 py-2 border-b ${borderColor} rounded-tl-lg rounded-tr-lg`,
          style: { top: "-22px", backgroundColor: headerBg },
          children: [
            /* @__PURE__ */ jsx2("span", { className: `text-xs font-medium ${textColor}`, children: getLanguageLabel(language) }),
            /* @__PURE__ */ jsx2(
              "button",
              {
                onClick: handleCopy,
                className: `p-1.5 rounded transition-colors ${buttonHover}`,
                title: "Copy code",
                children: copied ? /* @__PURE__ */ jsx2(Check, { size: 14, className: "text-green-500" }) : /* @__PURE__ */ jsx2(Copy, { size: 14, className: iconColor })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx2("div", { className: "max-h-80 overflow-auto", children: /* @__PURE__ */ jsx2(
        SyntaxHighlighter,
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
var StreamingMarkdown = memo2(
  ({
    content,
    isStreaming = false,
    theme = "light",
    cursorColor = "#2563EB"
  }) => {
    return /* @__PURE__ */ jsx2(
      ReactMarkdown,
      {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeRaw],
        components: {
          blockquote: ({ children }) => /* @__PURE__ */ jsx2("blockquote", { className: "border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-2 my-4 bg-gray-100 dark:bg-gray-800 rounded-md", children }),
          p: ({ children }) => /* @__PURE__ */ jsx2("p", { className: "mb-0", children }),
          h1: ({ children }) => /* @__PURE__ */ jsx2("h1", { className: "text-2xl font-bold mb-2 last:mb-0", children }),
          h2: ({ children }) => /* @__PURE__ */ jsx2("h2", { className: "text-xl font-bold mb-2 last:mb-0", children }),
          h3: ({ children }) => /* @__PURE__ */ jsx2("h3", { className: "text-lg font-bold mb-2 last:mb-0", children }),
          h4: ({ children }) => /* @__PURE__ */ jsx2("h4", { className: "text-base font-bold mb-2 last:mb-0", children }),
          h5: ({ children }) => /* @__PURE__ */ jsx2("h5", { className: "text-sm font-bold mb-2 last:mb-0", children }),
          h6: ({ children }) => /* @__PURE__ */ jsx2("h6", { className: "text-xs font-bold mb-2 last:mb-0", children }),
          ul: ({ children }) => /* @__PURE__ */ jsx2("ul", { className: "list-disc list-outside ml-6 mb-2 last:mb-0 space-y-1", children }),
          ol: ({ children }) => /* @__PURE__ */ jsx2("ol", { className: "list-decimal list-outside ml-6 mb-2 last:mb-0 space-y-1", children }),
          li: ({ children }) => /* @__PURE__ */ jsx2("li", { className: "mb-1", children }),
          hr: () => /* @__PURE__ */ jsx2("hr", { className: "my-4 border-t border-gray-200 dark:border-gray-700 mb-3" }),
          a: ({ href, children }) => /* @__PURE__ */ jsx2(
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
              return /* @__PURE__ */ jsx2(CodeBlock, { language, code, theme });
            }
            return /* @__PURE__ */ jsx2("pre", { className: "my-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-x-auto", children: /* @__PURE__ */ jsx2("code", { className: "text-sm font-mono text-gray-800 dark:text-gray-200", children }) });
          },
          code: (_c) => {
            var _d = _c, { className, children } = _d, props = __objRest(_d, ["className", "children"]);
            const isInlineCode = !className;
            return isInlineCode ? /* @__PURE__ */ jsx2("code", { className: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono", children }) : /* @__PURE__ */ jsx2("code", __spreadProps(__spreadValues({ className }, props), { children }));
          },
          table: ({ children }) => /* @__PURE__ */ jsx2("div", { className: "overflow-x-auto my-4", children: /* @__PURE__ */ jsx2("table", { className: "border-collapse w-full", children }) }),
          th: ({ children }) => /* @__PURE__ */ jsx2("th", { className: "border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left", children }),
          td: (_e) => {
            var _f = _e, { children } = _f, props = __objRest(_f, ["children"]);
            return /* @__PURE__ */ jsx2(
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

// app/components/chat-message.tsx
import {
  vscDarkPlus as vscDarkPlus2,
  oneLight as oneLight2
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Fragment, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var CodeBlock2 = memo3(
  ({
    language,
    code,
    theme
  }) => {
    const [copied, setCopied] = useState3(false);
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
    const syntaxTheme = isDark ? vscDarkPlus2 : oneLight2;
    const bgColor = isDark ? "#1e1e1e" : "#efefef";
    const headerBg = isDark ? "#1e1e1e" : "#f5f5f5";
    const borderColor = isDark ? "border-gray-700" : "border-gray-300";
    const textColor = isDark ? "text-gray-300" : "text-gray-700";
    const buttonHover = isDark ? "hover:bg-gray-700" : "hover:bg-gray-200";
    const iconColor = isDark ? "text-gray-400" : "text-gray-600";
    return /* @__PURE__ */ jsxs3("div", { className: `mt-1 mb-3 rounded-lg border-2 ${borderColor}`, children: [
      /* @__PURE__ */ jsxs3(
        "div",
        {
          className: `sticky top-0 z-20 flex items-center justify-between px-4 py-2 border-b ${borderColor} rounded-tl-lg rounded-tr-lg`,
          style: { top: "-22px", backgroundColor: headerBg },
          children: [
            /* @__PURE__ */ jsx3("span", { className: `text-xs font-medium ${textColor}`, children: getLanguageLabel(language) }),
            /* @__PURE__ */ jsx3(
              "button",
              {
                onClick: handleCopy,
                className: `p-1.5 rounded transition-colors ${buttonHover}`,
                title: "Copy code",
                children: copied ? /* @__PURE__ */ jsx3(Check2, { size: 14, className: "text-green-500" }) : /* @__PURE__ */ jsx3(Copy2, { size: 14, className: iconColor })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx3("div", { className: "max-h-80 overflow-auto", children: /* @__PURE__ */ jsx3(
        SyntaxHighlighter2,
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
var DynamicChartComponent = lazy(() => import("./chart-component-RCLR3IKU.mjs"));
var MemoizedChart = memo3(
  ({
    type,
    data,
    theme
  }) => {
    return /* @__PURE__ */ jsx3(
      Suspense,
      {
        fallback: /* @__PURE__ */ jsx3("div", { className: "animate-pulse h-64 bg-gray-100 dark:bg-gray-800 rounded-lg" }),
        children: /* @__PURE__ */ jsx3(DynamicChartComponent, { type, data, theme })
      }
    );
  },
  (prevProps, nextProps) => {
    return prevProps.type === nextProps.type && prevProps.theme === nextProps.theme && JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
  }
);
MemoizedChart.displayName = "MemoizedChart";
var JsonBlock = memo3(
  ({
    title,
    jsonContent,
    keyProp
  }) => {
    const [isExpanded, setIsExpanded] = useState3(false);
    const [copyJsonSuccess, setCopyJsonSuccess] = useState3(false);
    const formattedJson = useMemo(() => {
      try {
        const parsed = JSON.parse(jsonContent.trim());
        return JSON.stringify(parsed, null, 2);
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        return jsonContent;
      }
    }, [jsonContent]);
    const highlightedJson = useMemo(() => {
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
    return /* @__PURE__ */ jsxs3("div", { className: "my-4 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900", children: [
      /* @__PURE__ */ jsxs3(
        "div",
        {
          onClick: () => setIsExpanded(!isExpanded),
          className: "flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-gray-50 bg-gray-900",
          children: [
            /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2", children: [
              isExpanded ? /* @__PURE__ */ jsx3(
                ChevronDown2,
                {
                  size: 20,
                  className: "text-gray-600 dark:text-gray-300"
                }
              ) : /* @__PURE__ */ jsx3(
                ChevronRight2,
                {
                  size: 20,
                  className: "text-gray-600 dark:text-gray-300"
                }
              ),
              /* @__PURE__ */ jsx3("span", { className: "font-semibold text-gray-800 dark:text-white", children: title }),
              /* @__PURE__ */ jsx3("span", { className: "text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white rounded-full", children: "JSON" })
            ] }),
            /* @__PURE__ */ jsx3(
              "button",
              {
                onClick: handleCopyJson,
                className: "p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors",
                title: "Copy JSON",
                children: copyJsonSuccess ? /* @__PURE__ */ jsx3(Check2, { size: 16, className: "text-green-500" }) : /* @__PURE__ */ jsx3(
                  Copy2,
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
      isExpanded && /* @__PURE__ */ jsx3("div", { className: "border-t border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsx3("pre", { className: "p-4 overflow-x-auto bg-white dark:bg-black text-sm font-mono", children: /* @__PURE__ */ jsx3(
        "code",
        {
          className: "language-json text-gray-800 dark:text-gray-100",
          dangerouslySetInnerHTML: {
            __html: highlightedJson
          }
        }
      ) }) }),
      /* @__PURE__ */ jsx3("style", { children: `
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
function ChatMessage({
  message,
  isStreaming = false,
  theme,
  onAnalyticOpen,
  messageBubbleColor = "#E5E3F8",
  streamingText = "NAIA is working on it...",
  streamingTextColor = "#2563EB",
  vectorColor,
  vectorColorDark,
  agentId,
  onFeedbackChange
}) {
  var _a, _b;
  const { role, content } = message;
  const [copied, setCopied] = useState3(false);
  const [imageDialogOpen, setImageDialogOpen] = useState3(false);
  const [selectedImage, setSelectedImage] = useState3(null);
  const messageContainerRef = useRef(null);
  const [feedback, setFeedback] = useState3(
    ((_a = message.metadata) == null ? void 0 : _a.feedbackPositive) !== void 0 ? message.metadata.feedbackPositive : null
  );
  const [feedbackLoading, setFeedbackLoading] = useState3(false);
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
  useEffect(() => {
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
    marked.setOptions({
      gfm: true,
      // GitHub Flavored Markdown
      breaks: true
      // Convert \n to <br>
    });
    let html = marked.parse(processedMarkdown);
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
    return /* @__PURE__ */ jsxs3("div", { className: "mt-3 inline-flex items-center", children: [
      /* @__PURE__ */ jsx3("div", { className: "flex items-center space-x-1", children: /* @__PURE__ */ jsx3(
        "span",
        {
          className: "text-sm font-medium streaming-text",
          style: { color: streamingTextColor },
          children: streamingText
        }
      ) }),
      /* @__PURE__ */ jsx3("style", { children: `
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
      return /* @__PURE__ */ jsx3(
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
      return /* @__PURE__ */ jsxs3("div", { className: "p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800 w-full max-w-full my-4", children: [
        /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx3(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-5 w-5",
              viewBox: "0 0 20 20",
              fill: "currentColor",
              children: /* @__PURE__ */ jsx3(
                "path",
                {
                  fillRule: "evenodd",
                  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
                  clipRule: "evenodd"
                }
              )
            }
          ),
          /* @__PURE__ */ jsx3("h3", { className: "font-medium", children: "Unable to generate chart" })
        ] }),
        /* @__PURE__ */ jsx3("p", { className: "ml-8 text-sm", children: "The data format is not compatible with the requested chart type. Please try a different visualization or check the data structure." })
      ] });
    }
  };
  const renderImage = (imageData, key) => {
    const trimmedData = imageData.trim();
    return /* @__PURE__ */ jsx3(
      "div",
      {
        className: "my-6 p-2",
        children: /* @__PURE__ */ jsxs3("div", { className: "max-w-full", children: [
          /* @__PURE__ */ jsx3(
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
          /* @__PURE__ */ jsx3("div", { className: "flex justify-end text-sm mr-2", children: /* @__PURE__ */ jsx3(
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
    return /* @__PURE__ */ jsx3(
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
    return /* @__PURE__ */ jsx3(
      "div",
      {
        onClick: handleAnalyticClick,
        className: "my-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 cursor-pointer hover:shadow-md transition-shadow",
        children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs3("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsx3("div", { className: "w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center", children: /* @__PURE__ */ jsx3(
              "svg",
              {
                className: "w-6 h-6 text-white",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                xmlns: "http://www.w3.org/2000/svg",
                children: /* @__PURE__ */ jsx3(
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
            /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsx3("h3", { className: "font-semibold text-gray-800 dark:text-gray-200", children: "Analytics Dataset" }),
              /* @__PURE__ */ jsxs3("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                recordCount,
                " records, ",
                columnCount,
                " columns - Click to analyze"
              ] }),
              headers.length > 0 && /* @__PURE__ */ jsxs3("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-1", children: [
                "Fields: ",
                headers.slice(0, 3).join(", "),
                headers.length > 3 ? ` (+${headers.length - 3} more)` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx3("div", { className: "px-3 py-1 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full", children: "Pivot Table" })
        ] })
      },
      key || `analytic-${analyticData.substring(0, 50)}`
    );
  };
  const ImageLoadingIndicator = memo3(
    ({ isStreaming: isStreaming2 }) => {
      useEffect(() => {
        if (isStreaming2) {
          const timeout = setTimeout(() => {
            console.warn(
              "Image generation timeout - this may indicate a streaming issue"
            );
          }, 3e4);
          return () => clearTimeout(timeout);
        }
      }, [isStreaming2]);
      return /* @__PURE__ */ jsxs3(
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
            /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 mb-4", children: [
              /* @__PURE__ */ jsx3("div", { className: "h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center", children: /* @__PURE__ */ jsx3("div", { className: "animate-spin h-5 w-5 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full" }) }),
              /* @__PURE__ */ jsx3("div", { className: "font-medium text-gray-700 dark:text-gray-300", children: "Generating image..." })
            ] }),
            /* @__PURE__ */ jsx3("div", { className: "h-64 md:h-80 relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 w-full flex items-center justify-center", children: /* @__PURE__ */ jsxs3("div", { className: "w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 animate-pulse relative overflow-hidden", children: [
              /* @__PURE__ */ jsx3("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" }),
              /* @__PURE__ */ jsx3("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx3(
                ImageIcon,
                {
                  size: 48,
                  className: "text-gray-400 dark:text-gray-500"
                }
              ) }),
              /* @__PURE__ */ jsx3("div", { className: "absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-gray-400 dark:border-gray-500" }),
              /* @__PURE__ */ jsx3("div", { className: "absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-gray-400 dark:border-gray-500" }),
              /* @__PURE__ */ jsx3("div", { className: "absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-gray-400 dark:border-gray-500" }),
              /* @__PURE__ */ jsx3("div", { className: "absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-gray-400 dark:border-gray-500" })
            ] }) }),
            /* @__PURE__ */ jsxs3("div", { className: "mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400", children: [
              /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx3("div", { className: "w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" }),
                /* @__PURE__ */ jsx3("span", { children: "Processing image data..." })
              ] }),
              /* @__PURE__ */ jsx3("div", { children: "Please wait..." })
            ] }),
            /* @__PURE__ */ jsx3("style", { children: `
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
    return /* @__PURE__ */ jsx3(ImageLoadingIndicator, { isStreaming });
  };
  const renderChartLoading = (type = "unknown") => {
    const normalizedType = type.toLowerCase();
    return /* @__PURE__ */ jsxs3(
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
          /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 mb-4", children: [
            /* @__PURE__ */ jsx3("div", { className: "h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center", children: /* @__PURE__ */ jsx3("div", { className: "animate-spin h-5 w-5 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full" }) }),
            /* @__PURE__ */ jsxs3("div", { className: "font-medium text-gray-700 dark:text-gray-300", children: [
              "Generating ",
              normalizedType,
              " chart..."
            ] })
          ] }),
          /* @__PURE__ */ jsxs3("div", { className: "h-64 md:h-80 relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 w-full", children: [
            /* @__PURE__ */ jsx3("div", { className: "absolute bottom-0 left-0 w-full h-0.5 bg-gray-300 dark:bg-gray-600" }),
            /* @__PURE__ */ jsx3("div", { className: "absolute bottom-0 left-0 w-0.5 h-full bg-gray-300 dark:bg-gray-600" }),
            [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx3(
              "div",
              {
                className: "absolute w-full h-px bg-gray-200 dark:bg-gray-600",
                style: { bottom: `${i * 20}%` }
              },
              `h-${i}`
            )),
            [1, 2, 3, 4, 5, 6, 7, 8].map((i) => /* @__PURE__ */ jsx3(
              "div",
              {
                className: "absolute h-full w-px bg-gray-200 dark:bg-gray-600",
                style: { left: `${i * 12.5}%` }
              },
              `v-${i}`
            )),
            normalizedType === "bar" && /* @__PURE__ */ jsx3("div", { className: "absolute bottom-0 left-0 w-full h-full flex items-end justify-around p-4", children: [45, 80, 30, 65, 50, 75, 40].map((h, i) => /* @__PURE__ */ jsx3(
              "div",
              {
                className: "w-8 bg-gray-300 dark:bg-gray-600 animate-pulse rounded-t-sm opacity-60",
                style: { height: `${h}%` }
              },
              `bar-${i}`
            )) }),
            normalizedType === "line" && /* @__PURE__ */ jsx3("div", { className: "absolute bottom-0 left-0 w-full h-full flex items-end justify-around p-4", children: [45, 80, 30, 65, 50, 75, 40].map((h, i) => /* @__PURE__ */ jsx3(
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
            (normalizedType === "pie" || normalizedType === "doughnut") && /* @__PURE__ */ jsxs3("div", { className: "absolute inset-0 flex items-center justify-center", children: [
              /* @__PURE__ */ jsx3(
                "div",
                {
                  className: `w-32 h-32 rounded-full border-8 border-gray-300 dark:border-gray-600 animate-pulse ${normalizedType === "doughnut" ? "border-[16px]" : "border-8"}`
                }
              ),
              /* @__PURE__ */ jsx3("div", { className: "absolute w-32 h-32", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx3(
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
            normalizedType === "scatter" && /* @__PURE__ */ jsx3("div", { className: "absolute inset-0", children: Array.from({ length: 15 }).map((_, i) => {
              const x = 10 + Math.random() * 80;
              const y = 10 + Math.random() * 80;
              return /* @__PURE__ */ jsx3(
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
            normalizedType === "radar" && /* @__PURE__ */ jsx3("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxs3("div", { className: "w-48 h-48 relative", children: [
              [1, 2, 3].map((level) => /* @__PURE__ */ jsx3(
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
              [0, 60, 120, 180, 240, 300].map((angle) => /* @__PURE__ */ jsx3(
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
              /* @__PURE__ */ jsxs3("div", { className: "absolute w-full h-full animate-pulse", children: [
                /* @__PURE__ */ jsx3(
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
                /* @__PURE__ */ jsx3(
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
                /* @__PURE__ */ jsx3(
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
                /* @__PURE__ */ jsx3(
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
                /* @__PURE__ */ jsx3(
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
            normalizedType !== "bar" && normalizedType !== "line" && normalizedType !== "pie" && normalizedType !== "doughnut" && normalizedType !== "scatter" && normalizedType !== "radar" && /* @__PURE__ */ jsx3("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxs3("div", { className: "text-gray-400 dark:text-gray-500 text-lg", children: [
              "Preparing ",
              normalizedType,
              " chart..."
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs3("div", { className: "mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400", children: [
            /* @__PURE__ */ jsx3("div", { className: "w-2/3 flex gap-2", children: ["Dataset 1", "Dataset 2"].map((label, i) => /* @__PURE__ */ jsxs3(
              "div",
              {
                className: "flex items-center",
                children: [
                  /* @__PURE__ */ jsx3(
                    "div",
                    {
                      className: `w-3 h-3 rounded-full mr-1 ${i === 0 ? "bg-gray-400 dark:bg-gray-500" : "bg-gray-300 dark:bg-gray-600"}`
                    }
                  ),
                  /* @__PURE__ */ jsx3("span", { children: label })
                ]
              },
              `legend-${i}`
            )) }),
            /* @__PURE__ */ jsx3("div", { children: "Processing data..." })
          ] })
        ]
      }
    );
  };
  const renderAppLoading = (appName = "Unknown App") => {
    return /* @__PURE__ */ jsxs3("div", { className: "my-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 w-full block", children: [
      /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsx3("div", { className: "h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center", children: /* @__PURE__ */ jsx3("div", { className: "animate-spin h-5 w-5 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full" }) }),
        /* @__PURE__ */ jsxs3("div", { className: "font-medium text-gray-700 dark:text-gray-300", children: [
          "Preparing ",
          appName,
          "..."
        ] })
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs3("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsx3("div", { className: "w-10 h-10 rounded-lg bg-blue-500 animate-pulse flex items-center justify-center", children: /* @__PURE__ */ jsx3(
            "svg",
            {
              className: "w-6 h-6 text-white",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              xmlns: "http://www.w3.org/2000/svg",
              children: /* @__PURE__ */ jsx3(
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
          /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsx3("h3", { className: "font-semibold text-gray-800 dark:text-gray-200", children: appName }),
            /* @__PURE__ */ jsx3("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Getting ready to launch..." })
          ] })
        ] }),
        /* @__PURE__ */ jsx3("div", { className: "px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg", children: "Loading..." })
      ] })
    ] });
  };
  const renderAnalyticLoading = () => {
    return /* @__PURE__ */ jsxs3("div", { className: "my-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 w-full block", children: [
      /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsx3("div", { className: "h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center", children: /* @__PURE__ */ jsx3("div", { className: "animate-spin h-5 w-5 border-2 border-emerald-500 dark:border-emerald-400 border-t-transparent rounded-full" }) }),
        /* @__PURE__ */ jsx3("div", { className: "font-medium text-gray-700 dark:text-gray-300", children: "Processing analytics data..." })
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs3("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsx3("div", { className: "w-10 h-10 rounded-lg bg-emerald-500 animate-pulse flex items-center justify-center", children: /* @__PURE__ */ jsx3(
            "svg",
            {
              className: "w-6 h-6 text-white",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              xmlns: "http://www.w3.org/2000/svg",
              children: /* @__PURE__ */ jsx3(
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
          /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsx3("h3", { className: "font-semibold text-gray-800 dark:text-gray-200", children: "Analytics Dataset" }),
            /* @__PURE__ */ jsx3("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Preparing pivot table interface..." })
          ] })
        ] }),
        /* @__PURE__ */ jsx3("div", { className: "px-3 py-1 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full animate-pulse", children: "Loading..." })
      ] })
    ] });
  };
  const renderWidgetLoading = (widgetType = "card") => {
    const isForm = widgetType === "form";
    return /* @__PURE__ */ jsxs3("div", { className: "my-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 w-full block", children: [
      /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsx3("div", { className: "h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center", children: /* @__PURE__ */ jsx3("div", { className: "animate-spin h-5 w-5 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full" }) }),
        /* @__PURE__ */ jsxs3("div", { className: "font-medium text-gray-700 dark:text-gray-300", children: [
          "Preparing ",
          isForm ? "form" : "card",
          " widget..."
        ] })
      ] }),
      isForm ? (
        // Form loading skeleton
        /* @__PURE__ */ jsxs3("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx3("div", { className: "h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" }),
          /* @__PURE__ */ jsx3("div", { className: "h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" }),
          /* @__PURE__ */ jsx3("div", { className: "h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" }),
          /* @__PURE__ */ jsx3("div", { className: "h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" })
        ] })
      ) : (
        // Card loading skeleton
        /* @__PURE__ */ jsxs3("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx3("div", { className: "h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" }),
          /* @__PURE__ */ jsxs3("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx3("div", { className: "h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" }),
            /* @__PURE__ */ jsx3("div", { className: "h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" }),
            /* @__PURE__ */ jsx3("div", { className: "h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" }),
            /* @__PURE__ */ jsx3("div", { className: "h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" })
          ] })
        ] })
      )
    ] });
  };
  const CustomMarkdown = ({ content: content2 }) => /* @__PURE__ */ jsx3(
    ReactMarkdown2,
    {
      remarkPlugins: [remarkGfm2],
      rehypePlugins: [rehypeRaw2],
      components: {
        blockquote: ({ children }) => /* @__PURE__ */ jsx3("blockquote", { className: "border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-2 my-4 bg-gray-100 dark:bg-gray-800 rounded-md", children }),
        p: ({ children }) => /* @__PURE__ */ jsx3("p", { className: "mb-2 last:mb-0", children }),
        h1: ({ children }) => /* @__PURE__ */ jsx3("h1", { className: "text-2xl font-bold mb-2 last:mb-0", children }),
        h2: ({ children }) => /* @__PURE__ */ jsx3("h2", { className: "text-xl font-bold mb-2 last:mb-0", children }),
        h3: ({ children }) => /* @__PURE__ */ jsx3("h3", { className: "text-lg font-bold mb-2 last:mb-0", children }),
        h4: ({ children }) => /* @__PURE__ */ jsx3("h4", { className: "text-base font-bold mb-2 last:mb-0", children }),
        h5: ({ children }) => /* @__PURE__ */ jsx3("h5", { className: "text-sm font-bold mb-2 last:mb-0", children }),
        h6: ({ children }) => /* @__PURE__ */ jsx3("h6", { className: "text-xs font-bold mb-2 last:mb-0", children }),
        ul: ({ children }) => /* @__PURE__ */ jsx3("ul", { className: "list-disc list-outside ml-6 mb-2 last:mb-0 space-y-1", children }),
        ol: ({ children }) => /* @__PURE__ */ jsx3("ol", { className: "list-decimal list-outside ml-6 mb-2 last:mb-0 space-y-1", children }),
        li: ({ children }) => /* @__PURE__ */ jsx3("li", { className: "mb-1", children }),
        hr: ({ children }) => /* @__PURE__ */ jsx3("hr", { className: "my-4 border-t border-gray-200 dark:border-gray-700 mb-3" }),
        a: ({ href, children }) => /* @__PURE__ */ jsx3(
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
            return /* @__PURE__ */ jsx3(
              CodeBlock2,
              {
                language,
                code,
                theme
              }
            );
          }
          return /* @__PURE__ */ jsx3("pre", { className: "my-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-x-auto", children: /* @__PURE__ */ jsx3("code", { className: "text-sm font-mono text-gray-800 dark:text-gray-200", children }) });
        },
        code: (_c) => {
          var _d = _c, { className, children } = _d, props = __objRest(_d, ["className", "children"]);
          const isInlineCode = !className;
          return isInlineCode ? /* @__PURE__ */ jsx3("code", { className: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono", children }) : /* @__PURE__ */ jsx3("code", __spreadProps(__spreadValues({ className }, props), { children }));
        },
        table: ({ children }) => /* @__PURE__ */ jsx3("div", { className: "overflow-x-auto my-4", children: /* @__PURE__ */ jsx3("table", { className: "border-collapse w-full", children }) }),
        th: ({ children }) => /* @__PURE__ */ jsx3("th", { className: "border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left", children }),
        td: (_e) => {
          var _f = _e, { children } = _f, props = __objRest(_f, ["children"]);
          return /* @__PURE__ */ jsx3(
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
  const processTextContent = useMemo(() => {
    return (text) => {
      if (!isStreaming) {
        const parts = text.split(
          /(```(?:chart:[a-z]+|image|app:[^\n]+|analytic|(?:widget:)?(?:card|form|decision)|json:[^\n]+)\n[\s\S]*?\n```)/g
        );
        if (parts.length > 1) {
          return /* @__PURE__ */ jsx3(Fragment, { children: parts.map((part, i) => {
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
              return /* @__PURE__ */ jsx3(
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
              return /* @__PURE__ */ jsx3(
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
              return /* @__PURE__ */ jsx3(
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
            return part ? /* @__PURE__ */ jsx3(
              CustomMarkdown,
              {
                content: part
              },
              `text-${i}`
            ) : null;
          }) });
        }
        return /* @__PURE__ */ jsx3(CustomMarkdown, { content: text });
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
        return /* @__PURE__ */ jsx3(CustomMarkdown, { content: text });
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
        return /* @__PURE__ */ jsx3(CustomMarkdown, { content: text });
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
          processedBeforeBlock = /* @__PURE__ */ jsx3(Fragment, { children: beforeParts.map((part, i) => {
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
              return /* @__PURE__ */ jsx3(
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
              return /* @__PURE__ */ jsx3(
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
              return /* @__PURE__ */ jsx3(
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
            return part ? /* @__PURE__ */ jsx3(
              CustomMarkdown,
              {
                content: part
              },
              `text-${i}`
            ) : null;
          }) });
        } else {
          processedBeforeBlock = /* @__PURE__ */ jsx3(CustomMarkdown, { content: textBeforeLastBlock });
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
            lastBlockElement = /* @__PURE__ */ jsx3(
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
            lastBlockElement = /* @__PURE__ */ jsx3(
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
            lastBlockElement = /* @__PURE__ */ jsx3(
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
          lastBlockElement = /* @__PURE__ */ jsx3("div", { className: "my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800", children: /* @__PURE__ */ jsx3("div", { className: "flex items-center justify-between p-4", children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx3("div", { className: "animate-spin h-4 w-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full" }),
            /* @__PURE__ */ jsx3("span", { className: "font-semibold text-gray-800 dark:text-gray-200", children: jsonTitle }),
            /* @__PURE__ */ jsx3("span", { className: "text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full", children: "JSON" })
          ] }) }) });
        }
      }
      return /* @__PURE__ */ jsxs3(Fragment, { children: [
        processedBeforeBlock,
        lastBlockElement
      ] });
    };
  }, [isStreaming, theme]);
  const renderContent = () => {
    var _a2, _b2, _c, _d;
    const contentToRender = content;
    if (typeof contentToRender === "string") {
      return /* @__PURE__ */ jsxs3(Fragment, { children: [
        message.isToolExecuting && message.executingToolName && /* @__PURE__ */ jsx3(
          ToolExecutionIndicator,
          {
            toolName: message.executingToolName
          }
        ),
        /* @__PURE__ */ jsx3("div", { className: "markdown-content", children: role === "user" ? /* @__PURE__ */ jsx3("div", { className: "whitespace-pre-wrap break-words", children: contentToRender }) : /* @__PURE__ */ jsx3(
          StreamingMarkdown,
          {
            content: contentToRender,
            isStreaming,
            theme,
            cursorColor: streamingTextColor
          }
        ) }),
        /* @__PURE__ */ jsx3(StreamingIndicator, {}),
        ((_a2 = message.metadata) == null ? void 0 : _a2.steps) && /* @__PURE__ */ jsx3(
          ToolExecutionWidget,
          {
            steps: message.metadata.steps,
            theme
          }
        ),
        ((_b2 = message.metadata) == null ? void 0 : _b2.vectors) && /* @__PURE__ */ jsx3(
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
      return /* @__PURE__ */ jsxs3("div", { className: "space-y-3", children: [
        message.isToolExecuting && message.executingToolName && /* @__PURE__ */ jsx3(
          ToolExecutionIndicator,
          {
            toolName: message.executingToolName
          }
        ),
        contentToRender.map((part, i) => {
          if (part.type === "text") {
            const textContent = part.text;
            return /* @__PURE__ */ jsx3("div", { children: role === "user" ? /* @__PURE__ */ jsx3("div", { className: "whitespace-pre-wrap break-words", children: textContent }) : /* @__PURE__ */ jsx3(
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
            return /* @__PURE__ */ jsxs3(
              "div",
              {
                className: "border border-gray-200 dark:border-gray-700 rounded-md p-4",
                children: [
                  /* @__PURE__ */ jsxs3("p", { className: "text-sm text-gray-500 mb-2 flex items-center", children: [
                    /* @__PURE__ */ jsx3(FileText, { size: 16, className: "mr-1" }),
                    "PDF Document:"
                  ] }),
                  /* @__PURE__ */ jsxs3("div", { className: "flex flex-col", children: [
                    /* @__PURE__ */ jsx3("span", { className: "text-sm font-medium mb-2", children: filePart.filename || "Document" }),
                    /* @__PURE__ */ jsx3(
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
            return /* @__PURE__ */ jsx3("div", { className: "p-2", children: /* @__PURE__ */ jsxs3("div", { className: "max-w-full", children: [
              /* @__PURE__ */ jsx3(
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
              /* @__PURE__ */ jsx3("div", { className: "flex justify-end text-sm mr-2", children: /* @__PURE__ */ jsx3(
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
        /* @__PURE__ */ jsx3(StreamingIndicator, {}),
        ((_c = message.metadata) == null ? void 0 : _c.steps) && /* @__PURE__ */ jsx3(
          ToolExecutionWidget,
          {
            steps: message.metadata.steps,
            theme
          }
        ),
        ((_d = message.metadata) == null ? void 0 : _d.vectors) && /* @__PURE__ */ jsx3(
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
    return /* @__PURE__ */ jsx3("div", { children: "..." });
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
  return /* @__PURE__ */ jsxs3(Fragment, { children: [
    /* @__PURE__ */ jsx3("div", { ref: messageContainerRef, className: "mb-3", children: /* @__PURE__ */ jsx3(
      "div",
      {
        className: `flex ${role === "user" ? "justify-end" : "justify-start"}`,
        children: /* @__PURE__ */ jsxs3(
          "div",
          {
            className: `max-w-[100%] sm:max-w-[90%] ${role === "user" ? "" : "w-full"}`,
            children: [
              /* @__PURE__ */ jsx3(
                "div",
                {
                  className: `rounded-2xl ${role === "assistant" ? "bg-transparent pl-0" : ""} p-3 transition-all duration-200`,
                  style: role === "user" ? { backgroundColor: messageBubbleColor } : void 0,
                  children: /* @__PURE__ */ jsx3(
                    "div",
                    {
                      className: `prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none [&_p]:!my-0`,
                      children: renderContent()
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxs3(
                "div",
                {
                  className: `mt-2 text-sm text-gray-500 dark:text-gray-400 ${role === "user" ? "text-right pr-1" : "text-left"}`,
                  children: [
                    formatTime(message.createdAt),
                    role === "assistant" && /* @__PURE__ */ jsxs3(Fragment, { children: [
                      /* @__PURE__ */ jsx3(
                        "button",
                        {
                          onClick: copyToClipboard,
                          className: "ml-3 inline-flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors",
                          "aria-label": "Copy message",
                          children: copied ? /* @__PURE__ */ jsx3(
                            Check2,
                            {
                              size: 16,
                              className: "text-green-500"
                            }
                          ) : /* @__PURE__ */ jsx3(Copy2, { size: 16 })
                        }
                      ),
                      ((_b = message.metadata) == null ? void 0 : _b.logId) && agentId && /* @__PURE__ */ jsxs3("span", { className: "ml-3 inline-flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsx3(
                          "button",
                          {
                            onClick: () => handleFeedback(true),
                            disabled: feedbackLoading,
                            className: `inline-flex items-center transition-colors ${feedback === true ? "text-green-600 dark:text-green-400" : "text-gray-500 hover:text-green-600 dark:hover:text-green-400"} ${feedbackLoading ? "opacity-50 cursor-not-allowed" : ""}`,
                            "aria-label": "Like this response",
                            title: "Like",
                            children: /* @__PURE__ */ jsx3(ThumbsUp, { size: 16, fill: feedback === true ? "currentColor" : "none" })
                          }
                        ),
                        /* @__PURE__ */ jsx3(
                          "button",
                          {
                            onClick: () => handleFeedback(false),
                            disabled: feedbackLoading,
                            className: `inline-flex items-center transition-colors ${feedback === false ? "text-red-600 dark:text-red-400" : "text-gray-500 hover:text-red-600 dark:hover:text-red-400"} ${feedbackLoading ? "opacity-50 cursor-not-allowed" : ""}`,
                            "aria-label": "Dislike this response",
                            title: "Dislike",
                            children: /* @__PURE__ */ jsx3(ThumbsDown, { size: 16, fill: feedback === false ? "currentColor" : "none" })
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
    imageDialogOpen && selectedImage && /* @__PURE__ */ jsx3(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
        onClick: closeImageDialog,
        children: /* @__PURE__ */ jsxs3(
          "div",
          {
            className: "relative max-w-[95vw] max-h-[95vh] bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-2xl",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsx3("div", { className: "absolute top-0 right-0 z-10 p-4", children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx3(
                  "a",
                  {
                    href: selectedImage.src,
                    download: "image.png",
                    className: "p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all cursor-pointer",
                    title: "Download image",
                    children: /* @__PURE__ */ jsx3(Download, { size: 20 })
                  }
                ),
                /* @__PURE__ */ jsx3(
                  "button",
                  {
                    onClick: closeImageDialog,
                    className: "p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all cursor-pointer",
                    title: "Close",
                    children: /* @__PURE__ */ jsx3(X, { size: 20 })
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsx3(
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
export {
  ChatMessage as default
};
