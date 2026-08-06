export type Vcs = 'hg' | 'git'

async function commandSucceeds(bin: string, args: string[]): Promise<boolean> {
  try {
    const command = new Deno.Command(bin, { args, stdout: 'piped', stderr: 'piped' })
    const { code } = await command.output()
    return code === 0
  } catch {
    // bin not on PATH at all
    return false
  }
}

// Delegates "is this an hg/git repo, and where's its root" to the VCS tools
// themselves (`hg root` / `sl root`, both of which already walk up from cwd
// correctly) rather than reimplementing directory-walking here.
export async function detectVcs(): Promise<Vcs> {
  if (await commandSucceeds('hg', ['root'])) return 'hg'
  if (await commandSucceeds('sl', ['root'])) return 'git'
  throw new Error('Not inside an hg or git/sl repository (looked for `hg root` / `sl root`).')
}
