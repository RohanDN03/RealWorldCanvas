
import { ReactNode } from "react";

export function IconButton({
    icon,
    onClick,
    activated,
    tooltip,
    theme = "dark"
}: {
    icon: ReactNode;
    onClick: () => void;
    activated: boolean;
    tooltip?: string;
    theme?: "light" | "dark";
}) {
    return (
        <button
            className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all flex-shrink-0 ${
                activated
                    ? "bg-purple-600 text-white"
                    : theme === "dark"
                        ? "text-neutral-400 hover:text-white hover:bg-neutral-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
            onClick={onClick}
            title={tooltip}
        >
            {icon}
        </button>
    );
}