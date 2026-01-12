import { useState, memo } from "react";
import { ChevronDown, ChevronRight, Database } from "lucide-react";

export interface VectorResult {
    rowId: string;
    similarity: string;
    template: string;
    entityName: string;
    data: Record<string, any>;
}

interface VectorResultsProps {
    vectors: VectorResult[];
    theme?: "light" | "dark";
    vectorColor?: string;
    vectorColorDark?: string;
}

function generateColorVariations(baseColor: string, isDark: boolean) {
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (isDark) {
        return {
            bg: `rgba(${r}, ${g}, ${b}, 0.15)`,           // Very light bg
            bgHover: `rgba(${r}, ${g}, ${b}, 0.25)`,      // Hover bg
            border: `rgba(${r}, ${g}, ${b}, 0.4)`,        // Border
            icon: `rgba(${r}, ${g}, ${b}, 0.8)`,          // Icon/accent
            textPrimary: `rgb(${Math.min(r + 100, 255)}, ${Math.min(g + 100, 255)}, ${Math.min(b + 100, 255)})`, // Light text
            textSecondary: `rgb(${Math.min(r + 60, 255)}, ${Math.min(g + 60, 255)}, ${Math.min(b + 60, 255)})`,  // Medium text
            badge: `rgba(${r}, ${g}, ${b}, 0.5)`,         // Badge bg
            badgeText: `rgb(${Math.min(r + 80, 255)}, ${Math.min(g + 80, 255)}, ${Math.min(b + 80, 255)})`,      // Badge text
            itemBg: `rgba(${r}, ${g}, ${b}, 0.1)`,        // Item background
            itemBorder: `rgba(${r}, ${g}, ${b}, 0.35)`,   // Item border
            itemHover: `rgba(${r}, ${g}, ${b}, 0.18)`,    // Item hover
        };
    } else {
        return {
            bg: `rgb(${Math.min(r + 220, 255)}, ${Math.min(g + 220, 255)}, ${Math.min(b + 220, 255)})`,          // Very light bg
            bgHover: `rgb(${Math.min(r + 200, 255)}, ${Math.min(g + 200, 255)}, ${Math.min(b + 200, 255)})`,     // Hover bg
            border: `rgb(${Math.min(r + 150, 255)}, ${Math.min(g + 150, 255)}, ${Math.min(b + 150, 255)})`,      // Border
            icon: `rgb(${Math.max(r - 50, 0)}, ${Math.max(g - 50, 0)}, ${Math.max(b - 50, 0)})`,                 // Icon/accent
            textPrimary: `rgb(${Math.max(r - 120, 0)}, ${Math.max(g - 120, 0)}, ${Math.max(b - 120, 0)})`,       // Dark text
            textSecondary: `rgb(${Math.max(r - 80, 0)}, ${Math.max(g - 80, 0)}, ${Math.max(b - 80, 0)})`,        // Medium text
            badge: `rgb(${Math.min(r + 150, 255)}, ${Math.min(g + 150, 255)}, ${Math.min(b + 150, 255)})`,       // Badge bg
            badgeText: `rgb(${Math.max(r - 90, 0)}, ${Math.max(g - 90, 0)}, ${Math.max(b - 90, 0)})`,            // Badge text
            itemBg: `rgb(255, 255, 255)`,                 // Item background (white)
            itemBorder: `rgb(${Math.min(r + 150, 255)}, ${Math.min(g + 150, 255)}, ${Math.min(b + 150, 255)})`, // Item border
            itemHover: `rgb(${Math.min(r + 210, 255)}, ${Math.min(g + 210, 255)}, ${Math.min(b + 210, 255)})`,  // Item hover
        };
    }
}

export const VectorResults = memo(({ vectors, theme = "light", vectorColor, vectorColorDark }: VectorResultsProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!vectors || vectors.length === 0) {
        return null;
    }

    const isDark = theme === "dark";

    const defaultLightColor = "#9333EA";
    const defaultDarkColor = "#A855F7";

    const baseColor = isDark
        ? (vectorColorDark || defaultDarkColor)
        : (vectorColor || defaultLightColor);

    const colors = generateColorVariations(baseColor, isDark);

    return (
        <div
            className="my-4 border rounded-lg overflow-hidden"
            style={{
                backgroundColor: colors.bg,
                borderColor: colors.border
            }}
        >
            {}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between transition-colors"
                style={{
                    backgroundColor: isExpanded ? colors.bgHover : 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isExpanded ? colors.bgHover : 'transparent'}
            >
                <div className="flex items-center gap-3">
                    <Database
                        size={20}
                        style={{ color: colors.icon }}
                    />
                    <div className="text-left">
                        <div
                            className="font-semibold"
                            style={{ color: colors.textPrimary }}
                        >
                            Vector Search Results
                        </div>
                        <div
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                        >
                            {vectors.length} {vectors.length === 1 ? 'result' : 'results'} found
                        </div>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronDown
                        size={20}
                        style={{ color: colors.icon }}
                    />
                ) : (
                    <ChevronRight
                        size={20}
                        style={{ color: colors.icon }}
                    />
                )}
            </button>

            {}
            {isExpanded && (
                <div
                    className="border-t"
                    style={{ borderColor: colors.border }}
                >
                    <div className="p-4 space-y-3">
                        {vectors.map((vector, index) => (
                            <VectorResultItem
                                key={vector.rowId || index}
                                vector={vector}
                                theme={theme}
                                colors={colors}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

VectorResults.displayName = "VectorResults";

const VectorResultItem = memo(
    ({ vector, theme, colors }: { vector: VectorResult; theme?: "light" | "dark"; colors: any }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const similarityPercentage = (parseFloat(vector.similarity) * 100).toFixed(1);

        return (
            <div
                className="border rounded-lg"
                style={{
                    backgroundColor: colors.itemBg,
                    borderColor: colors.itemBorder
                }}
            >
                {}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full px-3 py-2 flex items-center justify-between transition-colors rounded-t-lg"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.itemHover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                            <span
                                className="text-sm font-medium"
                                style={{ color: colors.textPrimary }}
                            >
                                {vector.entityName}
                            </span>
                            <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: colors.badge,
                                    color: colors.badgeText
                                }}
                            >
                                {similarityPercentage}% match
                            </span>
                        </div>
                        <div className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                            {vector.template}
                        </div>
                    </div>
                    {isExpanded ? (
                        <ChevronDown
                            size={16}
                            style={{ color: colors.icon }}
                        />
                    ) : (
                        <ChevronRight
                            size={16}
                            style={{ color: colors.icon }}
                        />
                    )}
                </button>

                {}
                {isExpanded && (
                    <div
                        className="border-t px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg"
                        style={{ borderColor: colors.itemBorder }}
                    >
                        <div className="space-y-2">
                            {Object.entries(vector.data).map(([key, value]) => {
                                if (
                                    key === "id" ||
                                    key === "createdAt" ||
                                    key === "updatedAt" ||
                                    key === "createdBy" ||
                                    key === "updatedBy"
                                ) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={key}
                                        className="flex items-start gap-2 text-sm"
                                    >
                                        <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                                            {key}:
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {typeof value === "object"
                                                ? JSON.stringify(value)
                                                : String(value)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    },
);

VectorResultItem.displayName = "VectorResultItem";
