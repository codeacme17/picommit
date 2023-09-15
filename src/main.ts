import fs from 'fs'
import path from 'path'

// 定义文件和目录路径
const HOOKS_DIR = path.join('.git', 'hooks')
const CORE_HOOK_SCRIPT_PATH = path.join(
  __dirname,
  '../',
  'picommit.sh'
)
const PICOMMIT_FILE = '.picommit'

function installHooks(): void {
  if (!fs.existsSync(HOOKS_DIR)) {
    console.error(
      'Error: .git/hooks directory not found. Are you in the root of a git repository?'
    )
    process.exit(1)
  }

  // 复制核心钩子脚本到 .git/hooks/pre-commit
  fs.copyFileSync(
    CORE_HOOK_SCRIPT_PATH,
    path.join(HOOKS_DIR, 'pre-commit')
  )
  fs.chmodSync(path.join(HOOKS_DIR, 'pre-commit'), '755') // Make the hook script executable
}

function createPicommitFile(): void {
  if (!fs.existsSync(PICOMMIT_FILE)) {
    fs.writeFileSync(
      PICOMMIT_FILE,
      '# List your picommit configurations here\n'
    )
  }
}

// picommit-init 主逻辑
export function picommitInit(): void {
  installHooks()
  createPicommitFile()
  console.log('picommit initialized successfully.')
}

// CLI 调用逻辑
if (require.main === module) {
  picommitInit()
}
