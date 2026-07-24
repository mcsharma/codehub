// Extension → highlight.js language name, for the repo file viewer.
// Extension-first (like GitHub itself), falling back to hljs's own
// content-based auto-detection for anything not listed here.
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  rb: "ruby",
  go: "go",
  rs: "rust",
  java: "java",
  kt: "kotlin",
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  hpp: "cpp",
  cs: "csharp",
  php: "php",
  swift: "swift",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  sql: "sql",
  json: "json",
  yml: "yaml",
  yaml: "yaml",
  toml: "ini",
  ini: "ini",
  xml: "xml",
  html: "xml",
  css: "css",
  scss: "scss",
  less: "less",
  md: "markdown",
  markdown: "markdown",
  graphql: "graphql",
  gql: "graphql",
  dockerfile: "dockerfile",
  prisma: "graphql", // closest bracket/schema-block syntax hljs ships with
};

export function languageFromPath(path: string): string | null {
  const basename = path.split("/").pop() ?? path;
  if (basename.toLowerCase() === "dockerfile") return "dockerfile";
  const ext = basename.includes(".") ? basename.split(".").pop()!.toLowerCase() : "";
  return EXTENSION_TO_LANGUAGE[ext] ?? null;
}
