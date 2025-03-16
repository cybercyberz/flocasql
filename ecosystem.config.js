module.exports = {
  apps: [{
    name: 'websitecursor',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NODE_OPTIONS: '--max_old_space_size=512'
    },
    instances: 1,
    exec_mode: 'cluster',
    max_memory_restart: '512M',
    watch: false,
    autorestart: true,
    kill_timeout: 3000
  }]
}; 