void (async () => {
  console.log("Executing script");

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const historyButton = window.document.getElementById("linkHistoricos");
  historyButton?.click();

  await sleep(1000);
  console.log(historyButton);

  const selectHistory = window.document.getElementById("select-history");

  // get all options
  const options = selectHistory?.getElementsByTagName("option");

  // iterate over options

  for (let i = 0; i < options?.length; i++) {
    const option = options[i];
    option.selected = true;

    await sleep(1000);

    // download excel
    window.document.getElementById("a_excel")?.click();
  }
})();
