module.exports = {
  apps: [{
    name: 'websitecursor',
    script: './node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/flocaclo/public_html',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0',
      NODE_OPTIONS: '--max_old_space_size=512'
    },
    watch: false,
    autorestart: true,
    max_memory_restart: '512M'
  }]
}; 