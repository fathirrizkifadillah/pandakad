import type React from "react";
import { Card } from "./Card";

interface StatCardProps {
	label: string;
	value: string | number;
	subtext?: string;
	icon: React.ReactNode;
	trend?: {
		text: string;
		isPositive?: boolean;
	};
	accentColor?: "olive" | "gold" | "blue" | "purple";
}

export const StatCard: React.FC<StatCardProps> = ({
	label,
	value,
	subtext,
	icon,
	trend,
	accentColor = "olive",
}) => {
	const iconBgs = {
		olive: "bg-[#75834a]/10 text-[#75834a]",
		gold: "bg-[#d2ae54]/15 text-[#b39138]",
		blue: "bg-sky-50 text-sky-600",
		purple: "bg-purple-50 text-purple-600",
	};

	return (
		<Card className="hover:shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-xs font-medium tracking-wide uppercase text-slate-500">
						{label}
					</p>
					<p className="mt-1.5 text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
						{value}
					</p>
					{subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
					{trend && (
						<p
							className={`mt-2 text-xs font-medium inline-flex items-center gap-1 ${
								trend.isPositive ? "text-emerald-600" : "text-slate-500"
							}`}
						>
							{trend.text}
						</p>
					)}
				</div>
				<div className={`p-3 rounded-xl shrink-0 ${iconBgs[accentColor]}`}>
					{icon}
				</div>
			</div>
		</Card>
	);
};
