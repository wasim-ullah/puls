#!/usr/bin/env bash
# Usage: PGHOST=... PGPORT=... PGUSER=postgres tests/run.sh
set -euo pipefail
cd "$(dirname "$0")/.."
psql -q -c 'drop database if exists puls_test' -c 'create database puls_test'
for f in tests/supabase_stubs.sql migrations/*.sql seed.sql; do
  psql -q -v ON_ERROR_STOP=1 -d puls_test -f "$f" > /dev/null
done
psql -q -v ON_ERROR_STOP=1 -d puls_test -f tests/test_rules.sql 2>&1 | grep -E 'PASS|FAIL|ERROR|ALL TESTS' | sed 's/^.*NOTICE:  //'
