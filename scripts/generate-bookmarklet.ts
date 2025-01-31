import fs from "fs";

const filePath = "scripts/itau-bookmarklet.js";

const main = () => {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const urlEncoded = encodeURIComponent(fileContent);

  console.log(`javascript:${urlEncoded}`);
};

main();
