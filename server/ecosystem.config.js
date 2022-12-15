module.exports = {
    apps : [{
      name: "server",
      script: "src/server.js",
      instances: 3,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }]
}