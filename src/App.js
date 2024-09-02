import React, {useState, useContext} from 'react';
import './App.css';
import { Button, Input, Card, message, Empty, Typography, List, Row, Col, Statistic, Switch } from 'antd';
import {
  SearchOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import moment from 'moment'
import { ThemeContext } from "./Theme";

function App() {

  const { theme, toggleTheme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [inputError, setInputError] = useState(false);
  const [countryCityVal, setCountryCityVal] = useState(null);
  const [searchedInfo, setSearchedInfo] = useState({});
  const [searchHistory, setSearchHistory] = useState([]);

function getCountryCityData(countryCity){
  // Fetch using Geocoder API to get Lat and Lon for given country/city
  
  if (countryCity !== null) {
    setLoading(true);
    let searchHist = searchHistory;
    searchHist.push({
      "value":countryCity.toString(),
      "dt": moment().format("DD-MM-YYYY HH:mm a")
    }
    )
    setSearchHistory(searchHist)
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${countryCity.toString().toLowerCase()}&appid=c8b4befa7aa57e19e18c6ff2ad93929a`)
    .then(res => res.json())
    .then((result) => {
      if (result.length === 0) {
        // Empty response from the API
        setInputError(true);
        setLoading(false);
        messageApi.error("Unable to find the country/city provided.")
      } else {
        let parsedInfo = {
          "country": result[0]['country'],
          "state": 'state' in result[0] ? result[0]['state'] : result[0]['name'],
          "lat": result[0]['lat'],
          "lon": result[0]['lon']
        }
        getCurrentTemp(parsedInfo)
      }
    })
  } else {
    // Show alert saying please fill in value
    messageApi.warning("Please enter a country/city to search for!");
    setLoading(false);
  }
  setCountryCityVal(null);
}

function getCurrentTemp(parsedInfo) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${parsedInfo['lat']}&lon=${parsedInfo['lon']}&appid=c8b4befa7aa57e19e18c6ff2ad93929a`)
  .then(res => res.json())
  .then((result) => {
    if (Object.keys(result).length !== 0 && result['cod'] === 200){
      let searchedObj = {};
      searchedObj['country'] = parsedInfo['country']
      searchedObj['state'] = parsedInfo['state']
      searchedObj['current_temp'] = Math.round(result['main']['temp'] - 273.15)
      searchedObj['feels_like'] = Math.round(result['main']['feels_like'] - 273.15)
      searchedObj['max_temp'] = Math.round(result['main']['temp_max'] - 273.15)
      searchedObj['min_temp'] = Math.round(result['main']['temp_min'] - 273.15)
      searchedObj['humidity'] = result['main']['humidity']
      searchedObj['weather'] = result['weather'][0]['main']
      searchedObj['weather_icon'] = `http://openweathermap.org/img/wn/${result['weather'][0]['icon']}@2x.png`
      searchedObj['dt'] = moment().format("DD-MM-YYYY HH:mm a");
      setSearchedInfo(searchedObj)

    } else {
      setLoading(false);
      messageApi.error("Searched country/city does not have a valid latitude and longitude")
    }
  })
  setLoading(false);
}

function searchAgain(value){
  setCountryCityVal(value);
  getCountryCityData(value);
};

function removeHistory(value){
  let specifiedIndex = searchHistory.indexOf(value)
  let filteredSearchHistory = searchHistory.filter((item, index) => index !== specifiedIndex)
  setSearchHistory(filteredSearchHistory);
};


  return (
    <>
    {contextHolder}
    <div className={`App ${theme}`}>
      <header className="App-header">
        <div className="container">
        <Row>
          <Col span={6}/>
        <Col span={12}>
        <div className='spacer'>
            <Input className='searchInput' status={inputError ? 'error' : ''}
            value={countryCityVal}
             onChange={(e) => {setInputError(false);setCountryCityVal(e.target.value)}}/>
            <Button icon={<SearchOutlined/>} onClick={() => getCountryCityData(countryCityVal)}/>
          </div>
        </Col>
        <Col span={6}>
          <Switch checkedChildren="Dark" unCheckedChildren="Light" onClick={() => toggleTheme()} defaultChecked/>
        </Col>
      </Row>
          
          <div className='body'>
            <Row style={{width: "100%", height: '100%'}}>
              <Col span={6} style={{width: "100%", height: '100%'}}/>
              <Col span={12} style={{width: "100%", height: '100%'}}>
              <Card className='card' bordered={false}>
            <div className='currentWeatherBox'>
            
            <Card className="currentWeatherCard" loading={loading} bordered={false}>
            {
                    Object.keys(searchedInfo).length !== 0 ?
                    <>
                      <div className="currTemp">
                        <Row>
                          <Col span={18}>
                              <Statistic title={"Today's Weather"} value={searchedInfo["current_temp"]} suffix={<>&deg;</>} valueStyle={{fontSize: "4em"}}/>
                          </Col>
                          <Col span={6}>
                          <img className='weatherImg' src={searchedInfo['weather_icon']} alt='image of current weather'/>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={4}>
                            <h4>H: {searchedInfo["max_temp"]}&deg;</h4>
                          </Col>
                          <Col span={4}>
                            <h4>L: {searchedInfo["min_temp"]}&deg;</h4>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={6}>
                            {searchedInfo['state']}, {searchedInfo['country']}
                          </Col>
                          <Col span={6}>
                            {searchedInfo['dt']}
                          </Col>
                          <Col span={6}>
                            Humidity: {searchedInfo['humidity']}%
                          </Col>
                          <Col span={6}>
                            {searchedInfo['weather']}
                          </Col>
                        </Row>
                      </div>
                    </>
                    :
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <Typography.Text>
                          Please search for a country/city to view the current temperature information.
                        </Typography.Text>
                      }
                />
                  }
                </Card>
            
              </div>
              <div className='searchHistoryBox'>
                <Card title="Search History" className="searchHistoryContainer" bordered={false}>
                {
                    Object.keys(searchHistory).length !== 0 ?
                    <List
                    dataSource={searchHistory}
                    renderItem={(item) => (
                      <List.Item
                      actions={[<Button icon={<SearchOutlined/>} onClick={() => searchAgain(item['value'])}/>, 
                      <Button icon={<DeleteOutlined/>} onClick={() => removeHistory(item)}/>]}>
                        <List.Item.Meta
                          title={item['value']}
                          description={item['dt']}
                        />
                      </List.Item>
                    )}
                  />
                  :
                  <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <Typography.Text>
                          No records
                        </Typography.Text>
                      }
                />
                }
                  
                </Card>
              </div>
            </Card>
              </Col>
              <Col span={6} style={{width: "100%", height: '100%'}}/>
            </Row>
            
          </div>  
        </div>
      </header>
    </div>
    </>
  );
}

export default App;
