module.exports = {
  apps: [{
    name: 'websitecursor',
    script: 'start-server.js',
    cwd: '/home/flocaclo/public_html',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
