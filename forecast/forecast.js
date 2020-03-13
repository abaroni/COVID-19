const neatCsv = require('neat-csv')
const fs = require('fs')
const regression  = require('regression')

const csvFile = '../dati-andamento-nazionale/dpc-covid19-ita-andamento-nazionale.csv'
fs.readFile(csvFile, 'utf8', async function(err, data) {
  const dailyArray = await neatCsv(data)
  const postive = []
  const cured = []
  const dead = []
  const total = []
  dailyArray.forEach((item,i) => {
    //console.log(item.totale_attualmente_positivi)
    postive.push([i,parseInt(item.totale_attualmente_positivi)])
    cured.push([i,item.dimessi_guariti])
    dead.push([i,item.deceduti])
    total.push([i,item.totale_casi])

  });
  let forecast = regression.exponential(postive,{ precision: 16 })
  console.log(postive)
  console.log(forecast)
  console.log(forecast.predict(dailyArray.length))

  let blind = postive.slice(7,dailyArray.length)
  let blind_forecast = regression.exponential(blind,{ precision: 16 })
  console.log(blind)
  console.log(blind_forecast)
  console.log(blind_forecast.predict(dailyArray.length))

})
