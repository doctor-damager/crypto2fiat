var configSheet = SpreadsheetApp.getActive().getSheetByName('API_config')

// constants
const apiKey = configSheet.getRange('B2').getValue()
const apiBase = 'https://rest.coinapi.io'
const endPointExchangerate = '/v1/exchangerate/'
const orderSheetName = configSheet.getRange('B4').getValue()
const fiatIsoCode = configSheet.getRange('E1').getValue()
const options =
    {
        method: 'GET',
        headers: {
            'X-CoinAPI-Key': apiKey
        },
        json: true,
        gzip: true
    }
const columns = {
    'coin': 'A',
    'type': 'B',
    'wallet': 'C',
    'investment': 'D',
    'date': 'E',
    'fees': 'F',
    'interestCrypto': 'G',
    'rate': 'H',
    'interestFiat': 'I',
    'startLine': 'L3'
}

var ordersSheet = SpreadsheetApp.getActive().getSheetByName(orderSheetName)

function getPricesFromCoinMarketCap() {

    //yyyy-mm-ddThh:mm:ss.mmmZ
    //'2021-03-20T20:44:08.000Z';

    var startFrom = ordersSheet.getRange('L3').getValue()
    startFrom = (startFrom == '') ? 2 : startFrom


    while (ordersSheet.getRange(columns.interestCrypto + startFrom.toString()).getValue() != "") {
        let rowNumber = startFrom.toString()

        let orderDate = ordersSheet.getRange(columns.date + rowNumber).getValue()
        let dateIso = new Date(orderDate)
        dateIso = dateIso.toISOString()

        let coinCode = ordersSheet.getRange(columns.coin + rowNumber).getValue()


        let combinedUrl = apiBase + endPointExchangerate + coinCode + '/' + fiatIsoCode + '?time=' + dateIso;

        let response = UrlFetchApp.fetch(combinedUrl, options)

        let json = response.getContentText()
        let data = JSON.parse(json)


        let exchangeRate = data['rate']

        ordersSheet.getRange(columns.rate + rowNumber).setValue(exchangeRate);

        setFiatInterest(rowNumber, exchangeRate);

        startFrom++
        ordersSheet.getRange(columns.startLine).setValue(startFrom);
    }


}

/**
 * Converts the difference between interest and fees to fiat interest
 * @param rowNumber current row
 * @param exchangeRate
 */
function setFiatInterest(rowNumber, exchangeRate) {

    var cryptoInterest = ordersSheet.getRange(columns.interestCrypto + rowNumber).getValue()
    var fees = ordersSheet.getRange(columns.fees + rowNumber).getValue()

    var fiatInterest = (exchangeRate * (cryptoInterest - fees))
    Logger.log(fiatInterest)

    ordersSheet.getRange(columns.interestFiat + rowNumber).setValue(fiatInterest);

}
