import { Button } from "@mantine/core";
import DateSelect from "./DateSelect";
import { LocationSelect } from "./LocationSelect";
import SeveritySelect from "./SeveritySelect";

function Filters () {
    return(<div>
        <LocationSelect />
        <DateSelect />
        <SeveritySelect />
        <Button>Submit</Button>
    </div>);
}

export default Filters;