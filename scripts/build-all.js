const { execSync } = require('child_process')
const fs = require('fs')
const { cpSync, rmSync, mkdirSync } = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function runCmd(cmd) {
  console.log('> ', cmd)
  execSync(cmd, { stdio: 'inherit', cwd: root })
}

function assemblePublic() {
  const out = path.join(root, 'public')
  try {
    rmSync(out, { recursive: true, force: true })
    mkdirSync(out, { recursive: true })
  } catch (e) {}

  const skip = new Set(['admin', 'client-portal', 'node_modules', '.git', 'public', 'scripts', 'api'])
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

  const portalDist = path.join(root, 'client-portal', 'dist')
  const targetPortal = path.join(out, 'app')
  try {
    cpSync(portalDist, targetPortal, { recursive: true })
    console.log('Copied client-portal/dist -> public/app')
  } catch (e) {
    console.error('Failed to copy client-portal/dist:', e.message)
    process.exit(1)
  }
}

async function main() {
  try {
    runCmd('npm --prefix admin install')
    runCmd('npm --prefix admin run build')
    
    runCmd('npm --prefix client-portal install')
    runCmd('npm --prefix client-portal run build')
    
    assemblePublic()
    console.log('Public assembled successfully')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
