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

  console.log(`[predev] Port ${PORT} is busy — killing zombie process...`)

  try {
    const isWin = platform() === 'win32'
    const result = execSync('netstat -ano', { encoding: 'utf8', timeout: 5000 })
    const lines = result.split('\n').filter(l => l.includes(`:${PORT}`) && l.includes('LISTENING'))

    for (const line of lines) {
      const pid = line.trim().split(/\s+/).pop()
      if (pid && pid !== '0' && pid !== String(process.pid)) {
        try {
          if (isWin) {
            execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf8', stdio: 'ignore', timeout: 5000 })
          } else {
            execSync(`kill -9 ${pid}`, { encoding: 'utf8', stdio: 'ignore', timeout: 5000 })
          }
          console.log(`[predev] Killed zombie process ${pid}`)
        } catch {}
      }
    }
  } catch {}

  // Wait for OS to release the port
  await new Promise(r => setTimeout(r, 1000))

  const freeAfter = await isPortFree(PORT)
  if (freeAfter) {
    console.log(`[predev] Port ${PORT} is now free — starting server...`)
  } else {
    console.error(`[predev] Port ${PORT} is still busy. Close all terminals and try again.`)
    process.exit(1)
  }
}

await main()
