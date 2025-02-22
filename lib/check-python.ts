import { spawn } from 'child_process'
import { join } from 'path'

export async function checkPythonEnvironment(): Promise<{
  pythonCommand: string
  hasRequiredPackages: boolean
  error?: string
}> {
  const pythonCommands = process.platform === 'win32' 
    ? ['python', 'py', 'python3']
    : ['python3', 'python']
  
  for (const cmd of pythonCommands) {
    try {
      // First check if Python is available
      const versionCheck = await new Promise<boolean>((resolve) => {
        const process = spawn(cmd, ['--version'])
        process.on('error', () => resolve(false))
        process.on('close', (code) => resolve(code === 0))
      })

      if (!versionCheck) continue

      // Then check required packages
      const checkScript = join(process.cwd(), 'lib', 'check_packages.py')
      const result = await new Promise<string>((resolve, reject) => {
        const process = spawn(cmd, [checkScript])
        
        let output = ''
        let error = ''
        
        process.stdout.on('data', (data: Buffer) => {
          output += data.toString()
        })
        
        process.stderr.on('data', (data: Buffer) => {
          error += data.toString()
        })
        
        process.on('close', (code: number | null) => {
          if (code === 0) {
            resolve(output.trim())
          } else {
            reject(error || 'Process failed')
          }
        })
      })
      
      if (result === 'OK') {
        return {
          pythonCommand: cmd,
          hasRequiredPackages: true
        }
      }
    } catch (error) {
      console.error(`Failed to check ${cmd}:`, error)
    }
  }
  
  return {
    pythonCommand: '',
    hasRequiredPackages: false,
    error: 'Python environment not properly configured. Please ensure Python and required packages are installed.'
  }
} 