import {
  ToolExecutionIndicator,
  ToolExecutionWidget
} from "./chunk-2RXQ2EZ2.mjs";
import {
  chatClient,
  configureChatClient
} from "./chunk-VONUV37R.mjs";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-FWCSY2DS.mjs";

// app/components/chat.tsx
import {
  useState as useState4,
  useEffect as useEffect4,
  useRef as useRef2,
  useLayoutEffect,
  useCallback as useCallback2,
  startTransition as startTransition2
} from "react";
import {
  Trash2,
  Edit,
  Moon,
  Sun,
  MessageCirclePlus,
  PanelRightClose,
  PanelRightOpen,
  MoreHorizontal
} from "lucide-react";
import { motion as motion2, AnimatePresence as AnimatePresence2 } from "framer-motion";

// app/components/chat-content.tsx
import {
  useRef,
  useEffect as useEffect2,
  useState as useState2,
  useMemo as useMemo2,
  useCallback,
  lazy,
  Suspense,
  startTransition
} from "react";
import { X as X2, ArrowDownCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// app/components/analytics-panel.tsx
import { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  Download,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  X,
  ArrowUpDown,
  Folder,
  FolderOpen,
  FileText,
  BarChart3,
  Eye,
  EyeOff
} from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function AnalyticsPanel({
  name,
  csvData
}) {
  const { headers, data } = useMemo(() => {
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
  const [pivotConfig, setPivotConfig] = useState({
    rows: [],
    columns: [],
    values: [],
    aggregation: "count"
  });
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);
  const [sortConfig, setSortConfig] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(
    /* @__PURE__ */ new Set()
  );
  const [showGroupedView, setShowGroupedView] = useState(false);
  const [setTreeNodes] = useState([]);
  const [animatingNodes, setAnimatingNodes] = useState(
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
      return /* @__PURE__ */ jsx(
        FileText,
        {
          size: 14,
          className: "text-blue-500 dark:text-blue-400"
        }
      );
    }
    if (node.isExpanded) {
      return /* @__PURE__ */ jsx(
        FolderOpen,
        {
          size: 14,
          className: "text-emerald-600 dark:text-emerald-400"
        }
      );
    } else {
      return /* @__PURE__ */ jsx(
        Folder,
        {
          size: 14,
          className: "text-emerald-600 dark:text-emerald-400"
        }
      );
    }
  };
  const getExpandIcon = (isExpanded, hasChildren) => {
    if (!hasChildren) return null;
    return isExpanded ? /* @__PURE__ */ jsx(
      ChevronDown,
      {
        size: 14,
        className: "text-gray-600 dark:text-gray-400 transition-transform duration-200"
      }
    ) : /* @__PURE__ */ jsx(
      ChevronRight,
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
  const pivotData = useMemo(() => {
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
  useEffect(() => {
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
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(true);
  return /* @__PURE__ */ jsxs("div", { className: "flex h-[calc(100%-70px)] bg-white dark:bg-gray-900 min-h-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-4", children: pivotData.summary && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Rows:" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-800 dark:text-gray-200", children: pivotData.summary.totalRows.toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Columns:" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-800 dark:text-gray-200", children: (pivotData.summary.totalColumns || headers.length).toLocaleString() })
          ] }),
          pivotData.summary.originalRows && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Filtered:" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-800 dark:text-gray-200", children: pivotData.summary.originalRows.toLocaleString() })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: exportToCsv,
              className: "flex items-center px-3 py-1.5 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 transition-colors",
              title: "Export to CSV",
              children: [
                /* @__PURE__ */ jsx(Download, { size: 14, className: "mr-1" }),
                "Export"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: resetConfig,
              className: "flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300",
              title: "Reset Configuration",
              children: [
                /* @__PURE__ */ jsx(RotateCcw, { size: 14, className: "mr-1" }),
                "Reset"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setIsFilterPanelVisible(
                !isFilterPanelVisible
              ),
              className: "flex items-center px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",
              title: isFilterPanelVisible ? "Hide Filters" : "Show Filters",
              children: [
                isFilterPanelVisible ? /* @__PURE__ */ jsx(EyeOff, { size: 14, className: "mr-1" }) : /* @__PURE__ */ jsx(Eye, { size: 14, className: "mr-1" }),
                isFilterPanelVisible ? "Hide" : "Show",
                " Filters"
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900", children: /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto min-w-0", children: pivotData.rows.length > 0 ? /* @__PURE__ */ jsx("div", { className: "", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm border-collapse bg-white dark:bg-gray-900 analytics-table-container", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-100 dark:bg-gray-900 sticky top-0", children: /* @__PURE__ */ jsx("tr", { children: (pivotConfig.rows.length > 0 || pivotConfig.columns.length > 0 || pivotConfig.values.length > 0 ? [
          ...pivotConfig.rows,
          ...pivotConfig.values,
          ...showGroupedView ? [] : ["_count"]
        ] : headers).map((header, index) => /* @__PURE__ */ jsx(
          "th",
          {
            className: "border-0 border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 relative",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: header === "_count" ? "Count" : header }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleSort(
                      header
                    ),
                    className: "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer",
                    title: "Sort column",
                    children: (sortConfig == null ? void 0 : sortConfig.key) === header ? sortConfig.direction === "asc" ? /* @__PURE__ */ jsx(
                      ArrowUp,
                      {
                        size: 14
                      }
                    ) : /* @__PURE__ */ jsx(
                      ArrowDown,
                      {
                        size: 14
                      }
                    ) : /* @__PURE__ */ jsx(
                      ArrowUpDown,
                      {
                        size: 14,
                        className: "opacity-50"
                      }
                    )
                  }
                ),
                header !== "_count" && header !== "_rowKey" && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setActiveFilterDropdown(
                      activeFilterDropdown === header ? null : header
                    ),
                    className: `p-1 rounded cursor-pointer ${(filters[header] || []).length > 0 ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`,
                    title: "Filter column",
                    children: /* @__PURE__ */ jsx(
                      Filter,
                      {
                        size: 14
                      }
                    )
                  }
                )
              ] }),
              activeFilterDropdown === header && header !== "_count" && header !== "_rowKey" && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-8 z-50 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg min-w-96 max-w-96 min-h-96 max-h-96 overflow-auto", children: [
                /* @__PURE__ */ jsx("div", { className: "p-2 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-gray-700 dark:text-gray-300", children: [
                    "Filter",
                    " ",
                    header
                  ] }),
                  /* @__PURE__ */ jsx(
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
                /* @__PURE__ */ jsx("div", { className: "overflow-y-auto", children: getUniqueValues(
                  header
                ).map(
                  (value) => /* @__PURE__ */ jsxs(
                    "label",
                    {
                      className: "flex items-center px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer",
                      children: [
                        /* @__PURE__ */ jsx(
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
                        /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300 truncate", children: value })
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
        /* @__PURE__ */ jsx("tbody", { className: "bg-white dark:bg-gray-900", children: pivotData.rows.slice(0, 1e6).map((row, index) => {
          if (row._isTreeNode && showGroupedView) {
            const indentLevel = row._treeLevel || row.level || 0;
            const isLeafNode = row.children && row.children.length === 0;
            const hasChildren = row.children && row.children.length > 0;
            const isAnimating = animatingNodes.has(
              row.id
            );
            if (isLeafNode) {
              return /* @__PURE__ */ jsx(
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
                      return /* @__PURE__ */ jsxs(
                        "td",
                        {
                          className: `border-0 border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 ${alignmentClass}`,
                          style: headerIndex === 0 ? {
                            paddingLeft: `${cellIndent}px`
                          } : {},
                          children: [
                            headerIndex === 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                              /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                                Array.from(
                                  {
                                    length: indentLevel
                                  }
                                ).map(
                                  (_, levelIndex) => /* @__PURE__ */ jsx(
                                    "div",
                                    {
                                      className: "w-6 flex justify-center",
                                      children: /* @__PURE__ */ jsx("div", { className: "w-px h-full bg-gray-300 dark:bg-gray-600" })
                                    },
                                    levelIndex
                                  )
                                ),
                                /* @__PURE__ */ jsx("div", { className: "w-6 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-3 h-px bg-gray-300 dark:bg-gray-600" }) })
                              ] }),
                              getTreeIcon(
                                row,
                                hasChildren
                              ),
                              /* @__PURE__ */ jsx("span", { className: "text-gray-700 dark:text-gray-300", children: shouldFormatAsNumber(
                                cellValue,
                                header
                              ) ? formatNumericValue(
                                cellValue
                              ) : cellValue })
                            ] }),
                            headerIndex !== 0 && /* @__PURE__ */ jsx("span", { children: shouldFormatAsNumber(
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
            return /* @__PURE__ */ jsx(
              "tr",
              {
                className: `transition-all duration-200 font-medium ${getLevelColor(
                  indentLevel
                )} hover:bg-opacity-75 border-l-4 ${isAnimating ? "animate-pulse" : ""}`,
                children: /* @__PURE__ */ jsx(
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
                    children: /* @__PURE__ */ jsxs(
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
                          indentLevel > 0 && /* @__PURE__ */ jsx("div", { className: "flex items-center", children: Array.from(
                            {
                              length: indentLevel
                            }
                          ).map(
                            (_, levelIndex) => /* @__PURE__ */ jsx(
                              "div",
                              {
                                className: "w-6 flex justify-center",
                                children: /* @__PURE__ */ jsx("div", { className: "w-px h-full bg-gray-300 dark:bg-gray-600" })
                              },
                              levelIndex
                            )
                          ) }),
                          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-300 dark:border-gray-600 group-hover:bg-gray-50 dark:group-hover:bg-gray-600 transition-colors", children: getExpandIcon(
                            row.isExpanded,
                            hasChildren
                          ) }),
                          getTreeIcon(
                            row,
                            hasChildren
                          ),
                          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 flex-1", children: [
                            /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-800 dark:text-gray-200", children: row.label }),
                            /* @__PURE__ */ jsxs("span", { className: "text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400", children: [
                              row.count,
                              " ",
                              "records"
                            ] })
                          ] }),
                          pivotConfig.values.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400", children: [
                            pivotConfig.values.slice(
                              0,
                              3
                            ).map(
                              (col) => /* @__PURE__ */ jsxs(
                                "div",
                                {
                                  className: "flex items-center space-x-1",
                                  children: [
                                    /* @__PURE__ */ jsx(
                                      BarChart3,
                                      {
                                        size: 12,
                                        className: "text-gray-500"
                                      }
                                    ),
                                    /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                                      col,
                                      ":"
                                    ] }),
                                    /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-800 dark:text-gray-200 font-mono", children: shouldFormatAsNumber(
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
                            pivotConfig.values.length > 3 && /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500", children: [
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
          return /* @__PURE__ */ jsx(
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
                  return /* @__PURE__ */ jsx(
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
        pivotData.totals && pivotConfig.values.length > 0 && /* @__PURE__ */ jsx("tfoot", { className: "bg-gray-100 dark:bg-gray-800 border-t-2 border-gray-400 dark:border-gray-600", children: /* @__PURE__ */ jsx("tr", { children: (pivotConfig.rows.length > 0 || pivotConfig.columns.length > 0 || pivotConfig.values.length > 0 ? [
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
            return /* @__PURE__ */ jsx(
              "td",
              {
                className: `border-0 border-gray-300 dark:border-gray-600 px-3 py-3 font-semibold text-gray-900 dark:text-gray-100 ${alignmentClass}`,
                children: cellContent
              },
              header
            );
          }
        ) }) })
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-64 text-gray-500 dark:text-gray-400", children: /* @__PURE__ */ jsx("div", { className: "text-center max-w-md", children: pivotConfig.rows.length === 0 && pivotConfig.columns.length === 0 && pivotConfig.values.length === 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 mx-auto mt-16 mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(
          "svg",
          {
            className: "w-8 h-8 text-emerald-600 dark:text-emerald-400",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx(
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
        /* @__PURE__ */ jsx("p", { className: "text-lg font-medium mb-2", children: "Configure Your Analytics" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm mb-4", children: [
          "Dataset loaded with",
          " ",
          data.length.toLocaleString(),
          " ",
          "records and ",
          headers.length,
          " ",
          "columns.",
          /* @__PURE__ */ jsx("br", {}),
          "Select columns in the filter panel to start analyzing your data."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-left bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium mb-2", children: "Quick Start:" }),
          /* @__PURE__ */ jsxs("ol", { className: "list-decimal list-inside space-y-1", children: [
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("strong", { children: "Group by Rows:" }),
              " ",
              "Select dimensions to group your data"
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("strong", { children: "Value Columns:" }),
              " ",
              "Choose metrics to analyze"
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("strong", { children: "Aggregation:" }),
              " ",
              "Pick how to summarize values (sum, average, etc.)"
            ] })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-lg font-medium mb-2", children: "No data to display" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Try adjusting your filters or configuration" })
      ] }) }) }) }) })
    ] }),
    isFilterPanelVisible && /* @__PURE__ */ jsx("div", { className: "w-80 min-w-80 border-l border-gray-200 dark:border-gray-700 bg-white flex flex-col flex-shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300", children: "Search Data" }),
        /* @__PURE__ */ jsx(
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
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300", children: "Group by Rows" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: "",
              onChange: (e) => e.target.value && addToPivotConfig("rows", e.target.value),
              className: "w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Add column..." }),
                headers.filter(
                  (h) => !pivotConfig.rows.includes(h)
                ).sort().map((header) => /* @__PURE__ */ jsx("option", { value: header, children: header }, header))
              ]
            }
          ),
          pivotConfig.rows.map((row, index) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center justify-between mt-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded text-sm",
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-emerald-800 dark:text-emerald-200 flex-1", children: row }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => moveColumnUp("rows", index),
                      disabled: index === 0,
                      className: "text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      children: /* @__PURE__ */ jsx(ArrowUp, { size: 14 })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => moveColumnDown(
                        "rows",
                        index
                      ),
                      disabled: index === pivotConfig.rows.length - 1,
                      className: "text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      children: /* @__PURE__ */ jsx(ArrowDown, { size: 14 })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => removeFromPivotConfig(
                        "rows",
                        row
                      ),
                      className: "text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200",
                      children: /* @__PURE__ */ jsx(X, { size: 14 })
                    }
                  )
                ] })
              ]
            },
            row
          ))
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300", children: "Value Columns" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: "",
              onChange: (e) => e.target.value && addToPivotConfig(
                "values",
                e.target.value
              ),
              className: "w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Add column..." }),
                headers.filter(
                  (h) => !pivotConfig.values.includes(h)
                ).sort().map((header) => /* @__PURE__ */ jsx("option", { value: header, children: header }, header))
              ]
            }
          ),
          pivotConfig.values.map((value, index) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center justify-between mt-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-sm",
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-blue-800 dark:text-blue-200 flex-1", children: value }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => moveColumnUp(
                        "values",
                        index
                      ),
                      disabled: index === 0,
                      className: "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      children: /* @__PURE__ */ jsx(ArrowUp, { size: 14 })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => moveColumnDown(
                        "values",
                        index
                      ),
                      disabled: index === pivotConfig.values.length - 1,
                      className: "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      children: /* @__PURE__ */ jsx(ArrowDown, { size: 14 })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => removeFromPivotConfig(
                        "values",
                        value
                      ),
                      className: "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200",
                      children: /* @__PURE__ */ jsx(X, { size: 14 })
                    }
                  )
                ] })
              ]
            },
            value
          ))
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300", children: "Aggregation" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: pivotConfig.aggregation,
              onChange: (e) => updatePivotConfig(
                "aggregation",
                e.target.value
              ),
              className: "w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
              children: [
                /* @__PURE__ */ jsx("option", { value: "count", children: "Count" }),
                /* @__PURE__ */ jsx("option", { value: "sum", children: "Sum" }),
                /* @__PURE__ */ jsx("option", { value: "avg", children: "Average" }),
                /* @__PURE__ */ jsx("option", { value: "min", children: "Minimum" }),
                /* @__PURE__ */ jsx("option", { value: "max", children: "Maximum" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300", children: "Display Mode" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: showGroupedView ? "grouped" : "aggregated",
              onChange: (e) => setShowGroupedView(
                e.target.value === "grouped"
              ),
              className: "w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
              children: [
                /* @__PURE__ */ jsx("option", { value: "aggregated", children: "Aggregated View" }),
                /* @__PURE__ */ jsx("option", { value: "grouped", children: "Grouped View" })
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}

// app/components/chat-content.tsx
import { Fragment as Fragment2, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var ChatInput = lazy(() => import("./chat-input-ZAFYBUO7.mjs"));
var DynamicChatMessage = lazy(() => import("./chat-message-RBCHNC5A.mjs"));
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
  streamingText = "NAIA is working on it...",
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
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [messages, setMessages] = useState2(
    conversation.messages || []
  );
  const [isStreaming, setIsStreaming] = useState2(false);
  const [streamingMessage, setStreamingMessage] = useState2(
    null
  );
  const streamingMessageRef = useRef(null);
  const previousConversationIdRef = useRef(conversation.id);
  const stableConversationKeyRef = useRef(conversation.id);
  const [errorDialog, setErrorDialog] = useState2(null);
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState2(false);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState2(false);
  const [openAnalytic, setOpenAnalytic] = useState2(null);
  const [chatWidth, setChatWidth] = useState2(30);
  const [isResizingChatApp, setIsResizingChatApp] = useState2(false);
  const chatAppResizeHandleRef = useRef(null);
  const chatAppContainerRef = useRef(null);
  const minChatWidth = 20;
  const maxChatWidth = 80;
  const hasMessages = messages.length > 0 || !!streamingMessage;
  const hasOpenPanel = !!openAnalytic;
  const isWaitingForInput = useMemo2(() => {
    return conversation.waiting === true || messages.some((message) => message.waiting === true);
  }, [conversation.waiting, messages]);
  const allMessages = useMemo2(() => {
    const combined = [...messages];
    if (streamingMessage) {
      combined.push(streamingMessage);
    }
    return combined.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [messages, streamingMessage]);
  const scrollToBottom = useCallback(
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
  useEffect2(() => {
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
  useEffect2(() => {
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
  useEffect2(() => {
    setShowScrollToBottomButton(false);
    setUserHasScrolledUp(false);
    const timeoutId = setTimeout(() => {
      scrollToBottom("auto");
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [conversation.id, scrollToBottom]);
  useEffect2(() => {
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
  useEffect2(() => {
    if (openAnalytic) {
      setOpenAnalytic(null);
    }
  }, [conversation.id]);
  useEffect2(() => {
    if (messages.length > 0 && !userHasScrolledUp) {
      const timeoutId = setTimeout(() => {
        scrollToBottom("smooth");
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, scrollToBottom, userHasScrolledUp]);
  useEffect2(() => {
    if (conversation.messages && conversation.messages.length > 0) {
      const timeouts = [
        setTimeout(() => scrollToBottom("auto"), 50),
        setTimeout(() => scrollToBottom("auto"), 200),
        setTimeout(() => scrollToBottom("auto"), 500)
      ];
      return () => timeouts.forEach(clearTimeout);
    }
  }, [conversation.messages, conversation.id, scrollToBottom]);
  useEffect2(() => {
    if (hasMessages) {
      const timeoutId = setTimeout(() => {
        scrollToBottom("auto");
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [hasMessages, scrollToBottom]);
  useEffect2(() => {
    return () => {
      setIsStreaming(false);
      setStreamingMessage(null);
      streamingMessageRef.current = null;
    };
  }, []);
  const handleAddUserMessage = useCallback(
    (message) => {
      startTransition(() => {
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
  const handleStreamStart = useCallback(() => {
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
    startTransition(() => {
      setStreamingMessage(newStreamingMessage);
      setIsStreaming(true);
    });
  }, []);
  const handleToolExecutionStart = useCallback((toolName) => {
    setStreamingMessage((prev) => {
      if (!prev) return null;
      return __spreadProps(__spreadValues({}, prev), {
        isToolExecuting: true,
        executingToolName: toolName
      });
    });
  }, []);
  const handleToolExecutionEnd = useCallback(() => {
    setStreamingMessage((prev) => {
      if (!prev) return null;
      return __spreadProps(__spreadValues({}, prev), {
        isToolExecuting: false,
        executingToolName: void 0
      });
    });
  }, []);
  const pendingChunksRef = useRef("");
  const throttleTimerRef = useRef(null);
  const handleStreamUpdate = useCallback((chunk) => {
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
  const handleStreamEnd = useCallback(
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
  const handleError = useCallback((details) => {
    setIsStreaming(false);
    setStreamingMessage(null);
    streamingMessageRef.current = null;
    setErrorDialog(details);
    setShowScrollToBottomButton(false);
  }, []);
  const handleStopStreaming = useCallback(() => {
    setIsStreaming(false);
    setStreamingMessage(null);
    streamingMessageRef.current = null;
  }, []);
  const handleAnalyticOpen = useCallback(
    (name, data) => {
      setOpenAnalytic({ name, data });
      onSidebarToggle == null ? void 0 : onSidebarToggle();
    },
    [onSidebarToggle]
  );
  const handlePanelClose = useCallback(() => {
    setOpenAnalytic(null);
  }, []);
  const startResizingChatApp = useCallback(
    (e) => {
      e.preventDefault();
      setIsResizingChatApp(true);
    },
    []
  );
  useEffect2(() => {
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
    return /* @__PURE__ */ jsx2("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs2("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full", children: [
      /* @__PURE__ */ jsxs2("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsx2("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: errorDialog.title }),
        /* @__PURE__ */ jsx2(
          "button",
          {
            onClick: () => setErrorDialog(null),
            className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
            "aria-label": "Close error dialog",
            children: /* @__PURE__ */ jsx2(X2, { size: 20 })
          }
        )
      ] }),
      /* @__PURE__ */ jsx2("p", { className: "text-sm text-gray-600 dark:text-gray-300 mb-4", children: errorDialog.message }),
      /* @__PURE__ */ jsx2("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx2(
        "button",
        {
          onClick: () => setErrorDialog(null),
          className: "px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
          children: "OK"
        }
      ) })
    ] }) });
  };
  return /* @__PURE__ */ jsxs2(Fragment2, { children: [
    /* @__PURE__ */ jsx2("style", { children: `
        .resize-active {
          user-select: none;
        }
        .resize-active * {
          cursor: col-resize !important;
        }
      ` }),
    /* @__PURE__ */ jsxs2(
      "div",
      {
        ref: chatAppContainerRef,
        className: "flex h-full relative w-full",
        children: [
          /* @__PURE__ */ jsx2(ErrorDialog, {}),
          /* @__PURE__ */ jsxs2(
            "div",
            {
              className: `flex flex-col transition-all duration-300 relative min-w-[500px] ${hasOpenPanel ? "" : "w-full"}`,
              style: hasOpenPanel ? { width: `${chatWidth}%` } : {},
              children: [
                isResizingChatApp && /* @__PURE__ */ jsx2("div", { className: "absolute inset-0 z-40 bg-transparent cursor-col-resize" }),
                /* @__PURE__ */ jsxs2(Fragment2, { children: [
                  /* @__PURE__ */ jsxs2(
                    "div",
                    {
                      ref: scrollContainerRef,
                      className: `flex-1 overflow-y-auto py-6 relative ${hasOpenPanel ? "px-2 sm:px-4" : "px-4 sm:px-8"} ${!hasMessages ? "flex flex-col items-center justify-center" : ""}`,
                      "data-ref": "scrollContainerRef",
                      "data-main-chat-scroll": "true",
                      children: [
                        /* @__PURE__ */ jsx2(AnimatePresence, { mode: "wait", children: !hasMessages && !isReadOnly && /* @__PURE__ */ jsxs2(
                          motion.div,
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
                              welcomeIcon && /* @__PURE__ */ jsx2(
                                motion.div,
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
                                  children: /* @__PURE__ */ jsx2(
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
                              /* @__PURE__ */ jsx2(
                                motion.h2,
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
                              /* @__PURE__ */ jsx2(
                                motion.p,
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
                              /* @__PURE__ */ jsx2(
                                motion.div,
                                {
                                  initial: { opacity: 0, y: 10 },
                                  animate: { opacity: 1, y: 0 },
                                  transition: {
                                    delay: 0.4,
                                    duration: 0.5
                                  },
                                  className: `w-full ${hasOpenPanel ? "max-w-xs" : "max-w-xl"}`,
                                  children: /* @__PURE__ */ jsx2(Suspense, { fallback: null, children: /* @__PURE__ */ jsx2(
                                    ChatInput,
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
                        !hasMessages && isReadOnly && /* @__PURE__ */ jsxs2("div", { className: "text-center", children: [
                          /* @__PURE__ */ jsx2("h3", { className: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-2", children: "Log View" }),
                          /* @__PURE__ */ jsx2("p", { className: "text-gray-500 dark:text-gray-400", children: "This log contains no messages." })
                        ] }),
                        hasMessages && /* @__PURE__ */ jsxs2(
                          motion.div,
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
                                return /* @__PURE__ */ jsx2(
                                  motion.div,
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
                                    children: /* @__PURE__ */ jsx2(
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
                              /* @__PURE__ */ jsx2(
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
                  !isReadOnly && hasMessages && /* @__PURE__ */ jsx2(
                    motion.div,
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
                      children: /* @__PURE__ */ jsxs2(
                        "div",
                        {
                          className: hasOpenPanel ? "p-2 sm:p-3 w-full" : "p-4 sm:p-6 w-full max-w-4xl mx-auto",
                          children: [
                            isWaitingForInput && /* @__PURE__ */ jsxs2("div", { className: "mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg", children: [
                              /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2", children: [
                                /* @__PURE__ */ jsxs2("div", { className: "flex space-x-1", children: [
                                  /* @__PURE__ */ jsx2("div", { className: "w-2 h-2 bg-amber-500 rounded-full animate-pulse" }),
                                  /* @__PURE__ */ jsx2(
                                    "div",
                                    {
                                      className: "w-2 h-2 bg-amber-500 rounded-full animate-pulse",
                                      style: {
                                        animationDelay: "0.2s"
                                      }
                                    }
                                  ),
                                  /* @__PURE__ */ jsx2(
                                    "div",
                                    {
                                      className: "w-2 h-2 bg-amber-500 rounded-full animate-pulse",
                                      style: {
                                        animationDelay: "0.4s"
                                      }
                                    }
                                  )
                                ] }),
                                /* @__PURE__ */ jsx2("p", { className: "text-sm text-amber-800 dark:text-amber-200 font-medium", children: "Waiting for form input..." })
                              ] }),
                              /* @__PURE__ */ jsx2("p", { className: "text-xs text-amber-700 dark:text-amber-300 mt-1", children: "Complete the form above or click Cancel to continue without data capture." })
                            ] }),
                            showScrollToBottomButton && /* @__PURE__ */ jsx2("div", { className: "absolute bottom-22 left-1/2 transform -translate-x-1/2 z-10", children: /* @__PURE__ */ jsx2(
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
                                children: /* @__PURE__ */ jsx2(ArrowDownCircle, { size: 24 })
                              }
                            ) }),
                            /* @__PURE__ */ jsx2(Suspense, { fallback: null, children: /* @__PURE__ */ jsx2(
                              ChatInput,
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
          hasOpenPanel && /* @__PURE__ */ jsx2(
            "div",
            {
              ref: chatAppResizeHandleRef,
              onMouseDown: startResizingChatApp,
              className: `h-full cursor-col-resize transition-all z-50 relative flex items-center justify-center ${isResizingChatApp ? "w-2 bg-indigo-500 dark:bg-indigo-400" : "w-1 hover:w-2 bg-gray-300 dark:bg-gray-700 hover:bg-indigo-500 dark:hover:bg-indigo-400"}`,
              title: "Drag to resize chat and app areas",
              children: /* @__PURE__ */ jsxs2("div", { className: "flex flex-col space-y-1 opacity-60", children: [
                /* @__PURE__ */ jsx2("div", { className: "w-0.5 h-0.5 bg-white rounded-full" }),
                /* @__PURE__ */ jsx2("div", { className: "w-0.5 h-0.5 bg-white rounded-full" }),
                /* @__PURE__ */ jsx2("div", { className: "w-0.5 h-0.5 bg-white rounded-full" })
              ] })
            }
          ),
          hasOpenPanel && /* @__PURE__ */ jsxs2("div", { className: "flex-1 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col w-full", children: [
            /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800", children: [
              /* @__PURE__ */ jsxs2("div", { className: "flex items-center space-x-3", children: [
                /* @__PURE__ */ jsx2(
                  "div",
                  {
                    className: `w-8 h-8 rounded-lg flex items-center justify-center ${false ? "bg-blue-500" : "bg-emerald-500"}`,
                    children: false ? /* @__PURE__ */ jsx2(
                      "svg",
                      {
                        className: "w-5 h-5 text-white",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        xmlns: "http://www.w3.org/2000/svg",
                        children: /* @__PURE__ */ jsx2(
                          "path",
                          {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          }
                        )
                      }
                    ) : /* @__PURE__ */ jsx2(
                      "svg",
                      {
                        className: "w-5 h-5 text-white",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        xmlns: "http://www.w3.org/2000/svg",
                        children: /* @__PURE__ */ jsx2(
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
                /* @__PURE__ */ jsxs2("div", { children: [
                  /* @__PURE__ */ jsx2("h3", { className: "font-semibold text-gray-800 dark:text-gray-200", children: false ? "openApp" : "Analytics Dashboard" }),
                  openAnalytic && /* @__PURE__ */ jsx2("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: openAnalytic.name })
                ] })
              ] }),
              /* @__PURE__ */ jsx2("div", { className: "flex items-center space-x-2", children: /* @__PURE__ */ jsx2(
                "button",
                {
                  onClick: handlePanelClose,
                  className: "p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors",
                  "aria-label": "Close panel",
                  children: /* @__PURE__ */ jsx2(
                    X2,
                    {
                      size: 20,
                      className: "text-gray-600 dark:text-gray-400"
                    }
                  )
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs2("div", { className: "flex-1 relative h-full", children: [
              isResizingChatApp && /* @__PURE__ */ jsx2("div", { className: "absolute inset-0 z-50 bg-transparent cursor-col-resize" }),
              false ? /* @__PURE__ */ jsx2(
                "iframe",
                {
                  className: "w-full h-full border-0",
                  allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                  sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
                }
              ) : openAnalytic ? /* @__PURE__ */ jsx2(
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
import { createPortal } from "react-dom";
import { useState as useState3, useEffect as useEffect3 } from "react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
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
  const [isMounted, setIsMounted] = useState3(false);
  useEffect3(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  if (!isOpen || !isMounted) return null;
  return createPortal(
    /* @__PURE__ */ jsxs3("div", { className: "fixed inset-0 z-[9999] flex items-center justify-center", children: [
      /* @__PURE__ */ jsx3(
        "div",
        {
          className: "fixed inset-0 bg-black/50",
          onClick: onClose,
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsxs3("div", { className: "relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-80 max-w-[90vw] z-10", children: [
        /* @__PURE__ */ jsx3("h3", { className: "text-lg font-medium mb-2", children: title }),
        /* @__PURE__ */ jsx3("p", { className: "text-gray-500 dark:text-gray-400 mb-4", children: message }),
        /* @__PURE__ */ jsxs3("div", { className: "flex justify-end gap-3", children: [
          /* @__PURE__ */ jsx3(
            "button",
            {
              onClick: onClose,
              className: "px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer",
              children: cancelText
            }
          ),
          /* @__PURE__ */ jsx3(
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
import { Fragment as Fragment3, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect4;
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
  streamingText = "NAIA is working on it...",
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
  const [conversations, setConversations] = useState4([]);
  const [selectedConversationId, setSelectedConversationId] = useState4(null);
  const [selectedConversation, setSelectedConversation] = useState4(null);
  const [isLoading, setIsLoading] = useState4(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState4(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState4(false);
  const [pendingDeleteId, setPendingDeleteId] = useState4(null);
  const [sidebarOpen, setSidebarOpen] = useState4(true);
  const [titleInput, setTitleInput] = useState4("");
  const [isSavingTitle, setIsSavingTitle] = useState4(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState4(false);
  const [conversationToRename, setConversationToRename] = useState4(null);
  const [theme, setTheme] = useState4(propTheme);
  const [agentId] = useState4(propAgentId);
  const [initialAssistantIdChecked] = useState4(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState4(false);
  const [openMenuId, setOpenMenuId] = useState4(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState4(false);
  const [sidebarWidth, setSidebarWidth] = useState4(250);
  const [isResizing, setIsResizing] = useState4(false);
  const titleInputRef = useRef2(null);
  const resizeHandleRef = useRef2(null);
  const hasFetchedRef = useRef2(false);
  const minSidebarWidth = 200;
  const maxSidebarWidth = 600;
  useEffect4(() => {
    if (propLocalDebug) {
      configureChatClient(propLocalDebug);
    }
  }, [propLocalDebug]);
  const applyTheme = useCallback2((newTheme) => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.remove("light");
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
    localStorage.setItem("theme", newTheme);
  }, []);
  useEffect4(() => {
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
  useEffect4(() => {
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
  const categorizeConversationsByDate = useCallback2(
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
  useEffect4(() => {
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
  const selectConversation = useCallback2((id) => {
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
  const handleThreadCreated = useCallback2(
    (oldId, newId, backendConversation) => {
      startTransition2(() => {
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
  useEffect4(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    !initialLoadComplete && /* @__PURE__ */ jsx4("div", { className: "fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs4("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx4("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" }),
      /* @__PURE__ */ jsx4("p", { className: "text-gray-500 dark:text-gray-400", children: "Loading..." })
    ] }) }),
    /* @__PURE__ */ jsxs4("div", { className: "flex h-screen overflow-hidden bg-white dark:bg-gray-900", children: [
      /* @__PURE__ */ jsx4("style", { children: `
        .resize-active {
          cursor: col-resize;
          user-select: none;
        }
      ` }),
      /* @__PURE__ */ jsx4(
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
      isRenameDialogOpen && /* @__PURE__ */ jsx4("div", { className: "fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs4("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-120 max-w-[90vw]", children: [
        /* @__PURE__ */ jsx4("h3", { className: "text-lg font-medium mb-4 text-gray-900 dark:text-gray-100", children: "Rename Conversation" }),
        /* @__PURE__ */ jsx4(
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
        /* @__PURE__ */ jsxs4("div", { className: "flex justify-end gap-2 mt-4", children: [
          /* @__PURE__ */ jsx4(
            "button",
            {
              onClick: handleCancelRename,
              disabled: isSavingTitle,
              className: "px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx4(
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
      /* @__PURE__ */ jsx4(AnimatePresence2, { children: sidebarOpen && /* @__PURE__ */ jsx4(
        motion2.div,
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
      /* @__PURE__ */ jsx4(AnimatePresence2, { children: sidebarOpen && /* @__PURE__ */ jsx4(
        motion2.div,
        {
          initial: { width: 0, opacity: 0 },
          animate: { width: sidebarWidth, opacity: 1 },
          exit: { width: 0, opacity: 0 },
          transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          },
          className: "bg-[#f9f9f9] dark:bg-gray-900 dark:!bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full relative z-20 overflow-hidden",
          children: /* @__PURE__ */ jsx4("div", { className: "flex flex-col h-full", children: /* @__PURE__ */ jsx4(
            "div",
            {
              className: "flex-1 overflow-y-auto p-2",
              style: {
                backgroundColor: theme === "dark" ? sidebarBackgroundColorDark : sidebarBackgroundColor
              },
              children: /* @__PURE__ */ jsx4("div", { className: "flex-1", children: isLoading ? /* @__PURE__ */ jsx4("div", { className: "space-y-4" }) : conversations.length > 0 ? /* @__PURE__ */ jsx4("div", { className: "space-y-0", children: (() => {
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
                    return /* @__PURE__ */ jsxs4(
                      "div",
                      {
                        className: "mb-4",
                        children: [
                          /* @__PURE__ */ jsx4("div", { className: "text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide", children: groupName }),
                          /* @__PURE__ */ jsx4("div", { className: "space-y-0", children: groupConversations.map(
                            (conversation) => {
                              var _a;
                              const hasWaitingMessages = conversation.waiting === true || ((_a = conversation.messages) == null ? void 0 : _a.some(
                                (message) => message.waiting === true
                              )) || false;
                              return /* @__PURE__ */ jsxs4(
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
                                    /* @__PURE__ */ jsx4("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2", children: [
                                      /* @__PURE__ */ jsx4("div", { className: "font-medium overflow-hidden text-ellipsis whitespace-nowrap", children: conversation.title || "New Chat" }),
                                      hasWaitingMessages && /* @__PURE__ */ jsx4("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx4(
                                        "div",
                                        {
                                          className: "w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse",
                                          title: "Waiting for input"
                                        }
                                      ) })
                                    ] }) }),
                                    !conversation.isTemporary && /* @__PURE__ */ jsxs4("div", { className: "relative", children: [
                                      /* @__PURE__ */ jsx4(
                                        "button",
                                        {
                                          onClick: (e) => toggleConversationMenu(
                                            e,
                                            conversation.id
                                          ),
                                          className: "p-1.5 cursor-pointer rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 opacity-0 hover:bg-gray-300 dark:hover:bg-gray-700 group-hover:opacity-100 transition-opacity",
                                          "aria-label": "More options",
                                          children: /* @__PURE__ */ jsx4(
                                            MoreHorizontal,
                                            {
                                              size: 16
                                            }
                                          )
                                        }
                                      ),
                                      openMenuId === conversation.id && /* @__PURE__ */ jsxs4("div", { className: "absolute right-0 top-10 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 p-2", children: [
                                        /* @__PURE__ */ jsxs4(
                                          "button",
                                          {
                                            onClick: (e) => handleRenameClick(
                                              e,
                                              conversation
                                            ),
                                            className: "w-full text-left px-3 py-2 text-md flex cursor-pointer items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md",
                                            children: [
                                              /* @__PURE__ */ jsx4(
                                                Edit,
                                                {
                                                  size: 14
                                                }
                                              ),
                                              "Rename"
                                            ]
                                          }
                                        ),
                                        /* @__PURE__ */ jsxs4(
                                          "button",
                                          {
                                            onClick: (e) => handleDeleteClick(
                                              e,
                                              conversation.id
                                            ),
                                            className: "w-full text-left px-3 py-2 text-md text-red-600 cursor-pointer flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md",
                                            children: [
                                              /* @__PURE__ */ jsx4(
                                                Trash2,
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
              })() }) : /* @__PURE__ */ jsx4("div", { className: "text-center py-8 text-gray-500", children: "No conversations yet" }) })
            }
          ) })
        }
      ) }),
      /* @__PURE__ */ jsx4(AnimatePresence2, { children: sidebarOpen && /* @__PURE__ */ jsx4(
        motion2.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.3 },
          children: /* @__PURE__ */ jsx4(
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
      /* @__PURE__ */ jsxs4("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
        /* @__PURE__ */ jsxs4(
          "header",
          {
            className: "h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4",
            style: {
              backgroundColor: theme === "dark" ? headerBackgroundColorDark : headerBackgroundColor
            },
            children: [
              /* @__PURE__ */ jsx4("div", { className: "flex items-center", children: /* @__PURE__ */ jsxs4(Fragment3, { children: [
                /* @__PURE__ */ jsx4(
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
                    children: sidebarOpen ? /* @__PURE__ */ jsx4(PanelRightOpen, { size: 20 }) : /* @__PURE__ */ jsx4(PanelRightClose, { size: 20 })
                  }
                ),
                /* @__PURE__ */ jsx4(
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
                    children: /* @__PURE__ */ jsx4(MessageCirclePlus, { size: 20 })
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsx4("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx4("div", { className: "relative flex items-center", children: /* @__PURE__ */ jsx4("span", { className: "text-2xl font-bold mr-1", children: propTitle }) }) }),
              /* @__PURE__ */ jsx4("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx4(
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
                  children: theme === "dark" ? /* @__PURE__ */ jsx4(Sun, { size: 20 }) : /* @__PURE__ */ jsx4(Moon, { size: 20 })
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ jsx4(
          "div",
          {
            className: `flex-1 overflow-hidden bg-white dark:bg-gray-900 text-lg transition-all duration-300 ${false ? "flex" : "flex justify-center"}`,
            children: /* @__PURE__ */ jsx4(
              "div",
              {
                className: `flex flex-col transition-all duration-300 ${false ? "w-full" : "w-full max-w-6xl"}`,
                children: isLoading || !initialAssistantIdChecked ? /* @__PURE__ */ jsx4("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsx4("div", { className: "animate-pulse text-gray-500", children: isLoading ? "Loading conversations..." : "Initializing Assistant..." }) }) : !agentId ? /* @__PURE__ */ jsxs4("div", { className: "flex h-full flex-col items-center justify-center p-4 text-center", children: [
                  /* @__PURE__ */ jsx4("h2", { className: "text-xl font-semibold text-red-600 dark:text-red-400 mb-2", children: "Agent Not Configured" }),
                  /* @__PURE__ */ jsxs4("p", { className: "text-gray-700 dark:text-gray-300 max-w-md", children: [
                    "The Agent ID is missing or invalid. Please ensure it is provided in the URL parameters (e.g.,",
                    " ",
                    /* @__PURE__ */ jsx4("code", { children: "?agentId=your-id-here" }),
                    ")."
                  ] }),
                  /* @__PURE__ */ jsx4("p", { className: "text-gray-500 dark:text-gray-400 mt-4 text-sm", children: "If you continue to see this message, please contact support." })
                ] }) : isLoadingMessages && selectedConversationId ? /* @__PURE__ */ jsx4("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsx4("div", { className: "animate-pulse text-gray-500", children: "Loading messages..." }) }) : selectedConversation ? /* @__PURE__ */ jsx4(
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
                  /* @__PURE__ */ jsx4("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsx4("div", { className: "animate-pulse text-gray-500", children: isCreatingConversation ? "Creating new conversation..." : conversations.length === 0 ? "Creating new conversation..." : "Loading conversation..." }) })
                )
              }
            )
          }
        )
      ] })
    ] })
  ] });
}
export {
  NeptuneChatBot,
  ToolExecutionIndicator,
  ToolExecutionWidget,
  configureChatClient
};
