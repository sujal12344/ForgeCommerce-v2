"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import {
  Check,
  Columns3,
  Copy,
  Database,
  Link2,
  Lock,
  Search,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
}

interface ForeignKey {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

interface IndexData {
  name: string;
  definition: string;
}

interface Table {
  name: string;
  columns: Column[];
  primaryKeys: string[];
  foreignKeys: ForeignKey[];
  indexes: IndexData[];
}

interface SchemaData {
  tables: Table[];
  totalTables: number;
}

const DataTypeColors: Record<string, { bg: string; text: string }> = {
  bigint: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
  },
  integer: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
  },
  smallint: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
  },
  text: {
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
  },
  "character varying": {
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
  },
  varchar: {
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
  },
  boolean: {
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-700 dark:text-purple-300",
  },
  timestamp: {
    bg: "bg-orange-50 dark:bg-orange-950",
    text: "text-orange-700 dark:text-orange-300",
  },
  "timestamp with time zone": {
    bg: "bg-orange-50 dark:bg-orange-950",
    text: "text-orange-700 dark:text-orange-300",
  },
  date: {
    bg: "bg-orange-50 dark:bg-orange-950",
    text: "text-orange-700 dark:text-orange-300",
  },
  uuid: {
    bg: "bg-pink-50 dark:bg-pink-950",
    text: "text-pink-700 dark:text-pink-300",
  },
  jsonb: {
    bg: "bg-indigo-50 dark:bg-indigo-950",
    text: "text-indigo-700 dark:text-indigo-300",
  },
  json: {
    bg: "bg-indigo-50 dark:bg-indigo-950",
    text: "text-indigo-700 dark:text-indigo-300",
  },
  numeric: {
    bg: "bg-cyan-50 dark:bg-cyan-950",
    text: "text-cyan-700 dark:text-cyan-300",
  },
  decimal: {
    bg: "bg-cyan-50 dark:bg-cyan-950",
    text: "text-cyan-700 dark:text-cyan-300",
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
      title="Copy"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4 text-gray-500" />
      )}
    </button>
  );
}

function DataTypeTag({ type }: { type: string }) {
  const colors = DataTypeColors[type] || {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
  };

  return (
    <code
      className={`px-2.5 py-1 rounded text-sm font-mono font-semibold border ${colors.bg} ${colors.text} border-current border-opacity-20`}
    >
      {type}
    </code>
  );
}

export default function DatabaseSchemaPage() {
  const [schema, setSchema] = useState<SchemaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await fetch("/api/database-schema");
        if (!response.ok) {
          throw new Error("Failed to fetch database schema");
        }
        const data = await response.json();
        setSchema(data);
        if (data.tables.length > 0) {
          setSelectedTable(data.tables[0].name);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, []);

  const filteredTables = useMemo(() => {
    if (!schema) return [];
    return schema.tables.filter(table =>
      table.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [schema, searchInput]);

  const selectedTableData = schema?.tables.find(t => t.name === selectedTable);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-blue-600 rounded-full opacity-20 animate-pulse"></div>
              <Loader />
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Loading schema...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Fetching database structure
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-8">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertDescription className="flex items-start gap-3">
            <span className="text-lg">❌</span>
            <div>
              <p className="font-semibold mb-1">Error Loading Schema</p>
              <p className="text-sm">{error}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!schema || schema.tables.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-8">
        <Alert>
          <AlertDescription>No tables found in database</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 p-6 md:p-8 lg:p-10 scroll-smooth">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3.5 bg-linear-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-linear-to-r from-blue-600 via-blue-700 to-cyan-700 dark:from-blue-400 dark:via-blue-500 dark:to-cyan-500 bg-clip-text text-transparent">
                Schema Explorer
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {schema.totalTables} tables •{" "}
                {schema.tables.reduce((sum, t) => sum + t.columns.length, 0)}{" "}
                columns
              </p>
            </div>
          </div>

          {/* Stats - Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total Tables",
                value: schema.totalTables,
                icon: "📊",
                color: "from-blue-500 to-blue-600",
              },
              {
                label: "Total Columns",
                value: schema.tables.reduce(
                  (sum, t) => sum + t.columns.length,
                  0
                ),
                icon: "📋",
                color: "from-purple-500 to-purple-600",
              },
              {
                label: "Primary Keys",
                value: schema.tables.reduce(
                  (sum, t) => sum + t.primaryKeys.length,
                  0
                ),
                icon: "🔑",
                color: "from-amber-500 to-amber-600",
              },
              {
                label: "Relations",
                value: schema.tables.reduce(
                  (sum, t) => sum + t.foreignKeys.length,
                  0
                ),
                icon: "🔗",
                color: "from-pink-500 to-pink-600",
              },
            ].map((stat, idx) => (
              <Card
                key={idx}
                className={`bg-linear-to-br ${stat.color} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform hover:-translate-y-1 cursor-default`}
              >
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <p className="text-white/80 text-xs mt-2 font-medium">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative group">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <Input
                placeholder="Search tables..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50"
              />
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2 max-h-96 overflow-y-auto hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
              {filteredTables.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No tables found</p>
                </div>
              ) : (
                filteredTables.map((table, idx) => (
                  <button
                    key={table.name}
                    onClick={() => setSelectedTable(table.name)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 ${
                      selectedTable === table.name
                        ? "bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-400 dark:border-blue-600 shadow-md"
                        : "bg-white dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
                    }`}
                    style={{
                      animation: `slideIn 0.3s ease-out ${idx * 30}ms backwards`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {table.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1 font-medium">
                          <div>📊 {table.columns.length} cols</div>
                          {table.primaryKeys.length > 0 && (
                            <div>🔑 {table.primaryKeys.length}</div>
                          )}
                          {table.foreignKeys.length > 0 && (
                            <div>🔗 {table.foreignKeys.length}</div>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 bg-linear-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                        <Database
                          className={`w-4 h-4 transition-all duration-300 ${selectedTable === table.name ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-600"}`}
                        />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            {selectedTableData && (
              <>
                {/* Table Header */}
                <Card className="bg-linear-to-br from-white via-blue-50 to-gray-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-gray-800/50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                          <Database className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            {selectedTableData.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            <span className="inline-flex gap-4">
                              <span>
                                {selectedTableData.columns.length}{" "}
                                <span className="text-gray-400">columns</span>
                              </span>
                              <span>•</span>
                              <span>
                                {selectedTableData.primaryKeys.length}{" "}
                                <span className="text-gray-400">PKs</span>
                              </span>
                              <span>•</span>
                              <span>
                                {selectedTableData.foreignKeys.length}{" "}
                                <span className="text-gray-400">FKs</span>
                              </span>
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <CopyButton text={selectedTableData.name} />
                    </div>
                  </CardHeader>
                </Card>

                {/* Columns Table */}
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1 transform">
                  <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <Columns3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Columns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="text-left font-bold px-4 py-3.5 text-gray-700 dark:text-gray-300">
                              Column
                            </th>
                            <th className="text-left font-bold px-4 py-3.5 text-gray-700 dark:text-gray-300">
                              Type
                            </th>
                            <th className="text-left font-bold px-4 py-3.5 text-gray-700 dark:text-gray-300">
                              Null
                            </th>
                            <th className="text-left font-bold px-4 py-3.5 text-gray-700 dark:text-gray-300">
                              Default
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {selectedTableData.columns.map((col, idx) => (
                            <tr
                              key={col.name}
                              className="hover:bg-linear-to-r hover:from-blue-50/50 hover:to-cyan-50/50 dark:hover:from-blue-900/10 dark:hover:to-cyan-900/10 transition-all duration-200"
                              style={{
                                animation: `fadeInUp 0.3s ease-out ${idx * 20}ms backwards`,
                              }}
                            >
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2">
                                  <code className="font-mono font-bold text-gray-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default">
                                    {col.name}
                                  </code>
                                  {selectedTableData.primaryKeys.includes(
                                    col.name
                                  ) && (
                                    <Badge className="bg-linear-to-r from-amber-400 to-yellow-400 text-amber-900 dark:from-amber-600 dark:to-yellow-600 dark:text-white text-xs font-bold shadow-md hover:shadow-lg transition-all">
                                      <Lock className="w-3 h-3 mr-1" />
                                      PK
                                    </Badge>
                                  )}
                                  <CopyButton text={col.name} />
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <DataTypeTag type={col.type} />
                              </td>
                              <td className="px-4 py-3.5">
                                <Badge
                                  variant="outline"
                                  className={`text-xs font-bold shadow-sm transition-all duration-200 ${
                                    col.nullable
                                      ? "bg-linear-to-r from-green-50 to-emerald-50 text-green-700 dark:from-green-950/50 dark:to-emerald-950/50 dark:text-green-300 border-green-300 dark:border-green-700"
                                      : "bg-linear-to-r from-red-50 to-pink-50 text-red-700 dark:from-red-950/50 dark:to-pink-950/50 dark:text-red-300 border-red-300 dark:border-red-700"
                                  }`}
                                >
                                  {col.nullable ? "✓ Yes" : "✗ No"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3.5">
                                {col.default ? (
                                  <code className="text-xs bg-linear-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:shadow-md transition-all duration-200 inline-block">
                                    {col.default.substring(0, 25)}
                                  </code>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-600">
                                    —
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Foreign Keys */}
                {selectedTableData.foreignKeys.length > 0 && (
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1 transform">
                    <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <Link2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        Relations ({selectedTableData.foreignKeys.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {selectedTableData.foreignKeys.map((fk, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-linear-to-r from-pink-50 via-pink-50 to-rose-50 dark:from-pink-950/30 dark:via-pink-900/20 dark:to-rose-950/30 rounded-lg border-2 border-pink-200 dark:border-pink-800 hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-300 transform hover:scale-102"
                          style={{
                            animation: `slideInRight 0.3s ease-out ${idx * 50}ms backwards`,
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-mono text-sm">
                              <span className="font-bold text-gray-900 dark:text-white">
                                {fk.column}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 mx-2">
                                →
                              </span>
                              <span className="text-blue-600 dark:text-blue-400 font-bold">
                                {fk.referencedTable}.{fk.referencedColumn}
                              </span>
                            </div>
                            <CopyButton
                              text={`${fk.column} → ${fk.referencedTable}.${fk.referencedColumn}`}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Indexes */}
                {selectedTableData.indexes.length > 0 && (
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1 transform">
                    <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        Indexes ({selectedTableData.indexes.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {selectedTableData.indexes.map((idx, i) => (
                        <div
                          key={i}
                          className="p-4 bg-linear-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-900/20 dark:to-rose-950/30 rounded-lg border-2 border-amber-200 dark:border-amber-800 hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 transform hover:scale-102"
                          style={{
                            animation: `slideInUp 0.3s ease-out ${i * 50}ms backwards`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <code className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                              {idx.name}
                            </code>
                            <CopyButton text={idx.name} />
                          </div>
                          <pre className="bg-linear-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-3 rounded-lg text-xs overflow-x-auto text-gray-700 dark:text-gray-300 whitespace-pre-wrap wrap-break-word max-h-40 font-mono border border-gray-300 dark:border-gray-700">
                            {idx.definition}
                          </pre>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
