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

  const optionsValues = Array.from(options).map((option) => option.value);

  const excelDownloadLink = window.document.getElementById("a_excel").href;
  console.log("🚀 ~ void ~ excelDownloadLink:", excelDownloadLink);

  const excelEndpoint = excelDownloadLink.split("?")[0];

  await Promise.all(
    optionsValues.map(async (optionValue) => {
      const month = optionValue.split("-")[0];
      const year = optionValue.split("-")[1];

      const url = `${excelEndpoint}?anio=${year}&mes=${month}`;

      // download excel in browser
      const response = await fetch(url);
      const blob = await response.blob();
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = `itau-${year}-${month}.xls`;
      a.click();
    }),
  );

  for (let i = 0; i < options?.length; i++) {
    const option = options[i];

    selectHistory.click();
    await sleep(200);
    // Click the option element to select it
    option.click();

    // Dispatch a change event to ensure any listeners are triggered
    selectHistory.dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(1000);

    // download excel after the option change effects have been applied
    window.document.getElementById("a_excel")?.click();
  }
})();
