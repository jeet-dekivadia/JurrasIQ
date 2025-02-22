import { spawn } from 'child_process'

export async function checkPythonEnvironment(): Promise<{
  pythonCommand: string
  hasRequiredPackages: boolean
  error?: string
}> {
  const pythonCommands = ['python3', 'python', 'py']
  
  for (const cmd of pythonCommands) {
    try {
      const result = await new Promise<string>((resolve, reject) => {
        const process = spawn(cmd, ['-c', 'import pandas, numpy, sklearn; print("OK")'])
        
        let output = ''
        let error = ''
        
        process.stdout.on('data', (data) => {
          output += data.toString()
        })
        
        process.stderr.on('data', (data) => {
          error += data.toString()
        })
        
        process.on('close', (code) => {
          if (code === 0) {
            resolve(output.trim())
          } else {
            reject(error || 'Process failed')
          }
        })
        
        process.on('error', () => {
          // Continue to next command if this one isn't found
          resolve('')
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