import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { buildFileTree } from "../utils/buildFileTree";
import type { FileTreeNode } from "../utils/buildFileTree";

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
          gap: 1,
          width: "100%",
          border: "none",
          background: isActive ? "#eff6ff" : "transparent",
          borderRadius: 1,
          py: 0.5,
          pl: 1 + depth * 1.5,
          pr: 1,
          cursor: "pointer",
          textAlign: "left",
          "&:hover": { background: isActive ? "#eff6ff" : "action.hover" },
        }}
      >
        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: statusColor(node.status ?? ""), flexShrink: 0 }} />
        <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            color: isActive ? "primary.main" : "text.primary",
            fontWeight: isActive ? 700 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
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
          borderRadius: 1,
          py: 0.5,
          pl: depth * 1.5,
          pr: 1,
          cursor: "pointer",
          textAlign: "left",
          "&:hover": { background: "action.hover" },
        }}
      >
        {expanded ? (
          <ExpandMoreOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        ) : (
          <ChevronRightOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        )}
        <FolderOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
        <Typography variant="caption" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
          {node.name}
        </Typography>
      </Box>
      <Collapse in={expanded}>
        {node.children?.map((child) => (
          <FileTreeNodeRow key={child.path} node={child} depth={depth + 1} activePath={activePath} onSelectFile={onSelectFile} />
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

const CommitFileTree = ({ files, activePath, onSelectFile }: CommitFileTreeProps) => {
  const tree = buildFileTree(files);

  return (
    <Box sx={{ py: 1 }}>
      <Typography
        variant="caption"
        sx={{ display: "block", px: 1.5, pb: 1, fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}
      >
        {files.length} changed file{files.length === 1 ? "" : "s"}
      </Typography>
      {tree.map((node) => (
        <FileTreeNodeRow key={node.path} node={node} depth={0} activePath={activePath} onSelectFile={onSelectFile} />
      ))}
    </Box>
  );
};

export default CommitFileTree;
