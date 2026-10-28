import { clsx } from "clsx";
import type React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "gold" | "outline" | "ghost" | "danger";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
	children,
	className,
	variant = "primary",
	size = "md",
	isLoading = false,
	leftIcon,
	rightIcon,
	disabled,
	...props
}) => {
	const baseStyles =
		"inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

	const variants = {
		primary:
			"bg-[#75834a] hover:bg-[#63703c] text-white shadow-sm focus-visible:outline-[#75834a]",
		gold: "bg-[#d2ae54] hover:bg-[#c09d43] text-white shadow-sm focus-visible:outline-[#d2ae54]",
		outline:
			"border border-[#cbd5e1] hover:border-[#94a3b8] bg-white text-[#334155] hover:bg-slate-50 focus-visible:outline-[#75834a]",
		ghost:
			"text-[#475569] hover:text-[#1e293b] hover:bg-slate-200/50 focus-visible:outline-[#75834a]",
		danger:
			"bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus-visible:outline-rose-600",
	};

	const sizes = {
		sm: "text-xs px-2.5 py-1.5 gap-1.5",
		md: "text-sm px-4 py-2 gap-2",
		lg: "text-base px-5 py-2.5 gap-2.5",
	};

	return (
		<button
			className={twMerge(
				clsx(baseStyles, variants[variant], sizes[size], className),
			)}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading ? (
				<span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
			) : (
				leftIcon
			)}
			{children}
			{!isLoading && rightIcon}
		</button>
	);
};
