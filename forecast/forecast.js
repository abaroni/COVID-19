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
  const dates= []
  let latest = null
  dailyArray.forEach((item,i) => {
    positive.push([i+1,parseInt(item.totale_attualmente_positivi)])
    dead.push([i+1,parseInt(item.deceduti)])
    cured.push([i+1,parseInt(item.dimessi_guariti)])
    total.push([i+1,parseInt(item.totale_casi)])
    dates.push(item.data.split(' ')[0])
    latest = item
  });

  const METHODS = [
    regression.linear,
    regression.exponential,
    regression.logarithmic,
    regression.power,
    regression.polynomial
  ]
  const FORECAST_TOMORROW = dailyArray.length
  const FORECAST_ONE_WEEK = dailyArray.length + 6

  function forecasts(array, latest_to_consider = array.length,day = FORECAST_TOMORROW, method = regression.exponential ){
    const startIndex = dailyArray.length - latest_to_consider
    const endIndex = dailyArray.length
    const blindDates = dates.map(d => d.split(' ')[0]).slice(startIndex,endIndex)
    let blind = array.slice(startIndex,endIndex)
    //let blind_forecast = method(blind,{ precision: 16 })
    //console.log(blind_forecast)
    let return_object = {
      dates : blindDates,
      dataPoints: blind,
      exponential : regression.exponential(blind,{ precision: 16 }),
      linear :  regression.linear(blind,{ precision: 16 }),
      power: regression.power(blind,{ precision: 16 })
    }
    return return_object

  }

  function getOutputObject(days = total.length){
    const totalForecasts = forecasts(total,days)
    const startingDay = totalForecasts.dataPoints[0][0]
    const finalDay = totalForecasts.dataPoints[totalForecasts.dataPoints.length - 1][0]
    //console.log(startingDay)
    //console.log(finalDay)
    const totalForcastedLinear = []
    const totalForcastedPower = []
    const totalForcastedExponential = []
    const FUTURE_TIME_WINDOW = 7
    for(let day = startingDay; day<= finalDay +FUTURE_TIME_WINDOW ; day++){
      const datapointLinear = parseInt(totalForecasts.linear.predict(day)[1])
      const datapointPower = parseInt(totalForecasts.power.predict(day)[1])
      const datapointExponential = parseInt(totalForecasts.exponential.predict(day)[1])
      totalForcastedLinear.push(datapointLinear)
      totalForcastedPower.push(datapointPower)
      totalForcastedExponential.push(datapointExponential)
    }

    return {
      dates: totalForecasts.dates,
      latestDate: latest.data.split(' ')[0],
      total:totalForecasts.dataPoints.map(e=>e[1]),
      dead: dead.map(e=>e[1]),
      cured: cured.map(e=>e[1]),
      positive: positive.map(e=>e[1]),
      totalForcastedLinear: totalForcastedLinear,
      totalEquationLinear: totalForecasts.linear.string,
      totalR2Linear: totalForecasts.linear.r2,
      totalForcastedPower: totalForcastedPower,
      totalEquationPower: totalForecasts.power.string,
      totalR2Power: totalForecasts.power.r2,
      totalForcastedExponential: totalForcastedExponential,
      totalEquationExponential: totalForecasts.exponential.string,
      totalR2Exponential: totalForecasts.exponential.r2
    }
  }

  fs.writeFile('allData.json', JSON.stringify(getOutputObject(),null,2) , (err) => {
      if (err) throw err;
      console.log('Data written to file');
  })
  fs.writeFile('restrictedData.json', JSON.stringify(getOutputObject(7),null,2), (err) => {
      if (err) throw err;
      console.log('Data written to file');
  })

})
