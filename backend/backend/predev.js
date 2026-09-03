// predev.js — Kill any zombie process on port 5000 before starting the server
import { createServer } from 'net'
import { execSync } from 'child_process'
import { platform } from 'os'

const PORT = 5000

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => { server.close(); resolve(true) })
    server.listen(port)
  })
}

async function main() {
  const free = await isPortFree(PORT)
  if (free) {
    console.log(`[predev] Port ${PORT} is free — starting server...`)
    return
  }

  console.log(`[predev] Port ${PORT} is busy — attempting to free it...`)

  const isWin = platform() === 'win32'

  // Method 1: Try npx kill-port
  try {
    execSync('npx kill-port 5000', { stdio: 'ignore', timeout: 10000 })
    console.log(`[predev] Freed port ${PORT} via npx kill-port`)
    await new Promise(r => setTimeout(r, 1500))
    const ok = await isPortFree(PORT)
    if (ok) { console.log(`[predev] Port ${PORT} is now free`); return }
  } catch {}

  // Method 2: Try netstat + taskkill/kill
  try {
    const cmd = isWin ? 'netstat -ano' : 'ss -tlnp'
    const result = execSync(cmd, { encoding: 'utf8', timeout: 5000 })
    const lines = result.split('\n').filter(l => l.includes(`:${PORT}`) && l.includes('LISTEN'))

    for (const line of lines) {
      const parts = line.trim().split(/\s+/)
      const pid = isWin ? parts[parts.length - 1] : parts[parts.length - 1]?.split('=')?.[1]?.split(',')[0]
      if (pid && pid !== '0' && pid !== String(process.pid)) {
        try {
          const killCmd = isWin ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`
          execSync(killCmd, { stdio: 'ignore', timeout: 5000 })
          console.log(`[predev] Killed process ${pid} on port ${PORT}`)
        } catch {}
      }
    }
  } catch {}

  await new Promise(r => setTimeout(r, 1500))

  const freeAfter = await isPortFree(PORT)
  if (freeAfter) {
    console.log(`[predev] Port ${PORT} is now free — starting server...`)
  } else {
    console.warn(`[predev] WARNING: Port ${PORT} may still be busy. Server will try to start anyway.`)
    // Don't exit — let the server try to start
  }
}

await main()
