import { maxBy, min, orderBy } from 'lodash';
import {createStylesheet} from '../helper/styles';
import {ISensor} from './sensor.type';
import {useEffect, useState} from 'react';
import useWindowDimensions from '../hooks/use-window-dimensions';
import useClientLoaded from '../hooks/use-client-loaded';
import {noop} from '@babel/types';
import {faArrowDown, faArrowUp, faCoffee, faCross, faTimes} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const useStyles = createStylesheet((theme) => ({
    links: {
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        marginTop: 25,
    },
    link: {
        marginHorizontal: 10,
    },
    outer: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
    },
    container: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#111',
        // width: 500,
        width: '100vw',
        height: 700,
        overflow: 'hidden',
        marginVertical: 50,
    },
    surface: {
        position: 'relative',
        width: 0,
        height: 700,
    },
    wrapper: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        marginHorizontal: 15,
    },
    box: {
        position: 'absolute',
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: '#AAA',
        transitionDuration: '300ms',
        transitionProperty: 'width, height, left, top, display, opacity',
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    model: {
        fontSize: '0.85rem',
        color: 'white',
        display: 'inline-block',
        margin: -2,
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: '#AAA',
        zIndex: 10,
    },
    row: {},
    cellWithout: {
        paddingVertical: 2,
        textAlign: 'right',
    },
    cellX: {
        width: 20,
        paddingVertical: 2,
        textAlign: 'center',
    },
    cellW: {
        width: 90,
        paddingVertical: 2,
        textAlign: 'right',
    },
    cellH: {
        width: 40,
        paddingVertical: 2,
        textAlign: 'right',
    },
    cell: {
        width: 150,
        paddingVertical: 2,
        textAlign: 'right',
    },
    cellModel: {
        width: 265,
    },
    cellScreen: {
        width: 200,
    },
    cellAspectRatio: {
        width: 130,
        textAlign: 'right',
    },
    cellArea: {
        width: 130,
        textAlign: 'right',
    },
    cellCheckbox: {
        width: 30,
    },
    cellLogo: {
        width: 150,
    },
    pointer: {
        cursor: 'pointer',
    },
    sortIcon: {
        marginLeft: 5,
        cursor: 'pointer',
    },
    text: {
        border: 'none',
        borderBottom: '1px solid #CCC',
        background: 'transparent',
        width: 40,
        color: 'white',
        outline: 'none',
        paddingBottom: 5,
    },
    textSearch: {
        border: 'none',
        borderBottom: '1px solid #CCC',
        background: 'transparent',
        width: 200,
        color: 'white',
        outline: 'none',
        paddingBottom: 5,
    },
    title: {
        // marginLeft: 150,
    },
    tableSelected: {
        minHeight: 350,
    },
}));

interface Props {
    sensors: ISensor[];
}

function sortSensors(selectedSensors: ISensor[], sensors: ISensor[]) {
    const result = [...selectedSensors];
    result.sort(function(a, b){
        return sensors.indexOf(a) - sensors.indexOf(b);
    });
    return result;
}

const offset = 50;

export function SensorComparison({sensors}: Props) {
    const windowDimensions = useWindowDimensions();
    const loaded = useClientLoaded();
    const classes = useStyles();
    const [selectedSensors, setSelectedSensors] = useState(sensors.filter((s) => s.default));
    const [realPhysicalSensorSize, setRealPhysicalSensorSize] = useState(false);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortColumn2, setSortColumn2] = useState(null);
    const [sortDirection, setSortDirection] = useState(null);
    const [screenSize, setScreenSize] = useState<number>(typeof window !== 'undefined' ? Math.sqrt(window.screen.width*window.screen.width+window.screen.height*window.screen.height)/96 : 100);
    const [screenSizeStr, setScreenSizeStr] = useState<string>(typeof window !== 'undefined' ? (Math.sqrt(window.screen.width*window.screen.width+window.screen.height*window.screen.height)/96).toFixed(1) : '100');
    const [searchStr, setSearchStr] = useState<string>('');
    const [filteredSensors, setFilteredSensors] = useState<ISensor[]>(sensors);

    const maxWidth = windowDimensions.width - offset*2;
    const maxHeight = 700;

    const maxSensorWidth = maxBy(selectedSensors, s => s.width);
    const maxSensorHeight = maxBy(selectedSensors, s => s.height);

    let factor = 1;
    if (maxSensorWidth != null) {
        const factorWidth = maxWidth / maxSensorWidth.width;
        const factorHeight = maxHeight / maxSensorHeight.height;

        factor = min([factorWidth, factorHeight]);
    }

    if (realPhysicalSensorSize && screenSize) {
        const screenDiagonalPx = typeof window !== 'undefined' ? Math.sqrt(window.screen.width*window.screen.width+window.screen.height*window.screen.height) : 100;
        const oneInchPx = screenDiagonalPx / screenSize;
        const oneMillimeterPx = screenDiagonalPx / screenSize / 2.54 / 10;
        factor = oneMillimeterPx;
    }

    useEffect(() => {
        let list = sensors.filter(s => s.model.toLowerCase().indexOf(searchStr.toLowerCase().trim()) > -1 || s.logo.toLowerCase().indexOf(searchStr.toLowerCase().trim()) > -1);
        if (sortColumn?.length > 0) {
            list = orderBy(list, s => s[sortColumn], sortDirection);
        }
        if (sortColumn?.length > 0 && sortColumn2?.length > 0) {
            list = orderBy(list, [s => s[sortColumn], s => s[sortColumn2]], [sortDirection, sortDirection]);
        }
        setFilteredSensors(list);
    }, [searchStr, sortColumn, sortDirection]);

    const changeSort = (column: string, column2: string) => {
        if (sortColumn !== column) {
            setSortColumn(column);
            setSortColumn2(column2);
            setSortDirection('asc');
            return;
        }
        if (sortColumn === column && sortDirection === 'asc') {
            setSortColumn(column);
            setSortColumn2(column2);
            setSortDirection('desc');
            return;
        }
        if (sortColumn === column && sortDirection === 'desc') {
            setSortColumn(null);
            setSortColumn2(null);
            setSortDirection(null);
            return;
        }
    };

    const onToggleSensor = (sensor) => {
        console.log('onToggleSensor');
        if (selectedSensors.includes(sensor)) {
          setSelectedSensors(selectedSensors.filter(s => s !== sensor));
        } else {
          setSelectedSensors([...selectedSensors, sensor]);
        }
    };

    const onToggleAllSensorsForLogo = (logo) => {
        const allSensorsSelected = selectedSensors.filter(s => s.logo === logo).length === sensors.filter(s => s.logo === logo).length;
        console.log('onToggleAllSensorsForLogo', allSensorsSelected);
        const selectedWithout = selectedSensors.filter(s => s.logo !== logo);
        if (allSensorsSelected) {
            setSelectedSensors([...selectedWithout]);
        } else {
            setSelectedSensors([...selectedWithout, ...sensors.filter(s => s.logo === logo)]);
        }
    };

    const onToggleRealPhysicalSensorSize = (val) => {
        setRealPhysicalSensorSize(!realPhysicalSensorSize);
    };

    const onScreenSizeChange = (event) => {
        setScreenSizeStr(event.target.value.replace(',', '.'));
        setScreenSize(parseFloat(event.target.value.replace(',', '.')));
    };

    const onSearchChange = (event) => {
        setSearchStr(event.target.value);
    };

    const onSearchClear = () => {
        setSearchStr('');
    };

    const centerX = 0;

    const getAlignItems = (sensor: ISensor) => {
        return sensor.anchor.startsWith('top') ? 'flex-start' : 'flex-end';
    };

    const getJustifyContent = (sensor: ISensor) => {
        if (sensor.anchor.endsWith('left')) return 'flex-start';
        if (sensor.anchor.endsWith('center')) return 'center';
        return 'flex-end';
    };

    const getResolution = (sensor: ISensor) => {
        if (sensor.resolutionX && sensor.resolutionY) {
            return `${sensor.resolutionX} x ${sensor.resolutionY}`;
        }
        return '-';
    };

    const getDensity = (sensor: ISensor) => {
        return sensor.photositeDensity ? sensor.photositeDensity.toLocaleString('en') : '-';
    };

    const getDimensions = (sensor: ISensor) => {
        return `${sensor.width.toFixed(2)} x ${sensor.height.toFixed(2)}`;
    };

    const getArea = (sensor: ISensor) => {
        return `${sensor.area.toFixed(2)}`;
    };

    const getDiagonal = (sensor: ISensor) => {
        return `${sensor.diagonal.toFixed(2)}`;
    };

    function getAspectRatio(aspectRatio: string) {
        if (!aspectRatio) return;
        const parts = aspectRatio.split(':');
        return `${parseFloat(parts[0]).toFixed(2)}:1`;
    }

    const logoCount: Record<string, number> = {};

    const logoAsset = {
        'analog': 'analog.svg',
        'arri': 'arri.svg',
        'canon': 'canon.svg',
        'red': 'red.png',
        'blackmagic': 'blackmagic.svg',
        'panasonic': 'panasonic.svg',
        'panavision': 'panavision.svg',
        'sony': 'sony.svg',
    };

    return (
        <div className={classes.outer}>
            <div className={classes.container}>
                <div className={classes.surface}>
                    {
                        loaded && sensors.map(sensor => (
                            <div key={sensor.model} style={{
                                width: sensor.width*factor,
                                height: sensor.height*factor,
                                left: centerX-(sensor.width*factor)/2,
                                top: maxHeight/2-(sensor.height*factor)/2,
                                borderColor: sensor.color,
                                opacity: selectedSensors.includes(sensor) ? 1 : 0,
                                alignItems: getAlignItems(sensor),
                                justifyContent: getJustifyContent(sensor),
                            }} className={classes.box}>
                                <div className={classes.model} style={{
                                    color: sensor.textColor,
                                    backgroundColor: sensor.color,
                                }}>{sensor.logo} {sensor.model}</div>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className={classes.wrapper}>
                <div>
                    <h3 className={classes.title}>Options</h3>
                    <table>
                        <tbody>
                        <tr>
                            <td className={classes.cellLogo}/>
                            <td className={classes.cellCheckbox}><input className={classes.pointer} type="checkbox" checked={realPhysicalSensorSize} onChange={onToggleRealPhysicalSensorSize} /></td>
                            <td className={`${classes.cellModel} ${classes.pointer}`} onClick={onToggleRealPhysicalSensorSize}>Real physical sensor size</td>
                            <td className={classes.cellScreen}>Your screen size (inch)</td>
                            <td className={classes.cell}><input type="text" className={classes.text} value={screenSizeStr} onChange={onScreenSizeChange} /></td>
                        </tr>
                        </tbody>
                    </table>
                    <h3 className={classes.title}>Selected</h3>
                    <div className={classes.tableSelected}>
                    <table>
                        <thead>
                        <tr>
                            <th className={classes.cellLogo}/>
                            <th className={classes.cellCheckbox}/>
                            <th className={classes.cellModel}>Model</th>
                            <th className={classes.cell}>Dimensions (mm)</th>
                            <th className={classes.cellAspectRatio}>Aspect Ratio</th>
                            <th className={classes.cell}>Diagonal (mm)</th>
                            <th className={classes.cellArea}>Area (mm²)</th>
                            <th className={classes.cell}>Resolution (px)</th>
                            <th className={classes.cellWithout}>Crop Factor (S35){'\u00A0\u00A0\u00A0'}</th>
                            <th className={classes.cellWithout}>Density (px/mm²)</th>
                        </tr>
                        </thead>
                        <tbody>
                            {
                                sortSensors(selectedSensors, sensors).map(sensor => (
                                    <tr key={sensor.model} className={`${classes.row} ${classes.pointer}`} onClick={() => onToggleSensor(sensor)}>
                                        <td className={classes.cellLogo} style={{textAlign: 'right', paddingRight: 10}}>{sensor.logo}</td>
                                        <td className={classes.cellCheckbox}><input className={classes.pointer} type="checkbox" checked={selectedSensors.includes(sensor)} onChange={() => noop} /></td>
                                        <td className={classes.cellModel}>{sensor.model}</td>
                                        <td className={classes.cell}>{getDimensions(sensor)}</td>
                                        <td className={classes.cellAspectRatio}>{getAspectRatio(sensor.aspectRatio)}</td>
                                        <td className={classes.cell}>{getDiagonal(sensor)}</td>
                                        <td className={classes.cellArea}>{getArea(sensor)}</td>
                                        <td className={classes.cell}>{getResolution(sensor)}</td>
                                        <td className={classes.cellWithout}>{sensor.cropFactor}</td>
                                        <td className={classes.cellWithout}>{getDensity(sensor)}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    </div>
                    {/*<h3 className={classes.title}>All {sortColumn} - {sortDirection}</h3>*/}
                    <h3 className={classes.title}>All</h3>
                    <table className="table-all">
                        <thead>
                            <tr>
                                <th className={classes.cellLogo}/>
                                <th className={classes.cellCheckbox}/>
                                <th className={classes.cellModel}>
                                    Model
                                </th>
                                <th colSpan={3} className={`${classes.cell} ${classes.pointer}`} onClick={() => changeSort('width', 'height')}>
                                    Dimensions (mm)
                                    {
                                        sortColumn === 'width' &&
                                        <FontAwesomeIcon className={classes.sortIcon} icon={sortDirection === 'desc' ? faArrowDown : faArrowUp} />
                                    }
                                </th>
                                <th className={`${classes.cellAspectRatio} ${classes.pointer}`} onClick={() => changeSort('aspectRatio')}>
                                    Aspect Ratio
                                    {
                                        sortColumn === 'aspectRatio' &&
                                        <FontAwesomeIcon className={classes.sortIcon} icon={sortDirection === 'desc' ? faArrowDown : faArrowUp} />
                                    }
                                </th>
                                <th className={`${classes.cell} ${classes.pointer}`} onClick={() => changeSort('diagonal')}>
                                    Diagonal (mm)
                                    {
                                        sortColumn === 'diagonal' &&
                                        <FontAwesomeIcon className={classes.sortIcon} icon={sortDirection === 'desc' ? faArrowDown : faArrowUp} />
                                    }
                                </th>
                                <th className={`${classes.cellArea} ${classes.pointer}`} onClick={() => changeSort('area')}>
                                    Area (mm²)
                                    {
                                        sortColumn === 'area' &&
                                        <FontAwesomeIcon className={classes.sortIcon} icon={sortDirection === 'desc' ? faArrowDown : faArrowUp} />
                                    }
                                </th>
                                <th className={`${classes.cell} ${classes.pointer}`} onClick={() => changeSort('resolutionX', 'resolutionY')}>
                                    Resolution (px)
                                    {
                                        sortColumn === 'resolutionX' &&
                                        <FontAwesomeIcon className={classes.sortIcon} icon={sortDirection === 'desc' ? faArrowDown : faArrowUp} />
                                    }
                                </th>
                                <th className={`${classes.cellWithout} ${classes.pointer}`} onClick={() => changeSort('cropFactor')}>
                                    {'\u00A0\u00A0\u00A0\u00A0'}
                                    Crop Factor (S35)
                                    {
                                        sortColumn === 'cropFactor' &&
                                        <FontAwesomeIcon className={classes.sortIcon} icon={sortDirection === 'desc' ? faArrowDown : faArrowUp} />
                                    }
                                </th>
                                <th className={`${classes.cellWithout} ${classes.pointer}`} onClick={() => changeSort('photositeDensity')}>
                                    {'\u00A0\u00A0\u00A0\u00A0'}
                                    Density (px/mm²)
                                    {
                                        sortColumn === 'photositeDensity' &&
                                        <FontAwesomeIcon className={classes.sortIcon} icon={sortDirection === 'desc' ? faArrowDown : faArrowUp} />
                                    }
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    {'\u00A0'}
                                </td>
                            </tr>
                            <tr>
                                <td className={classes.cellLogo}/>
                                <td className={classes.cellCheckbox}/>
                                <td className={classes.cellModel}>
                                    <input type="text" placeholder="search" className={classes.textSearch} value={searchStr} onChange={onSearchChange} />
                                    {'\u00A0'}{'\u00A0'}
                                    {
                                        searchStr.length > 0 &&
                                        <FontAwesomeIcon className={classes.pointer} icon={faTimes} onClick={() => onSearchClear()} />
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {'\u00A0'}
                                </td>
                            </tr>
                            {
                                filteredSensors.map((sensor, i) => {

                                    const hasPrintedLogo = logoCount[sensor.logo];
                                    if (!hasPrintedLogo) {
                                        logoCount[sensor.logo] = filteredSensors.filter(s => s.logo === sensor.logo).length;
                                    }

                                    return (
                                        <tr key={sensor.model} className={`${classes.row} ${classes.pointer}`}
                                            onClick={() => onToggleSensor(sensor)}>

                                            {
                                                !hasPrintedLogo && !(sortColumn?.length > 0) &&
                                                <td rowSpan={logoCount[sensor.logo]} style={{verticalAlign: 'top', paddingTop: 6}}
                                                    onClick={(ev) => {
                                                        onToggleAllSensorsForLogo(sensor.logo);
                                                        ev.stopPropagation();
                                                    }}>
                                                    <img
                                                    style={{width: 100, filter: 'brightness(0) invert()'}}
                                                    src={`/logo/${logoAsset[sensor.logo.toLowerCase()]}`}/>
                                                </td>
                                            }
                                            {
                                                sortColumn?.length > 0 &&
                                                <td className={classes.cellLogo} style={{textAlign: 'right', paddingRight: 10}}>{sensor.logo}</td>
                                            }

                                            <td className={classes.cellCheckbox}><input className={classes.pointer}
                                                                                        type="checkbox"
                                                                                        checked={selectedSensors.includes(sensor)}
                                                                                        onChange={() => noop}/></td>
                                            <td className={classes.cellModel}>{sensor.model}</td>

                                            <td className={classes.cellW}>{sensor.width.toFixed(2)}</td>
                                            <td className={classes.cellX}>x</td>
                                            <td className={classes.cellH}>{sensor.height.toFixed(2)}</td>

                                            <td className={classes.cellAspectRatio}>{getAspectRatio(sensor.aspectRatio)}</td>
                                            <td className={classes.cell}>{getDiagonal(sensor)}</td>
                                            <td className={classes.cellArea}>{getArea(sensor)}</td>
                                            <td className={classes.cell}>{getResolution(sensor)}</td>
                                            <td className={classes.cellWithout}>{sensor.cropFactor}</td>
                                            <td className={classes.cellWithout}>{getDensity(sensor)}</td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    );
}
