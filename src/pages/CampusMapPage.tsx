import type React from "react";
import { CampusMapExplorer } from "../components/map/CampusMapExplorer";

export const CampusMapPage: React.FC = () => {
	return (
		<div className="w-full h-[calc(100vh-8.5rem)] min-h-[580px] rounded-2xl overflow-hidden shadow-sm">
			<CampusMapExplorer standaloneHeader={false} />
		</div>
	);
};
