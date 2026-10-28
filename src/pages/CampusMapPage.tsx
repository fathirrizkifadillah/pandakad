import type React from "react";
import { CampusMapExplorer } from "../components/map/CampusMapExplorer";

export const CampusMapPage: React.FC = () => {
	return (
		<div className="w-full h-[calc(100vh-4rem)] rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-sm">
			<CampusMapExplorer />
		</div>
	);
};
