import React from 'react';
import {Input as Shadcn} from "@/components/ui/input";
import {Input} from "@nextui-org/react";
import DateRangePickerForm from "@/app/form-tests/DateRangePicker";

function Page() {
    return (
        // <div className="space-y-4 m-4">
        //     <Input
        //         radius="sm"
        //         color="primary"
        //         variant="bordered"
        //     />
        //     <Shadcn
        //         radius="sm"
        //         color="primary"
        //         variant="bordered"
        //     />
        // </div>
        <DateRangePickerForm/>


    );
}

export default Page;