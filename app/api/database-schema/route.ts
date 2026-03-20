import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL not configured" },
        { status: 400 }
      );
    }

    const pool = new Pool({
      connectionString: databaseUrl,
    });

    // Get all tables and their columns
    const tablesQuery = `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;

    // Get primary keys - simple and robust
    const pkQuery = `
      SELECT DISTINCT
        kcu.table_name,
        kcu.column_name
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
        AND kcu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND kcu.table_schema = 'public'
      ORDER BY kcu.table_name, kcu.ordinal_position;
    `;

    // Get foreign keys - simple and robust
    const fkQuery = `
      SELECT 
        kcu.table_name,
        kcu.column_name,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
        AND kcu.table_schema = tc.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND kcu.table_schema = 'public'
      ORDER BY kcu.table_name, kcu.column_name;
    `;

    // Get indexes - simple and robust
    const indexQuery = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `;

    const [tablesResult, pkResult, fkResult, indexResult] = await Promise.all([
      pool.query(tablesQuery),
      pool.query(pkQuery).catch(e => {
        console.warn("PK query failed:", e.message);
        return { rows: [] };
      }),
      pool.query(fkQuery).catch(e => {
        console.warn("FK query failed:", e.message);
        return { rows: [] };
      }),
      pool.query(indexQuery).catch(e => {
        console.warn("Index query failed:", e.message);
        return { rows: [] };
      }),
    ]);

    // Group columns by table
    const tables: Record<string, any> = {};

    tablesResult.rows.forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = {
          name: row.table_name,
          columns: [],
          primaryKeys: [],
          foreignKeys: [],
          indexes: [],
        };
      }

      tables[row.table_name].columns.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === "YES",
        default: row.column_default,
      });
    });

    // Add primary keys
    pkResult.rows.forEach(row => {
      if (tables[row.table_name]) {
        tables[row.table_name].primaryKeys.push(row.column_name);
      }
    });

    // Add foreign keys
    fkResult.rows.forEach(row => {
      if (tables[row.table_name]) {
        tables[row.table_name].foreignKeys.push({
          column: row.column_name,
          referencedTable: row.referenced_table,
          referencedColumn: row.referenced_column,
        });
      }
    });

    // Add indexes
    indexResult.rows.forEach(row => {
      if (tables[row.tablename]) {
        tables[row.tablename].indexes.push({
          name: row.indexname,
          definition: row.indexdef,
        });
      }
    });

    await pool.end();

    return NextResponse.json({
      tables: Object.values(tables),
      totalTables: Object.keys(tables).length,
    });
  } catch (error) {
    console.error("Database schema fetch error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch schema",
      },
      { status: 500 }
    );
  }
}
