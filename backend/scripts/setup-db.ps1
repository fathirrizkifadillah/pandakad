# Script Setup Database Lokal PostgreSQL UNPANDA
# Menyiapkan role unpanda_app, database akademik_dev, dan akademik_test

$ErrorActionPreference = "Stop"

$PGUSER = if ($env:PGUSER) { $env:PGUSER } else { "postgres" }
$PGHOST = if ($env:PGHOST) { $env:PGHOST } else { "127.0.0.1" }
$PGPORT = if ($env:PGPORT) { $env:PGPORT } else { "5432" }

Write-Host "===> Menyiapkan Database Lokal UNPANDA pada $PGHOST:$PGPORT (sebagai $PGUSER)..."

$initSql = @"
DO `$do`$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'unpanda_app') THEN
      CREATE ROLE unpanda_app WITH LOGIN PASSWORD 'unpanda_secure_pass_2026';
   END IF;
END
`$do`$;

SELECT 'CREATE DATABASE akademik_dev OWNER unpanda_app'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'akademik_dev')\gexec

SELECT 'CREATE DATABASE akademik_test OWNER unpanda_app'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'akademik_test')\gexec

GRANT ALL PRIVILEGES ON DATABASE akademik_dev TO unpanda_app;
GRANT ALL PRIVILEGES ON DATABASE akademik_test TO unpanda_app;
"@

$tempSqlFile = Join-Path $env:TEMP "unpanda_db_setup.sql"
Set-Content -Path $tempSqlFile -Value $initSql -Encoding UTF8

try {
    & psql -h $PGHOST -p $PGPORT -U $PGUSER -f $tempSqlFile
    Write-Host "✅ Database akademik_dev dan akademik_test berhasil disiapkan!" -ForegroundColor Green
} catch {
    Write-Error "❌ Gagal menyiapkan database: $_"
} finally {
    if (Test-Path $tempSqlFile) {
        Remove-Item -Force $tempSqlFile
    }
}
