import { Plus, Search, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { mockUsersManagement } from "../../mock/academicData";
import type { Role, UserManagementItem } from "../../types";

export const ManajemenUser: React.FC = () => {
	const [users, setUsers] = useState<UserManagementItem[]>(mockUsersManagement);
	const [filterRole, setFilterRole] = useState<"Semua" | Role>("Semua");
	const [searchQuery, setSearchQuery] = useState("");

	const filteredUsers = users.filter((u) => {
		const matchRole = filterRole === "Semua" || u.role === filterRole;
		const matchSearch =
			u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			u.identifier.includes(searchQuery) ||
			u.email.toLowerCase().includes(searchQuery.toLowerCase());
		return matchRole && matchSearch;
	});

	const handleAddUser = () => {
		const name = prompt("Masukkan Nama Lengkap:");
		if (!name) return;
		const identifier = prompt("Masukkan NIM/NIDN/NIP:");
		if (!identifier) return;

		const newUser: UserManagementItem = {
			id: `u_${Date.now()}`,
			name,
			role: "Mahasiswa",
			identifier,
			email: `${name.toLowerCase().replace(/\s+/g, ".")}@student.unpanda.ac.id`,
			prodi: "Teknik Informatika",
			status: "Aktif",
		};
		setUsers([newUser, ...users]);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
						Manajemen Pengguna & Akun
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Kelola data akun mahasiswa, dosen, dan staf administrasi sistem
						akademik UNPANDA.
					</p>
				</div>

				<Button
					variant="primary"
					size="sm"
					onClick={handleAddUser}
					leftIcon={<Plus className="w-4 h-4" />}
				>
					Tambah Pengguna Baru
				</Button>
			</div>

			<Card padded={false} className="overflow-hidden">
				{/* Filter and Search Bar */}
				<div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						{(["Semua", "Mahasiswa", "Dosen", "Admin"] as const).map((r) => (
							<button
								key={r}
								type="button"
								onClick={() => setFilterRole(r)}
								className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
									filterRole === r
										? "bg-[#75834a] text-white shadow-2xs"
										: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
								}`}
							>
								{r}
							</button>
						))}
					</div>

					<div className="relative w-full sm:w-64">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Cari nama, NIM, atau email..."
							className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-[#75834a]"
						/>
					</div>
				</div>

				{/* User Table */}
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse text-xs sm:text-sm">
						<thead>
							<tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
								<th className="py-3 px-4">Nama & Email</th>
								<th className="py-3 px-3">Role</th>
								<th className="py-3 px-3">Identitas (NIM/NIDN/NIP)</th>
								<th className="py-3 px-3">Unit / Program Studi</th>
								<th className="py-3 px-3 text-center">Status</th>
								<th className="py-3 px-4 text-center">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200/80">
							{filteredUsers.map((u) => (
								<tr
									key={u.id}
									className="hover:bg-slate-50/80 transition-colors"
								>
									<td className="py-3.5 px-4">
										<span className="font-bold text-slate-900 block">
											{u.name}
										</span>
										<span className="text-[11px] font-mono text-slate-500">
											{u.email}
										</span>
									</td>
									<td className="py-3.5 px-3">
										<Badge
											variant={
												u.role === "Admin"
													? "gold"
													: u.role === "Dosen"
														? "olive"
														: "neutral"
											}
										>
											{u.role}
										</Badge>
									</td>
									<td className="py-3.5 px-3 font-mono font-medium text-slate-800">
										{u.identifier}
									</td>
									<td className="py-3.5 px-3 text-slate-600">{u.prodi}</td>
									<td className="py-3.5 px-3 text-center">
										<Badge
											variant={u.status === "Aktif" ? "success" : "danger"}
										>
											{u.status}
										</Badge>
									</td>
									<td className="py-3.5 px-4 text-center">
										<button
											type="button"
											onClick={() =>
												setUsers(users.filter((item) => item.id !== u.id))
											}
											className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
											title="Hapus akun"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
};
