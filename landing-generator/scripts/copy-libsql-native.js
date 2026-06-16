/**
 * Copies @libsql/linux-x64-gnu native binding into the standalone build
 * as _libsql_native/ so it survives Azure Oryx's node_modules repackaging.
 *
 * This runs as part of postbuild. On Windows (dev machine), we download
 * the package via npm pack if it's not already cached.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const STANDALONE = path.join(__dirname, "..", ".next-build", "standalone");
const NATIVE_DIR = path.join(STANDALONE, "_libsql_native", "@libsql", "linux-x64-gnu");
const LIBSQL_DIR = path.join(STANDALONE, "_libsql_native", "libsql");

// Also put it in node_modules/@libsql/linux-x64-gnu for the standalone build
const NM_DIR = path.join(STANDALONE, "node_modules", "@libsql", "linux-x64-gnu");

function findOrDownloadLinuxBinding() {
  // Check if already in local node_modules (Linux dev machine)
  const localNM = path.join(__dirname, "..", "node_modules", "@libsql", "linux-x64-gnu");
  if (fs.existsSync(path.join(localNM, "index.node"))) {
    console.log("[copy-libsql-native] Using local node_modules/@libsql/linux-x64-gnu");
    return localNM;
  }

  // Check for cached tgz
  const root = path.join(__dirname, "..");
  const tgzFiles = fs.readdirSync(root).filter((f) => f.startsWith("libsql-linux-x64-gnu-") && f.endsWith(".tgz"));

  let tgzPath;
  if (tgzFiles.length > 0) {
    tgzPath = path.join(root, tgzFiles[0]);
    console.log(`[copy-libsql-native] Using cached ${tgzFiles[0]}`);
  } else {
    // Download via npm pack
    console.log("[copy-libsql-native] Downloading @libsql/linux-x64-gnu via npm pack...");
    const output = execSync("npm pack @libsql/linux-x64-gnu", { cwd: root, encoding: "utf-8" });
    const filename = output.trim().split("\n").pop();
    tgzPath = path.join(root, filename);
    console.log(`[copy-libsql-native] Downloaded ${filename}`);
  }

  // Extract to temp dir
  const tmpDir = path.join(root, "_tmp_libsql_extract");
  fs.mkdirSync(tmpDir, { recursive: true });
  execSync(`tar -xzf "${tgzPath}" -C "${tmpDir}" --strip-components=1`, { cwd: root });

  return tmpDir;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  const srcDir = findOrDownloadLinuxBinding();

  // Copy to _libsql_native (survives Oryx repackaging)
  console.log(`[copy-libsql-native] Copying to _libsql_native/...`);
  fs.mkdirSync(path.dirname(NATIVE_DIR), { recursive: true });
  copyDir(srcDir, NATIVE_DIR);

  // Also copy to standalone node_modules (for direct use)
  console.log(`[copy-libsql-native] Copying to standalone node_modules/...`);
  fs.mkdirSync(path.dirname(NM_DIR), { recursive: true });
  copyDir(srcDir, NM_DIR);

  // Copy the libsql JS wrapper too
  const localLibsql = path.join(__dirname, "..", "node_modules", "libsql");
  if (fs.existsSync(localLibsql)) {
    console.log(`[copy-libsql-native] Copying libsql JS wrapper to _libsql_native/...`);
    fs.mkdirSync(LIBSQL_DIR, { recursive: true });
    copyDir(localLibsql, LIBSQL_DIR);
  }

  // Clean up temp dir if used
  const tmpDir = path.join(__dirname, "..", "_tmp_libsql_extract");
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true });
  }

  console.log("[copy-libsql-native] Done!");
} catch (err) {
  console.error("[copy-libsql-native] ERROR:", err.message);
  process.exit(1);
}
