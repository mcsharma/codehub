// hg's `user` field is the raw "Name <email>" changeset field — the mocks
// only ever show a display name, never the email.
export function formatCommitAuthor(rawUser: string): string {
  const angleIndex = rawUser.indexOf("<");
  return (angleIndex === -1 ? rawUser : rawUser.slice(0, angleIndex)).trim();
}

// Shared by RepoCard ("Updated 2h ago") and the commit list ("3 hours ago").
export function formatRelativeTime(unixSeconds: number): string {
  const diffMs = Date.now() - unixSeconds * 1000;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "yesterday";
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear}y ago`;
}

// Shared by the repo file/directory browser (file row sizes, binary/too-large placeholders).
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}
