export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  status?: string;
  children?: FileTreeNode[];
}

interface MutableFolder {
  name: string;
  path: string;
  type: "folder";
  children: Map<string, MutableFolder | MutableFile>;
}

interface MutableFile {
  name: string;
  path: string;
  type: "file";
  status: string;
}

// Builds a nested tree from flat file paths, then compacts any chain of
// folders that each have exactly one (folder) child into a single row —
// e.g. "src/components/Foo" collapses to one node if `src` and
// `components` each only contain that one subfolder, matching GitHub's
// PR file-tree behavior.
export function buildFileTree(files: { path: string; status: string }[]): FileTreeNode[] {
  const root: MutableFolder = { name: "", path: "", type: "folder", children: new Map() };

  for (const file of files) {
    const segments = file.path.split("/");
    let current = root;
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      const path = segments.slice(0, i + 1).join("/");
      let next = current.children.get(segment);
      if (!next || next.type !== "folder") {
        next = { name: segment, path, type: "folder", children: new Map() };
        current.children.set(segment, next);
      }
      current = next;
    }
    const fileName = segments[segments.length - 1];
    current.children.set(fileName, { name: fileName, path: file.path, type: "file", status: file.status });
  }

  function compact(folder: MutableFolder): FileTreeNode[] {
    const entries = Array.from(folder.children.values()).sort((a, b) =>
      a.type === b.type ? a.name.localeCompare(b.name) : a.type === "folder" ? -1 : 1
    );
    return entries.map((entry) => {
      if (entry.type === "file") {
        return { name: entry.name, path: entry.path, type: "file", status: entry.status };
      }
      let node = entry;
      let name = entry.name;
      // Collapse a->b->c chains where every intermediate folder has exactly
      // one child that is itself a folder.
      while (node.children.size === 1) {
        const [onlyChild] = Array.from(node.children.values());
        if (onlyChild.type !== "folder") break;
        name = `${name}/${onlyChild.name}`;
        node = onlyChild;
      }
      return { name, path: node.path, type: "folder", children: compact(node) };
    });
  }

  return compact(root);
}
