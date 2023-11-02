import {CASH_EXPIRE} from '../constants/constants.js';
import {API_URL} from '../api/APIHelper.js';


// this function execute when page is loaded
window.onload = function() {
    // Define the URLs of the JSON files with relative paths
    const cityDataUrl = '../data/cities.json';
    const apiKeyUrl = '../data/appSettings.json';

    // Arrays to store the data
    let cityIdList = [];
    let apiKeyList = [];

    // Array of Promises for fetch requests
    const fetchPromises = [];

    // Fetch the city IDs
    fetchPromises.push(
        fetch(cityDataUrl)
            .then(response => response.json())
            .then(data => {
                const sampleList = data.List;
                cityIdList = sampleList.map(item => parseInt(item.CityCode));
            })
            .catch(error => {
                console.error('Error:', error);
            })
    );

    // Fetch the API key
    fetchPromises.push(
        fetch(apiKeyUrl)
            .then(response => response.json())
            .then(data => {
                apiKeyList.push(data.API_KEY);
            })
            .catch(error => {
                console.error('Error:', error);
            })
    );

    // Wait for all Promises to resolve
    Promise.all(fetchPromises)
        .then(() => {
            // Both fetch requests are complete here
            //get data for each city
            var genclassIds = ['.cname','.cdt','.cdesc','.ctemp','.cimg','.ctmi','.ctma','.cp','.ch','.cv','.cd','.csr','.css'];
            for(var j=0;j<cityIdList.length;j++){

                // update the classIDs
                var classIds = [];
                for(var k=0;k<genclassIds.length;k++){
                    var element = genclassIds[k];
                    var corrElement = element.slice(0,2)+ (j+1) + element.slice(2);
                    classIds.push(corrElement);
                }
    
                weatherBalloon(cityIdList[j],classIds,apiKeyList[0],API_URL);
                
            }  
            

    
        });
};





//call the API accordinto  given city id and get the result
function weatherBalloon(cityID,classId, key, url) {
    // Check if cached data exists
    const cachedData = localStorage.getItem(`weatherData_${cityID}`);
    if (cachedData) {
      
      // If cached data exists and is not expired
      const parsedData = JSON.parse(cachedData);
      const currentTime = new Date().getTime();
      
      //checks the cahche is old than 5 minitus (300000 ms)
      if (currentTime - parsedData.timestamp < CASH_EXPIRE) {
        updateUI(parsedData.data,classId);
        console.log('Cached data exist and updated:', parsedData)
        return;
      }
    }
    
    // if cache no or more than 5 mins then call api and save as a cache
    console.log("No valied cache data need to call API")
    fetch(url + '?id=' + cityID + '&appid=' + key + '&units=metric')  
    .then(function(resp) { return resp.json() }) // Convert data to json
    .then(function (data) {
        const timestamp = new Date().getTime();
        const cachedData = {
          timestamp: timestamp,
          data: data,
        };
        //console.log(data);
        // Store data in cache
        localStorage.setItem('weatherData_' + cityID, JSON.stringify(cachedData));
        
        updateUI(data,classId); //update the html page using data
    })

    .catch((error) => {
        console.error('Error:', error);
    });
}




// update each card with api values

function updateUI(data,classId) {

    var name = document.querySelector(classId[0]); // querySelector is used to select and retrieve the first HTML element in the web page that has the CSS class "name." 
    var dt = document.querySelector(classId[1]);
    var desc = document.querySelector(classId[2]);
    var temp = document.querySelector(classId[3]);
    var imgElement = document.querySelector(classId[4]);

    var tempMin = document.querySelector(classId[5]);
    var tempMax = document.querySelector(classId[6]);


    var pressure = document.querySelector(classId[7]);
    var humidity = document.querySelector(classId[8]);
    var visibility = document.querySelector(classId[9]);
    var degree = document.querySelector(classId[10]);
    var sunrise = document.querySelector(classId[11]);
    var sunset = document.querySelector(classId[12]);



    // get the data form promise
    var nameValue = data['name'];
    //var idValue = data['id'];
    var dtValue = data['dt']; // Unix timestamp
    var descValue = data['weather'][0]['description'];
    var tempValue = parseInt(data['main']['temp']); 
    var tempMinValue = parseInt(data['main']['temp_min']);
    var tempMaxValue = parseInt(data['main']['temp_max']);
    
    var pressureValue = parseInt(data['main']['pressure']) + " hpa";  
    var humidityValue = parseInt(data['main']['humidity']);  
    var visibilityValue = (parseFloat(data['visibility'])/1000) + ' km';  
    var degreeValue = parseInt(data['wind']['speed']) + ' m/s  ' + parseInt(data['wind']['deg']) +  ' Degree' ;  
    var sunriseValue = parseInt(data['sys']['sunrise']);
    var sunsetValue = parseInt(data['sys']['sunset']);  

    var countryData   = data['sys']['country'];
    var icondata = data['weather'][0]['icon'];
    var imgUrl = "https://openweathermap.org/img/wn/" + icondata.toString() +".png" ;

    //sunrice time
    var myTimeSr = new Date(sunriseValue * 1000);  //Multiply by 1000 to convert from seconds to milliseconds
    //give the date and time as the required form
    var hoursSr = myTimeSr.getHours();
    var minutesSr = myTimeSr.getMinutes();
    var amPmSr = hoursSr >= 12 ? 'pm' : 'am';
    var newHoursSr = hoursSr % 12 || 12; // Convert 0 to 12
    var newTimeSr = newHoursSr  + '.'+ minutesSr + amPmSr;



    //sunset time
    var myTimeSs = new Date(sunsetValue * 1000);  //Multiply by 1000 to convert from seconds to milliseconds
    //give the date and time as the required form
    var hoursSs = myTimeSs.getHours();
    var minutesSs = myTimeSs.getMinutes();
    var amPmSs = hoursSs >= 12 ? 'pm' : 'am';
    var newHoursSs = hoursSs % 12 || 12; // Convert 0 to 12
    var newTimeSs = newHoursSs  + '.'+ minutesSs + amPmSs;



    // Create a Date object using the Unix timestamp
    var myTime = new Date(dtValue * 1000);  //Multiply by 1000 to convert from seconds to milliseconds
    //give the date and time as the required form
    var hours = myTime.getHours();
    var minutes = myTime.getMinutes();
    var amPm = hours >= 12 ? 'pm' : 'am';
    var newHours = hours % 12 || 12; // Convert 0 to 12
    var monthNames = [
       'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
       ];
    var monthName = monthNames[myTime.getMonth()];
    var day = myTime.getDate();
    var newDt = newHours+'.'+ minutes + amPm +', '+ monthName +' ' + day;



    // get only last two words from the description
    var splitDescription = descValue.split(' ');
    var lengthVec = splitDescription.length;
    if(lengthVec >2){
        var towWordsArr = splitDescription.slice(lengthVec-2);
        descValue = towWordsArr.join(' ');  
    }

    //get double figure number for tempture
    var newTemp = convertToDoubleDigit(tempValue);
    var newMinTemp = convertToDoubleDigit(tempMinValue);
    var newMaxTemp = convertToDoubleDigit(tempMaxValue);



    // insert the values to between the tags
    name.innerHTML = nameValue + ','+ countryData; //access the content within that HTML element
    dt.innerHTML = newDt;
    // Set the src attribute of the image element
    desc.innerHTML = descValue;
    temp.innerHTML =  newTemp +' \u00B0C';
    tempMin.innerHTML = newMinTemp +' \u00B0C';
    tempMax.innerHTML = newMaxTemp +' \u00B0C';
    imgElement.src = imgUrl;

    pressure.innerHTML = pressureValue;
    humidity.innerHTML = humidityValue;
    visibility.innerHTML = visibilityValue;
    degree.innerHTML = degreeValue;
    sunrise.innerHTML = newTimeSr;
    sunset.innerHTML = newTimeSs;
       
    
}



function convertToDoubleDigit(num) {
    
    if (num < 10 && 0<=num) {
      // If num is a single-digit number, add a leading zero
      return '0' + num;
    } else if(num<0 && num>-10) {
      // If num is already a double-digit number, return it as is
      var absNum = Math.abs(num);
      return  '-0' + absNum;
    }

    else{
        return num.toString();
    }
  }

