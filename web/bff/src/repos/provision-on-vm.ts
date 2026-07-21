import { Client } from 'ssh2'

const HG_VM_HOST = process.env.HG_VM_HOST ?? '143.110.207.184'

// Connects as the hgservice user with a dedicated, forced-command-restricted
// key (see services/hg/README.md and create-repo.sh) — that key can only
// ever run create-repo.sh, regardless of what command is sent here, so the
// string below just becomes $SSH_ORIGINAL_COMMAND on the other end.
export async function provisionRepoOnVm(ownerUsername: string, repoName: string): Promise<void> {
  const privateKey = process.env.HG_VM_DEPLOY_KEY
  if (!privateKey) {
    throw new Error('HG_VM_DEPLOY_KEY is not configured')
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
                reject(new Error(`VM repo provisioning failed (exit ${code}): ${stderr.trim()}`))
              }
            })
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
      })
  })
}
