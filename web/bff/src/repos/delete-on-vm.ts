import { Client } from 'ssh2'

const HG_VM_HOST = process.env.HG_VM_HOST ?? '143.110.207.184'

// Connects as the hgservice user with a dedicated, forced-command-restricted
// key — deliberately separate from HG_VM_DEPLOY_KEY (see
// services/hg/README.md and delete-repo.sh): that key can only ever run
// delete-repo.sh, regardless of what command is sent here, so the string
// below just becomes $SSH_ORIGINAL_COMMAND on the other end. delete-repo.sh
// itself is idempotent (exit 0 if the repo is already gone), so any
// non-zero exit here is a real failure, not a races-with-itself case.
export async function deleteRepoOnVm(ownerUsername: string, repoName: string): Promise<void> {
  const privateKey = process.env.HG_VM_DELETE_KEY
  if (!privateKey) {
    throw new Error('HG_VM_DELETE_KEY is not configured')
  }

  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn
      .on('ready', () => {
        conn.exec(`${ownerUsername} ${repoName}`, (err, stream) => {
          if (err) {
            conn.end()
            reject(err)
            return
          }
          let stderr = ''
          stream
            .on('close', (code: number) => {
              conn.end()
              if (code === 0) {
                resolve()
              } else {
                reject(new Error(`VM repo deletion failed (exit ${code}): ${stderr.trim()}`))
              }
            })
            // The channel must be drained or ssh2 never emits 'close' on it —
            // stdout isn't otherwise interesting (the script's only real
            // output is "OK"), so this is a no-op sink.
            .on('data', () => {})
            .stderr.on('data', (data: Buffer) => {
              stderr += data.toString()
            })
        })
      })
      .on('error', (err) => reject(err))
      .connect({
        host: HG_VM_HOST,
        username: 'hgservice',
        privateKey,
        readyTimeout: 10_000,
      })
  })
}
