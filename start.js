import { execSync } from 'child_process'
import { createServer } from 'net'

const PORT = parseInt(process.env.PORT) || 5000

function killPort(port) {
  try {
    const result = execSync(`netstat -ano 2>nul | findstr :${port}.*LISTENING`, { encoding: 'utf8' })
    const lines = result.trim().split('\n').filter(Boolean)
    for (const line of lines) {
      const pid = line.trim().split(/\s+/).pop()
      if (pid && pid !== '0' && pid !== String(process.pid)) {
        try {
          execSync(`taskkill //F //PID ${pid}`, { encoding: 'utf8', stdio: 'ignore' })
          console.log(`✅ Killed zombie process ${pid} on port ${port}`)
        } catch {}
      }
    }
  } catch {
    // Port is free
  }
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => { server.close(); resolve(true) })
    server.listen(port)
  })
}

async function main() {
  // Kill any zombie on our port
  killPort(PORT)
  
  // Wait a moment for the OS to release the port
  await new Promise(r => setTimeout(r, 500))
  
  // Check if port is actually free now
  const free = await isPortFree(PORT)
  if (!free) {
    console.error(`❌ Port ${PORT} is still busy after killing zombies. Retrying...`)
    killPort(PORT)
    await new Promise(r => setTimeout(r, 1000))
  }

  // Now import and start the actual server
  await import('./src/index.js')
}

main().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
