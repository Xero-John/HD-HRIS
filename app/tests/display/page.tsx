"use client"
import React, {useMemo} from 'react';
// import DataDisplay from "@/components/common/data-display/data-display";
import {useQuery} from "@/services/queries";
import {LeaveType} from "@/types/leaves/LeaveTypes";
// import DataDisplay from "@/components/common/data-display/draft/data-display";
import {
    filterLeaveTypes, LeaveTypeTableConfiguration
} from "@/components/admin/leaves/leave-types/display/table/config/leave-type-table-config";
import DataDisplay from "@/components/common/data-display/data-display";
import {Card, CardBody} from "@nextui-org/card";
import FormSwitch from "@/components/ui/FormSwitch";


function Page() {
    const {data, isLoading} = useQuery<LeaveType[]>("/api/admin/leaves/leave-types", {
        refreshInterval: 3000
    });
    const leaveData = useMemo(() => {
        if (!data) return []
        return data
    }, [data])
    return (<div>
        <FormSwitch>Hello</FormSwitch>
        <DataDisplay
            title="Leave Types"
            data={leaveData}
            filterProps={{
                filterItems: filterLeaveTypes
            }}
            sortProps={{
                sortItems: [{key: "name", name: "Name"}, {key: "created_at", name: "Created At"}, {
                    key: "is_active", name: "Status"
                },]
            }}
            searchProps={{
                searchingItemKey: ["name"]
            }}
            paginationProps={{
                loop: true,
            }}
            onTableDisplay={{
                config: LeaveTypeTableConfiguration, isLoading,
            }}
            onGridDisplay={(data) => {
                return (<pre>{JSON.stringify(data, null, 2)}</pre>)
            }}

            onListDisplay={(data) => {
                return (<Card className="w-full">
                        <CardBody>{data.name}</CardBody>
                    </Card>

                )
            }}
        />
    </div>);
}

export default Page;