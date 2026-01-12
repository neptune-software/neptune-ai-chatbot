import {
  __spreadProps,
  __spreadValues
} from "./chunk-FWCSY2DS.mjs";

// app/components/chart-component.tsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import {
  Line,
  Bar,
  Pie,
  Doughnut,
  Scatter,
  Radar,
  Bubble,
  PolarArea
} from "react-chartjs-2";
import { useState, useEffect, useRef } from "react";
import { Component } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);
var ChartErrorBoundary = class extends Component {
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
function ChartComponent({
  type,
  data,
  theme
}) {
  const [error, setError] = useState(null);
  const [chartOptions, setChartOptions] = useState({});
  const [isRecovering, setIsRecovering] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const recoveryTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const readyTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
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
  useEffect(() => {
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
  useEffect(() => {
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
  useEffect(() => {
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
  useEffect(() => {
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
      return /* @__PURE__ */ jsxs("div", { className: "p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-5 w-5",
              viewBox: "0 0 20 20",
              fill: "currentColor",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  fillRule: "evenodd",
                  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
                  clipRule: "evenodd"
                }
              )
            }
          ),
          /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Chart rendering failed" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "ml-8 text-sm mb-3", children: "The chart could not be rendered due to a technical error." }),
        /* @__PURE__ */ jsx(
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
          return /* @__PURE__ */ jsx(
            Line,
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
          return /* @__PURE__ */ jsx(
            Bar,
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
          return /* @__PURE__ */ jsx(
            Pie,
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
          return /* @__PURE__ */ jsx(
            Doughnut,
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
          return /* @__PURE__ */ jsx(
            PolarArea,
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
          return /* @__PURE__ */ jsx(
            Scatter,
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
          return /* @__PURE__ */ jsx(
            Bubble,
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
          return /* @__PURE__ */ jsx(
            Radar,
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
          return /* @__PURE__ */ jsx(
            Line,
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
          return /* @__PURE__ */ jsxs("div", { className: "p-6 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 rounded-lg border border-amber-100 dark:border-amber-800 w-full max-w-full", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  className: "h-5 w-5",
                  viewBox: "0 0 20 20",
                  fill: "currentColor",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      fillRule: "evenodd",
                      d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z",
                      clipRule: "evenodd"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxs("p", { children: [
                "Unsupported chart type: ",
                type
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm mt-2 ml-8", children: "Supported types: line, bar, pie, doughnut, polararea, scatter, bubble, radar, area" })
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
  const ErrorFallback = () => /* @__PURE__ */ jsx("div", { className: "w-full h-64 md:h-96 max-w-full overflow-hidden flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800", children: /* @__PURE__ */ jsxs("div", { className: "text-center p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-3 mb-3 text-red-600 dark:text-red-300", children: [
      /* @__PURE__ */ jsx(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-8 w-8",
          viewBox: "0 0 20 20",
          fill: "currentColor",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              fillRule: "evenodd",
              d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
              clipRule: "evenodd"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx("h3", { className: "font-medium text-lg", children: "Chart Error" })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-600 dark:text-red-300 mb-4", children: [
      "Something went wrong while rendering the ",
      type,
      " chart."
    ] }),
    /* @__PURE__ */ jsx(
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
      return /* @__PURE__ */ jsxs("div", { className: "p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800 w-full max-w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-5 w-5",
              viewBox: "0 0 20 20",
              fill: "currentColor",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  fillRule: "evenodd",
                  d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
                  clipRule: "evenodd"
                }
              )
            }
          ),
          /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Chart data issue" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "ml-8 text-sm mb-3", children: error }),
        /* @__PURE__ */ jsx(
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
      return /* @__PURE__ */ jsx("div", { className: "w-full h-64 md:h-96 max-w-full overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "text-gray-500 dark:text-gray-400", children: [
        /* @__PURE__ */ jsxs(
          "svg",
          {
            className: "animate-spin h-8 w-8 mx-auto mb-2",
            fill: "none",
            viewBox: "0 0 24 24",
            children: [
              /* @__PURE__ */ jsx(
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
              /* @__PURE__ */ jsx(
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
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: isRecovering ? "Recovering chart..." : "Initializing chart..." })
      ] }) });
    }
    try {
      return /* @__PURE__ */ jsx(
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
          children: /* @__PURE__ */ jsx(
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
      return /* @__PURE__ */ jsx(ErrorFallback, {});
    }
  };
  try {
    return /* @__PURE__ */ jsx(ChartErrorBoundary, { fallback: /* @__PURE__ */ jsx(ErrorFallback, {}), children: /* @__PURE__ */ jsx(MainChart, {}) });
  } catch (err) {
    console.error("Error rendering chart:", err);
    return /* @__PURE__ */ jsx(ErrorFallback, {});
  }
}
export {
  ChartComponent as default
};
