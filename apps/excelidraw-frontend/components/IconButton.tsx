// import { ReactNode } from "react";

// export function IconButton({
//     icon, onClick, activated
// }: {
//     icon: ReactNode,
//     onClick: () => void,
//     activated: boolean
// }) {
//     return <div className={`m-2 pointer rounded-full border p-2 bg-black hover:bg-gray ${activated ? "text-red-400" : "text-white"}`} onClick={onClick}>
//         {icon}
//     </div>
// }
import { ReactNode } from "react";

export function IconButton({
    icon,
    onClick,
    activated,
    tooltip
}: {
    icon: ReactNode;
    onClick: () => void;
    activated: boolean;
    tooltip?: string;
}) {
    return (
        <button
            className={`p-2 rounded-lg transition-all ${
                activated
                    ? "bg-purple-600 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
            onClick={onClick}
            title={tooltip}
        >
            {icon}
        </button>
    );
}