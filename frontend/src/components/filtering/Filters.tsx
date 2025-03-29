import DateSelect from "./DateSelect";
import { LocationSelect } from "./LocationSelect";
import SeveritySelect from "./SeveritySelect";

function Filters () {
    return(<div>
        <LocationSelect />
        <DateSelect />
        <SeveritySelect />
    </div>);
}

export default Filters;