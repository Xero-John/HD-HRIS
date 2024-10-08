"use client";
import React from 'react';
import { Autocomplete, AutocompleteItem, cn } from "@nextui-org/react";
import Typography from "@/components/common/typography/Typography";
import { Controller, useFormContext } from "react-hook-form";
import { LuChevronsUpDown } from "react-icons/lu";
import { LeaveType } from "@/types/leaves/LeaveRequestTypes";

interface LeaveTypeSelectionProps {
    leaveTypes: LeaveType[];
    isLoading?: boolean;
    duration: (days: number | null) => void;
}

function LeaveTypeSelection({ duration, leaveTypes, isLoading }: LeaveTypeSelectionProps) {
    const { control, setValue, formState: { errors } } = useFormContext();
    const [searchTerm, setSearchTerm] = React.useState('');  // Add state for searchTerm

    // Memoize the leave types and normalize for searching
    const availableLeavesTypes = React.useMemo(() => {
        if (!leaveTypes || leaveTypes.length === 0) return [];
        return leaveTypes.map(type => ({
            ...type,
            textValue: type.name.toLowerCase(),  // Normalize for search
        }));
    }, [leaveTypes]);

    return (
        <Controller
            control={control}
            name="leave_type_id"
            render={({ field }) => (
                <div>
                    <Autocomplete
                        label={<Typography
                            className={cn("text-sm font-medium inline-flex", errors.leave_type_id ? "text-red-500" : "")}>
                            Pick a Leave Type
                        </Typography>}
                        isClearable={false}
                        aria-hidden="false"
                        isRequired
                        radius="sm"
                        placeholder="Select a Leave Type"
                        items={availableLeavesTypes.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))}  // Filter based on searchTerm
                        labelPlacement="outside"
                        className="w-full"
                        variant="bordered"
                        isLoading={isLoading}
                        disableSelectorIconRotation
                        selectorIcon={<LuChevronsUpDown />}
                        selectedKey={field.value ? String(field.value) : null}
                        onInputChange={(e) => setSearchTerm(e)}  // Update searchTerm on input change
                        onSelectionChange={(e) => {
                            const selectedItem = availableLeavesTypes.find(item => String(item.id) === String(e));
                            if (selectedItem) {
                                setValue('leave_type_id', selectedItem.id);
                                field.onChange(selectedItem.id);  // Sync with react-hook-form
                                duration(selectedItem.duration_days);  // Set the leave type duration
                            } else {
                                setValue('leave_type_id', "");
                                field.onChange("");  // Clear value
                                duration(null);  // Clear duration
                            }
                        }}
                        {...field}
                    >
                        {(item) => (
                            <AutocompleteItem textValue={item.name} key={item.id} className="capitalize">
                                {item.name}
                            </AutocompleteItem>
                        )}
                    </Autocomplete>

                    {errors.leave_type_id && (
                        <Typography className="text-[0.8rem] font-medium text-red-500 mt-2">
                            {errors.leave_type_id.message as string}
                        </Typography>
                    )}
                </div>
            )}
        />
    );
}

export default LeaveTypeSelection;