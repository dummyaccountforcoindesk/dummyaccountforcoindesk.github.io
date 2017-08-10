$(document).ready(function() {

	// Action completed after form submission
	$('#form').submit(function(e) {

		// Prevent Default action
		e.preventDefault();


		// Container array to hold data
		var portfolioCoins = [];

		// Fill array with user input
		$('.coin-num').each(function(index, coin) {
			if (coin.value > 0) {
				var obj = {"Coin": coin.id, "Quantity": coin.value}
				portfolioCoins.push(obj);
			}
		})

		// Get historical Prices
		portfolioCoins.forEach(function(coinObj, index, array) {
			var request = $.ajax({
				type: "GET",
				async: false,
				url: "https://www.coincap.io/history/1day/" + coinObj["Coin"]
			})

			request.done(function(data){

				// Get oldest Price
				var oldPrice = data['price'][0][1];

				// Add to data Object
				coinObj.oldPrice = oldPrice;


				// At teh end of the AJAX request for the last coin kick off the next function
				if (index == array.length - 1){
					getCurrentPrice();
				}

			})
		})

		// Get current data
		function getCurrentPrice() {
			var front_request = $.ajax({
				type: "GET",
				async: false,
				url: "https://www.coincap.io/front"
			})


			// Get current Price for all coins
			front_request.done(function(data){
				portfolioCoins.forEach(function(coinObj) {
					data.forEach(function(currentCoin) {
						if (coinObj.Coin == currentCoin.short) {
							coinObj.currentPrice = currentCoin.price
						}
					})
				})
			}, calculateTotalReturn)
		}


		// Calculate total return %
		function calculateTotalReturn() {
			var totalStartPrice = 0
			var totalEndPrice = 0

			// Iterate over our data Objects
			portfolioCoins.forEach(function(coinObj, index, array){
				totalStartPrice += coinObj["oldPrice"] * coinObj["Quantity"]
				totalEndPrice += coinObj["currentPrice"] * coinObj["Quantity"]


				// At the end of the last object kick off our render function=
				if (index == array.length -1) {
					renderReturn(totalStartPrice, totalEndPrice)
				}
			})
		}


		// Display Results on the page
		function renderReturn(totalStartPrice, totalEndPrice) {
			var color;

			// Calculate net return
			var total = ((totalEndPrice - totalStartPrice) / totalStartPrice) * 100


			// Determine color based on return
			if (total > 0){
				color = "green"
			} else if (total < 0){
				color = "red"
			}


			// Display Result
			$('#return').html("<p> Your 24hr Total Return is " + "<span class='" + color +"'>" + total.toString() + "%</span>. </p>")

		}

	})


})