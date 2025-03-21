import Knex from "knex";
import config from "./knexfile";

const knex = Knex(config);

// SIGINT is what Ctrl + C sends when the process is running
process.on("SIGINT", async () => {
  console.log("Shutting down database connection...");
  await knex.destroy();
  process.exit(0);
});

export default knex;
