/**
 * SentraOps — Version Manager
 *
 * Usage:
 *   node scripts/version.js            — show current version info
 *   node scripts/version.js bump       — auto-bump based on commits since last tag
 *   node scripts/version.js bump minor — force minor bump
 *   node scripts/version.js bump patch — force patch bump
 */

const fs = require('fs')
const { execSync } = require('child_process')
const path = require('path')

const readFileSync = fs.readFileSync
const writeFileSync = fs.writeFileSync

const pkgPath = path.join(__dirname, '..', 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
const current = pkg.version
const versionTsPath = path.join(__dirname, '..', 'src', 'lib', 'version.ts')

function writeVersionTs(ver) {
  const [major, minor, patch] = ver.split('.').map(Number)
  writeFileSync(versionTsPath, `/**
 * SentraOps version — updated by \`node scripts/version.js bump\`
 * Do not edit manually.
 */
export const VERSION = '${ver}'
export const APP_NAME = 'SentraOps'
export const APP_DESCRIPTION = 'Dashboard operasional all-in-one untuk UMKM'
export const VERSION_MAJOR = ${major}
export const VERSION_MINOR = ${minor}
export const VERSION_PATCH = ${patch}
`)
}

function exec(cmd) {
  try {
    return execSync(cmd, { cwd: path.join(__dirname, '..'), encoding: 'utf-8' }).trim()
  } catch {
    return ''
  }
}

function getLastTag() {
  const tags = exec('git tag --list "v*" --sort=-v:refname')
  return tags ? tags.split('\n')[0] : null
}

function getCommitsSince(since) {
  if (!since) return exec('git log --oneline --format="%s"').split('\n').filter(Boolean)
  const range = `${since}..HEAD`
  return exec(`git log ${range} --oneline --format="%s"`).split('\n').filter(Boolean)
}

function parseCommits(commits) {
  let features = 0
  let fixes = 0
  let breaking = 0

  for (const msg of commits) {
    const lower = msg.toLowerCase()
    if (lower.includes('feat!') || lower.includes('breaking')) breaking++
    else if (lower.startsWith('feat') || lower.startsWith('feature')) features++
    else if (lower.startsWith('fix')) fixes++
  }

  return { features, fixes, breaking }
}

function bumpVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number)
  const pre1 = major < 1

  switch (type) {
    case 'major':
      return pre1 ? `${major}.${minor + 1}.0` : `${major + 1}.0.0`
    case 'minor':
      return pre1 ? `${major}.${minor + 1}.0` : `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
    default:
      return version
  }
}

function suggestBump() {
  const lastTag = getLastTag()
  const commits = getCommitsSince(lastTag)
  const { features, fixes, breaking } = parseCommits(commits)

  if (breaking > 0) return 'minor' // pre-1.0: breaking = minor bump
  if (features > 0) return 'minor'
  if (fixes > 0) return 'patch'
  return 'patch'
}

// --- CLI ---
const cmd = process.argv[2]
const explicit = process.argv[3]

if (cmd === 'bump') {
  const type = explicit || suggestBump()
  const next = bumpVersion(current, type)

  pkg.version = next
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  // Update src/lib/version.ts
  writeVersionTs(next)

  const lastTag = getLastTag()
  const commits = getCommitsSince(lastTag)

  console.log(`  ${current} → ${next}  (${type})`)
  console.log(`  commits since ${lastTag || 'beginning'}: ${commits.length}`)

  // Tag
  try {
    execSync(`git tag -a v${next} -m "v${next}"`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
    })
    console.log(`  tagged: v${next}`)
  } catch {
    console.log('  (tag skipped — not a git repo or already tagged)')
  }
} else {
  // Info mode
  const lastTag = getLastTag()
  const commits = lastTag ? getCommitsSince(lastTag) : []
  const { features, fixes } = parseCommits(commits)
  const suggested = suggestBump()

  console.log(`\n  SentraOps`)
  console.log(`  version: ${current}`)
  console.log(`  last tag: ${lastTag || '(none)'}`)
  console.log(`  commits since: ${commits.length || 0}`)
  if (commits.length > 0) {
    console.log(`    ${features} features  |  ${fixes} fixes`)
    console.log(`  suggested bump: ${suggested} → ${bumpVersion(current, suggested)}`)
  }
  console.log()
}
