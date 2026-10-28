import { clsx } from "clsx";
import type React from "react";
import { twMerge } from "tailwind-merge";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?:
		| "olive"
		| "gold"
		| "success"
		| "warning"
		| "info"
		| "neutral"
		| "danger";
	size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
	children,
	className,
	variant = "neutral",
	size = "md",
	...props
}) => {
	const baseStyles =
		"inline-flex items-center font-medium rounded-full select-none";

	const variants = {
		olive: "bg-[#75834a]/15 text-[#566432] border border-[#75834a]/25",
		gold: "bg-[#d2ae54]/15 text-[#967727] border border-[#d2ae54]/30",
		success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
		warning: "bg-amber-50 text-amber-700 border border-amber-200",
		info: "bg-sky-50 text-sky-700 border border-sky-200",
		neutral: "bg-slate-100 text-slate-700 border border-slate-200",
		danger: "bg-rose-50 text-rose-700 border border-rose-200",
	};

	const sizes = {
		sm: "text-[11px] px-2 py-0.5 gap-1",
		md: "text-xs px-2.5 py-1 gap-1.5",
	};

	return (
		<span
			className={twMerge(
				clsx(baseStyles, variants[variant], sizes[size], className),
			)}
			{...props}
		>
			{children}
		</span>
	);
};
