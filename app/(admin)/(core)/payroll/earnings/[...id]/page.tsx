"use client";
import { z } from "zod";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Switch,
} from "@nextui-org/react";
import TableData from "@/components/tabledata/TableData";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { AffectedEmployee, PayheadAffected } from "@/types/payroll/payrollType";
import axios, { AxiosResponse } from "axios";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/dist/client/components/navigation";
import fetcher from "@/services/fetcher";
import useSWR from "swr";

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(20, { message: "Character limit reached." }),
  calculation: z.string(),
  is_mandatory: z.boolean(),
  is_active: z.boolean(),
});

function Page() {
  const [selectedKeys, setSelectedKeys] = useState<any>();
  const [valueKeys, setValueKeys] = useState<any>();
  const { id } = useParams(); // This will capture the dynamic 'id' from the URL
  const { data, isLoading } = useSWR<PayheadAffected>(
    `/api/admin/payroll/earnings/edit?id=${id}`,
    fetcher
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      calculation: "",
      is_mandatory: false,
      is_active: false,
    },
  });
  const setData = useCallback(async () => {
    if (data){
      const employeeIds = data?.affected.map((employee) =>
        String(employee.id)
      );
      setSelectedKeys(new Set(employeeIds));
      setValueKeys(employeeIds)
      form.reset({
        name: data.payhead.name,
        calculation: data.payhead.calculation,
        is_mandatory: data.payhead.is_mandatory,
        is_active: data.payhead.is_active,
      });
    }
  }, [data]);
  useEffect(() => {
    setData();
  }, [setData]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log([values, valueKeys.map(Number)]);
    try {
      await axios.post(
        `/api/admin/payroll/earnings/edit?id=${id}`,
        {
          data: values,
          affected: valueKeys.map(Number), // Convert selected keys to numbers
        }
      );
      toast({
        title: "Edit Earning",
        description: "Earning edited successfully!",
        variant: "primary",
      });
    } catch (error) {
      toast({
        title: "Error Updating",
        description: "Error updating: " + error,
        variant: "danger",
      });
    }
  };

  const config: TableConfigProps<AffectedEmployee> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "role", name: "Role", sortable: true },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return (
            <div className="flex items-center space-x-2">
              <Avatar src={item.picture} />
              <p className="capitalize">{`${item.first_name} ${item.middle_name} ${item.last_name}`}</p>
            </div>
          );
        case "role":
          return (
            <div>
              <p>{item.ref_job_classes ? item.ref_job_classes.name : "None"}</p>
              <p className=" text-gray-500">
                {item.ref_departments ? item.ref_departments.name : "None"}
              </p>
            </div>
          );
        default:
          return <></>;
      }
    },
  };

  function handleSelection(keys: any) {
    if (keys === "all") {
      const employeeIds = data?.employees.map((employee) =>
        String(employee.id)
      );
      setSelectedKeys(keys);
      setValueKeys(employeeIds);
      console.log(employeeIds);
    } else {
      setSelectedKeys(keys);
      const keysArray = Array.from(keys);
      setValueKeys(keysArray);
      console.log(keysArray);
    }
  }
  return (
    <div className="flex flex-row gap-2 pt-2">
      <Card className="h-fit m-2">
        <CardHeader>Edit Earning</CardHeader>
        <CardBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Earning Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter earning name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="calculation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calculation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter mathematical calculation"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_mandatory"
                render={({ field }) => (
                  <FormItem className="flex flex-row-reverse items-center justify-between">
                    <FormControl>
                      <Switch
                        className="mt-2"
                        isSelected={field.value}
                        onValueChange={field.onChange}
                        color="success"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel>Mandatory</FormLabel>
                      <FormDescription>
                        Apply earning to every employees.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row-reverse items-center justify-between">
                    <FormControl>
                      <Switch
                        className="mt-2"
                        isSelected={field.value}
                        onValueChange={field.onChange}
                        color="success"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Effective on next payroll process.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </CardBody>
      </Card>
      <div className="w-full">
        <TableData
          config={config}
          items={data?.employees!}
          isLoading={isLoading}
          selectedKeys={selectedKeys}
          searchingItemKey={["first_name", "middle_name", "last_name"]}
          onSelectionChange={(keys) => handleSelection(keys)}
          counterName="Employees"
          className="flex-1 h-[calc(100vh-9.5rem)] overflow-y-auto w-full"
          removeWrapper
          isHeaderSticky
          color={"primary"}
          selectionMode="multiple"
          aria-label="Employees"
        />
      </div>
    </div>
  );
}

export default Page;
