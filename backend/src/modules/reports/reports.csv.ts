/**
 * Utilitas pembuatan dan sanitasi CSV sesuai standar RFC 4180
 * dilengkapi proteksi Spreadsheet Formula Injection (CSV Injection).
 */

export function sanitizeCsvCell(value: unknown): string {
	if (value === null || value === undefined) {
		return "";
	}

	let str = String(value);

	// 1. Mitigasi CSV Formula Injection (DDE Attack):
	// Jika cell diawali dengan karakter =, +, -, @, \t, atau \r, berikan prefix petik tunggal (')
	// agar aplikasi spreadsheet (Excel, LibreOffice, Google Sheets) membacanya sebagai teks murni.
	if (/^[=+\-@\t\r]/.test(str)) {
		str = `'${str}`;
	}

	// 2. Standar RFC 4180:
	// Jika terdapat tanda kutip ganda, koma, atau baris baru, bungkus dengan tanda kutip ganda
	// dan ubah setiap karakter " internal menjadi dua buah "" berurutan.
	if (
		str.includes(",") ||
		str.includes('"') ||
		str.includes("\n") ||
		str.includes("\r")
	) {
		return `"${str.replace(/"/g, '""')}"`;
	}

	return str;
}

export function buildCsv(
	headers: string[],
	rows: Array<Array<unknown>>,
): string {
	const headerLine = headers.map(sanitizeCsvCell).join(",");
	const dataLines = rows.map((row) => row.map(sanitizeCsvCell).join(","));

	// Gunakan CRLF (\r\n) sesuai spesifikasi RFC 4180
	return [headerLine, ...dataLines].join("\r\n");
}
