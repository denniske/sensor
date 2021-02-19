import {getRows} from '../src/helper/get-rows';
import SensorLayout from '../src/components/sensor-layout';


export default function Home({sensors}) {
    return (
        <SensorLayout sensors={sensors}/>
    );
}

export async function getStaticProps() {
    const sensors = await getRows();
    console.log(sensors);
    return {
        props: {
            sensors,
        },
    };
}
