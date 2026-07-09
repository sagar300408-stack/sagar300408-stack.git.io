const fs = require('fs')
const { cpSync, rmSync, mkdirSync } = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const out = path.join(root, 'public')

function run() {
  try {
    rmSync(out, { recursive: true, force: true })
    mkdirSync(out, { recursive: true })
  } catch (e) {
    // ignore
  }

  const skip = new Set(['admin', 'node_modules', '.git', 'public', 'scripts'])

  const names = fs.readdirSync(root)
  for (const name of names) {
    if (skip.has(name)) continue
    if (name.startsWith('.')) continue
    const src = path.join(root, name)
    const dst = path.join(out, name)
    try {
      const stat = fs.statSync(src)
      if (stat.isDirectory()) {
        cpSync(src, dst, { recursive: true })
      } else if (stat.isFile()) {
        cpSync(src, dst)
      }
    } catch (e) {
      console.error('copy entry failed', src, e.message)
    }
  }

  const adminDist = path.join(root, 'admin', 'dist')
  const targetAdmin = path.join(out, 'admin')
  try {
    cpSync(adminDist, targetAdmin, { recursive: true })
    console.log('Copied admin/dist -> public/admin')
  } catch (e) {
    console.error('Failed to copy admin/dist:', e.message)
    process.exit(1)
  }
}

run()
