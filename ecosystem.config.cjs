module.exports = {
  apps: [
    {
      name: "ERP_Base_Backend",
      script: "server.js",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
