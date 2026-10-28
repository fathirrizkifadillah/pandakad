import { clsx } from "clsx";
import type React from "react";
import { twMerge } from "tailwind-merge";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
	children,
	className,
	padded = true,
	...props
}) => {
	return (
		<div
			className={twMerge(
				clsx(
					"bg-white border border-[#e2e8f0] rounded-xl shadow-xs transition-shadow duration-150",
					padded && "p-5 sm:p-6",
					className,
				),
			)}
			{...props}
		>
			{children}
		</div>
	);
};
