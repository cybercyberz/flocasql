module.exports = {
  apps: [{
    name: 'websitecursor',
    script: 'npm',
    args: 'start',
    cwd: '/home/flocaclo/public_html',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '127.0.0.1'
    },
    watch: false,
    autorestart: true,
    max_memory_restart: '512M'
  }]
}; 