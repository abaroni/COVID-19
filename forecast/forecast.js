const neatCsv = require('neat-csv')
const fs = require('fs')
const regression  = require('regression')

const csvFile = '../dati-andamento-nazionale/dpc-covid19-ita-andamento-nazionale.csv'
fs.readFile(csvFile, 'utf8', async function(err, data) {
  const dailyArray = await neatCsv(data)
  const positive = []
  const cured = []
  const dead = []
  const total = []
  dailyArray.forEach((item,i) => {
    positive.push([i,parseInt(item.totale_attualmente_positivi)])
    dead.push([i,parseInt(item.deceduti)])
    cured.push([i,parseInt(item.dimessi_guariti)])
    total.push([i,parseInt(item.totale_casi)])
  });

  const FORECAST_TOMORROW = dailyArray.length
  const FORECAST_ONE_WEEK = dailyArray.length + 6
  function forecast(array,start = 1,day = FORECAST_TOMORROW){
    let blind = array.slice(dailyArray.length - start,dailyArray.length)
    let blind_forecast = regression.exponential(blind,{ precision: 16 })
    //console.log(blind)
    //console.log(blind_forecast)
    let return_object = {
      forecast : parseInt(blind_forecast.predict(day)[1]),
      r2 : blind_forecast.r2
    }
    return return_object

  }
  console.log("Tomorrow:")
  console.log("Positive", forecast(positive,3))
  console.log("Dead", forecast(dead,3))
  console.log("Cured", forecast(cured,3))
  console.log("Total", forecast(total,3))

  console.log("Next week:")
  console.log("Positive", forecast(positive,3,FORECAST_ONE_WEEK))
  console.log("Dead", forecast(dead,3,FORECAST_ONE_WEEK))
  console.log("Cured", forecast(cured,3,FORECAST_ONE_WEEK))
  console.log("Total", forecast(total,3,FORECAST_ONE_WEEK))
})
