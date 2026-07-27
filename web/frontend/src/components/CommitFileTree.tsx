import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { buildFileTree } from "../utils/buildFileTree";
import type { FileTreeNode } from "../utils/buildFileTree";

// Apple's HIG "System Blue" — matches RepoDirectoryTree's folder color so
// the two sidebar trees (Code tab vs. commit diff view) read as the same
// component visually.
const FOLDER_BLUE = "#0A84FF";

const statusColor = (status: string): string | undefined => {
  if (status === "added") return "success.main";
  if (status === "removed") return "error.main";
  return "warning.main"; // modified
};

interface NodeProps {
  node: FileTreeNode;
  depth: number;
  activePath: string | null;
  onSelectFile: (path: string) => void;
}

const FileTreeNodeRow = ({ node, depth, activePath, onSelectFile }: NodeProps) => {
  const [expanded, setExpanded] = useState(true);

  if (node.type === "file") {
    const isActive = node.path === activePath;
    return (
      <Box
        component="button"
        onClick={() => onSelectFile(node.path)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          width: "100%",
          border: "none",
          background: isActive ? "#eff6ff" : "transparent",
          py: 0.5,
          pl: 1 + depth * 1.5,
          pr: 1,
          cursor: "pointer",
          textAlign: "left",
          "&:hover": { background: isActive ? "#eff6ff" : "action.hover" },
        }}
      >
        <Box sx={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: statusColor(node.status ?? ""),
            }}
          />
        </Box>
        <InsertDriveFileOutlinedIcon fontSize="small" sx={{ color: "text.secondary", flexShrink: 0 }} />
        <Typography
          variant="body2"
          sx={{
            color: isActive ? "primary.main" : "text.primary",
            fontWeight: isActive ? 700 : 400,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {node.name}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        component="button"
        onClick={() => setExpanded((e) => !e)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          width: "100%",
          border: "none",
          background: "transparent",
          py: 0.5,
          pl: 1 + depth * 1.5,
          pr: 1,
          cursor: "pointer",
          textAlign: "left",
          "&:hover": { background: "action.hover" },
        }}
      >
        {expanded ? (
          <ExpandMoreOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
        ) : (
          <ChevronRightOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
        )}
        <FolderIcon fontSize="small" sx={{ color: FOLDER_BLUE, flexShrink: 0 }} />
        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
          {node.name}
        </Typography>
      </Box>
      <Collapse in={expanded}>
        {node.children?.map((child) => (
          <FileTreeNodeRow
            key={child.path}
            node={child}
            depth={depth + 1}
            activePath={activePath}
            onSelectFile={onSelectFile}
          />
        ))}
      </Collapse>
    </Box>
  );
};

interface CommitFileTreeProps {
  files: { path: string; status: string }[];
  activePath: string | null;
  onSelectFile: (path: string) => void;
}

// Styling mirrors RepoDirectoryTree (the Code tab's sidebar) exactly —
// same icon set, font, row height/padding — even though the two trees are
// built differently (this one has the full file list up front and builds
// a client-side trie, RepoDirectoryTree fetches level-by-level).
const CommitFileTree = ({ files, activePath, onSelectFile }: CommitFileTreeProps) => {
  const tree = buildFileTree(files);

  return (
    <Box>
      {tree.map((node) => (
        <FileTreeNodeRow key={node.path} node={node} depth={0} activePath={activePath} onSelectFile={onSelectFile} />
      ))}
    </Box>
  );
};

export default CommitFileTree;
