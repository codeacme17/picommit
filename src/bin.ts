// git-hooks-manager.ts

import fs from 'fs'
import path from 'path'

const HOOKS_DIR = path.join('.git', 'hooks')
const CORE_HOOK_SCRIPT = 'core-hook.sh'

export function install(): void {
  if (!fs.existsSync(HOOKS_DIR)) {
    console.error(
      'Error: .git/hooks directory not found. Are you in the root of a git repository?'
    )
    process.exit(1)
  }

  const coreHookPath = path.join(__dirname, CORE_HOOK_SCRIPT)
  if (!fs.existsSync(coreHookPath)) {
    console.error(
      `Error: Core hook script ${CORE_HOOK_SCRIPT} not found.`
    )
    process.exit(1)
  }

  // Copy the core hook script to .git/hooks for each type of git hook
  const hooks = [
    'pre-commit',
    'post-commit',
    'pre-push',
    'post-merge',
  ] // add more hooks as needed
  for (const hook of hooks) {
    fs.copyFileSync(coreHookPath, path.join(HOOKS_DIR, hook))
    fs.chmodSync(path.join(HOOKS_DIR, hook), '755') // Make the hook script executable
  }

  console.log('Git hooks installed.')
}

export function uninstall(): void {
  const hooks = [
    'pre-commit',
    'post-commit',
    'pre-push',
    'post-merge',
  ]
  for (const hook of hooks) {
    const hookPath = path.join(HOOKS_DIR, hook)
    if (fs.existsSync(hookPath)) {
      fs.unlinkSync(hookPath)
    }
  }

  console.log('Git hooks uninstalled.')
}

export function add(hookName: string, command: string): void {
  const hookFilePath = path.join(HOOKS_DIR, hookName)
  if (!fs.existsSync(hookFilePath)) {
    console.error(`Error: Hook ${hookName} not found.`)
    process.exit(1)
  }

  fs.appendFileSync(hookFilePath, `\n${command}\n`)
  console.log(`Command added to ${hookName} hook.`)
}

// CLI logic
const [cmd, ...args] = process.argv.slice(2)

switch (cmd) {
  case 'install':
    install()
    break
  case 'uninstall':
    uninstall()
    break
  case 'add':
    if (args.length !== 2) {
      console.error('Usage: add <hook-name> <command>')
      process.exit(1)
    }
    add(args[0], args[1])
    break
  default:
    console.error('Invalid command.')
    process.exit(1)
}
