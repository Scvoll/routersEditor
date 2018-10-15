import React, { Component } from 'react';
import './App.css';
import { RoutersList} from "./routersList";


export const reorder = (list, startIndex, endIndex) => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

let nextId = 0;

class App extends Component {
    constructor(props) {
        super(props);
        this.routeLine = null;
        this.myMap = null;
        this.state = {
            inputValue: "",
            routers: [],
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.addRoute = this.addRoute.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.initMap  = this.initMap.bind(this);
        this.deleteRoute = this.deleteRoute.bind(this);
        this.drawRouteLine = this.drawRouteLine.bind(this);
    }

    componentDidMount() {
        window.ymaps.ready(this.initMap);
    }

    initMap() {
        this.myMap = new window.ymaps.Map("map", {
            center: [55.76, 37.64],
            zoom: 7
        });
    }

    handleInputChange (e) {
        this.setState({
            inputValue: e.target.value,
        })
    }

    addRoute(e) {
        let zipText = this.state.inputValue.trim();
        if (e.key === "Enter" && zipText) {
            let rawCoordinates = window.ymaps.geocode(zipText);
                rawCoordinates.then(res => res.geoObjects.get(0).geometry.getCoordinates())
                .then((coordinates) => {
                    nextId++;
                    let mark = new window.ymaps.Placemark(coordinates, {
                        balloonContentHeader: `Маршрут №${nextId}`,
                        hintContent: "Подробнее"
                    }, {
                        draggable: true
                    });
                    this.onDragPlacemark(mark);


                    this.setState((prevState => {
                        return {
                            routers: prevState.routers.concat(
                                {
                                    id: nextId,
                                    text: `Маршрут №${nextId}`,
                                    coordinates: coordinates,
                                    mark: mark
                                }),
                            inputValue: "",
                        }
                    }));
                    return {mark, coordinates};
                })
                .then(({mark, coordinates})=> {
                    this.myMap.geoObjects.add(mark);
                    this.myMap.setCenter(coordinates, 7);
                    if (this.routeLine) {
                        this.myMap.geoObjects.remove(this.routeLine);
                        this.drawRouteLine();
                    } else {
                        this.drawRouteLine();
                    }
                })
        }
    }

    deleteRoute(id) {
        let changedList = this.state.routers.filter(item => {
            if (item.id === id) {
                this.myMap.geoObjects.remove(item.mark);
                return false;
            }
            return true
        });
        if (!changedList[0]) {
            nextId = 0;
        }
        this.setState(
            {routers: changedList}, () => {
            this.myMap.geoObjects.remove(this.routeLine);
            this.drawRouteLine();
        })
    }

    drawRouteLine () {
        let a =  this.state.routers.map(item => item.coordinates);
        this.routeLine = new window.ymaps.GeoObject({
            geometry: {
                type: "LineString",
                coordinates: a
            }
        });
        this.myMap.geoObjects.add(this.routeLine);
    }

    onDragEnd(result) {                 // on list item
        if (!result.destination) {
            return;
        }
        const routers = reorder(
            this.state.routers,
            result.source.index,
            result.destination.index
        );
        this.setState({
            routers,
        }, () => {
            if (this.state.routers.length > 1) {
                this.myMap.geoObjects.remove(this.routeLine);
                this.drawRouteLine();
            }
        });
    }

    onDragPlacemark (mark) {
        mark.events.add('dragend', (e)=> {
            this.myMap.geoObjects.remove(this.routeLine);
            let nextCoordinates = e.get('target').geometry._coordinates;
            let freshState = this.state.routers.map((item) => {
                if (item.text === mark.properties._data.balloonContentHeader) {
                    item.coordinates = nextCoordinates;
                    return item
                }
                return item
            });
            this.setState({
                routers: freshState
            }, () => {
                this.myMap.geoObjects.remove(this.routeLine);
                this.drawRouteLine();
            })
        });
    }


    render() {
        return (
            <div className="app">
                <div className='interface'>
                    <input placeholder={"Введите новую точку маршрута"}
                           value={this.state.inputValue}
                           onChange={this.handleInputChange}
                           onKeyPress={this.addRoute}
                    />
                    <RoutersList onDragEnd={this.onDragEnd}
                                 routers={this.state.routers}
                                 deleteRoute={this.deleteRoute}
                    />
                </div>
                <div id="map"/>
            </div>
        );
    }
}


export default App;

