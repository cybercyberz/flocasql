module.exports = {
  apps: [
    {
      name: 'websitecursor-build',
      script: 'node_modules/next/dist/bin/next',
      args: 'build',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max_old_space_size=512'
      },
      kill_timeout: 3000,
      wait_ready: true,
      autorestart: false,
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'websitecursor',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      watch: false,
      autorestart: true
    }
  ]
}; 