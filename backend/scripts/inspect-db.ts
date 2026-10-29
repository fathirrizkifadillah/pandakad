import { prisma } from "../src/lib/prisma.js";

async function run() {
	const tables = (await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `)) as Array<{ table_name: string }>;

	console.log("\n📊 DAFTAR TABEL & JUMLAH BARIS DI DATABASE 'akademik_dev':");
	console.log("----------------------------------------------------------");
	for (const t of tables) {
		const countResult = (await prisma.$queryRawUnsafe(
			`SELECT COUNT(*)::int as count FROM "${t.table_name}"`,
		)) as Array<{ count: number }>;
		console.log(
			`• ${t.table_name.padEnd(25)} : ${countResult[0]?.count ?? 0} rows`,
		);
	}
	console.log("----------------------------------------------------------\n");

	process.exit(0);
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
