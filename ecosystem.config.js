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
    watch: false,
    autorestart: true
  }]
}; 