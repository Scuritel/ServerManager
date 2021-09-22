const fs = require('fs')
const {spawn} = require('child_process')

const configName = 'config.json'
const configImport = './' + configName.split('.')[0]
const defaultConf = {
  Servers: [
    {
      'Name': 'Example',
      'CommandToStart': 'ts-node',
      'Path': '~/GitProjects/Anything',
      'File': 'index.ts',
      'Port': 3000,
      'ConfigFile': 'config.json',
      'ConfigPortProperty': 'PORT'
    }
  ]
}

const delay = (ms) => new Promise((res, rej) => setTimeout(res, ms))
const readConfig = () => {
  if (!fs.existsSync(configName)) {
    fs.writeFileSync(configName, JSON.stringify(defaultConf, void 0, 2))
  }
  return require(configImport)
}
const changeServerConfig = (server) => {
  const confPath = server.Path + '/' + server.ConfigFile
  const actConfPath = server.Path + '/./' + server.ConfigFile.split('.')[0]
  let conf = {}
  if (fs.existsSync(confPath)) {
    conf = require(actConfPath)
  }
  console.log(conf)
  conf[server.ConfigPortProperty] = server.Port
  fs.writeFileSync(confPath, JSON.stringify(conf, void 0, 2))
}
const main = async () => {
  const config = readConfig()
  console.log(config)
  const processes = []
  for(const server of config.Servers)
  if (fs.existsSync(server.Path + '/' + server.File)) {
    changeServerConfig(server)
    const p = spawn(server.CommandToStart, [server.Path + '/' + server.File], {
      cwd: server.Path
    })
    p.stdout.on('data', (data) => {
      console.log(`${server.Name}: ${data}`)
    })
    p.stderr.on('data', (data) => {
      console.warn(`stderr of ${server.Name}: ${data}`)
    })
    p.on('error', (data) => {
      console.warn(`error of ${server.Name}: ${data}`)
    })
    p.on('close', (code) => {
      console.warn(`${server.Name} closed with error code ${code}`)
    })
  }
  else {
    console.warn(`Path of ${server.Name} server doesn't exist`)
  }
  while(processes.find(x => x.connected)) {
    await delay(100)
  }
}

main()
