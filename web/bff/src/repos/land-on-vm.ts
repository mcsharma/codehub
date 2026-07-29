import { Client } from 'ssh2'

const HG_VM_HOST = process.env.HG_VM_HOST ?? '143.110.207.184'

// Connects as the hgservice user with a dedicated, forced-command-restricted
// key — deliberately separate from HG_VM_DEPLOY_KEY/HG_VM_DELETE_KEY (see
// services/hg/README.md and land-review.sh): that key can only ever run
// land-review.sh, regardless of what command is sent here. Unlike
// create/delete, this one's stdout matters — land-review.sh prints the
// landed node hash on success, which the caller needs to store.
export async function landReviewOnVm(ownerUsername: string, repoName: string, node: string): Promise<string> {
  const privateKey = process.env.HG_VM_LAND_KEY
  if (!privateKey) {
    throw new Error('HG_VM_LAND_KEY is not configured')
  }

  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn
      .on('ready', () => {
        conn.exec(`${ownerUsername} ${repoName} ${node}`, (err, stream) => {
          if (err) {
            conn.end()
            reject(err)
            return
          }
          let stdout = ''
          let stderr = ''
          stream
            .on('close', (code: number) => {
              conn.end()
              if (code === 0) {
                resolve(stdout.trim())
              } else {
                reject(new Error(`Landing failed (exit ${code}): ${stderr.trim()}`))
              }
            })
            .on('data', (data: Buffer) => {
              stdout += data.toString()
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
        readyTimeout: 10_000,
      })
  })
}
