
# Gastos mensuales

Una aplicación para medir los gastos mensuales realizados con tarjetas de crédito o débito en Uruguay.
Los datos se obtienen a partir de estados de cuenta en excel que el usuario debe suministrar (ya que ningún banco en Uruguay ofrece una API a la cual se pueda acceder sin costos enormes)

Actualmente tiene soporte para subir estados de cuenta de:
- Itaú
- Santander
- Scotiabank

![image](https://github.com/user-attachments/assets/9c337a9e-6d88-4fab-a696-9559c6b0b592)


## Bookmarklet para descargar todos los estados de cuenta en Itaú



```
javascript:void%20(async%20()%20%3D%3E%20%7B%0A%20%20console.log(%22Executing%20script%22)%3B%0A%0A%20%20const%20sleep%20%3D%20(ms)%20%3D%3E%20new%20Promise((resolve)%20%3D%3E%20setTimeout(resolve%2C%20ms))%3B%0A%0A%20%20const%20historyButton%20%3D%20window.document.getElementById(%22linkHistoricos%22)%3B%0A%20%20historyButton%3F.click()%3B%0A%0A%20%20await%20sleep(1000)%3B%0A%20%20console.log(historyButton)%3B%0A%0A%20%20const%20selectHistory%20%3D%20window.document.getElementById(%22select-history%22)%3B%0A%0A%20%20%2F%2F%20get%20all%20options%0A%20%20const%20options%20%3D%20selectHistory%3F.getElementsByTagName(%22option%22)%3B%0A%0A%20%20const%20optionsValues%20%3D%20Array.from(options).map((option)%20%3D%3E%20option.value)%3B%0A%0A%20%20const%20excelDownloadLink%20%3D%20window.document.getElementById(%22a_excel%22).href%3B%0A%20%20console.log(%22%F0%9F%9A%80%20~%20void%20~%20excelDownloadLink%3A%22%2C%20excelDownloadLink)%3B%0A%0A%20%20const%20excelEndpoint%20%3D%20excelDownloadLink.split(%22%3F%22)%5B0%5D%3B%0A%0A%20%20await%20Promise.all(%0A%20%20%20%20optionsValues.map(async%20(optionValue)%20%3D%3E%20%7B%0A%20%20%20%20%20%20const%20month%20%3D%20optionValue.split(%22-%22)%5B0%5D%3B%0A%20%20%20%20%20%20const%20year%20%3D%20optionValue.split(%22-%22)%5B1%5D%3B%0A%0A%20%20%20%20%20%20const%20url%20%3D%20%60%24%7BexcelEndpoint%7D%3Fanio%3D%24%7Byear%7D%26mes%3D%24%7Bmonth%7D%60%3B%0A%0A%20%20%20%20%20%20%2F%2F%20download%20excel%20in%20browser%0A%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(url)%3B%0A%20%20%20%20%20%20const%20blob%20%3D%20await%20response.blob()%3B%0A%20%20%20%20%20%20const%20urlBlob%20%3D%20URL.createObjectURL(blob)%3B%0A%20%20%20%20%20%20const%20a%20%3D%20document.createElement(%22a%22)%3B%0A%20%20%20%20%20%20a.href%20%3D%20urlBlob%3B%0A%20%20%20%20%20%20a.download%20%3D%20%60itau-%24%7Byear%7D-%24%7Bmonth%7D.xls%60%3B%0A%20%20%20%20%20%20a.click()%3B%0A%20%20%20%20%7D)%2C%0A%20%20)%3B%0A%0A%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20options%3F.length%3B%20i%2B%2B)%20%7B%0A%20%20%20%20const%20option%20%3D%20options%5Bi%5D%3B%0A%0A%20%20%20%20selectHistory.click()%3B%0A%20%20%20%20await%20sleep(200)%3B%0A%20%20%20%20%2F%2F%20Click%20the%20option%20element%20to%20select%20it%0A%20%20%20%20option.click()%3B%0A%0A%20%20%20%20%2F%2F%20Dispatch%20a%20change%20event%20to%20ensure%20any%20listeners%20are%20triggered%0A%20%20%20%20selectHistory.dispatchEvent(new%20Event(%22change%22%2C%20%7B%20bubbles%3A%20true%20%7D))%3B%0A%20%20%20%20await%20sleep(1000)%3B%0A%0A%20%20%20%20%2F%2F%20download%20excel%20after%20the%20option%20change%20effects%20have%20been%20applied%0A%20%20%20%20window.document.getElementById(%22a_excel%22)%3F.click()%3B%0A%20%20%7D%0A%7D)()%3B%0A
```
