import { Calendar, Clock, Download, MapPin, User } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { mockJadwalMahasiswa } from "../../mock/academicData";
import { studentApi } from "../../services/api/student";
import type { JadwalKuliahItem } from "../../types";

export const JadwalKuliah: React.FC = () => {
	const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
	const [scheduleItems, setScheduleItems] =
		useState<JadwalKuliahItem[]>(mockJadwalMahasiswa);

	// Muat jadwal perkuliahan riil mahasiswa dari endpoint dashboard
	useEffect(() => {
		const loadSchedule = async () => {
			try {
				const res = await studentApi.getStudentDashboard();
				if (res?.enrolledClasses && res.enrolledClasses.length > 0) {
					const adapted: JadwalKuliahItem[] = [];
					for (const cls of res.enrolledClasses) {
						for (const sch of cls.schedules || []) {
							adapted.push({
								id: `${cls.classId}-${sch.dayOfWeek}`,
								kode: cls.courseCode,
								matkul: cls.courseName,
								sks: cls.sks,
								dosen: cls.lecturerName,
								ruang: sch.room,
								hari: sch.dayOfWeek,
								jam: `${sch.startTime} - ${sch.endTime}`,
								kelas: cls.classCode,
							});
						}
					}
					if (adapted.length > 0) {
						setScheduleItems(adapted);
					}
				}
			} catch {
				// Gunakan data mock jika backend offline
			}
		};
		loadSchedule();
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
						Jadwal Kuliah Mingguan
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Jadwal kegiatan belajar mengajar semester berjalan (Semester Ganjil
						2026/2027).
					</p>
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() =>
						alert("Jadwal kuliah berhasil diunduh dalam format PDF!")
					}
					leftIcon={<Download className="w-4 h-4" />}
				>
					Cetak / Unduh Jadwal
				</Button>
			</div>

			{/* Daily Schedule List */}
			<div className="space-y-4">
				{days.map((day) => {
					const classesThisDay = scheduleItems.filter((j) => j.hari === day);
					return (
						<Card key={day} padded={false} className="overflow-hidden">
							<div className="px-5 py-3.5 bg-slate-100/75 border-b border-slate-200 flex items-center justify-between">
								<span className="font-bold text-sm text-slate-900 flex items-center gap-2">
									<Calendar className="w-4 h-4 text-[#75834a]" />
									Hari {day}
								</span>
								<span className="text-xs font-semibold text-slate-500">
									{classesThisDay.length} Kelas
								</span>
							</div>

							{classesThisDay.length === 0 ? (
								<div className="p-6 text-center text-xs text-slate-400">
									Tidak ada jadwal perkuliahan pada hari ini. Waktu luang untuk
									belajar mandiri.
								</div>
							) : (
								<div className="divide-y divide-slate-100">
									{classesThisDay.map((item) => (
										<div
											key={item.id}
											className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
										>
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<span className="font-mono text-xs text-slate-500">
														{item.kode}
													</span>
													<Badge variant="olive">{item.sks} SKS</Badge>
													<Badge variant="neutral">{item.kelas}</Badge>
												</div>
												<h4 className="font-bold text-base text-slate-900">
													{item.matkul}
												</h4>
												<p className="text-xs text-slate-600 flex items-center gap-1.5">
													<User className="w-3.5 h-3.5 text-slate-400" />
													<span>{item.dosen}</span>
												</p>
											</div>

											<div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 bg-[#f6f5ef]/80 sm:bg-transparent p-2.5 sm:p-0 rounded-lg">
												<div className="flex items-center gap-1 text-xs font-bold text-[#566432]">
													<Clock className="w-3.5 h-3.5" />
													<span>{item.jam}</span>
												</div>
												<div className="flex items-center gap-1 text-xs text-slate-500">
													<MapPin className="w-3.5 h-3.5" />
													<span>{item.ruang}</span>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</Card>
					);
				})}
			</div>
		</div>
	);
};
