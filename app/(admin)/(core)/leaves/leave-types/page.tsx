"use client"
import React, {Key, useCallback, useEffect, useMemo, useState} from 'react';
import {
    filterLeaveTypes,
    LeaveTypeTableConfiguration
} from "@/components/admin/leaves/leave-types/display/table/config/leave-type-table-config";
import {usePaginateQuery} from "@/services/queries";
import {LeaveRequestPaginate, LeaveType} from "@/types/leaves/LeaveTypes";
import DataDisplay from "@/components/common/data-display/data-display";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import LeaveTypeForm from "@/components/admin/leaves/leave-types/form/LeaveTypeForm";
import Typography from "@/components/common/typography/Typography";
import {getColor} from "@/helper/background-color-generator/generator";
import {Chip} from "@nextui-org/chip";
import {Button} from "@nextui-org/button";
import {uniformChipStyle, uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {isEqual} from "lodash";
import showDialog from "@/lib/utils/confirmDialog";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";
import CardView from "@/components/common/card-view/card-view";
import {isObjectEmpty} from "@/helper/objects/isObjectEmpty";
import {pluralize} from "@/helper/pluralize/pluralize";
import EmployeesAvatar from "@/components/common/avatar/employees-avatar";
import CardTable from "@/components/common/card-view/card-table";
import {capitalize} from "@nextui-org/shared-utils";
import {AxiosError} from "axios";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import {IoMdInformationCircle} from 'react-icons/io';
import {icon_size_sm} from "@/lib/utils";


function LeaveTypeTable() {
    const {toast} = useToast()
    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(5)
    const [leaveType, setLeaveType] = useState<LeaveType>()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const {data, isLoading, error} = usePaginateQuery<LeaveRequestPaginate>("/api/admin/leaves/leave-types", page, rows, {
        refreshInterval: 3000
    });
    useDocumentTitle("Manage Leave Types")
    const leaveData = useMemo(() => {
        if (!data?.data) {
            if(error){
                if(error instanceof AxiosError){
                    toast({
                        title: "Error", description: error.response?.data.message, variant: "danger",
                    })
                } else{
                    toast({
                        title: "Error", description: error, variant: "danger",
                    })
                }
                console.log("Error while fetching: ", error)

            }
            return []
        } else {
            return data.data
        }
    }, [data?.data, error, toast])

    const onOpenDrawer = useCallback(() => {
        setIsOpen(true)
    }, [setIsOpen])

    SetNavEndContent(() => {

        return (<>
            <Button {...uniformStyle()} onPress={onOpenDrawer}>
                Add Leave Type
            </Button>
            <LeaveTypeForm onOpen={setIsOpen} isOpen={isOpen}/>
        </>)
    })

    const handleRowKey = (key: Key) => {
        const data = leaveData.find((item) => item.id === Number(key))
        setLeaveType(data!)
    }

    useEffect(() => {
        const id = leaveType?.id
        if (!isEqual(leaveData, leaveType)) {
            setLeaveType(leaveData.find((item) => item.id === id))
        }
    }, [leaveData, leaveType]);

    // const handleLeaveTypeDeleteMultiple = async (keys: Selection) => {
    //     const deleteKeys = keys === "all" ? leaveData.map((item) => item.id) // Collect all IDs
    //         : Array.from(keys).map(key => Number(key)); // Collect selected IDs and convert to numbers
    //
    //
    //     // Filter leaveData to find names of the deleted items
    //     const deletedNames = leaveData
    //         .filter(item => deleteKeys.includes(item.id)) // Use includes to check for matches
    //         .map(item => item.name) // Map to get the names
    //         .join(", "); // Join names into a string
    //
    //
    //     const res = await showDialog({
    //         title: "Delete Leave Type", message: (<Typography>Are you sure you want to delete this
    //             <Typography as="span"
    //                         className="font-semibold"> {deletedNames}</Typography>?
    //         </Typography>)
    //     })
    //
    //
    //     alert("Deleted Keys: " + deleteKeys)
    //     if (res === "yes") {
    //         try {
    //             const res = await axiosInstance.post('/api/admin/leaves/leave-types/delete', deleteKeys)
    //             if (res.status !== 200) {
    //                 toast({
    //                     title: "Error", description: res.data.message, variant: "danger",
    //                 })
    //             }
    //         } catch (error){
    //             console.log(error)
    //             if(error instanceof Error) {
    //                 toast({
    //                     title: "Error", description: error.message, variant: "danger",
    //                 })
    //             } else if(error instanceof AxiosError){
    //                 toast({
    //                     title: "Error", description: error.response?.data.message, variant: "danger",
    //                 })
    //             }
    //         }
    //
    //
    //
    //     }
    //     if (res === "no") {
    //         return;
    //     }
    //
    // }


    return (<>
        <DataDisplay
            title="Leave Types"
            data={leaveData}
            isLoading={isLoading}
            filterProps={{
                filterItems: filterLeaveTypes
            }}
            sortProps={{
                sortItems: [{
                    key: "id", name: "ID"
                }, {key: "name", name: "Name"}, {key: "created_at", name: "Created At"}]

            }}
            // onDeleteSelected={async (keys) => {
            //     await handleLeaveTypeDeleteMultiple(keys)
            // }}
            searchProps={{
                searchingItemKey: ["name"]
            }}
            rowSelectionProps={{
                onRowChange: setRows
            }}
            paginationProps={{
                loop: true, data_length: data?.totalItems!, onChange: setPage
            }}
            onTableDisplay={{
                config: LeaveTypeTableConfiguration, onRowAction: handleRowKey, layout: "auto"
            }}


            // onExport={{
            //     drawerProps: {
            //         title: "Export",
            //     }
            // }}
            // onImport={{
            //     drawerProps: {
            //         title: "Import",
            //     }
            // }}
            onView={<LeaveTypesDetails {...leaveType!} onClose={() => setLeaveType(undefined)}/>}
            defaultDisplay="table"/></>);
}

export default LeaveTypeTable;


const LeaveTypesDetails = ({onClose, ...props}: LeaveType & { onClose: () => void }) => {
    const {toast} = useToast()
    const curr_emp = props.current_employees
    const [editOpen, setEditOpen] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const [data, setData] = useState<LeaveType>()
    const handleEmployeePicture = (key: Key) => {
        alert(key)
    }

    const handleLeaveTypeEdit = (value: boolean) => {
        setEditOpen(value)
        setData(props!)

    }

    const handleLeaveTypeDelete = async (key: Key) => {
        const hasEmployees = props.current_employees.length

        console.log("Props: ", props)
        const leaveTypeName = props.name
        if (hasEmployees > 0) {
            alert("Cannot delete leave type with employees")
        }

        const res = await showDialog({
            title: "Delete Leave Type", message: (<Typography>Are you sure you want to delete this
                <Typography as="span" className="font-semibold"> {leaveTypeName}</Typography>?
            </Typography>)
        })

        const deletedIds = {
            leave_type_id: props.id, employee_status_id: props.applicable_to_employee_types
        }

        if (res === "yes") {
            setLoading(true)
            try {
                const res = await axiosInstance.post('/api/admin/leaves/leave-types/delete', deletedIds)
                if (res.status !== 200) {
                    toast({
                        title: "Error", description: res.data.message, variant: "danger",
                    })
                }
            } catch (error) {
                console.log(error)
                if (error instanceof AxiosError) {
                    toast({
                        title: "Error", description: error.response?.data.message, variant: "danger",
                    })
                } else {
                    toast({
                        title: "Error", description: "An unexpected error occurred", variant: "danger",
                    })
                }
            }


        }
        if (res === "no") {
            return;
        }

    }

    return (<>
        {!isObjectEmpty(props) && <CardView
            className="max-w-[500px]"
            title="Leave Type"
            onDelete={() => handleLeaveTypeDelete(props.id)}
            onEdit={() => handleLeaveTypeEdit(!editOpen)}
            editProps={{
                isDisabled: props.current_employees.length > 0
            }}
            deleteProps={{
                isLoading: loading,
                isDisabled: props.current_employees.length > 0
            }}
            onClose={onClose}
            header={<div
                className="flex flex-col gap-2 h-32 bg-opacity-50 backdrop-blur-sm w-full">
                <div className="flex items-center gap-5 w-fit">
                    <Typography className="text-2xl font-bold">{props.name}</Typography>
                    <Chip style={{
                        background: getColor(props.code, 0.2),
                        borderColor: getColor(props.code, 0.5),
                        color: getColor(props.code)
                    }} variant="bordered" classNames={{
                        content: "font-bold",
                    }}>
                        {props.code}
                    </Chip>
                </div>
                <div className="text-pretty break-words h-24">
                    <Typography className="text-sm text-justify indent-5 h-[4rem]">
                        {props.description}
                    </Typography>
                </div>
            </div>}
            body={<CardTable data={[//     {
                //     label: "Minimum Days", value: pluralize(props.min_duration, "day")
                // },
                {label: "Maximum Days", value: pluralize(props.max_duration, "day")}, {
                    label: "Applicable for",
                    value:  <div className="flex flex-wrap gap-2">{props.applicable_to_employee_types.map(item => (
                            <Chip key={item.id} {...uniformChipStyle(item.name)} variant="bordered"
                                  className="rounded" size="sm">{capitalize(item.name)}</Chip>))}</div>

                }, {
                    label: "Current Usage",
                    value: <EmployeesAvatar employees={curr_emp} handleEmployeePicture={handleEmployeePicture}/>
                }, {
                    label: "Leave Compensation Status", value: props.paid_leave ? "Paid Leave" : "Unpaid Leave"
                }, {
                    label: "Attachment Status", value: props.attachment_required ? "Required" : "Not Required"
                }, {
                    label: "Created At", value: props.created_at
                }, {
                    label: "Updated At", value: props.updated_at
                },]}/>}
            onDanger={
                <div className="w-full">{props.current_employees.length > 0 && <Chip className="bg-[#338EF7] text-white min-w-full" radius="sm" startContent={<IoMdInformationCircle className={icon_size_sm}/>}>Note. This leave cannot be edited or deleted.</Chip>}</div>
            }
        />}

        <LeaveTypeForm
            isOpen={editOpen}
            onOpen={setEditOpen}
            data={data}
            title="Update Leave Type"
            description="Kindly update the details for the leave type provided below."/>
    </>)
}