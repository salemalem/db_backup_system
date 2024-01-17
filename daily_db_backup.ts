import Logger from "https://deno.land/x/logger@v1.1.2/logger.ts";
const logger = new Logger();

async function run_db_backup() {
  // Get current date and time in a specific format (e.g., YYYY-MM-DD_HH-MM-SS)
  const now = new Date();
  const timestamp = now.toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');

  const backupFileName = `./db_backups/dump_${timestamp}.dump`;
  logger.info(`Creating backup file: ${backupFileName}`);
  const process = Deno.run({
    cmd: [
      "pg_dump",
      "-Fc", // Flag to create a dump in the custom format (binary format)
      "-U", "postgres", // Database username
      "-d", "postgres", // Database name
      "-f", backupFileName // Path to save the backup file with timestamp
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const { code } = await process.status();

  if (code === 0) {
    const output = await process.output();
    logger.info(new TextDecoder().decode(output));
    logger.info(`Backup file created successfully: ${backupFileName}`);
  } else {
    const error = await process.stderrOutput();
    logger.error(new TextDecoder().decode(error));
  }
}

async function main() {
  while (true) {
    await run_db_backup();
    // Wait for 24 hours (24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
    await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
  }
}

main();