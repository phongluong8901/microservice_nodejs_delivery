import type { IOrder } from "../types";

interface Props {
    order: IOrder | null;
}

const RiderOrderMap = ({ order }: Props) => {
    return (
        <div>RiderOrderMap</div>
    );
}

export default RiderOrderMap;