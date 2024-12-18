"use client"
import React, {useMemo} from 'react';
import DataDisplay from '@/components/common/data-display/data-display';
import {useSignatories} from "@/services/queries";
import BorderCard from "@/components/common/BorderCard";
import Typography, {Section} from "@/components/common/typography/Typography";
import {AnimatedList} from "@/components/ui/animated-list";
import {Accordion, AccordionItem, Avatar, Button} from '@nextui-org/react';
import {capitalize} from "@nextui-org/shared-utils";
import {LuPlus, LuSettings2} from 'react-icons/lu';
import CardTable from '@/components/common/card-view/card-table';
import {Tooltip} from "@nextui-org/tooltip";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {icon_size_sm} from "@/lib/utils";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import SignatoryForm from "@/components/admin/signatory/list-form/add-signatory-form";
import AddJobRoleForm from "@/components/admin/signatory/list-form/add-job-role/add-job-role-form";
import {JobTypes} from "@/types/signatory/job/job-types";
import {SignatoryRoles} from "@/types/signatory/signatory-types";

function Page() {
    const {data, isLoading, mutate} = useSignatories()
    const signatories = useMemo(() => {
        if (data) {
            return data
        }
        return []
    }, [data])


    SetNavEndContent(() => {
        return (<SignatoryForm/>)
    })
    return (
        <DataDisplay
        isLoading={isLoading}
        data={signatories}
        defaultDisplay="grid"
        searchProps={{
            searchingItemKey: ["name"]
        }}
        onGridDisplay={(data) => {
            console.log("Test: ", data.signatories.map(item => ({id: item.job_classes.id, name: item.job_classes.name})))
            const jobs: JobTypes[] = data.signatories.map(item => ({id: item.job_classes.id, name: item.job_classes.name}))
            const roles: SignatoryRoles[] = data.signatories.map(item => ({id: item.signatory_roles.id, signatory_role_name: item.signatory_roles.signatory_role_name}))
            return (<>
                <BorderCard className="w-full max-w-[450px]">
                    <Section className="ms-0" title={data.name} subtitle="">
                        <AddJobRoleForm id={data.id} name={data.name} existingJobs={jobs} existingRoles={roles}/>
                    </Section>
                    <div className="h-80 mt-4 pb-4 px-2 overflow-y-auto">
                        <AnimatedList className="mt-2">
                            <Accordion variant="splitted" selectionMode="multiple">
                                {data.signatories.sort((a, b) => a.order_number - b.order_number).map((item, index) => (
                                    <AccordionItem key={index} aria-label={data.name} indicator={<LuSettings2/>}
                                                   className="shadow-none border-2 rounded"
                                                   title={<div className="flex justify-between items-center">
                                                       <Typography
                                                           className="font-semibold text-sm">{item.order_number}</Typography>
                                                       <Typography
                                                           className="font-semibold text-sm">{item.job_classes.name}</Typography>
                                                       <Typography
                                                           className="font-semibold text-sm">{capitalize(item.signatory_roles.signatory_role_name)}</Typography>
                                                   </div>}>
                                        <hr className="border"/>
                                        <div className="mt-2 max-h-52 overflow-y-scroll">
                                            <CardTable data={item.employees.map((emp, index) => ({
                                                label: (<Tooltip key={index} content={emp.departments}>
                                                    <Avatar size="sm" isBordered src={emp.picture || ""}/>
                                                </Tooltip>), value: <Typography>{getEmpFullName(emp)}</Typography>
                                            }))}/>


                                        </div>
                                    </AccordionItem>))}
                            </Accordion>
                        </AnimatedList>
                    </div>
                </BorderCard>
            </>)
        }}
    />);
}

export default Page;

